import { assert, describe, test, clearStore, afterEach, createMockedFunction } from 'matchstick-as'
import { createNewEquipDelegatedWearablesEvent } from './mocks/events'
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { bigIntArraytoString, intArraytoString } from './helpers/arrays'
import { handleEquipDelegatedWearables } from '../../src/mappings/diamond'
import { BIGINT_ONE, BIGINT_ZERO, STATUS_AAVEGOTCHI } from '../../src/utils/constants'
import { Aavegotchi } from '../../generated/schema'
import { getAavegotchiMock } from '../mocks'

const tokenId = BigInt.fromI32(123)
const commitmentId = BigInt.fromI32(1)
const address = Address.fromString(
  "0x1AD3d72e54Fb0eB46e87F82f77B284FC8a66b16C"
);

describe('EquipDelegatedWearables Handler', () => {
  afterEach(() => {
    clearStore()
  })

  test('Should create a update equipDelegatedWearables in aavegotchi entity', () => {
    assert.entityCount('TokenCommitment', 0)

    const oldCommitmentIds = new Array<BigInt>(16).fill(BigInt.zero())
    const newCommitmentIds = new Array<BigInt>(16).fill(BigInt.zero())
    newCommitmentIds[0] = commitmentId
    const equippedDelegatedWearables = new Array<i32>(16).fill(0)

    const event = createNewEquipDelegatedWearablesEvent(tokenId, oldCommitmentIds, newCommitmentIds)
    const gotchi = new Aavegotchi(tokenId.toString());
    gotchi.gotchiId = BigInt.fromString(tokenId.toString());
    gotchi.withSetsRarityScore = BIGINT_ONE;
    gotchi.kinship = BIGINT_ONE;
    gotchi.hauntId = BIGINT_ONE;
    gotchi.name = "Test Gotchi";
    gotchi.nameLowerCase = "test gotchi";
    gotchi.randomNumber = BIGINT_ONE;
    gotchi.status = STATUS_AAVEGOTCHI;
    gotchi.numericTraits = [1, 1, 1];
    gotchi.modifiedNumericTraits = [1, 1, 1];
    gotchi.equippedWearables = equippedDelegatedWearables;
    gotchi.equippedDelegatedWearables = equippedDelegatedWearables;
    gotchi.collateral = address;
    gotchi.escrow = address;
    gotchi.stakedAmount = BIGINT_ONE;
    gotchi.minimumStake = BIGINT_ONE;
    gotchi.lastInteracted = BIGINT_ONE;
    gotchi.experience = BIGINT_ONE;
    gotchi.toNextLevel = BIGINT_ONE;
    gotchi.usedSkillPoints = BIGINT_ONE;
    gotchi.level = BIGINT_ONE;
    gotchi.baseRarityScore = BIGINT_ONE;
    gotchi.modifiedRarityScore = BIGINT_ONE;
    gotchi.locked = false;
    gotchi.originalOwner = address.toHexString();
    gotchi.owner = address.toHexString();
    gotchi.timesTraded = BIGINT_ONE;
    gotchi.save()

      // calls getAavegotchi
    createMockedFunction(
        event.address,
        "getAavegotchi",
        "getAavegotchi(uint256):((uint256,string,address,uint256,uint256,int16[6],int16[6],uint16[16],address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,(uint256,uint256,(string,string,string,int8[6],bool[16],uint8[],(uint8,uint8,uint8,uint8),uint256,uint256,uint256,uint32,uint8,bool,uint16,bool,uint8,int16,uint32))[]))"
    )
        .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
        .returns(getAavegotchiMock(event));

    // calls findWearableSets
    createMockedFunction(
        event.address,
        "findWearableSets",
        "findWearableSets(uint256[]):(uint256[])"
    )
        .withArgs([ethereum.Value.fromUnsignedBigIntArray([BIGINT_ONE])])
        .returns([ethereum.Value.fromUnsignedBigIntArray([BIGINT_ZERO])]);

    // calls getWearableSets
    createMockedFunction(
        event.address,
        "getWearableSets",
        "getWearableSets():((string,uint8[],uint16[],int8[5])[])"
    )
        // .withArgs([])
        .returns([
            ethereum.Value.fromTupleArray([
                changetype<ethereum.Tuple>([
                    ethereum.Value.fromString("yes"),
                    ethereum.Value.fromUnsignedBigIntArray([BIGINT_ONE]),
                    ethereum.Value.fromUnsignedBigIntArray([BIGINT_ONE]),
                    ethereum.Value.fromUnsignedBigIntArray([
                        BigInt.fromI32(10),
                        BIGINT_ONE,
                        BIGINT_ONE,
                        BIGINT_ONE,
                        BIGINT_ONE,
                    ]),
                ]),
            ]),
        ]);

    assert.entityCount('Aavegotchi', 1)
    assert.fieldEquals('Aavegotchi', gotchi.id, 'equippedDelegatedWearables', intArraytoString(equippedDelegatedWearables))

    handleEquipDelegatedWearables(event)

    assert.entityCount('Aavegotchi', 1)
    assert.fieldEquals('Aavegotchi', gotchi.id, 'equippedDelegatedWearables', bigIntArraytoString(newCommitmentIds))
  })
})
