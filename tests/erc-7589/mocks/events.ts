import { newMockEvent } from 'matchstick-as'
import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import {
  buildEventParamAddress,
  buildEventParamBoolean,
  buildEventParamBytes,
  buildEventParamUint,
} from '../helpers/events'
import {
  RoleGranted,
  RoleApprovalForAll,
  RoleRevoked,
  TokensCommitted,
  TokensReleased,
} from '../../../generated/AavegotchiDiamond/AavegotchiDiamond'
import { ZERO_ADDRESS } from '../helpers/contants'

/**
@dev Creates a mock for the event RoleRevoked

Example:
    event RoleRevoked(uint256 indexed _commitmentId, bytes32 indexed _role, address indexed _grantee)
 */
export function createNewRoleRevokedEvent(
  commitmentId: BigInt,
  roleHash: Bytes,
  grantee: string,
): RoleRevoked {
  const event = changetype<RoleRevoked>(newMockEvent())
  event.address = Address.fromString(ZERO_ADDRESS)
  event.parameters = new Array<ethereum.EventParam>()
  event.parameters.push(buildEventParamUint('_commitmentId', commitmentId))
  event.parameters.push(buildEventParamBytes('_role', roleHash))
  event.parameters.push(buildEventParamAddress('_grantee', grantee))
  return event
}


/**
@dev Creates a mock for the event RoleGranted for a ERC-7589 roles registry

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
export function createNewRoleGrantedEvent(
  roleAssignment: Bytes,
  commitmentId: BigInt,
  grantee: string,
  expirationDate: BigInt,
  revocable: boolean,
  data: Bytes,
): RoleGranted {
  const event = changetype<RoleGranted>(newMockEvent())
  event.address = Address.fromString(ZERO_ADDRESS)
  event.parameters = new Array<ethereum.EventParam>()
  event.parameters.push(buildEventParamUint('_commitmentId', commitmentId))
  event.parameters.push(buildEventParamBytes('_role', roleAssignment))
  event.parameters.push(buildEventParamAddress('_grantee', grantee))
  event.parameters.push(buildEventParamUint('_expirationDate', expirationDate))
  event.parameters.push(buildEventParamBoolean('_revocable', revocable))
  event.parameters.push(buildEventParamBytes('_data', data))
  return event
}

/**
@dev Creates a mock for the event RoleApprovalForAll

Example:
    event RoleApprovalForAll(
        address indexed _tokenAddress,
        address indexed _operator,
        bool _isApproved
    );
 */
export function createNewRoleApprovalForAllEvent(
  grantor: string,
  operator: string,
  tokenAddress: string,
  isApproved: boolean,
): RoleApprovalForAll {
  const event = changetype<RoleApprovalForAll>(newMockEvent())
  event.address = Address.fromString(ZERO_ADDRESS)
  event.parameters = new Array<ethereum.EventParam>()
  event.transaction.from = Address.fromString(grantor)
  event.parameters.push(buildEventParamAddress('_tokenAddress', tokenAddress))
  event.parameters.push(buildEventParamAddress('_operator', operator))
  event.parameters.push(buildEventParamBoolean('_isApproved', isApproved))
  return event
}

/**
@dev Creates a mock for the event TokensCommitted

Example:
    event TokensCommitted(
        address indexed _grantor,
        uint256 indexed _commitmentId,
        address indexed _tokenAddress,
        uint256 _tokenId,
        uint256 _tokenAmount
    );
 */

export function createNewTokensCommittedEvent(
  grantor: string,
  commitmentId: BigInt,
  tokenAddress: string,
  tokenId: BigInt,
  tokenAmount: BigInt,
): TokensCommitted {
  const event = changetype<TokensCommitted>(newMockEvent())
  event.address = Address.fromString(ZERO_ADDRESS)
  event.parameters = new Array<ethereum.EventParam>()
  event.transaction.from = Address.fromString(grantor)
  event.parameters.push(buildEventParamAddress('_grantor', grantor))
  event.parameters.push(buildEventParamUint('_commitmentId', commitmentId))
  event.parameters.push(buildEventParamAddress('_tokenAddress', tokenAddress))
  event.parameters.push(buildEventParamUint('_tokenId', tokenId))
  event.parameters.push(buildEventParamUint('_tokenAmount', tokenAmount))
  return event
}

/**
@dev Creates a mock for the event TokensReleased

Example:
    event TokensReleased(uint256 indexed _commitmentId)
 */

export function createNewTokensReleasedEvent(commitmentId: BigInt): TokensReleased {
  const event = changetype<TokensReleased>(newMockEvent())
  event.address = Address.fromString(ZERO_ADDRESS)
  event.parameters = new Array<ethereum.EventParam>()
  event.parameters.push(buildEventParamUint('_commitmentId', commitmentId))
  return event
}
