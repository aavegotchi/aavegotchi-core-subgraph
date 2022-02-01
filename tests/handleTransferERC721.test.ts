import { test, assert, clearStore, newMockEvent, createMockedFunction } from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { handleTransfer } from "../src/mappings/diamond";
import { Transfer } from "../generated/AavegotchiDiamond/AavegotchiDiamond";
import { BIGINT_ONE, BIGINT_ZERO, STATUS_AAVEGOTCHI, STATUS_SACRIFIED } from "../src/utils/constants";
import { getAavegotchiMock } from "./mocks";
import { Aavegotchi, Portal } from "../generated/schema";

test("handleTransferERC721 - should change owner of aavegotchi entity if token is aavegotchi", () => {

    let testAddressFrom = Address.fromString("0x1AD3d72e54Fb0eB46e87F82f77B284FC8a66b16C");
    let testAddressTo = Address.fromString("0xf06dCbec97D02E0df8D304bdBBb7ccAb587C3e1f");

    //init data
    let portal = new Portal("1");
    portal.save();

    let gotchi = new Aavegotchi("1");
    gotchi.locked = false;
    gotchi.owner = testAddressFrom.toHexString();
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
        newMockevent.parameters
    );
    event.parameters = new Array();

    let _from = new ethereum.EventParam("_from", ethereum.Value.fromAddress(testAddressFrom));
    event.parameters.push(_from);

    let _to = new ethereum.EventParam("_to",  ethereum.Value.fromAddress(testAddressTo));
    event.parameters.push(_to);
    
    let _id = new ethereum.EventParam("_id", ethereum.Value.fromUnsignedBigInt(BIGINT_ONE));
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
    .returns(getAavegotchiMock(event, STATUS_AAVEGOTCHI))

    // execute handler with event
    handleTransfer(event);

    // assert and clear store
    assert.fieldEquals("Aavegotchi", "1", "owner", testAddressTo.toHexString());
    clearStore();
})

test("handleTransferERC721 - should set owner to 0x0 of aavegotchi entity if gotchi is sacrified", () => {

    let testAddressFrom = Address.fromString("0x1AD3d72e54Fb0eB46e87F82f77B284FC8a66b16C");
    let testAddressTo = Address.fromString("0x0000000000000000000000000000000000000000");

    //init data
    let portal = new Portal("1");
    portal.save();

    let gotchi = new Aavegotchi("1");
    gotchi.locked = false;
    gotchi.owner = testAddressFrom.toHexString();
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
        newMockevent.parameters
    );
    event.parameters = new Array();

    let _from = new ethereum.EventParam("_from", ethereum.Value.fromAddress(testAddressFrom));
    event.parameters.push(_from);

    let _to = new ethereum.EventParam("_to",  ethereum.Value.fromAddress(testAddressTo));
    event.parameters.push(_to);
    
    let _id = new ethereum.EventParam("_id", ethereum.Value.fromUnsignedBigInt(BIGINT_ONE));
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
    .returns(getAavegotchiMock(event, STATUS_SACRIFIED))

    // execute handler with event
    handleTransfer(event);

    // assert and clear store
    assert.fieldEquals("Aavegotchi", "1", "owner", "0x0000000000000000000000000000000000000000");
    clearStore();
})
