import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import {
    test,
    assert,
    createMockedFunction,
    newMockEvent,
} from "matchstick-as/assembly/index";
import { Aavegotchi, Whitelist } from "../generated/schema";
import {
    handleGotchiLendingAdded2,
    handleGotchiLendingCancelled2,
    handleGotchiLendingClaimed2,
    handleGotchiLendingEnded2,
    handleGotchiLendingExecuted2,
} from "../src/mappings/diamond";
import { BIGINT_ONE, BIGINT_ZERO } from "../src/utils/constants";
import { getAavegotchiMock } from "./mocks";
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

const borrower = Address.fromString(
    "0x5C647cA5e2Bc5BD17c40410FcB8003D38879Ae50"
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
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(257)),
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
    gotchi.equippedDelegatedWearables = [1];
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
    let members = new Array<Bytes>();
    members.push(address);

    whitelist.members = members;
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

    // check gotchi lending entity
    assert.fieldEquals("GotchiLending", "1", "cancelled", "false");
    assert.fieldEquals("GotchiLending", "1", "completed", "false");
    assert.fieldEquals("GotchiLending", "1", "gotchi", "1");
    assert.fieldEquals("GotchiLending", "1", "gotchiTokenId", "1");
    assert.fieldEquals("GotchiLending", "1", "gotchiBRS", "1");
    assert.fieldEquals("GotchiLending", "1", "gotchiKinship", "1");
    assert.fieldEquals("GotchiLending", "1", "upfrontCost", "1");
    assert.fieldEquals("GotchiLending", "1", "rentDuration", "1");
    assert.fieldEquals("GotchiLending", "1", "lender", address.toHexString());
    assert.fieldEquals(
        "GotchiLending",
        "1",
        "originalOwner",
        address.toHexString()
    );
    assert.fieldEquals("GotchiLending", "1", "period", "1");
    assert.fieldEquals("GotchiLending", "1", "splitOwner", "1");
    assert.fieldEquals("GotchiLending", "1", "splitBorrower", "2");
    assert.fieldEquals("GotchiLending", "1", "splitOther", "3");
    assert.fieldEquals(
        "GotchiLending",
        "1",
        "thirdPartyAddress",
        address.toHexString()
    );
    assert.fieldEquals("Aavegotchi", "1", "locked", "true");
    assert.fieldEquals("GotchiLending", "1", "timeCreated", "1");
    assert.fieldEquals("GotchiLending", "1", "channellingAllowed", "true");
    assert.fieldEquals("GotchiLending", "1", "whitelist", "1");
    assert.fieldEquals("GotchiLending", "1", "whitelistId", "1");
    assert.fieldEquals(
        "GotchiLending",
        "1",
        "whitelistMembers",
        "[0x1ad3d72e54fb0eb46e87f82f77b284fc8a66b16c]"
    );
});

