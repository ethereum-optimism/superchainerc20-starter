import { parseEther, parseUnits } from 'viem'
import { beforeAll, describe, expect, it } from 'vitest'
import { testClientByChain, testClients } from '@/utils/clients'
import { envVars } from '@/envVars'
import { L2NativeSuperchainERC20Abi } from '@/abi/L2NativeSuperchainERC20Abi'
import {
  generatePrivateKey,
  privateKeyToAccount,
  toAccount,
} from 'viem/accounts'
import {
  createInteropSentL2ToL2Messages,
  decodeRelayedL2ToL2Messages,
} from '@eth-optimism/viem'

const testPrivateKey = generatePrivateKey()
const testAccount = privateKeyToAccount(testPrivateKey)

// Private key-less account - used with impersonation
const minterAccount = toAccount(envVars.VITE_TOKEN_MINTER_ADDRESS)

const l2NativeSuperchainERC20Contract = {
  address: envVars.VITE_TOKEN_CONTRACT_ADDRESS,
  abi: L2NativeSuperchainERC20Abi,
} as const

describe('bridge token from L2 to L2', async () => {
  const decimals = await testClientByChain.supersimL2A.readContract({
    ...l2NativeSuperchainERC20Contract,
    functionName: 'decimals',
  })

  beforeAll(async () => {
    // Deal 1000 ETH to the test account on each chain
    await Promise.all(
      testClients.map((client) =>
        client.setBalance({
          address: testAccount.address,
          value: parseEther('1000'),
        }),
      ),
    )
  })

  beforeAll(async () => {
    // Impersonate the minter account and mint 1000 tokens to the test account
    await Promise.all(
      testClients.map(async (client) => {
        await client.impersonateAccount({
          address: envVars.VITE_TOKEN_MINTER_ADDRESS,
        })
        const hash = await client.writeContract({
          account: minterAccount,
          address: envVars.VITE_TOKEN_CONTRACT_ADDRESS,
          abi: L2NativeSuperchainERC20Abi,
          functionName: 'mintTo',
          args: [testAccount.address, parseUnits('1000', decimals)],
        })
        await client.waitForTransactionReceipt({ hash })
      }),
    )
  })

  it.for([
    {
      source: testClientByChain.supersimL2A,
      destination: testClientByChain.supersimL2B,
    },
    {
      source: testClientByChain.supersimL2B,
      destination: testClientByChain.supersimL2A,
    },
  ] as const)(
    'should bridge tokens from $source.chain.id to $destination.chain.id',
    async ({ source: sourceClient, destination: destinationClient }) => {
      const startingDestinationBalance = await destinationClient.readContract({
        ...l2NativeSuperchainERC20Contract,
        functionName: 'balanceOf',
        args: [testAccount.address],
      })

      const amountToBridge = parseUnits('10', decimals)

      // Initiate bridge transfer of 10 tokens from L2A to L2B
      const hash = await sourceClient.sendSupERC20({
        account: testAccount,
        tokenAddress: envVars.VITE_TOKEN_CONTRACT_ADDRESS,
        amount: amountToBridge,
        chainId: destinationClient.chain.id,
        to: testAccount.address,
      })

      const receipt = await sourceClient.waitForTransactionReceipt({
        hash,
      })

      // Extract the cross-chain message from the bridge transaction
      const { sentMessages } = await createInteropSentL2ToL2Messages(
        // @ts-expect-error
        sourceClient,
        { receipt },
      )
      expect(sentMessages).toHaveLength(1)

      // Relay the message on the destination chain (L2B)
      const relayMessageTxHash = await destinationClient.relayL2ToL2Message({
        account: testAccount,
        sentMessageId: sentMessages[0].id,
        sentMessagePayload: sentMessages[0].payload,
      })

      const relayMessageReceipt =
        await destinationClient.waitForTransactionReceipt({
          hash: relayMessageTxHash,
        })

      // Verify the message was successfully processed
      const { successfulMessages } = decodeRelayedL2ToL2Messages({
        receipt: relayMessageReceipt,
      })
      expect(successfulMessages).length(1)

      // Verify the balance increased by 10 tokens on L2B
      const endingBalance = await destinationClient.readContract({
        ...l2NativeSuperchainERC20Contract,
        functionName: 'balanceOf',
        args: [testAccount.address],
      })

      expect(endingBalance).toEqual(startingDestinationBalance + amountToBridge)
    },
  )

  it.for([
    {
      source: testClientByChain.supersimL2A,
      destination: testClientByChain.supersimL2B,
    },
  ] as const)(
    'should fail when trying to bridge more tokens than available balance',
    async ({ source: sourceClient }) => {
      const currentBalance = await sourceClient.readContract({
        ...l2NativeSuperchainERC20Contract,
        functionName: 'balanceOf',
        args: [testAccount.address],
      })

      const excessiveAmount = currentBalance + parseUnits('1', decimals)

      // Attempt to bridge more tokens than available
      await expect(
        sourceClient.sendSupERC20({
          account: testAccount,
          tokenAddress: envVars.VITE_TOKEN_CONTRACT_ADDRESS,
          amount: excessiveAmount,
          chainId: testClientByChain.supersimL2B.chain.id,
          to: testAccount.address,
        }),
      ).rejects.toThrow(/reverted/i)
    },
  )
})
