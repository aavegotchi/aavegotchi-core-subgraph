import {
    test,
    assert,
    clearStore,
    createMockedFunction,
    newMockEvent,
} from "matchstick-as/assembly/index";
import {
    Address,
    BigInt,
    bigInt,
    ethereum,
    log,
} from "@graphprotocol/graph-ts";
import { handleAavegotchiInteract } from "../src/mappings/diamond";
import { AavegotchiInteract } from "../generated/AavegotchiDiamond/AavegotchiDiamond";
import { Aavegotchi } from "../generated/schema";
import { BIGINT_ONE, BIGINT_ZERO, ZERO_ADDRESS } from "../src/utils/constants";
import { getAavegotchiMock } from "./mocks";

test("Count as interacted if gotchi is claimed", () => {
    // Initialise
    let gotchi = new Aavegotchi("1");
    gotchi.locked = false;
    gotchi.gotchiId = BIGINT_ONE;
    gotchi.kinship = BIGINT_ZERO;
    gotchi.gotchiId = BIGINT_ONE;
    // gotchi.portal = "1";
    gotchi.hauntId = BIGINT_ONE;
    gotchi.name = "Test";
    gotchi.nameLowerCase = "Test";
    gotchi.randomNumber = BIGINT_ONE;
    gotchi.status = BigInt.fromI32(3);
    gotchi.numericTraits = [1, 1, 1, 1, 1, 1];
    gotchi.modifiedNumericTraits = [1, 1, 1, 1, 1, 1];
    gotchi.equippedWearables = [1, 1, 1, 1, 1, 1];
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
    gotchi.locked = false;
    gotchi.timesTraded = BIGINT_ONE;
    gotchi.save();

    // prepare event
    let newMockevent = newMockEvent();
    let event = new AavegotchiInteract(
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

    let _tokenId = new ethereum.EventParam(
        "_tokenId",
        ethereum.Value.fromI32(1)
    );
    event.parameters.push(_tokenId);

    // // create mock for updateAavegotchi and getAavegotchi
    createMockedFunction(
        newMockevent.address,
        "getAavegotchi",
        "getAavegotchi(uint256):((uint256,string,address,uint256,uint256,int16[6],int16[6],uint16[16],address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,(uint256,uint256,(string,string,string,int8[6],bool[16],uint8[],(uint8,uint8,uint8,uint8),uint256,uint256,uint256,uint32,uint8,bool,uint16,bool,uint8,int16,uint32))[]))"
    )
        .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
        .returns(getAavegotchiMock(event));

    // execute handler with event
    handleAavegotchiInteract(event);

    // assert and clear store
    assert.fieldEquals("Aavegotchi", "1", "kinship", "1");
});

test("Don't count as interacted if gotchi is portal", () => {
    // prepare event
    let newMockevent = newMockEvent();
    let event = new AavegotchiInteract(
        newMockevent.address,
        newMockevent.logIndex,
        newMockevent.transactionLogIndex,
        newMockevent.logType,
        newMockevent.block,
        newMockevent.transaction,
        newMockevent.parameters,
        null
    );

    let _tokenId = new ethereum.EventParam(
        "_tokenId",
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)
    );
    event.parameters.push(_tokenId);
    let contractAddress = Address.fromString(
        "0x86935F11C86623deC8a25696E1C19a8659CbF95d"
    );
    event.address = contractAddress;

    // create mock for updateAavegotchi and getAavegotchi
    createMockedFunction(
        contractAddress,
        "getAavegotchi",
        "getAavegotchi(uint256):((uint256,string,address,uint256,uint256,int16[6],int16[6],uint16[16],address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,(uint256,uint256,(string,string,string,int8[6],bool[16],uint8[],(uint8,uint8,uint8,uint8),uint256,uint256,uint256,uint32,uint8,bool,uint16,bool,uint8,int16,uint32))[]))"
    )
        .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
        .returns(getAavegotchiMock(event, BigInt.fromI32(2)));

    // execute handler with event
    handleAavegotchiInteract(event);

    // assert and clear store
    assert.fieldEquals("Aavegotchi", "1", "kinship", "1");
    clearStore();
});
