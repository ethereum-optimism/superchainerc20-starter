import { parseEnv, z } from 'znv'
import { Address as ZodAddress } from 'abitype/zod'
import { deployment } from '@superchainerc20-starter/contracts'

export const envVars = parseEnv(import.meta.env, {
  VITE_TOKEN_CONTRACT_ADDRESS: ZodAddress.default(deployment.deployedAddress),
  VITE_TOKEN_MINTER_ADDRESS: ZodAddress.default(deployment.ownerAddress),
  VITE_WALLET_CONNECT_PROJECT_ID: z.string().optional(),
})
