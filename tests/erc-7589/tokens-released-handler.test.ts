import { assert, describe, test, clearStore, afterEach } from 'matchstick-as'
import { createNewTokensReleasedEvent } from './mocks/events'
import { handleTokensReleased } from '../../src/mappings/erc-7589'
import { Addresses } from './helpers/contants'
import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import { createMockRoleAssignment, createMockTokenCommitment } from './mocks/entities'
import { validateTokenCommitment } from './helpers/assertion'

const tokenAddress = Addresses[0]
const tokenId = BigInt.fromI32(123)
const tokenAmount = BigInt.fromI32(1)
const grantor = Addresses[2]
const grantee = Addresses[1]
const depositId = BigInt.fromI32(1)
const roleHash = Bytes.fromHexString('0x3d926b0dd5f4880fb18c9a49c890c7d76c2a97e0d4b4c20f1bb3fe6e5f89f5f4')

describe('ERC-7589 TokensReleased Handler', () => {
  afterEach(() => {
    clearStore()
  })

  test('Should update TokensCommitment entity isReleased to true', () => {
    const event = createNewTokensReleasedEvent(depositId)

    createMockTokenCommitment(grantor, tokenAddress, tokenId, event.address.toHexString(), depositId, tokenAmount, false)
    assert.entityCount('TokenCommitment', 1)

    handleTokensReleased(event)

    assert.entityCount('TokenCommitment', 1)
    validateTokenCommitment(
      depositId,
      grantor,
      tokenAddress,
      tokenId,
      tokenAmount,
      event.address.toHexString(),
      true,
    )
  })

  test('Should update roleAssignment expiration date', () => {
    const event = createNewTokensReleasedEvent(depositId)
    const expirationDate = BigInt.fromI32(86400).plus(BigInt.fromI32(event.block.timestamp.toI32()))

    const tokenCommitment = createMockTokenCommitment(
      grantor,
      tokenAddress,
      tokenId,
      event.address.toHexString(),
      depositId,
      tokenAmount,
      false,
    )
    const roleAssignment = createMockRoleAssignment(
      roleHash,
      grantor,
      grantee,
      tokenAddress,
      tokenId,
      expirationDate,
      event.address.toHexString(),
      tokenCommitment.id,
    )

    assert.entityCount('TokenCommitment', 1)
    assert.entityCount('RoleAssignment', 1)
    assert.fieldEquals('RoleAssignment', roleAssignment.id, 'expirationDate', expirationDate.toString())

    handleTokensReleased(event)

    assert.entityCount('TokenCommitment', 1)
    assert.entityCount('RoleAssignment', 1)
    assert.fieldEquals('RoleAssignment', roleAssignment.id, 'expirationDate', event.block.timestamp.toString())
    validateTokenCommitment(
      depositId,
      grantor,
      tokenAddress,
      tokenId,
      tokenAmount,
      event.address.toHexString(),
      true,
    )
  })

  test('Should skip if tokensCommitment does not exist', () => {
    assert.entityCount('TokenCommitment', 0)

    const event = createNewTokensReleasedEvent(depositId)
    handleTokensReleased(event)

    assert.entityCount('TokenCommitment', 0)
  })
})
