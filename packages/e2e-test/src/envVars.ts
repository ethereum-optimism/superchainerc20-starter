import { parseEnv, z } from 'znv'
import { Address as ZodAddress } from 'abitype/zod'

export const envVars = parseEnv(import.meta.env, {
  VITE_TOKEN_CONTRACT_ADDRESS: ZodAddress,
  VITE_TOKEN_MINTER_ADDRESS: ZodAddress,
})
