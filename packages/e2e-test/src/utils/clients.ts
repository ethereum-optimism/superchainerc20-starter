import { createTestClient, http, publicActions, walletActions } from 'viem'
import { supersimL2A, supersimL2B, walletActionsL2 } from '@eth-optimism/viem'

export const testClientByChain = {
  supersimL2A: createTestClient({
    chain: supersimL2A,
    transport: http(),
    mode: 'anvil',
    pollingInterval: 1000,
  })
    .extend(publicActions)
    .extend(walletActions)
    .extend(walletActionsL2()),
  supersimL2B: createTestClient({
    chain: supersimL2B,
    transport: http(),
    mode: 'anvil',
    pollingInterval: 1000,
  })
    .extend(publicActions)
    .extend(walletActions)
    .extend(walletActionsL2()),
} as const

export const testClients = Object.values(testClientByChain)
