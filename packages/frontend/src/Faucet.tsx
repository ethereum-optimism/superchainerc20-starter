import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { config } from '@/config'
import { useAccount } from 'wagmi'
import {
  Address,
  Hash,
  http,
  parseUnits,
  formatUnits,
  createTestClient,
  walletActions,
} from 'viem'
import { useTokenInfo } from '@/hooks/useTokenInfo'
import { L2NativeSuperchainERC20Abi } from '@/abi/L2NativeSuperchainERC20Abi'
import { envVars } from '@/envVars'
import { waitForTransactionReceipt } from '@wagmi/core'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { toAccount } from 'viem/accounts'

const drip = async (
  recipient: Address,
  chainId: number,
  amount: string,
  decimals: number = 18,
) => {
  const chain = config.chains.find((x) => x.id === chainId)
  if (!chain) throw new Error(`Chain with id ${chainId} not found`)

  const minterAccount = toAccount(envVars.VITE_TOKEN_MINTER_ADDRESS)

  const client = createTestClient({
    chain,
    transport: http(),
    mode: 'anvil',
    pollingInterval: 1000,
  }).extend(walletActions)

  await client.impersonateAccount({
    address: envVars.VITE_TOKEN_MINTER_ADDRESS,
  })

  const hash = await client.writeContract({
    account: minterAccount,
    address: envVars.VITE_TOKEN_CONTRACT_ADDRESS,
    abi: L2NativeSuperchainERC20Abi,
    functionName: 'mintTo',
    args: [recipient, parseUnits(amount, decimals)],
  })

  return hash
}

const dripToMany = async (
  recipient: Address,
  chainIds: number[],
  amount: string,
  decimals: number = 18,
) => {
  const txs = await Promise.all(
    chainIds.map(async (chainId) => {
      return {
        hash: await drip(recipient, chainId, amount, decimals),
        chainId,
      }
    }),
  )
  return txs
}

const waitForManyTx = async (txs: { hash: Hash; chainId: number }[]) => {
  return await Promise.all(
    txs.map(async (tx) => {
      return await waitForTransactionReceipt(config, {
        hash: tx.hash,
        chainId: tx.chainId as 901 | 902,
        timeout: 10000,
        pollingInterval: 1000,
      })
    }),
  )
}

const useWaitForManyTx = (txs: { hash: Hash; chainId: number }[]) => {
  //uses tanstack query
  return useQuery({
    queryKey: ['waitForManyTx', txs],
    queryFn: () => waitForManyTx(txs),
  })
}

export const Faucet = () => {
  const account = useAccount()

  const [txs, setTxs] = useState<{ hash: Hash; chainId: number }[]>([])

  const { data: receipts, isLoading, isError } = useWaitForManyTx(txs)

  const { symbol, decimals = 18 } = useTokenInfo()

  const [recipient, setRecipient] = useState(account.address || '')
  const [networks, setNetworks] = useState<string[]>(
    config.chains.map((x) => x.id.toString()),
  )
  const [amount, setAmount] = useState<string>('1000')

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNetworkToggle = (networkId: string) => {
    setNetworks((current) =>
      current.includes(networkId)
        ? current.filter((id) => id !== networkId)
        : [...current, networkId],
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Faucet</h2>
        <p className="text-sm text-muted-foreground">
          Drip {symbol} tokens on multiple networks
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Recipient Address</Label>
          <Input
            placeholder="0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Amount ({decimals} decimals)</Label>
          <Input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Select Networks</Label>
          <div className="grid gap-4 pt-2">
            {config.chains.map((chain) => (
              <div key={chain.id} className="flex items-center space-x-2">
                <Checkbox
                  id={chain.id.toString()}
                  checked={networks.includes(chain.id.toString())}
                  onCheckedChange={() =>
                    handleNetworkToggle(chain.id.toString())
                  }
                />
                <Label htmlFor={chain.id.toString()} className="font-normal">
                  {chain.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          disabled={
            !recipient || networks.length === 0 || isSubmitting || isLoading
          }
          onClick={async () => {
            try {
              setIsSubmitting(true)
              const txs = await dripToMany(
                recipient as Address,
                networks.map(Number),
                amount,
                decimals,
              )
              setTxs(txs)
            } finally {
              setIsSubmitting(false)
            }
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting transactions...
            </>
          ) : isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sent. Waiting for receipt...
            </>
          ) : (
            'Drip Tokens'
          )}
        </Button>

        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Error occurred while processing transactions
            </AlertDescription>
          </Alert>
        )}

        {receipts && receipts.length > 0 && (
          <Alert
            variant="default"
            className="border-green-500 bg-green-50 dark:bg-green-900/10"
          >
            <CheckCircle2 className="h-4 w-4" color="#22c55e" />
            <AlertTitle className="text-green-500">Success!</AlertTitle>
            <AlertDescription>
              Successfully dripped{' '}
              {formatUnits(parseUnits(amount, decimals), decimals)} {symbol}{' '}
              tokens on {receipts.length} networks.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
