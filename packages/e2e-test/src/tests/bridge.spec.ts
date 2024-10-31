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
  supersimL2B,
} from '@eth-optimism/viem'

const testPrivateKey = generatePrivateKey()
const testAccount = privateKeyToAccount(testPrivateKey)

// Private key-less account - used with impersonation
const minterAccount = toAccount(envVars.VITE_TOKEN_MINTER_ADDRESS)

const l2NativeSuperchainERC20Contract = {
  address: envVars.VITE_TOKEN_CONTRACT_ADDRESS,
  abi: L2NativeSuperchainERC20Abi,
} as const

describe('L2 to L2 bridge', async () => {
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

  it(
    'should bridge tokens from L2A to L2B',
    async () => {
      // Get initial balance on destination chain (L2B)
      const startingBalance = await testClientByChain.supersimL2B.readContract({
        ...l2NativeSuperchainERC20Contract,
        functionName: 'balanceOf',
        args: [testAccount.address],
      })

      const amountToBridge = parseUnits('10', decimals)

      // Initiate bridge transfer of 10 tokens from L2A to L2B
      const hash = await testClientByChain.supersimL2A.sendSupERC20({
        account: testAccount,
        tokenAddress: envVars.VITE_TOKEN_CONTRACT_ADDRESS,
        amount: amountToBridge,
        chainId: supersimL2B.id,
        to: testAccount.address,
      })

      const receipt =
        await testClientByChain.supersimL2A.waitForTransactionReceipt({
          hash,
        })

      // Extract the cross-chain message from the bridge transaction
      const { sentMessages } = await createInteropSentL2ToL2Messages(
        testClientByChain.supersimL2A,
        { receipt },
      )
      expect(sentMessages).toHaveLength(1)

      // Relay the message on the destination chain (L2B)
      const relayMessageTxHash =
        await testClientByChain.supersimL2B.relayL2ToL2Message({
          account: testAccount,
          sentMessageId: sentMessages[0].id,
          sentMessagePayload: sentMessages[0].payload,
        })

      const relayMessageReceipt =
        await testClientByChain.supersimL2B.waitForTransactionReceipt({
          hash: relayMessageTxHash,
        })

      // Verify the message was successfully processed
      const { successfulMessages } = decodeRelayedL2ToL2Messages({
        receipt: relayMessageReceipt,
      })
      expect(successfulMessages).length(1)

      // Verify the balance increased by 10 tokens on L2B
      const endingBalance = await testClientByChain.supersimL2B.readContract({
        ...l2NativeSuperchainERC20Contract,
        functionName: 'balanceOf',
        args: [testAccount.address],
      })

      expect(endingBalance).toEqual(startingBalance + amountToBridge)
    },
    { timeout: 20000 },
  )
})
