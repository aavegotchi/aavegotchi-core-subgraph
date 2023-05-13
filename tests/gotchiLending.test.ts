import { Address, Bytes, ethereum, store } from "@graphprotocol/graph-ts";
import {
    test,
    assert,
    clearStore,
    createMockedFunction,
    newMockEvent,
} from "matchstick-as/assembly/index";
import {
    Aavegotchi,
    ERC721Listing,
    Portal,
    Whitelist,
} from "../generated/schema";
import {
    handleClaimAavegotchi,
    handleGotchiLendingAdded2,
    handleGotchiLendingCancelled2,
    handleGotchiLendingClaimed2,
    handleGotchiLendingEnded2,
    handleGotchiLendingExecuted2,
} from "../src/mappings/diamond";
import { BIGINT_ONE } from "../src/utils/constants";
import { getAavegotchiMock, getClaimAavegotchiEvent } from "./mocks";
import {
    GotchiLendingAdded1,
    GotchiLendingCancelled,
    GotchiLendingClaimed1,
    GotchiLendingEnded1,
    GotchiLendingExecuted1,
} from "../generated/AavegotchiDiamond/AavegotchiDiamond";

const address = Address.fromString(
    "0x1AD3d72e54Fb0eB46e87F82f77B284FC8a66b16C"
);

test("add gotchi lending", () => {
    const lendingTuple: ethereum.Tuple = changetype<ethereum.Tuple>([
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromAddress(address),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromI32Array([1, 2, 3]),
        ethereum.Value.fromAddress(address),
        ethereum.Value.fromAddress(address),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromAddressArray([address]),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
    ]);

    let gotchi = new Aavegotchi("1");
    gotchi.withSetsRarityScore = BIGINT_ONE;
    gotchi.kinship = BIGINT_ONE;
    gotchi.gotchiId = BIGINT_ONE;
    gotchi.hauntId = BIGINT_ONE;
    gotchi.name = "Test Gotchi";
    gotchi.nameLowerCase = "test gotchi";
    gotchi.randomNumber = BIGINT_ONE;
    gotchi.status = BIGINT_ONE;
    gotchi.numericTraits = [1, 1, 1];
    gotchi.modifiedNumericTraits = [1, 1, 1];
    gotchi.equippedWearables = [1];
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
    gotchi.save();

    let newMockevent = newMockEvent();
    let event = new GotchiLendingAdded1(
        newMockevent.address,
        newMockevent.logIndex,
        newMockevent.transactionLogIndex,
        newMockevent.logType,
        newMockevent.block,
        newMockevent.transaction,
        newMockevent.parameters,
        null
    );
    event.parameters = new Array<ethereum.EventParam>();
    event.block.number = BIGINT_ONE;

    event.parameters.push(
        new ethereum.EventParam(
            "lending",
            ethereum.Value.fromTuple(lendingTuple)
        )
    );

    let contractAddress = Address.fromString(
        "0x86935F11C86623deC8a25696E1C19a8659CbF95d"
    );
    event.address = contractAddress;

    // init
    let whitelist = new Whitelist("1");
    whitelist.name = "Test Whitelist";
    whitelist.members = new Array<Bytes>();
    whitelist.owner = address.toHexString();
    whitelist.ownerAddress = address;
    whitelist.save();

    // create mock for updateAavegotchi and getAavegotchi
    createMockedFunction(
        event.address,
        "getAavegotchi",
        "getAavegotchi(uint256):((uint256,string,address,uint256,uint256,int16[6],int16[6],uint16[16],address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,(uint256,uint256,(string,string,string,int8[6],bool[16],uint8[],(uint8,uint8,uint8,uint8),uint256,uint256,uint256,uint32,uint8,bool,uint16,bool,uint8,int16,uint32))[]))"
    )
        .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
        .returns(getAavegotchiMock(event));

    handleGotchiLendingAdded2(event);

    assert.fieldEquals("GotchiLending", "1", "cancelled", "false");
    assert.fieldEquals("GotchiLending", "1", "completed", "false");
    assert.fieldEquals("GotchiLending", "1", "gotchi", "1");
    assert.fieldEquals("GotchiLending", "1", "gotchiTokenId", "1");
    assert.fieldEquals("GotchiLending", "1", "gotchiBRS", "1");
    assert.fieldEquals("GotchiLending", "1", "gotchiKinship", "1");
});

