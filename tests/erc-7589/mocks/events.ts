import { newMockEvent } from 'matchstick-as'
import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import {
  buildEventParamAddress,
  buildEventParamBoolean,
  buildEventParamBytes,
  buildEventParamUint,
  buildEventParamUintArray,
} from '../helpers/events'
import {
  EquipDelegatedWearables,
  RoleGranted,
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
  depositId: BigInt,
  roleHash: Bytes,
  grantee: string,
): RoleRevoked {
  const event = changetype<RoleRevoked>(newMockEvent())
  event.address = Address.fromString(ZERO_ADDRESS)
  event.parameters = new Array<ethereum.EventParam>()
  event.parameters.push(buildEventParamUint('_commitmentId', depositId))
  event.parameters.push(buildEventParamBytes('_role', roleHash))
  event.parameters.push(buildEventParamAddress('_grantee', grantee))
  return event
}


/**
@dev Creates a mock for the event RoleGranted for a ERC-7589 roles registry

Example:
    event RoleGranted(
        uint256 indexed _depositId,
        bytes32 indexed _role,
        address indexed _grantee,
        uint64 _expirationDate,
        bool _revocable,
        bytes _data
    );
 */
export function createNewRoleGrantedEvent(
  roleAssignment: Bytes,
  depositId: BigInt,
  grantee: string,
  expirationDate: BigInt,
  revocable: boolean,
  data: Bytes,
): RoleGranted {
  const event = changetype<RoleGranted>(newMockEvent())
  event.address = Address.fromString(ZERO_ADDRESS)
  event.parameters = new Array<ethereum.EventParam>()
  event.parameters.push(buildEventParamUint('_depositId', depositId))
  event.parameters.push(buildEventParamBytes('_role', roleAssignment))
  event.parameters.push(buildEventParamAddress('_grantee', grantee))
  event.parameters.push(buildEventParamUint('_expirationDate', expirationDate))
  event.parameters.push(buildEventParamBoolean('_revocable', revocable))
  event.parameters.push(buildEventParamBytes('_data', data))
  return event
}

/**
@dev Creates a mock for the event TokensCommitted

Example:
    event TokensCommitted(
        address indexed _grantor,
        uint256 indexed _depositId,
        address indexed _tokenAddress,
        uint256 _tokenId,
        uint256 _tokenAmount
    );
 */

export function createNewTokensCommittedEvent(
  grantor: string,
  depositId: BigInt,
  tokenAddress: string,
  tokenId: BigInt,
  tokenAmount: BigInt,
): TokensCommitted {
  const event = changetype<TokensCommitted>(newMockEvent())
  event.address = Address.fromString(ZERO_ADDRESS)
  event.parameters = new Array<ethereum.EventParam>()
  event.transaction.from = Address.fromString(grantor)
  event.parameters.push(buildEventParamAddress('_grantor', grantor))
  event.parameters.push(buildEventParamUint('_depositId', depositId))
  event.parameters.push(buildEventParamAddress('_tokenAddress', tokenAddress))
  event.parameters.push(buildEventParamUint('_tokenId', tokenId))
  event.parameters.push(buildEventParamUint('_tokenAmount', tokenAmount))
  return event
}

/**
@dev Creates a mock for the event TokensReleased

Example:
    event TokensReleased(uint256 indexed _depositId)
 */

export function createNewTokensReleasedEvent(depositId: BigInt): TokensReleased {
  const event = changetype<TokensReleased>(newMockEvent())
  event.address = Address.fromString(ZERO_ADDRESS)
  event.parameters = new Array<ethereum.EventParam>()
  event.parameters.push(buildEventParamUint('_depositId', depositId))
  return event
}

/**
@dev Creates a mock for the event EquipDelegatedWearables

Example:
     event EquipDelegatedWearables(
        uint256 indexed _tokenId, 
        uint256[16] _oldDepositIds, 
        uint256[16] _newDepositIds
    );
 */
export function createNewEquipDelegatedWearablesEvent(
  tokenId: BigInt,
  oldDepositIds: BigInt[],
  newDepositIds: BigInt[],
): EquipDelegatedWearables {
  const event = changetype<EquipDelegatedWearables>(newMockEvent())
  event.address = Address.fromString(ZERO_ADDRESS)
  event.parameters = new Array<ethereum.EventParam>()
  event.parameters.push(buildEventParamUint('_tokenId', tokenId))
  event.parameters.push(buildEventParamUintArray('_oldDepositIds', oldDepositIds))
  event.parameters.push(buildEventParamUintArray('_newDepositIds', newDepositIds))
  return event
}