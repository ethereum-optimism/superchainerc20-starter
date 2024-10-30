export const truncateDecimals = (value: number, decimals: number): string => {
  const parts = value.toString().split('.')
  if (parts.length === 1) return value.toString()
  return `${parts[0]}.${parts[1].slice(0, decimals)}`
}
