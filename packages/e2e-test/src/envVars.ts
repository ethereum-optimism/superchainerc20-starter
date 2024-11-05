import { parseEnv, z } from 'znv'
import { Address as ZodAddress } from 'abitype/zod'

export const envVars = parseEnv(import.meta.env, {
  VITE_TOKEN_CONTRACT_ADDRESS: ZodAddress.default("0x040fC8E3cb47245BaAE006286e8EC177Ff676C1C"),
  VITE_TOKEN_MINTER_ADDRESS: ZodAddress.default("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"),
})
