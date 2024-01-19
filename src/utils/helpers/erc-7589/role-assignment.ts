import { Bytes, BigInt, log } from '@graphprotocol/graph-ts'
import { User, RoleAssignment, RolesRegistry } from '../../../../generated/schema'
import { findOrCreateRolesRegistry } from './roles-registry'
import { findOrCreateRole } from './role'

/**
 * @notice Generate a role assignment id.
 * @dev roleRegistry, grantor, grantee, nft should be created/exist before calling this function.
 * @param roleRegistry The roles registry used for the role assignment.
 * @param grantor The grantor of the role assignment.
 * @param grantee The grantee of the role assignment.
 * @param nft The nft of the role assignment.
 * @param roleHash The role hash of the role assignment.
 * @param tokenCommitmentId The token commitment id of the role assignment.(only for ERC1155)
 * @returns The role assignment id.
 */
export function generateRoleAssignmentId(
  grantee: User,
  roleHash: Bytes,
  tokenCommitmentId: string,
): string {
    return tokenCommitmentId + '-' + grantee.id + '-' + roleHash.toHex()
}

/**
 * @notice Upsert a role assignment.
 * @dev roleRegistry, grantor, grantee, nft should be created/exist before calling this function.
 * @param roleHash The role hash of the role assignment.
 * @param rolesRegistryAddress The roles registry address of the role assignment.
 * @param grantor The grantor of the role assignment.
 * @param grantee The grantee of the role assignment.
 * @param nft The nft of the role assignment.
 * @param timestamp The timestamp of the role assignment.
 * @param expirationDate The expiration date of the role assignment.
 * @param data The data of the role assignment.
 * @param revocable The revocable of the role assignment.
 * @param tokenCommitment The tokens commitment of the role assignment.(only for ERC1155)
 * @returns The role assignment entity created (or found).
 */
export function upsertRoleAssignment(
  roleHash: Bytes,
  rolesRegistryAddress: string,
  grantor: User,
  grantee: User,
  tokenAddress: string,
  tokenId: BigInt,
  timestamp: BigInt,
  expirationDate: BigInt,
  data: Bytes,
  revocable: boolean,
  tokenCommitmentId: string,
): RoleAssignment {
  const rolesRegistry = findOrCreateRolesRegistry(rolesRegistryAddress)
  const roleAssignmentId = generateRoleAssignmentId(grantee, roleHash, tokenCommitmentId)
  let roleAssignment = RoleAssignment.load(roleAssignmentId)
  const role = findOrCreateRole(rolesRegistry, tokenAddress, tokenId, roleHash, tokenCommitmentId)

  if (!roleAssignment) {
    roleAssignment = new RoleAssignment(roleAssignmentId)
    roleAssignment.role = role.id
    roleAssignment.tokenAddress = tokenAddress
    roleAssignment.tokenId = tokenId
    roleAssignment.grantor = grantor.id
    roleAssignment.grantee = grantee.id
    roleAssignment.createdAt = timestamp
  }

  roleAssignment.expirationDate = expirationDate
  roleAssignment.revocable = revocable
  roleAssignment.data = data
  roleAssignment.updatedAt = timestamp
  roleAssignment.tokenCommitment = tokenCommitmentId

  if (!roleAssignment.revocable) {
    // if the role is not revocable, we update the lastNonRevocableExpirationDate
    // since the grantor will not able to revoke the role before this date
    // this is useful for the revocation check
    role.lastNonRevocableExpirationDate = expirationDate
    role.save()
  }

  roleAssignment.save()
  return roleAssignment
}

/**
 * @notice Update a role assignment expiration date.
 * @dev roleRegistry, grantor, grantee, nft should be created/exist before calling this function.
 * @param rolesRegistry The roles registry used for the role assignment.
 * @param nft The nft of the role assignment.
 * @param roleHash The role hash of the role assignment.
 * @param roleAssignmentId The role assignment id of the role assignment.
 * @param blockTimestamp The block timestamp of the role assignment.
 * @param txHash The transaction hash of the role assignment.
 * @param tokenCommitmentId The token commitment id of the role assignment.(only for ERC1155)
 */
export function updateRoleAssignmentExpiration(
  rolesRegistry: RolesRegistry,
  tokenAddress: string,
  tokenId: BigInt,
  roleHash: Bytes,
  roleAssignmentId: string,
  blockTimestamp: BigInt,
  txHash: string,
  tokenCommitmentId: string,
): void {
  const roleAssignment = RoleAssignment.load(roleAssignmentId)
  if (!roleAssignment) {
    log.warning('[updateRoleAssignmentExpiration] RoleAssignment {} does not exist, tx {} skipping...', [
      roleAssignmentId,
      txHash,
    ])
    return
  }
  if (blockTimestamp > roleAssignment.expirationDate) {
    log.warning('[updateRoleAssignmentExpiration] RoleAssignment {} already expired, tx {} skipping...', [
      roleAssignmentId,
      txHash,
    ])
    return
  }

  roleAssignment.expirationDate = blockTimestamp
  roleAssignment.save()

  if (!roleAssignment.revocable) {
    // smart contract validate that if a role is not revocable, it can only be revoked by the grantee
    // in that case, we can set the lastNonRevocableExpirationDate to zero, assuming that the grantee is revoking its own role
    const role = findOrCreateRole(rolesRegistry, tokenAddress, tokenId, roleHash, tokenCommitmentId)
    role.lastNonRevocableExpirationDate = blockTimestamp
    role.save()
  }

  log.warning('[updateRoleAssignmentExpiration] RoleAssignment {} expiration date updated, tx {}', [
    roleAssignmentId,
    txHash,
  ])
}
