import { BigInt } from '@graphprotocol/graph-ts'

/**
 * @dev Generate tokens commitment id.
 * @param rolesRegistryAddress The RoleRegistry contract.
 * @param depositId The tokens commitment id.
 * @returns The tokens commitment id.
 */
export function generateTokenCommitmentId(rolesRegistryAddress: string, depositId: BigInt): string {
  return `${rolesRegistryAddress}-${depositId}`
}
