import { log } from '@graphprotocol/graph-ts'
import { generateDepositId, upsertRoleAssignment } from '../../utils/helpers/erc-7589'
import { TokenCommitment } from '../../../generated/schema'
import { RoleGranted } from '../../../generated/AavegotchiDiamond/AavegotchiDiamond'
import { getOrCreateUser } from '../../utils/helpers/diamond'

/** 
@dev This handler is called when a role is granted.
@param event RoleGranted The event emitted by the contract.

Example:
     event RoleGranted(
        uint256 indexed _commitmentId,
        bytes32 indexed _role,
        address indexed _grantee,
        uint64 _expirationDate,
        bool _revocable,
        bytes _data
    );
*/
export function handleRoleGranted(event: RoleGranted): void {
  const tokenCommitmentId = event.params._commitmentId
  const rolesRegistryAddress = event.address.toHexString()
  const depositId = generateDepositId(rolesRegistryAddress, tokenCommitmentId)
  const tokenCommitment = TokenCommitment.load(depositId)

  if (!tokenCommitment) {
    log.error('[erc-7589][handleRoleGranted] TokenCommitment {} not found, tx hash: {}', [
      depositId,
      event.transaction.hash.toHexString(),
    ])
    return
  }

  const grantor = getOrCreateUser(tokenCommitment.grantor)
  grantor.save()
  const grantee = getOrCreateUser(event.params._grantee.toHex())
  grantee.save()
  const roleAssignment = upsertRoleAssignment(
    event.params._role,
    event.address.toHex(),
    grantor,
    grantee,
    tokenCommitment.tokenAddress,
    tokenCommitment.tokenId,
    event.block.timestamp,
    event.params._expirationDate,
    event.params._data,
    event.params._revocable,
    tokenCommitment.id,
  )
  log.warning('[erc-7589][handleRoleGranted] roleAssignment: {} NFT: {} Tx: {}', [
    roleAssignment.id,
    `${tokenCommitment.tokenAddress}-${tokenCommitment.tokenId}`,
    event.transaction.hash.toHex(),
  ])
}
