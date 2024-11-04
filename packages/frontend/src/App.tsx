import { ArrowLeftRight as BridgeIcon, Droplet, RefreshCw } from 'lucide-react'
import { Bridge } from '@/Bridge'
import { Providers } from '@/Providers'
import { WalletBalance } from '@/components/WalletBalance'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Faucet } from '@/Faucet'
import { ConnectWalletButton } from '@/components/connect-wallet/ConnectWalletButton'
import { TokenInfo } from '@/components/TokenInfo'
import { TokenAggregateSupply } from '@/components/TokenAggregateSupply'
import { useStartIndexer } from '@/hooks/useIndexer'
import { Button } from '@/components/ui/button'
import { RecentActivity } from '@/components/RecentActivity'

const IndexerStarter = () => {
  const indexer = useStartIndexer()
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => indexer?.resetAllChains()}
      className="flex items-center gap-2"
    >
      <RefreshCw className="h-4 w-4" />
      Reset Indexer
    </Button>
  )
}

function App() {
  return (
    <Providers>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <header className="border-b">
          <div className="container mx-auto flex h-16 items-center justify-between">
            <h1 className="text-xl font-bold">SuperchainERC20 Dev Tools</h1>
            <div className="flex items-center gap-4">
              <IndexerStarter />
              <ConnectWalletButton />
            </div>
          </div>
        </header>

        <main className="container mx-auto py-6 space-y-6">
          {/* Overview Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <TokenInfo />
            <TokenAggregateSupply />
            <WalletBalance />
          </div>

          {/* Main Content */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Left Column - Tools */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <Tabs defaultValue="faucet" className="w-full">
                  <div className="px-6 pt-6">
                    <TabsList className="w-full flex">
                      <TabsTrigger value="faucet" className="flex-1">
                        <Droplet className="mr-2 h-4 w-4" />
                        Faucet
                      </TabsTrigger>
                      <TabsTrigger value="bridge" className="flex-1">
                        <BridgeIcon className="mr-2 h-4 w-4" />
                        Bridge
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="p-6">
                    <TabsContent value="bridge">
                      <Bridge />
                    </TabsContent>
                    <TabsContent value="faucet">
                      <Faucet />
                    </TabsContent>
                    <TabsContent value="deploy">
                      {/* Add Contract Deployment interface */}
                      <div className="text-muted-foreground">
                        Contract deployment interface coming soon...
                      </div>
                    </TabsContent>
                    <TabsContent value="verify">
                      {/* Add Contract Verification interface */}
                      <div className="text-muted-foreground">
                        Contract verification interface coming soon...
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </Card>
            </div>

            <div className="space-y-6">
              <RecentActivity />
            </div>
          </div>
        </main>
      </div>
    </Providers>
  )
}

export default App