test("execute gotchi lending", () => {
    const lendingTuple: ethereum.Tuple = changetype<ethereum.Tuple>([
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromAddress(address),
        ethereum.Value.fromAddress(address),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromI32Array([1, 2, 3]),
        ethereum.Value.fromAddress(address),
        ethereum.Value.fromAddress(address),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromAddressArray([address]),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
    ]);
    let newMockevent = newMockEvent();
    let event = new GotchiLendingExecuted1(
        newMockevent.address,
        newMockevent.logIndex,
        newMockevent.transactionLogIndex,
        newMockevent.logType,
        newMockevent.block,
        newMockevent.transaction,
        newMockevent.parameters,
        null
    );
    event.parameters = new Array<ethereum.EventParam>();
    event.block.number = BIGINT_ONE;

    event.parameters.push(
        new ethereum.EventParam(
            "lending",
            ethereum.Value.fromTuple(lendingTuple)
        )
    );

    let contractAddress = Address.fromString(
        "0x86935F11C86623deC8a25696E1C19a8659CbF95d"
    );
    event.address = contractAddress;

    // create mock for updateAavegotchi and getAavegotchi
    createMockedFunction(
        event.address,
        "getAavegotchi",
        "getAavegotchi(uint256):((uint256,string,address,uint256,uint256,int16[6],int16[6],uint16[16],address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,(uint256,uint256,(string,string,string,int8[6],bool[16],uint8[],(uint8,uint8,uint8,uint8),uint256,uint256,uint256,uint32,uint8,bool,uint16,bool,uint8,int16,uint32))[]))"
    )
        .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
        .returns(getAavegotchiMock(event));

    handleGotchiLendingExecuted2(event);

    assert.fieldEquals("GotchiLending", "1", "cancelled", "false");
    assert.fieldEquals("GotchiLending", "1", "completed", "false");
    assert.fieldEquals("GotchiLending", "1", "gotchi", "1");
    assert.fieldEquals("GotchiLending", "1", "gotchiTokenId", "1");
    assert.fieldEquals("GotchiLending", "1", "gotchiBRS", "1");
    assert.fieldEquals("GotchiLending", "1", "gotchiKinship", "1");
});

test("claimed gotchi lending", () => {
    const lendingTuple: ethereum.Tuple = changetype<ethereum.Tuple>([
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromAddress(address),
        ethereum.Value.fromAddress(address),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromI32Array([1, 2, 3]),
        ethereum.Value.fromAddress(address),
        ethereum.Value.fromAddress(address),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromAddressArray([address]),
        ethereum.Value.fromUnsignedBigIntArray([BIGINT_ONE]),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
    ]);
    let newMockevent = newMockEvent();
    let event = new GotchiLendingClaimed1(
        newMockevent.address,
        newMockevent.logIndex,
        newMockevent.transactionLogIndex,
        newMockevent.logType,
        newMockevent.block,
        newMockevent.transaction,
        newMockevent.parameters,
        null
    );
    event.parameters = new Array<ethereum.EventParam>();
    event.block.number = BIGINT_ONE;

    event.parameters.push(
        new ethereum.EventParam(
            "lending",
            ethereum.Value.fromTuple(lendingTuple)
        )
    );

    let contractAddress = Address.fromString(
        "0x86935F11C86623deC8a25696E1C19a8659CbF95d"
    );
    event.address = contractAddress;

    // create mock for updateAavegotchi and getAavegotchi
    createMockedFunction(
        event.address,
        "getAavegotchi",
        "getAavegotchi(uint256):((uint256,string,address,uint256,uint256,int16[6],int16[6],uint16[16],address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,(uint256,uint256,(string,string,string,int8[6],bool[16],uint8[],(uint8,uint8,uint8,uint8),uint256,uint256,uint256,uint32,uint8,bool,uint16,bool,uint8,int16,uint32))[]))"
    )
        .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
        .returns(getAavegotchiMock(event));

    handleGotchiLendingClaimed2(event);

    assert.fieldEquals("GotchiLending", "1", "cancelled", "false");
    assert.fieldEquals("GotchiLending", "1", "completed", "false");
    assert.fieldEquals("GotchiLending", "1", "gotchi", "1");
    assert.fieldEquals("GotchiLending", "1", "gotchiTokenId", "1");
    assert.fieldEquals("GotchiLending", "1", "gotchiBRS", "1");
    assert.fieldEquals("GotchiLending", "1", "gotchiKinship", "1");
});

