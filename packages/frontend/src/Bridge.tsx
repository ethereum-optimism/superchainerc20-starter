import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { chains } from '@/config'
import { useTokenInfo } from '@/hooks/useTokenInfo'
import { parseUnits } from 'viem'
import { contracts } from '@eth-optimism/viem'
import {
  useAccount,
  useSimulateContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { envVars } from '@/envVars'
import { SuperchainTokenBridgeAbi } from '@/abi/SuperchainTokenBridgeAbi'

export const Bridge = () => {
  const { address } = useAccount()
  const { symbol, decimals = 18 } = useTokenInfo()
  const [amount, setAmount] = useState('')
  const amountUnits = parseUnits(amount, decimals)
  const [sourceChainIdString, setSourceChain] = useState(
    chains[0].id.toString(),
  )
  const sourceChainId = parseInt(sourceChainIdString)
  const [targetChainIdString, setTargetChain] = useState(
    chains[1].id.toString(),
  )
  const targetChainId = parseInt(targetChainIdString)

  const sourceChain = chains.find((chain) => chain.id === sourceChainId)
  const targetChain = chains.find((chain) => chain.id === targetChainId)

  const { switchChain } = useSwitchChain()

  const simulationResult = useSimulateContract({
    abi: SuperchainTokenBridgeAbi,
    address: contracts.superchainTokenBridge.address,
    functionName: 'sendERC20',
    args: [
      envVars.VITE_TOKEN_CONTRACT_ADDRESS,
      address!,
      amountUnits,
      BigInt(targetChainId),
    ],
    chainId: sourceChainId,
  })

  const {
    data: hash,
    isPending: isSendPending,
    writeContract,
    reset,
  } = useWriteContract()

  const handleSourceChainChange = async (chainId: string) => {
    try {
      // Attempt to switch chain first
      await switchChain({ chainId: parseInt(chainId) })

      // Only update the state if chain switch was successful
      setSourceChain(chainId)
      if (chainId === targetChainIdString) {
        const availableChains = chains.filter(
          (chain) => chain.id.toString() !== chainId,
        )
        setTargetChain(availableChains[0]?.id.toString() || '')
      }

      reset()
    } catch (error) {
      console.error('Failed to switch chain:', error)
      // Don't update the source chain if switching failed
    }
  }

  const { isLoading: isReceiptLoading } = useWaitForTransactionReceipt({
    hash,
  })

  const isLoading =
    isSendPending || isReceiptLoading || !simulationResult.data?.request

  const isButtonDisabled =
    !address || !amount || !sourceChain || !targetChain || isLoading

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Bridge {symbol}</h2>
        <p className="text-sm text-muted-foreground">
          Transfer assets between networks
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From Network</Label>
              <Select
                onValueChange={handleSourceChainChange}
                value={sourceChainIdString}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  {chains.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id.toString()}>
                      {chain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>To Network</Label>
              <Select
                onValueChange={setTargetChain}
                disabled={!sourceChainIdString}
                value={targetChainIdString}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  {chains
                    .filter(
                      (chain) => chain.id.toString() !== sourceChainIdString,
                    )
                    .map((chain) => (
                      <SelectItem key={chain.id} value={chain.id.toString()}>
                        {chain.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          disabled={isButtonDisabled}
          onClick={() => {
            writeContract(simulationResult.data!.request)
          }}
        >
          {isSendPending || isReceiptLoading ? (
            <>
              <span className="mr-2">Bridging...</span>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </>
          ) : (
            'Bridge'
          )}
        </Button>
      </div>
    </div>
  )
}
