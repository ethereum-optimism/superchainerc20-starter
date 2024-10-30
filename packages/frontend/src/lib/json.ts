/**
 * Type for our special BigInt wrapper object
 */
type BigIntWrapper = {
  __type: 'BigInt'
  value: string
}

/**
 * Custom JSON parser that supports BigInt
 * @param jsonString - The JSON string to parse
 * @returns Parsed object with BigInt values
 */
export function parseJson<T>(jsonString: string): T {
  return JSON.parse(jsonString, (_, value: unknown) => {
    if (
      value !== null &&
      typeof value === 'object' &&
      '__type' in value &&
      (value as BigIntWrapper).__type === 'BigInt' &&
      'value' in value
    ) {
      return BigInt((value as BigIntWrapper).value)
    }
    return value
  })
}

/**
 * Custom JSON serializer that supports BigInt
 * @param value - The value to serialize
 * @returns JSON string with BigInt values properly encoded
 */
export function serializeJson(value: unknown): string {
  return JSON.stringify(value, (_, value) => {
    if (typeof value === 'bigint') {
      return {
        __type: 'BigInt',
        value: value.toString(),
      }
    }
    return value
  })
}
