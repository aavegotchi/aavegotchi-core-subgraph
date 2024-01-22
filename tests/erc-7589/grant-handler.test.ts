import { assert, describe, test, clearStore, afterEach, beforeEach } from 'matchstick-as'
import { createNewRoleGrantedEvent } from './mocks/events'
import { handleRoleGranted } from '../../src/mappings/erc-7589'
import { Addresses, ZERO_ADDRESS } from './helpers/contants'
import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'
import { createMockTokenCommitment } from './mocks/entities'
import { User, TokenCommitment } from '../../generated/schema'
import { validateRole } from './helpers/assertion'
import { generateTokenCommitmentId } from '../../src/utils/helpers/erc-7589'

const RoleAssignmentId = Bytes.fromUTF8('0xGrantRole')
const tokenAddress = Addresses[0]
const tokenId = BigInt.fromI32(123)
const tokenAmount = BigInt.fromI32(1)
const grantee = Addresses[1]
const grantor = Addresses[2]
const revocable = true
const data = Bytes.fromUTF8('0x1234567890')
const expirationDate = BigInt.fromI32(99999)
const rolesRegistry = ZERO_ADDRESS
const commitmentId = BigInt.fromI32(1)

describe('ERC-7589 RoleGranted Handler', () => {
  beforeEach(() => {
    createMockTokenCommitment(grantor, tokenAddress, tokenId, rolesRegistry, commitmentId, tokenAmount, false)
  })
  afterEach(() => {
    clearStore()
  })

  test('should grant multiple roles for the same SFT', () => {
    assert.entityCount('RoleAssignment', 0)
    assert.entityCount('Role', 0)
    assert.entityCount('User', 1)

    const event1 = createNewRoleGrantedEvent(
      RoleAssignmentId,
      commitmentId,
      Addresses[0],
      expirationDate,
      revocable,
      data,
    )
    const tokenCommitment1 = TokenCommitment.load(generateTokenCommitmentId(event1.address.toHexString(), commitmentId))
    handleRoleGranted(event1)

    const event2 = createNewRoleGrantedEvent(
      RoleAssignmentId,
      commitmentId.plus(BigInt.fromI32(1)),
      Addresses[1],
      expirationDate,
      revocable,
      data,
    )
    const tokenCommitment2 = createMockTokenCommitment(
      grantor,
      tokenAddress,
      tokenId,
      event2.address.toHexString(),
      commitmentId.plus(BigInt.fromI32(1)),
      tokenAmount,
      false,
    )
    handleRoleGranted(event2)

    const event3 = createNewRoleGrantedEvent(
      RoleAssignmentId,
      commitmentId.plus(BigInt.fromI32(2)),
      Addresses[2],
      expirationDate,
      revocable,
      data,
    )
    const tokenCommitment3 = createMockTokenCommitment(
      grantor,
      tokenAddress,
      tokenId,
      event3.address.toHexString(),
      commitmentId.plus(BigInt.fromI32(2)),
      tokenAmount,
      false,
    )
    handleRoleGranted(event3)

    assert.entityCount('RoleAssignment', 3)
    assert.entityCount('Role', 3)
    assert.entityCount('User', 3)

    const grantorUser = new User(grantor)
    validateRole(
      grantorUser,
      new User(Addresses[0]),
      tokenAddress,
      tokenId,
      RoleAssignmentId,
      expirationDate,
      data,
      event1.address.toHex(),
      BigInt.zero(),
      tokenCommitment1!.id,
    )
    validateRole(
      grantorUser,
      new User(Addresses[1]),
      tokenAddress,
      tokenId,
      RoleAssignmentId,
      expirationDate,
      data,
      event2.address.toHex(),
      BigInt.zero(),
      tokenCommitment2.id,
    )
    validateRole(
      grantorUser,
      new User(Addresses[2]),
      tokenAddress,
      tokenId,
      RoleAssignmentId,
      expirationDate,
      data,
      event3.address.toHex(),
      BigInt.zero(),
      tokenCommitment3.id,
    )
  })

  test('should grant multiple roles for different SFTs', () => {
    const tokenId1 = BigInt.fromI32(123)
    const tokenId2 = BigInt.fromI32(456)
    const tokenId3 = BigInt.fromI32(789)

    const tokenCommitment1 = createMockTokenCommitment(
      grantor,
      tokenAddress,
      tokenId1,
      rolesRegistry,
      BigInt.fromI32(1),
      tokenAmount,
      false,
    )
    const tokenCommitment2 = createMockTokenCommitment(
      grantor,
      tokenAddress,
      tokenId2,
      rolesRegistry,
      BigInt.fromI32(2),
      tokenAmount,
      false,
    )
    const tokenCommitment3 = createMockTokenCommitment(
      grantor,
      tokenAddress,
      tokenId3,
      rolesRegistry,
      BigInt.fromI32(3),
      tokenAmount,
      false,
    )
    assert.entityCount('RoleAssignment', 0)
    assert.entityCount('Role', 0)
    assert.entityCount('User', 1)

    const event1 = createNewRoleGrantedEvent(
      RoleAssignmentId,
      tokenCommitment1.commitmentId,
      Addresses[0],
      expirationDate,
      revocable,
      data,
    )
    event1.address = Address.fromString(rolesRegistry)
    handleRoleGranted(event1)
    const event2 = createNewRoleGrantedEvent(
      RoleAssignmentId,
      tokenCommitment2.commitmentId,
      Addresses[1],
      expirationDate,
      revocable,
      data,
    )
    event2.address = Address.fromString(rolesRegistry)
    handleRoleGranted(event2)
    const event3 = createNewRoleGrantedEvent(
      RoleAssignmentId,
      tokenCommitment3.commitmentId,
      Addresses[2],
      expirationDate,
      revocable,
      data,
    )
    event3.address = Address.fromString(rolesRegistry)
    handleRoleGranted(event3)

    assert.entityCount('RoleAssignment', 3)
    assert.entityCount('Role', 3)
    assert.entityCount('User', 3)

    const grantorUser = new User(grantor)
    validateRole(
      grantorUser,
      new User(Addresses[0]),
      tokenAddress,
      tokenId1,
      RoleAssignmentId,
      expirationDate,
      data,
      rolesRegistry,
      BigInt.zero(),
      tokenCommitment1.id,
    )
    validateRole(
      grantorUser,
      new User(Addresses[1]),
      tokenAddress,
      tokenId2,
      RoleAssignmentId,
      expirationDate,
      data,
      rolesRegistry,
      BigInt.zero(),
      tokenCommitment2.id,
    )
    validateRole(
      grantorUser,
      new User(Addresses[2]),
      tokenAddress,
      tokenId3,
      RoleAssignmentId,
      expirationDate,
      data,
      rolesRegistry,
      BigInt.zero(),
      tokenCommitment3.id,
    )
  })

  test('should update lastNonRevocableExpirationDate when revocable is false', () => {
    assert.entityCount('RoleAssignment', 0)
    assert.entityCount('Role', 0)
    assert.entityCount('User', 1)

    const event1 = createNewRoleGrantedEvent(
      RoleAssignmentId,
      commitmentId,
      Addresses[0],
      expirationDate,
      false,
      data,
    )
    handleRoleGranted(event1)

    const grantorUser = new User(grantor)
    validateRole(
      grantorUser,
      new User(Addresses[0]),
      tokenAddress,
      tokenId,
      RoleAssignmentId,
      expirationDate,
      data,
      event1.address.toHex(),
      expirationDate,
      generateTokenCommitmentId(rolesRegistry, commitmentId),
    )
  })
})
