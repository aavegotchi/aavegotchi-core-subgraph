import { assert, describe, test, clearStore, afterEach } from 'matchstick-as'
import { createNewTokensCommittedEvent } from './mocks/events'
import { handleTokensCommitted } from '../../src/mappings/erc-7589'
import { Addresses } from './helpers/contants'
import { BigInt } from '@graphprotocol/graph-ts'
import { validateTokenCommitment } from './helpers/assertion'

const tokenAddress = Addresses[0]
const tokenId = BigInt.fromI32(123)
const tokenAmount = BigInt.fromI32(1)
const grantor = Addresses[2]
const commitmentId = BigInt.fromI32(1)

describe('ERC-7589 TokensCommitted Handler', () => {
  afterEach(() => {
    clearStore()
  })

  test('Should create a new TokensCommitted entity', () => {
    assert.entityCount('TokenCommitment', 0)

    const event = createNewTokensCommittedEvent(grantor, commitmentId, tokenAddress, tokenId, tokenAmount)
    handleTokensCommitted(event)

    assert.entityCount('TokenCommitment', 1)
    validateTokenCommitment(
      commitmentId,
      grantor,
      tokenAddress,
      tokenId,
      tokenAmount,
      event.address.toHexString(),
      false,
    )
  })
})
