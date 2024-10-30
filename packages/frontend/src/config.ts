import { createConfig, http } from 'wagmi'
import { supersimL2A, supersimL2B } from '@eth-optimism/viem'
import { metaMask, walletConnect } from 'wagmi/connectors'
import { privateKeyToAccount } from 'viem/accounts'
import { devAccount } from '@/connectors/devAccount'
import { envVars } from '@/envVars'
import { HttpTransport } from 'viem'

export const chains = [supersimL2A, supersimL2B] as const

export const transports = Object.fromEntries(
  chains.map((chain) => [chain.id, http()]),
) as Record<(typeof chains)[number]['id'], HttpTransport>

// Default dev account (for testing)
export const defaultDevAccount = privateKeyToAccount(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)

export const config = createConfig({
  chains,
  transports,
  connectors: [
    devAccount(defaultDevAccount),
    walletConnect({ projectId: envVars.VITE_WALLET_CONNECT_PROJECT_ID || '' }),
    metaMask(),
  ],
})
