import { L2NativeSuperchainERC20Abi } from '@/abi/L2NativeSuperchainERC20Abi'
import { envVars } from '@/envVars'
import { useReadContracts } from 'wagmi'

const tokenContract = {
  address: envVars.VITE_TOKEN_CONTRACT_ADDRESS,
  abi: L2NativeSuperchainERC20Abi,
}

export const useTokenInfo = () => {
  const result = useReadContracts({
    contracts: [
      {
        ...tokenContract,
        functionName: 'symbol',
      },
      {
        ...tokenContract,
        functionName: 'decimals',
      },
      {
        ...tokenContract,
        functionName: 'name',
      },
    ],
  })
  const [symbol, decimals, name] = result.data || []

  return {
    symbol: symbol?.result,
    decimals: decimals?.result,
    name: name?.result,
  }
}
