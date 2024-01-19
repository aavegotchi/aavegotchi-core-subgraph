import { RoleApprovalForAll } from '../../../generated/AavegotchiDiamond/AavegotchiDiamond'
import { insertRoleApproval } from '../../utils/helpers/erc-7589'
import { log } from '@graphprotocol/graph-ts'

/** 
@dev This handler is called when a role approval for all is set.
@param event RoleApprovalForAll The event emitted by the contract.

Example:
    event RoleApprovalForAll(address indexed _tokenAddress, address indexed _operator, bool _isApproved);
*/
export function handleRoleApprovalForAll(event: RoleApprovalForAll): void {
  const roleApproval = insertRoleApproval(
    event.transaction.from.toHex(),
    event.params._operator.toHex(),
    event.address.toHex(),
    event.params._tokenAddress.toHex(),
    event.params._isApproved,
  )

  log.warning('[erc-7589][handleRoleApprovalForAll] Updated RoleAssignment Approval: {} Tx: {}', [
    roleApproval.id,
    event.transaction.hash.toHex(),
  ])
}
