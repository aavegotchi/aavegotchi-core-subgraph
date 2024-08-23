import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import { Role, RolesRegistry } from '../../../../generated/schema'

/**
 * @notice Generate a role id.
 * @dev rolesRegistry, nft, roleHash should be created/exist before calling this function.
 * @param rolesRegistry The roles registry used for the role.
 * @param roleHash The role hash of the role.
 * @param depositId The depositId of the role (only for ERC1155).
 * @returns The role id.
 */
export function generateRoleId(
  rolesRegistry: RolesRegistry,
  roleHash: Bytes,
  depositId: string,
): string {
  return `${rolesRegistry.id}-${depositId}-${roleHash.toHex()}`
}

/**
 * @notice Find or create a role.
 * @dev rolesRegistry, nft, roleHash should be created/exist before calling this function.
 * @param rolesRegistry The roles registry used for the role.
 * @param tokenAddress The token address of the role.
 * @param tokenId The token id of the role.
 * @param roleHash The role hash of the role.
 * @param tokenCommitment The commitment of the role.(only for ERC1155)
 * @returns The role entity created (or found).
 */
export function findOrCreateRole(
  rolesRegistry: RolesRegistry,
  tokenAddress: string,
  tokenId: BigInt,
  roleHash: Bytes,
  depositId: string,
): Role {
  const roleId = generateRoleId(rolesRegistry, roleHash, depositId)
  let role = Role.load(roleId)

  if (!role) {
    role = new Role(roleId)
    role.roleHash = roleHash
    role.tokenAddress = tokenAddress
    role.tokenId = tokenId
    role.rolesRegistry = rolesRegistry.id
    role.tokenCommitment = depositId
    role.save()
  }

  return role
}

/**
 * @notice Batch find or create a role.
 * @dev rolesRegistry, nft, roleHash should be created/exist before calling this function.
 * @param rolesRegistry The roles registry used for the role.
 * @param nft The nft of the role.
 * @param roleHashes The array of role hashes of the role.
 * @param depositId The commitment id of the role.(only for ERC1155)
 * @returns The role entity created (or found).
 */
export function findOrCreateRoles(
  rolesRegistry: RolesRegistry,
  tokenAddress: string,
  tokenId: BigInt,
  roleHashes: Bytes[],
  depositId: string | null,
): string[] {
  const roles: string[] = []

  for (let i = 0; i < roleHashes.length; i++) {
    roles.push(findOrCreateRole(rolesRegistry, tokenAddress, tokenId, roleHashes[i], depositId).id)
  }

  return roles
}
