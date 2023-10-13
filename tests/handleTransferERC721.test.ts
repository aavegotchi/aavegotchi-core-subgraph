import {
    test,
    assert,
    clearStore,
    newMockEvent,
    createMockedFunction,
} from "matchstick-as/assembly/index";
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { handleTransfer } from "../src/mappings/diamond";
import { Transfer } from "../generated/AavegotchiDiamond/AavegotchiDiamond";
import {
    BIGINT_ONE,
    BIGINT_ZERO,
    PORTAL_STATUS_BOUGHT,
    STATUS_AAVEGOTCHI,
    STATUS_CLOSED_PORTAL,
    ZERO_ADDRESS,
} from "../src/utils/constants";
import { getAavegotchiMock } from "./mocks";
import { Aavegotchi, Portal } from "../generated/schema";

test("handleTransferERC721 - should change owner of portal entity if token is portal", () => {
    let testAddressFrom = Address.fromString(
        "0x1AD3d72e54Fb0eB46e87F82f77B284FC8a66b16C"
    );
    let testAddressTo = Address.fromString(
        "0xf06dCbec97D02E0df8D304bdBBb7ccAb587C3e1f"
    );

    //init data
    let portal = new Portal("1");
    portal.activeListing = BIGINT_ONE;
    portal.buyer = ZERO_ADDRESS;
    portal.hauntId = BIGINT_ONE;
    portal.owner = ZERO_ADDRESS;
    portal.status = PORTAL_STATUS_BOUGHT;
    portal.timesTraded = BIGINT_ONE;
    portal.save();

    // prepare event
    let newMockevent = newMockEvent();
    let event = new Transfer(
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

    let _from = new ethereum.EventParam(
        "_from",
        ethereum.Value.fromAddress(testAddressFrom)
    );
    event.parameters.push(_from);

    let _to = new ethereum.EventParam(
        "_to",
        ethereum.Value.fromAddress(testAddressTo)
    );
    event.parameters.push(_to);

    let _id = new ethereum.EventParam(
        "_id",
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)
    );
    event.parameters.push(_id);

    event.transaction.to = newMockevent.address;
    event.transaction.from = newMockevent.address;

    // mock getAavegotchi
    // create mock for updateAavegotchi and getAavegotchi
    createMockedFunction(
        newMockevent.address,
        "getAavegotchi",
        "getAavegotchi(uint256):((uint256,string,address,uint256,uint256,int16[6],int16[6],uint16[16],address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,(uint256,uint256,(string,string,string,int8[6],bool[16],uint8[],(uint8,uint8,uint8,uint8),uint256,uint256,uint256,uint32,uint8,bool,uint16,bool,uint8,int16,uint32))[]))"
    )
        .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
        .returns(getAavegotchiMock(event, STATUS_AAVEGOTCHI));

    // execute handler with event
    handleTransfer(event);

    // assert and clear store
    assert.fieldEquals("Portal", "1", "owner", testAddressTo.toHexString());
    clearStore();
});

test("handleTransferERC721 - should change owner of aavegotchi entity if token is aavegotchi", () => {
    let testAddressFrom = Address.fromString(
        "0x1AD3d72e54Fb0eB46e87F82f77B284FC8a66b16C"
    );
    let testAddressTo = Address.fromString(
        "0xf06dCbec97D02E0df8D304bdBBb7ccAb587C3e1f"
    );

    //init data
    let portal = new Portal("1");
    portal.activeListing = BIGINT_ONE;
    portal.buyer = ZERO_ADDRESS;
    portal.hauntId = BIGINT_ONE;
    portal.owner = ZERO_ADDRESS;
    portal.status = PORTAL_STATUS_BOUGHT;
    portal.timesTraded = BIGINT_ONE;
    portal.save();

    let gotchi = new Aavegotchi("1");
    gotchi.locked = false;
    gotchi.owner = testAddressFrom.toHexString();
    gotchi.gotchiId = BIGINT_ONE;
    gotchi.kinship = BIGINT_ZERO;
    gotchi.gotchiId = BIGINT_ONE;
    // gotchi.portal = "1";
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
    gotchi.locked = false;
    gotchi.timesTraded = BIGINT_ONE;
    gotchi.save();

    // prepare event
    let newMockevent = newMockEvent();
    let event = new Transfer(
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

    let _from = new ethereum.EventParam(
        "_from",
        ethereum.Value.fromAddress(testAddressFrom)
    );
    event.parameters.push(_from);

    let _to = new ethereum.EventParam(
        "_to",
        ethereum.Value.fromAddress(testAddressTo)
    );
    event.parameters.push(_to);

    let _id = new ethereum.EventParam(
        "_id",
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)
    );
    event.parameters.push(_id);

    event.transaction.to = newMockevent.address;
    event.transaction.from = newMockevent.address;

    // mock getAavegotchi
    // create mock for updateAavegotchi and getAavegotchi
    createMockedFunction(
        newMockevent.address,
        "getAavegotchi",
        "getAavegotchi(uint256):((uint256,string,address,uint256,uint256,int16[6],int16[6],uint16[16],address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,(uint256,uint256,(string,string,string,int8[6],bool[16],uint8[],(uint8,uint8,uint8,uint8),uint256,uint256,uint256,uint32,uint8,bool,uint16,bool,uint8,int16,uint32))[]))"
    )
        .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
        .returns(getAavegotchiMock(event, STATUS_AAVEGOTCHI));

    // execute handler with event
    handleTransfer(event);

    // assert and clear store
    assert.fieldEquals("Aavegotchi", "1", "owner", testAddressTo.toHexString());
    clearStore();
});

