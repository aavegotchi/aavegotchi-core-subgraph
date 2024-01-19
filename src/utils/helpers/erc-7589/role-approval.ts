import { store } from '@graphprotocol/graph-ts'
import { findOrCreateRolesRegistry } from './roles-registry'
import { RoleApproval, RolesRegistry, User } from '../../../../generated/schema'
import { getOrCreateUser } from '../diamond'
/**
 * @notice Generate a role approval id.
 * @dev rolesRegistry, grantor, operator should be created/exist before calling this function.
 * @param roleRegistry The roles registry used for the role approval.
 * @param grantor The grantor of the role approval.
 * @param operator The operator approved by the grantor.
 * @param tokenAddress The token address of the role approval.
 * @returns The role approval id.
 */
export function generateRoleApprovalId(
  roleRegistry: RolesRegistry,
  grantor: User,
  operator: User,
  tokenAddress: string,
): string {
  return roleRegistry.id + '-' + grantor.id + '-' + operator.id + '-' + tokenAddress.toLowerCase()
}

/**
 * @notice Find or create a role approval.
 * @dev rolesRegistry, grantor, operator should be created/exist before calling this function.
 * @param rolesRegistry The roles registry used for the role approval.
 * @param grantor The grantor of the role approval.
 * @param operator The operator approved by the grantor.
 * @param tokenAddress The token address of the role approval.
 * @returns The role approval entity created (or found).
 */
export function findOrCreateRoleApproval(
  rolesRegistry: RolesRegistry,
  grantor: User,
  operator: User,
  tokenAddress: string,
): RoleApproval {
  const roleApprovalId = generateRoleApprovalId(rolesRegistry, grantor, operator, tokenAddress)
  let roleApproval = RoleApproval.load(roleApprovalId)
  if (roleApproval) return roleApproval

  roleApproval = new RoleApproval(roleApprovalId)
  roleApproval.grantor = grantor.id
  roleApproval.operator = operator.id
  roleApproval.tokenAddress = tokenAddress
  roleApproval.rolesRegistry = rolesRegistry.id
  roleApproval.isApproved = false
  roleApproval.save()
  return roleApproval
}

/**
 * @notice Delete a role approval.
 * @dev rolesRegistry, grantor, operator should be created/exist before calling this function.
 * @dev If the role approval does not exist, nothing will be done.
 * @param rolesRegistry  The roles registry used for the role approval.
 * @param grantor The grantor of the role approval.
 * @param operator The operator approved by the grantor.
 * @param tokenAddress The token address of the role approval.
 * @returns True if the role approval was deleted, false otherwise.
 */
export function deleteRoleApproval(
  rolesRegistry: RolesRegistry,
  grantor: User,
  operator: User,
  tokenAddress: string,
): boolean {
  const roleApprovalId = generateRoleApprovalId(rolesRegistry, grantor, operator, tokenAddress)
  if (!RoleApproval.load(roleApprovalId)) return false
  store.remove('RoleApproval', roleApprovalId)
  return true
}

/**
 * @notice Insert a role approval.
 * @param grantorAddress The grantor of the role approval.
 * @param operatorAddress The operator approved by the grantor.
 * @param rolesRegistryAddress The roles registry used for the role approval.
 * @param tokenAddress The token address of the role approval.
 * @param isApproved The approval status of the role approval.
 */
export function insertRoleApproval(
  grantorAddress: string,
  operatorAddress: string,
  rolesRegistryAddress: string,
  tokenAddress: string,
  isApproved: boolean,
): RoleApproval {
  const grantor = getOrCreateUser(grantorAddress)
  const operator = getOrCreateUser(operatorAddress)
  const rolesRegistry = findOrCreateRolesRegistry(rolesRegistryAddress)
  const roleApproval = findOrCreateRoleApproval(rolesRegistry, grantor, operator, tokenAddress)
  roleApproval.isApproved = isApproved
  roleApproval.save()
  return roleApproval
}
