import {
    test,
    assert,
    clearStore,
    newMockEvent,
    createMockedFunction,
} from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { handleSpendSkillpoints } from "../src/mappings/diamond";
import { SpendSkillpoints } from "../generated/AavegotchiDiamond/AavegotchiDiamond";
import { BIGINT_ONE, BIGINT_ZERO, ZERO_ADDRESS } from "../src/utils/constants";
import { getAavegotchiMock } from "./mocks";
import { Aavegotchi } from "../generated/schema";

test("should update withSetsRarityScore", () => {
    let gotchi = new Aavegotchi("1");
    gotchi.locked = false;
    gotchi.gotchiId = BIGINT_ONE;
    gotchi.kinship = BIGINT_ZERO;
    gotchi.gotchiId = BIGINT_ONE;
    gotchi.portal = "1";
    gotchi.hauntId = BIGINT_ONE;
    gotchi.name = "Test";
    gotchi.nameLowerCase = "test";
    gotchi.randomNumber = BIGINT_ONE;
    gotchi.status = BigInt.fromI32(3);
    gotchi.numericTraits = [1, 1, 1, 1, 1, 1];
    gotchi.modifiedNumericTraits = [1, 1, 1, 1, 1, 1];
    gotchi.equippedWearables = [1, 1, 1, 1, 1, 1];
    gotchi.historicalPrices = [];
    gotchi.collateral = Address.fromString(ZERO_ADDRESS);
    gotchi.escrow = Address.fromString(ZERO_ADDRESS);
    gotchi.stakedAmount = BIGINT_ONE;
    gotchi.minimumStake = BIGINT_ONE;
    gotchi.kinship = BIGINT_ONE;
    gotchi.lastInteracted = BIGINT_ONE;
    gotchi.experience = BIGINT_ONE;
    gotchi.toNextLevel = BIGINT_ONE;
    gotchi.usedSkillPoints = BIGINT_ONE;
    gotchi.level = BIGINT_ONE;
    gotchi.baseRarityScore = BIGINT_ONE;
    gotchi.modifiedRarityScore = BIGINT_ONE;
    gotchi.withSetsRarityScore = BIGINT_ONE;
    gotchi.locked = false;
    gotchi.timesTraded = BIGINT_ONE;
    gotchi.save();

    // prepare event
    let newMockevent = newMockEvent();
    let event = new SpendSkillpoints(
        newMockevent.address,
        newMockevent.logIndex,
        newMockevent.transactionLogIndex,
        newMockevent.logType,
        newMockevent.block,
        newMockevent.transaction,
        newMockevent.parameters,
        null
    );
    event.parameters = new Array();
    event.parameters.push(
        new ethereum.EventParam(
            "_tokenId",
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)
        )
    );
    event.parameters.push(
        new ethereum.EventParam(
            "_values",
            ethereum.Value.fromUnsignedBigIntArray([BIGINT_ONE, BIGINT_ONE])
        )
    );

    event.transaction.to = newMockevent.address;
    event.transaction.from = newMockevent.address;

    // calls getAavegotchi
    createMockedFunction(
        newMockevent.address,
        "getAavegotchi",
        "getAavegotchi(uint256):((uint256,string,address,uint256,uint256,int16[6],int16[6],uint16[16],address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,(uint256,uint256,(string,string,string,int8[6],bool[16],uint8[],(uint8,uint8,uint8,uint8),uint256,uint256,uint256,uint32,uint8,bool,uint16,bool,uint8,int16,uint32))[]))"
    )
        .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
        .returns(getAavegotchiMock(event));

    // calls findWearableSets
    createMockedFunction(
        newMockevent.address,
        "findWearableSets",
        "findWearableSets(uint256[]):(uint256[])"
    )
        .withArgs([ethereum.Value.fromUnsignedBigIntArray([BIGINT_ONE])])
        .returns([ethereum.Value.fromUnsignedBigIntArray([BIGINT_ZERO])]);

    // calls getWearableSets
    createMockedFunction(
        newMockevent.address,
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

    // execute handler with event
    handleSpendSkillpoints(event);

    // assert and clear store
    assert.fieldEquals("Aavegotchi", "1", "withSetsRarityScore", "7");
    clearStore();
});
