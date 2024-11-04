import { Card } from '@/components/ui/card'
import { useIndexerStore } from '@/indexer/indexer'
import { formatUnits } from 'viem'
import { chains } from '@/config'
import { useTokenInfo } from '@/hooks/useTokenInfo'
import { useAccount } from 'wagmi'
import { truncateDecimals } from '@/lib/truncateDecimals'
import { Copy } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export const WalletBalance = () => {
  const { address } = useAccount()
  const { toast } = useToast()

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-4)}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      description: 'Address copied to clipboard',
      duration: 2000,
    })
  }

  const balances = useIndexerStore((state) => state.balances)
  const { symbol, decimals } = useTokenInfo()

  // Return early if no address is connected
  if (!address) {
    return (
      <Card className="p-4">
        <div className="text-sm text-muted-foreground">
          Connect your wallet to view balances
        </div>
      </Card>
    )
  }

  const chainBalances = chains.map((chain) => ({
    chainId: chain.id,
    chainName: chain.name,
    symbol: symbol ?? 'TOKEN',
    balance: balances.perChain[chain.id]?.[address] ?? BigInt(0),
    decimals: decimals ?? 18,
    initials: chain.name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase(),
  }))

  // Calculate total balance across all chains
  const aggregateBalance = balances.aggregate[address] ?? BigInt(0)
  const formattedTotal = formatUnits(aggregateBalance, 18)

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 justify-between">
            <div className="text-sm font-medium text-muted-foreground">
              Wallet Balance
            </div>
            {address && (
              <div
                className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-muted-foreground/80"
                onClick={() => copyToClipboard(address)}
              >
                {truncateAddress(address)}
                <Copy className="h-3 w-3" />
              </div>
            )}
          </div>
          <div className="text-2xl font-bold">
            {truncateDecimals(Number(formattedTotal), 6)}
          </div>
        </div>

        <div className="space-y-3">
          {chainBalances.map((chain) => {
            const balance = Number(formatUnits(chain.balance, chain.decimals))
            const percentage =
              Number(formattedTotal) > 0
                ? (balance / Number(formattedTotal)) * 100
                : 0

            return (
              <div key={chain.chainId} className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                    {chain.initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium">
                          {chain.chainName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {percentage.toFixed(1)}% of total
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {truncateDecimals(balance, 6)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {chain.symbol}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5">
                  <div
                    className="bg-primary rounded-full h-1.5 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
