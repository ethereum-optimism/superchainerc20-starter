import { Card } from '@/components/ui/card'
import { useIndexerStore } from '@/indexer/indexer'
import { formatUnits } from 'viem'
import { chains } from '@/config'
import { useTokenInfo } from '@/hooks/useTokenInfo'
import { truncateDecimals } from '@/lib/truncateDecimals'

export const TokenAggregateSupply = () => {
  const totalSupply = useIndexerStore((state) => state.totalSupply)
  const { symbol, decimals } = useTokenInfo()

  const chainSupplies = chains.map((chain) => ({
    chainId: chain.id,
    chainName: chain.name,
    symbol: symbol ?? 'TOKEN',
    totalSupply: totalSupply[chain.id] ?? BigInt(0),
    decimals: decimals ?? 18,
    initials: chain.name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase(),
  }))

  // Sum up total supply across all chains and format it
  const aggregateSupply = Object.values(totalSupply).reduce(
    (sum, chainSupply) => sum + chainSupply,
    BigInt(0),
  )

  const formattedSupply = formatUnits(aggregateSupply, 18)

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <div className="text-sm font-medium text-muted-foreground">
            Total Supply
          </div>
          <div className="text-2xl font-bold">
            {truncateDecimals(Number(formattedSupply), 6)}
          </div>
        </div>

        <div className="space-y-3">
          {chainSupplies.map((chain) => {
            const supply = Number(
              formatUnits(chain.totalSupply, chain.decimals),
            )
            const percentage =
              Number(formattedSupply) > 0
                ? (supply / Number(formattedSupply)) * 100
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
                          {truncateDecimals(supply, 6)}
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
