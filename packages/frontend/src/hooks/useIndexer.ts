import { useEffect, useState } from 'react'
import { createPublicClient } from 'viem'
import { createIndexer } from '@/indexer/indexer'
import { chains, transports } from '@/config'
import { useAccount } from 'wagmi'
import { envVars } from '@/envVars'

const TOKEN_ADDRESSES = {
  [chains[0].id]: envVars.VITE_TOKEN_CONTRACT_ADDRESS,
  [chains[1].id]: envVars.VITE_TOKEN_CONTRACT_ADDRESS,
} as const

export function useStartIndexer() {
  const { isConnected } = useAccount()
  const [indexer, setIndexer] = useState<ReturnType<
    typeof createIndexer
  > | null>(null)

  useEffect(() => {
    if (!isConnected) return

    const clients = Object.fromEntries(
      chains.map((chain) => [
        chain.id,
        createPublicClient({
          chain,
          transport: transports[chain.id],
        }) as ReturnType<typeof createPublicClient>,
      ]),
    )

    const newIndexer = createIndexer(clients, TOKEN_ADDRESSES)
    newIndexer.initialize().catch(console.error)
    setIndexer(newIndexer)

    return () => {
      newIndexer.unwatch()
      setIndexer(null)
    }
  }, [isConnected])

  return indexer
}
