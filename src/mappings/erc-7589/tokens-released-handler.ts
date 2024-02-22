import { log } from '@graphprotocol/graph-ts'
import { findOrCreateRolesRegistry, generateTokenCommitmentId, updateRoleAssignmentExpiration } from '../../utils/helpers/erc-7589'
import { TokensReleased } from '../../../generated/AavegotchiDiamond/AavegotchiDiamond'
import { Role, TokenCommitment } from '../../../generated/schema'

/** 
@dev This handler is called when tokens are released.
@param event TokensReleased The event emitted by the contract.

Example:
    event TokensReleased(uint256 indexed _commitmentId);
*/
export function handleTokensReleased(event: TokensReleased): void {
  const tokenCommitmentId = generateTokenCommitmentId(event.address.toHexString(), event.params._commitmentId)
  const tokenCommitment = TokenCommitment.load(tokenCommitmentId)

  if (!tokenCommitment) {
    log.error('[erc-7589][handleTokensReleased] TokenCommitment {} not found, tx hash: {}', [
      tokenCommitmentId,
      event.transaction.hash.toHexString(),
    ])
    return
  }

  tokenCommitment.isReleased = true
  tokenCommitment.save()

  log.warning('[erc-7589][handleTokensReleased] TokenCommitment {} was released, tx hash: {}', [
    tokenCommitmentId,
    event.transaction.hash.toHexString(),
  ])

  const roleAssignments = tokenCommitment.roleAssignments.load()
  if (!roleAssignments.length) {
    log.warning('[erc-7589][handleTokensReleased] RoleAssignments for TokenCommitment {} not found, tx hash: {}', [
      tokenCommitmentId,
      event.transaction.hash.toHexString(),
    ])
    return
  }


  const rolesRegistry = findOrCreateRolesRegistry(event.address.toHexString())
  for (let i = 0; i < roleAssignments.length; i++) {
    const role = Role.load(roleAssignments[i].role)
    if (!role) {
      log.error('[erc-7589][handleTokensReleased] Role {} does not exist, tx {} skipping...', [
        roleAssignments[i].role,
        event.transaction.hash.toHex(),
      ])
      continue
    }
    updateRoleAssignmentExpiration(
      rolesRegistry,
      tokenCommitment.tokenAddress,
      tokenCommitment.tokenId,
      role.roleHash,
      roleAssignments[i].id,
      event.block.timestamp,
      event.transaction.hash.toHexString(),
      tokenCommitmentId,
    )
  }
}
