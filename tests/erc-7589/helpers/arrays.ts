import { BigInt } from '@graphprotocol/graph-ts'

export function intArraytoString(arr: i32[]): string {
  return `[${arr.toString().replaceAll(',', ', ')}]`
}

export function bigIntArraytoString(arr: BigInt[]): string {
  return `[${arr.toString().replaceAll(',', ', ')}]`
}
