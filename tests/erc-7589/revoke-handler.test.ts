import { assert, describe, test, clearStore, afterEach, beforeEach } from 'matchstick-as'
import { createNewRoleRevokedEvent } from './mocks/events'
import { handleRoleRevoked } from '../../src/mappings/erc-7589'
import { Bytes, BigInt, Address } from '@graphprotocol/graph-ts'
import {
  createMockRoleAssignment,
  createMockTokenCommitment,
} from './mocks/entities'
import { Addresses, ZERO_ADDRESS } from './helpers/contants'
import {
  findOrCreateRole,
  findOrCreateRolesRegistry,
  generateRoleAssignmentId,
  generateTokenCommitmentId,
} from '../../src/utils/helpers/erc-7589'
import { User } from '../../generated/schema'
import { validateRole } from './helpers/assertion'
import { getOrCreateUser } from '../../src/utils/helpers/diamond'

const tokenId = BigInt.fromI32(123)
const RoleAssignmentId = Bytes.fromUTF8('0xGrantRole')
const commitmentId = BigInt.fromI32(1)
const tokenAddress = Addresses[0]
const tokenAmount = BigInt.fromI32(1)
const grantee = Addresses[1]
const revoker = Addresses[2]
const expirationDate = BigInt.fromI32(99999)
const data = Bytes.fromUTF8('data')
const rolesRegistry = ZERO_ADDRESS
const ONE = BigInt.fromI32(1)
const TWO = BigInt.fromI32(2)