test("cancel gotchi lending", () => {
    const lendingTuple: ethereum.Tuple = changetype<ethereum.Tuple>([
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromAddress(address),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromI32Array([1, 2, 3]),
        ethereum.Value.fromAddress(address),
        ethereum.Value.fromAddress(address),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromAddressArray([address]),
        ethereum.Value.fromUnsignedBigIntArray([BIGINT_ONE]),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
    ]);
    let newMockevent = newMockEvent();
    let event = new GotchiLendingCancelled(
        newMockevent.address,
        newMockevent.logIndex,
        newMockevent.transactionLogIndex,
        newMockevent.logType,
        newMockevent.block,
        newMockevent.transaction,
        newMockevent.parameters,
        null
    );
    event.parameters = new Array<ethereum.EventParam>();
    event.block.number = BIGINT_ONE;

    event.parameters.push(
        new ethereum.EventParam(
            "lending",
            ethereum.Value.fromTuple(lendingTuple)
        )
    );

    let contractAddress = Address.fromString(
        "0x86935F11C86623deC8a25696E1C19a8659CbF95d"
    );
    event.address = contractAddress;

    // create mock for updateAavegotchi and getAavegotchi
    createMockedFunction(
        event.address,
        "getAavegotchi",
        "getAavegotchi(uint256):((uint256,string,address,uint256,uint256,int16[6],int16[6],uint16[16],address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,(uint256,uint256,(string,string,string,int8[6],bool[16],uint8[],(uint8,uint8,uint8,uint8),uint256,uint256,uint256,uint32,uint8,bool,uint16,bool,uint8,int16,uint32))[]))"
    )
        .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
        .returns(getAavegotchiMock(event));

    handleGotchiLendingCancelled2(event);

    assert.fieldEquals("GotchiLending", "1", "cancelled", "true");
    assert.fieldEquals("GotchiLending", "1", "completed", "false");
    assert.fieldEquals("GotchiLending", "1", "gotchi", "1");
    assert.fieldEquals("GotchiLending", "1", "gotchiTokenId", "1");
    assert.fieldEquals("GotchiLending", "1", "gotchiBRS", "1");
    assert.fieldEquals("GotchiLending", "1", "gotchiKinship", "1");
});

test("end gotchi lending", () => {
    const lendingTuple: ethereum.Tuple = changetype<ethereum.Tuple>([
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromAddress(address),
        ethereum.Value.fromAddress(address),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromI32Array([1, 2, 3]),
        ethereum.Value.fromAddress(address),
        ethereum.Value.fromAddress(address),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromAddressArray([address]),
        ethereum.Value.fromUnsignedBigIntArray([BIGINT_ONE]),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
    ]);
    let newMockevent = newMockEvent();
    let event = new GotchiLendingEnded1(
        newMockevent.address,
        newMockevent.logIndex,
        newMockevent.transactionLogIndex,
        newMockevent.logType,
        newMockevent.block,
        newMockevent.transaction,
        newMockevent.parameters,
        null
    );
    event.parameters = new Array<ethereum.EventParam>();
    event.block.number = BIGINT_ONE;

    event.parameters.push(
        new ethereum.EventParam(
            "lending",
            ethereum.Value.fromTuple(lendingTuple)
        )
    );

    let contractAddress = Address.fromString(
        "0x86935F11C86623deC8a25696E1C19a8659CbF95d"
    );
    event.address = contractAddress;

    // create mock for updateAavegotchi and getAavegotchi
    createMockedFunction(
        event.address,
        "getAavegotchi",
        "getAavegotchi(uint256):((uint256,string,address,uint256,uint256,int16[6],int16[6],uint16[16],address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,(uint256,uint256,(string,string,string,int8[6],bool[16],uint8[],(uint8,uint8,uint8,uint8),uint256,uint256,uint256,uint32,uint8,bool,uint16,bool,uint8,int16,uint32))[]))"
    )
        .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
        .returns(getAavegotchiMock(event));

    handleGotchiLendingEnded2(event);

    assert.fieldEquals("GotchiLending", "1", "completed", "true");
    assert.fieldEquals("GotchiLending", "1", "gotchi", "1");
    assert.fieldEquals("GotchiLending", "1", "gotchiTokenId", "1");
    assert.fieldEquals("GotchiLending", "1", "gotchiBRS", "1");
    assert.fieldEquals("GotchiLending", "1", "gotchiKinship", "1");
});
