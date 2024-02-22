import { BigInt, log } from '@graphprotocol/graph-ts'
import {
  findOrCreateRolesRegistry,
  generateCommitmentId,
} from '../../utils/helpers/erc-7589'
import { TokensCommitted } from '../../../generated/AavegotchiDiamond/AavegotchiDiamond'
import { getOrCreateUser } from '../../utils/helpers/diamond'
import { TokenCommitment } from '../../../generated/schema'

/** 
@dev This handler is called when tokens are committed.
@param event TokensCommitted The event emitted by the contract.

Example:
    event TokensCommitted(
        address indexed _grantor,
        uint256 indexed _commitmentId,
        address indexed _tokenAddress,
        uint256 _tokenId,
        uint256 _tokenAmount
    );
*/
export function handleTokensCommitted(event: TokensCommitted): void {
  const tokenAddress = event.params._tokenAddress.toHexString()
  const tokenId = event.params._tokenId
  const grantor = getOrCreateUser(event.params._grantor.toHexString())

  const rolesRegistry = findOrCreateRolesRegistry(event.address.toHexString())
  const tokenCommitmentId = generateCommitmentId(rolesRegistry.id, event.params._commitmentId)

  const tokenCommitment = new TokenCommitment(tokenCommitmentId)
  tokenCommitment.rolesRegistry = rolesRegistry.id
  tokenCommitment.depositId = event.params._commitmentId
  tokenCommitment.grantor = grantor.id
  tokenCommitment.tokenAddress = tokenAddress
  tokenCommitment.tokenId = tokenId
  tokenCommitment.amount = event.params._tokenAmount
  tokenCommitment.usedBalance = BigInt.zero()
  tokenCommitment.isReleased = false
  tokenCommitment.save()

  log.warning('[erc-7589][handleTokensCommitted] TokensCommitted {} created, tx hash: {}', [
    tokenCommitmentId,
    event.transaction.hash.toHexString(),
  ])
}