test("execute gotchi lending", () => {
    const lendingTuple: ethereum.Tuple = changetype<ethereum.Tuple>([
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromAddress(address),
        ethereum.Value.fromAddress(borrower),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromI32Array([1, 2, 3]),
        ethereum.Value.fromAddress(address),
        ethereum.Value.fromAddress(address),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromAddressArray([address]),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(256)),
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

    // check gotchi lending entity
    assert.fieldEquals("GotchiLending", "1", "cancelled", "false");
    assert.fieldEquals("GotchiLending", "1", "completed", "false");
    assert.fieldEquals("GotchiLending", "1", "gotchi", "1");
    assert.fieldEquals("GotchiLending", "1", "gotchiTokenId", "1");
    assert.fieldEquals("GotchiLending", "1", "gotchiBRS", "1");
    assert.fieldEquals("GotchiLending", "1", "gotchiKinship", "1");
    assert.fieldEquals("GotchiLending", "1", "upfrontCost", "1");
    assert.fieldEquals("GotchiLending", "1", "rentDuration", "1");
    assert.fieldEquals("GotchiLending", "1", "timeAgreed", "1");
    assert.fieldEquals("GotchiLending", "1", "channellingAllowed", "false");
    assert.fieldEquals(
        "GotchiLending",
        "1",
        "borrower",
        borrower.toHexString()
    );
    assert.fieldEquals("GotchiLending", "1", "lender", address.toHexString());
    assert.fieldEquals(
        "GotchiLending",
        "1",
        "originalOwner",
        address.toHexString()
    );
    assert.fieldEquals("GotchiLending", "1", "period", "1");
    assert.fieldEquals("GotchiLending", "1", "splitOwner", "1");
    assert.fieldEquals("GotchiLending", "1", "splitBorrower", "2");
    assert.fieldEquals("GotchiLending", "1", "splitOther", "3");
    assert.fieldEquals(
        "GotchiLending",
        "1",
        "thirdPartyAddress",
        address.toHexString()
    );
    assert.fieldEquals("GotchiLending", "1", "timeCreated", "1");
    assert.fieldEquals("GotchiLending", "1", "whitelist", "1");
    assert.fieldEquals("GotchiLending", "1", "whitelistId", "1");
    assert.fieldEquals(
        "GotchiLending",
        "1",
        "whitelistMembers",
        "[0x1ad3d72e54fb0eb46e87f82f77b284fc8a66b16c]"
    );

    assert.fieldEquals("Aavegotchi", "1", "owner", address.toHexString());
    assert.fieldEquals(
        "Aavegotchi",
        "1",
        "originalOwner",
        address.toHexString()
    );
    assert.fieldEquals("Aavegotchi", "1", "locked", "true");

    assert.fieldEquals("User", address.toHexString(), "gotchisLentOut", "[1]");
    assert.fieldEquals(
        "User",
        borrower.toHexString(),
        "gotchisBorrowed",
        "[1]"
    );

    assert.fieldEquals("Statistic", "0", "aavegotchisBorrowed", "1");
});

test("claimed gotchi lending", () => {
    const lendingTuple: ethereum.Tuple = changetype<ethereum.Tuple>([
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromAddress(address),
        ethereum.Value.fromAddress(borrower),
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
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(255)),
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

    assert.fieldEquals("GotchiLending", "1", "channellingAllowed", "false");

    assert.fieldEquals(
        "ClaimedToken",
        `1_${address.toHexString()}`,
        "amount",
        "1"
    );

    assert.fieldEquals("Aavegotchi", "1", "locked", "true");
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
        ethereum.Value.fromUnsignedBigInt(BIGINT_ZERO),
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
    assert.fieldEquals("GotchiLending", "1", "channellingAllowed", "false");
    assert.fieldEquals("Aavegotchi", "1", "locked", "false");
});

test("end gotchi lending", () => {
    const lendingTuple: ethereum.Tuple = changetype<ethereum.Tuple>([
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromAddress(address),
        ethereum.Value.fromAddress(borrower),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromI32Array([1, 2, 3]),
        ethereum.Value.fromAddress(address),
        ethereum.Value.fromAddress(address),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromAddressArray([address]),
        ethereum.Value.fromUnsignedBigIntArray([BIGINT_ONE]),
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(257)),
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
    assert.fieldEquals(
        "GotchiLending",
        "1",
        "timeEnded",
        event.block.timestamp.toString()
    );
    assert.fieldEquals("GotchiLending", "1", "gotchi", "1");
    assert.fieldEquals("GotchiLending", "1", "gotchiTokenId", "1");
    assert.fieldEquals("GotchiLending", "1", "gotchiBRS", "1");
    assert.fieldEquals("GotchiLending", "1", "gotchiKinship", "1");
    assert.fieldEquals("GotchiLending", "1", "completed", "true");
    assert.fieldEquals("GotchiLending", "1", "channellingAllowed", "true");

    assert.fieldEquals("User", borrower.toHexString(), "gotchisBorrowed", "[]");
    assert.fieldEquals("User", address.toHexString(), "gotchisLentOut", "[]");

    assert.fieldEquals("Aavegotchi", "1", "owner", address.toHexString());
    assert.fieldEquals(
        "Aavegotchi",
        "1",
        "originalOwner",
        address.toHexString()
    );
    assert.fieldEquals(
        "Aavegotchi",
        "1",
        "originalOwner",
        address.toHexString()
    );

    assert.fieldEquals("Aavegotchi", "1", "lending", "null");
    assert.fieldEquals("Aavegotchi", "1", "lending", "null");
    assert.fieldEquals("Aavegotchi", "1", "locked", "false");
});