test("handleTransferERC721 - should set owner to 0x0 of aavegotchi entity if gotchi is sacrified", () => {
    let testAddressFrom = Address.fromString(
        "0x1AD3d72e54Fb0eB46e87F82f77B284FC8a66b16C"
    );
    let testAddressTo = Address.fromString(
        "0x0000000000000000000000000000000000000000"
    );

    //init data
    let portal = new Portal("1");
    portal.activeListing = BIGINT_ONE;
    portal.buyer = ZERO_ADDRESS;
    portal.hauntId = BIGINT_ONE;
    portal.owner = ZERO_ADDRESS;
    portal.status = PORTAL_STATUS_BOUGHT;
    portal.timesTraded = BIGINT_ONE;
    portal.save();

    let gotchi = new Aavegotchi("1");
    gotchi.locked = false;
    gotchi.owner = testAddressFrom.toHexString();
    gotchi.gotchiId = BIGINT_ONE;
    gotchi.kinship = BIGINT_ZERO;
    gotchi.gotchiId = BIGINT_ONE;
    // gotchi.portal = "1";
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
    gotchi.locked = false;
    gotchi.timesTraded = BIGINT_ONE;
    gotchi.save();

    // prepare event
    let newMockevent = newMockEvent();
    let event = new Transfer(
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

    let _from = new ethereum.EventParam(
        "_from",
        ethereum.Value.fromAddress(testAddressFrom)
    );
    event.parameters.push(_from);

    let _to = new ethereum.EventParam(
        "_to",
        ethereum.Value.fromAddress(testAddressTo)
    );
    event.parameters.push(_to);

    let _id = new ethereum.EventParam(
        "_id",
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)
    );
    event.parameters.push(_id);

    event.transaction.to = newMockevent.address;
    event.transaction.from = newMockevent.address;

    // mock getAavegotchi
    // create mock for updateAavegotchi and getAavegotchi
    createMockedFunction(
        newMockevent.address,
        "getAavegotchi",
        "getAavegotchi(uint256):((uint256,string,address,uint256,uint256,int16[6],int16[6],uint16[16],address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,(uint256,uint256,(string,string,string,int8[6],bool[16],uint8[],(uint8,uint8,uint8,uint8),uint256,uint256,uint256,uint32,uint8,bool,uint16,bool,uint8,int16,uint32))[]))"
    )
        .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
        .returns(getAavegotchiMock(event, STATUS_AAVEGOTCHI));

    // execute handler with event
    handleTransfer(event);

    // assert and clear store
    assert.fieldEquals("Aavegotchi", "1", "owner", testAddressTo.toHexString());
    clearStore();
});

test("handleTransferERC721 - should proper handle bridged portals", () => {
    let testAddressFrom = Address.fromString(
        "0x86935f11c86623dec8a25696e1c19a8659cbf95d"
    );
    let testAddressTo = Address.fromString(
        "0xaba3abe71987030782b3312f23ca0f199791a748"
    );

    //init data
    let portal = new Portal("8107");
    portal.activeListing = BIGINT_ONE;
    portal.buyer = "0x86935f11c86623dec8a25696e1c19a8659cbf95d";
    portal.hauntId = BIGINT_ONE;
    portal.owner = "0x86935f11c86623dec8a25696e1c19a8659cbf95d";
    portal.status = PORTAL_STATUS_BOUGHT;
    portal.timesTraded = BIGINT_ONE;
    portal.save();

    // prepare event according to https://polygonscan.com/tx/0xe28b30bb6cb17cbda267303b2a9884c8b91364f14027f71a8ae6bc2d548ebf01
    let mockEvent = newMockEvent();
    mockEvent.transaction.from = Address.fromString(
        "0x0000000000000000000000000000000000000000"
    );
    mockEvent.transaction.to = Address.fromString(
        "0x0000000000000000000000000000000000000000"
    );
    mockEvent.block.number = BigInt.fromI32(20055552);
    // mockEvent.block.hash = Bytes.fromHexString("0xe28b30bb6cb17cbda267303b2a9884c8b91364f14027f71a8ae6bc2d548ebf01")
    mockEvent.transaction.nonce = BIGINT_ZERO;

    let event = new Transfer(
        mockEvent.address,
        mockEvent.logIndex,
        mockEvent.transactionLogIndex,
        mockEvent.logType,
        mockEvent.block,
        mockEvent.transaction,
        mockEvent.parameters,
        null
    );
    event.parameters = new Array();

    let _from = new ethereum.EventParam(
        "from",
        ethereum.Value.fromAddress(testAddressFrom)
    );
    event.parameters.push(_from);

    let _to = new ethereum.EventParam(
        "to",
        ethereum.Value.fromAddress(testAddressTo)
    );
    event.parameters.push(_to);

    let _id = new ethereum.EventParam(
        "id",
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(8107))
    );
    event.parameters.push(_id);

    // mock getAavegotchi
    // create mock for updateAavegotchi and getAavegotchi
    // createMockedFunction(
    //     mockEvent.address,
    //     "getAavegotchi",
    //     "getAavegotchi(uint256):((uint256,string,address,uint256,uint256,int16[6],int16[6],uint16[16],address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,(uint256,uint256,(string,string,string,int8[6],bool[16],uint8[],(uint8,uint8,uint8,uint8),uint256,uint256,uint256,uint32,uint8,bool,uint16,bool,uint8,int16,uint32))[]))"
    // )
    // .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
    // .returns(getAavegotchiMock(event, STATUS_AAVEGOTCHI))

    // execute handler with event
    handleTransfer(event);

    // assert and clear store
    assert.fieldEquals("Portal", "8107", "owner", testAddressTo.toHexString());
    clearStore();
});
