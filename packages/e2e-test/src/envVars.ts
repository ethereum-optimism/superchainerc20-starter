import { parseEnv, z } from 'znv'
import { Address as ZodAddress } from 'abitype/zod'
import { deployment } from '@superchainerc20-starter/contracts'

export const envVars = parseEnv(import.meta.env, {
  VITE_TOKEN_CONTRACT_ADDRESS: z
    .string()
    .default(deployment.deployedAddress)
    .transform((val) => {
      const address = val.trim() !== '' ? val : deployment.deployedAddress
      return ZodAddress.parse(address)
    }),
  VITE_TOKEN_MINTER_ADDRESS: z
    .string()
    .default(deployment.ownerAddress)
    .transform((val) => {
      const address = val.trim() !== '' ? val : deployment.ownerAddress
      return ZodAddress.parse(address)
    }),
})
