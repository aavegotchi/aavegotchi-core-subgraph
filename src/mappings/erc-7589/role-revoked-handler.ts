import { log } from '@graphprotocol/graph-ts'
import {
  findOrCreateRolesRegistry,
  generateRoleAssignmentId,
  generateDepositId,
  updateRoleAssignmentExpiration,
} from '../../utils/helpers/erc-7589'
import { TokenCommitment } from '../../../generated/schema'
import { RoleRevoked } from '../../../generated/AavegotchiDiamond/AavegotchiDiamond'
import { getOrCreateUser } from '../../utils/helpers/diamond'

/** 
@dev This handler is called when a role is revoked.
@param event RoleRevoked The event emitted by the contract.

Example:
    event RoleRevoked(uint256 indexed _commitmentId, bytes32 indexed _role, address indexed _grantee)
*/
export function handleRoleRevoked(event: RoleRevoked): void {
  const tokenCommitmentId = event.params._commitmentId
  const rolesRegistryAddress = event.address.toHexString()
  const depositId = generateDepositId(rolesRegistryAddress, tokenCommitmentId)
  const tokenCommitment = TokenCommitment.load(depositId)

  if (!tokenCommitment) {
    log.error('[erc-7589][handleRoleRevoked] TokenCommitment {} not found, tx {} skipping...', [
      depositId,
      event.transaction.hash.toHexString(),
    ])
    return
  }

  const granteeAddress = event.params._grantee.toHex()
  const grantee = getOrCreateUser(granteeAddress)
  grantee.save()
  if (!grantee) {
    log.error('[erc-7589][handleRoleRevoked] grantee {} does not exist, tx {} skipping...', [
      granteeAddress,
      event.transaction.hash.toHex(),
    ])
    return
  }

  const rolesRegistry = findOrCreateRolesRegistry(rolesRegistryAddress)
  const roleAssignmentId = generateRoleAssignmentId(
    rolesRegistry,
    grantee,
    event.params._role,
    depositId,
  )
  updateRoleAssignmentExpiration(
    rolesRegistry,
    tokenCommitment.tokenAddress,
    tokenCommitment.tokenId,
    event.params._role,
    roleAssignmentId,
    event.block.timestamp,
    event.transaction.hash.toHexString(),
    depositId,
  )

  log.warning('[erc-7589][handleRoleRevoked] Revoked RoleAssignment: {} NFT: {} tx: {}', [
    roleAssignmentId,
    `${tokenCommitment.tokenAddress}-${tokenCommitment.tokenId}`,
    event.transaction.hash.toHex(),
  ])
}
