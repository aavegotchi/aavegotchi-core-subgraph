import { BigInt } from '@graphprotocol/graph-ts'

/**
 * @dev Generate tokens commitment id.
 * @param rolesRegistryAddress The RoleRegistry contract.
 * @param commitmentId The tokens commitment id.
 * @returns The tokens commitment id.
 */
export function generateTokenCommitmentId(rolesRegistryAddress: string, commitmentId: BigInt): string {
  return `${rolesRegistryAddress}-${commitmentId}`
}
