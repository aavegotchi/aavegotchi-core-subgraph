import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import { RoleAssignment, Role, TokenCommitment } from '../../../generated/schema'
import {
  generateRoleAssignmentId,
  generateRoleId,
  findOrCreateRolesRegistry,
  generateTokenCommitmentId,
} from '../../../src/utils/helpers/erc-7589'
import { User } from '../../../generated/schema'
import { getOrCreateUser } from '../../../src/utils/helpers/diamond'


export function createMockRoleAssignment(
  roleHash: Bytes,
  grantor: string,
  grantee: string,
  tokenAddress: string,
  tokenId: BigInt,
  expirationDate: BigInt,
  rolesRegistryAddress: string,
  tokenCommitmentId: string,
): RoleAssignment {
  const rolesRegistry = findOrCreateRolesRegistry(rolesRegistryAddress)
  const roleId = generateRoleId(rolesRegistry, roleHash, tokenCommitmentId)
  const role = new Role(roleId)
  role.roleHash = roleHash
  role.tokenAddress = tokenAddress
  role.tokenId = tokenId
  role.rolesRegistry = rolesRegistryAddress
  role.tokenCommitment = tokenCommitmentId
  role.save()

  const roleAssignmentId = generateRoleAssignmentId(
    rolesRegistry,
    getOrCreateUser(grantee),
    roleHash,
    tokenCommitmentId,
  )
  const newRoleAssignment = new RoleAssignment(roleAssignmentId)
  newRoleAssignment.role = role.id
  newRoleAssignment.tokenAddress = tokenAddress
  newRoleAssignment.tokenId = tokenId
  newRoleAssignment.grantor = grantor
  newRoleAssignment.grantee = grantee
  newRoleAssignment.expirationDate = expirationDate
  newRoleAssignment.revocable = true
  newRoleAssignment.data = Bytes.fromUTF8('data')
  newRoleAssignment.createdAt = BigInt.fromI32(123)
  newRoleAssignment.updatedAt = BigInt.fromI32(123)
  newRoleAssignment.tokenCommitment = tokenCommitmentId
  newRoleAssignment.save()
  return newRoleAssignment
}

export function createMockTokenCommitment(
  grantor: string,
  tokenAddress: string,
  tokenId: BigInt,
  rolesRegistryAddress: string,
  depositId: BigInt,
  tokenAmount: BigInt,
  isReleased: boolean,
): TokenCommitment {
  const tokenCommitmentId = generateTokenCommitmentId(rolesRegistryAddress, depositId)
  const tokenCommitment = new TokenCommitment(tokenCommitmentId)
  const grantorUser = getOrCreateUser(grantor)
  grantorUser.save()
  tokenCommitment.grantor = getOrCreateUser(grantor).id
  tokenCommitment.tokenAddress = tokenAddress
  tokenCommitment.tokenId = tokenId
  tokenCommitment.amount = tokenAmount
  tokenCommitment.usedBalance = BigInt.zero()
  tokenCommitment.rolesRegistry = rolesRegistryAddress
  tokenCommitment.depositId = depositId
  tokenCommitment.isReleased = isReleased
  tokenCommitment.save()

  return tokenCommitment
}
