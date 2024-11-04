import { Card } from '@/components/ui/card'
import { useIndexerStore } from '@/indexer/indexer'
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react'
import { zeroAddress, formatUnits } from 'viem'
import { chains } from '@/config'
import { useTokenInfo } from '@/hooks/useTokenInfo'

// Simple utility function
const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const RecentActivity = () => {
  // Get recent transfers from the indexer store
  const transfers = useIndexerStore((state) => state.transfers)

  // Add the token info hook
  const { symbol, decimals } = useTokenInfo()

  // Get last 5 transfers, sorted by block number (most recent first)
  const recentTransfers = [...transfers]
    .sort((a, b) => Number(b.blockNumber - a.blockNumber))
    .slice(0, 5)

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
      </div>

      {recentTransfers.length === 0 ? (
        <div className="text-sm text-muted-foreground">No recent activity</div>
      ) : (
        <div className="space-y-4">
          {recentTransfers.map((transfer, index) => (
            <div
              key={`${transfer.chainId}-${transfer.blockNumber}-${index}`}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 shrink-0 rounded-full bg-muted flex items-center justify-center">
                  {transfer.from === zeroAddress ? (
                    <ArrowDownIcon className="h-4 w-4 text-green-500" />
                  ) : transfer.to === zeroAddress ? (
                    <ArrowUpIcon className="h-4 w-4 text-red-500" />
                  ) : (
                    <ArrowUpIcon className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {transfer.from === zeroAddress
                        ? 'Mint'
                        : transfer.to === zeroAddress
                          ? 'Burn'
                          : 'Transfer'}
                    </span>
                    <span className="text-sm font-medium">
                      {decimals && symbol
                        ? `${formatUnits(transfer.value, decimals)} ${symbol}`
                        : '...'}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {transfer.from === zeroAddress
                      ? `To: ${formatAddress(transfer.to)}`
                      : transfer.to === zeroAddress
                        ? `From: ${formatAddress(transfer.from)}`
                        : `${formatAddress(transfer.from)} → ${formatAddress(transfer.to)}`}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {chains.find((chain) => chain.id === transfer.chainId)
                      ?.name || 'Unknown Chain'}{' '}
                    • Block #{transfer.blockNumber.toString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
