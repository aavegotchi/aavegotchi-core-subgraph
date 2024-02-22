import { assert } from 'matchstick-as'
import {
  findOrCreateRolesRegistry,
  generateRoleAssignmentId,
  generateRoleId,
  generateTokenCommitmentId,
} from '../../../src/utils/helpers/erc-7589'
import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import { User } from '../../../generated/schema'



export function validateRole(
  grantor: User,
  grantee: User,
  tokenAddress: string,
  tokenId: BigInt,
  roleAssignment: Bytes,
  expirationDate: BigInt,
  data: Bytes,
  rolesRegistryAddress: string,
  depositId: string,
): void {
  const rolesRegistry = findOrCreateRolesRegistry(rolesRegistryAddress)
  const roleId = generateRoleId(rolesRegistry, roleAssignment, depositId)
  assert.fieldEquals('Role', roleId, 'roleHash', roleAssignment.toHex())
  assert.fieldEquals('Role', roleId, 'tokenAddress', tokenAddress)
  assert.fieldEquals('Role', roleId, 'tokenId', tokenId.toString())

  const roleAssignmentId = generateRoleAssignmentId(
    rolesRegistry,
    grantee,
    roleAssignment,
    depositId,
  )
  assert.fieldEquals(
    'RoleAssignment',
    roleAssignmentId,
    'role',
    generateRoleId(rolesRegistry, roleAssignment, depositId),
  )
  assert.fieldEquals('RoleAssignment', roleAssignmentId, 'tokenAddress', tokenAddress)
  assert.fieldEquals('RoleAssignment', roleAssignmentId, 'tokenId', tokenId.toString())
  assert.fieldEquals('RoleAssignment', roleAssignmentId, 'grantor', grantor.id)
  assert.fieldEquals('RoleAssignment', roleAssignmentId, 'grantee', grantee.id)
  assert.fieldEquals('RoleAssignment', roleAssignmentId, 'expirationDate', expirationDate.toString())
  assert.fieldEquals('RoleAssignment', roleAssignmentId, 'data', data.toHex())
}

export function validateTokenCommitment(
  depositId: BigInt,
  grantor: string,
  tokenAddress: string,
  tokenId: BigInt,
  amount: BigInt,
  rolesRegistryAddress: string,
  isReleased: boolean,
): void {
  const tokenCommitmentId = generateTokenCommitmentId(rolesRegistryAddress, depositId)
  assert.fieldEquals('TokenCommitment', tokenCommitmentId, 'rolesRegistry', rolesRegistryAddress)
  assert.fieldEquals('TokenCommitment', tokenCommitmentId, 'depositId', depositId.toString())
  assert.fieldEquals('TokenCommitment', tokenCommitmentId, 'grantor', grantor)
  assert.fieldEquals('TokenCommitment', tokenCommitmentId, 'tokenAddress', tokenAddress)
  assert.fieldEquals('TokenCommitment', tokenCommitmentId, 'tokenId', tokenId.toString())
  assert.fieldEquals('TokenCommitment', tokenCommitmentId, 'amount', amount.toString())
  assert.fieldEquals('TokenCommitment', tokenCommitmentId, 'isReleased', isReleased.toString())
}