describe('ERC-7589 RoleRevoked Handler', () => {
  beforeEach(() => {
    createMockTokenCommitment(revoker, tokenAddress, tokenId, rolesRegistry, commitmentId, tokenAmount, false)
  })
  afterEach(() => {
    clearStore()
  })

  test('should not revoke roleAssignment when revoker does not exist', () => {
    assert.entityCount('RoleAssignment', 0)

    const event = createNewRoleRevokedEvent(commitmentId, RoleAssignmentId, grantee)
    handleRoleRevoked(event)

    assert.entityCount('RoleAssignment', 0)
  })

  test('should not revoke roleAssignment when grantee does not exist', () => {
    assert.entityCount('RoleAssignment', 0)

    const event = createNewRoleRevokedEvent(commitmentId, RoleAssignmentId, grantee)
    handleRoleRevoked(event)

    assert.entityCount('RoleAssignment', 0)
  })

  test('should not revoke roleAssignment when roleAssignment does not exist', () => {
    getOrCreateUser(grantee)
    assert.entityCount('RoleAssignment', 0)

    const event = createNewRoleRevokedEvent(commitmentId, RoleAssignmentId, grantee)
    handleRoleRevoked(event)

    assert.entityCount('RoleAssignment', 0)
  })

  test('should not revoke roleAssignment when roleAssignment already expired', () => {
    const granteeUser = getOrCreateUser(grantee)
    createMockRoleAssignment(
      RoleAssignmentId,
      revoker,
      grantee,
      tokenAddress,
      tokenId,
      BigInt.fromI32(0),
      rolesRegistry,
      commitmentId.toString(),
    )
    assert.entityCount('RoleAssignment', 1)

    const event = createNewRoleRevokedEvent(commitmentId, RoleAssignmentId, grantee)
    handleRoleRevoked(event)

    assert.entityCount('RoleAssignment', 1)

    const _id = generateRoleAssignmentId(
      findOrCreateRolesRegistry(rolesRegistry),
      granteeUser,
      RoleAssignmentId,
      commitmentId.toString(),
    )
    assert.fieldEquals('RoleAssignment', _id, 'expirationDate', '0')
  })

  test('should revoke multiple roles for the same NFT', () => {
    const commitmentId1 = BigInt.fromI32(2)
    const commitmentId2 = BigInt.fromI32(3)
    const commitmentId3 = BigInt.fromI32(4)

    const tokenCommitmentId1 = generateTokenCommitmentId(rolesRegistry, commitmentId1)
    const tokenCommitmentId2 = generateTokenCommitmentId(rolesRegistry, commitmentId2)
    const tokenCommitmentId3 = generateTokenCommitmentId(rolesRegistry, commitmentId3)

    createMockTokenCommitment(revoker, tokenAddress, tokenId, rolesRegistry, commitmentId1, tokenAmount, false)
    createMockTokenCommitment(revoker, tokenAddress, tokenId, rolesRegistry, commitmentId2, tokenAmount, false)
    createMockTokenCommitment(revoker, tokenAddress, tokenId, rolesRegistry, commitmentId3, tokenAmount, false)

    const User1 = getOrCreateUser(Addresses[0])
    const User2 = getOrCreateUser(Addresses[1])
    const User3 = getOrCreateUser(Addresses[2])

    createMockRoleAssignment(
      RoleAssignmentId,
      revoker,
      Addresses[0],
      tokenAddress,
      tokenId,
      expirationDate,
      rolesRegistry,
      tokenCommitmentId1,
    )
    createMockRoleAssignment(
      RoleAssignmentId,
      revoker,
      Addresses[1],
      tokenAddress,
      tokenId,
      expirationDate.plus(ONE),
      rolesRegistry,
      tokenCommitmentId2,
    )
    createMockRoleAssignment(
      RoleAssignmentId,
      revoker,
      Addresses[2],
      tokenAddress,
      tokenId,
      expirationDate.plus(TWO),
      rolesRegistry,
      tokenCommitmentId3,
    )
    assert.entityCount('RoleAssignment', 3)
    assert.entityCount('Role', 3)

    const event1 = createNewRoleRevokedEvent(commitmentId1, RoleAssignmentId, Addresses[0])
    event1.address = Address.fromString(rolesRegistry)
    handleRoleRevoked(event1)

    const event2 = createNewRoleRevokedEvent(commitmentId2, RoleAssignmentId, Addresses[1])
    event2.address = Address.fromString(rolesRegistry)
    handleRoleRevoked(event2)

    const event3 = createNewRoleRevokedEvent(commitmentId3, RoleAssignmentId, Addresses[2])
    event3.address = Address.fromString(rolesRegistry)
    handleRoleRevoked(event3)

    assert.entityCount('RoleAssignment', 3)
    assert.entityCount('Role', 3)
    const revokerUser = new User(revoker)
    validateRole(
      revokerUser,
      User1,
      tokenAddress,
      tokenId,
      RoleAssignmentId,
      ONE,
      data,
      rolesRegistry,
      tokenCommitmentId1,
    )
    validateRole(
      revokerUser,
      User2,
      tokenAddress,
      tokenId,
      RoleAssignmentId,
      ONE,
      data,
      rolesRegistry,
      tokenCommitmentId2,
    )
    validateRole(
      revokerUser,
      User3,
      tokenAddress,
      tokenId,
      RoleAssignmentId,
      ONE,
      data,
      rolesRegistry,
      tokenCommitmentId3,
    )
  })

  test('should revoke multiple roles for different NFTs', () => {
    const granteeUser = getOrCreateUser(grantee)
    const tokenId1 = BigInt.fromString('123')
    const tokenId2 = BigInt.fromString('456')
    const tokenId3 = BigInt.fromString('789')

    const tokenCommitment1 = createMockTokenCommitment(
      revoker,
      tokenAddress,
      tokenId1,
      rolesRegistry,
      BigInt.fromI32(2),
      tokenAmount,
      false,
    )
    const tokenCommitment2 = createMockTokenCommitment(
      revoker,
      tokenAddress,
      tokenId2,
      rolesRegistry,
      BigInt.fromI32(3),
      tokenAmount,
      false,
    )
    const tokenCommitment3 = createMockTokenCommitment(
      revoker,
      tokenAddress,
      tokenId3,
      rolesRegistry,
      BigInt.fromI32(4),
      tokenAmount,
      false,
    )
    createMockRoleAssignment(
      RoleAssignmentId,
      revoker,
      grantee,
      tokenAddress,
      tokenId1,
      expirationDate,
      rolesRegistry,
      tokenCommitment1.id,
    )
    createMockRoleAssignment(
      RoleAssignmentId,
      revoker,
      grantee,
      tokenAddress,
      tokenId2,
      expirationDate.plus(ONE),
      rolesRegistry,
      tokenCommitment2.id,
    )
    createMockRoleAssignment(
      RoleAssignmentId,
      revoker,
      grantee,
      tokenAddress,
      tokenId3,
      expirationDate.plus(TWO),
      rolesRegistry,
      tokenCommitment3.id,
    )
    assert.entityCount('RoleAssignment', 3)
    assert.entityCount('Role', 3)

    const event1 = createNewRoleRevokedEvent(tokenCommitment1.commitmentId, RoleAssignmentId, grantee)
    event1.address = Address.fromString(rolesRegistry)
    handleRoleRevoked(event1)

    const event2 = createNewRoleRevokedEvent(tokenCommitment2.commitmentId, RoleAssignmentId, grantee)
    event2.address = Address.fromString(rolesRegistry)
    handleRoleRevoked(event2)

    const event3 = createNewRoleRevokedEvent(tokenCommitment3.commitmentId, RoleAssignmentId, grantee)
    event3.address = Address.fromString(rolesRegistry)
    handleRoleRevoked(event3)

    assert.entityCount('RoleAssignment', 3)
    assert.entityCount('Role', 3)
    const revokerUser = new User(revoker)
    validateRole(
      revokerUser,
      granteeUser,
      tokenAddress,
      tokenId1,
      RoleAssignmentId,
      ONE,
      data,
      rolesRegistry,
      tokenCommitment1.id,
    )
    validateRole(
      revokerUser,
      granteeUser,
      tokenAddress,
      tokenId2,
      RoleAssignmentId,
      ONE,
      data,
      rolesRegistry,
      tokenCommitment2.id,
    )
    validateRole(
      revokerUser,
      granteeUser,
      tokenAddress,
      tokenId3,
      RoleAssignmentId,
      ONE,
      data,
      rolesRegistry,
      tokenCommitment3.id,
    )
  })
})
