import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'

/**
 * @dev Build an event parameter of type boolean
 * @param name The name of the parameter.
 * @param value A boolean value.
 * @returns The event parameter.
 */
export function buildEventParamBoolean(name: string, value: boolean): ethereum.EventParam {
  const ethAddress = ethereum.Value.fromBoolean(value)
  return new ethereum.EventParam(name, ethAddress)
}
/**
 * @dev Build an event parameter of type address
 * @param name The name of the parameter.
 * @param address A string value to be casted to Address.
 * @returns The event parameter.
 */
export function buildEventParamAddress(name: string, address: string): ethereum.EventParam {
  const ethAddress = ethereum.Value.fromAddress(Address.fromString(address))
  return new ethereum.EventParam(name, ethAddress)
}

/**
 * @dev Build an event parameter of type positive BigInt
 * @param name The name of the parameter.
 * @param value A BigInt value to be casted to UnsignedBigInt.
 * @returns The event parameter.
 */
export function buildEventParamUint(name: string, value: BigInt): ethereum.EventParam {
  const ethValue = ethereum.Value.fromUnsignedBigInt(value)
  return new ethereum.EventParam(name, ethValue)
}

/**
 * @dev Build an event parameter of type string
 * @param name The name of the parameter.
 * @param value A string value to be casted to Bytes.
 * @returns The event parameter.
 */
export function buildEventParamBytes(name: string, value: Bytes): ethereum.EventParam {
  const ethValue = ethereum.Value.fromFixedBytes(value)
  return new ethereum.EventParam(name, ethValue)
}