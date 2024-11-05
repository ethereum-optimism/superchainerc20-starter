import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useIndexerStore } from '@/indexer/indexer'
import { chains } from '@/config'
import { useTokenInfo } from '@/hooks/useTokenInfo'

export const TokenSupply = () => {
  const totalSupply = useIndexerStore((state) => state.totalSupply)
  const { symbol, decimals } = useTokenInfo()

  const chainSupplies = chains.map((chain) => ({
    chainId: chain.id,
    chainName: chain.name,
    symbol: symbol ?? 'TOKEN',
    totalSupply: totalSupply[chain.id]?.toString() ?? '0',
    decimals: decimals ?? 18,
    initials: chain.name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase(),
  }))

  const aggregateSupply = chainSupplies.reduce(
    (acc, chain) => acc + Number(chain.totalSupply) / 10 ** chain.decimals,
    0,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supply Distribution</CardTitle>
        <CardDescription>Total token supply across chains</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {chainSupplies.map((chain) => {
            const supply = Number(chain.totalSupply) / 10 ** chain.decimals
            const percentage =
              aggregateSupply > 0 ? (supply / aggregateSupply) * 100 : 0

            return (
              <div key={chain.chainId} className="space-y-2">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
                    {chain.initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{chain.chainName}</div>
                        <div className="text-sm text-muted-foreground">
                          {percentage.toFixed(1)}% of total supply
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {supply.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {chain.symbol}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div
                    className="bg-primary rounded-full h-2.5 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
