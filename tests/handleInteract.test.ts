import { test, assert, clearStore, createMockedFunction, newMockEvent } from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts";
import { handleAavegotchiInteract } from "../src/mappings/diamond";
import { AavegotchiInteract } from "../generated/AavegotchiDiamond/AavegotchiDiamond";
import { Aavegotchi } from "../generated/schema";
import { BIGINT_ONE, BIGINT_ZERO } from "../src/utils/constants";
import { getAavegotchiMock } from "./mocks";


test("Count as interacted if gotchi is claimed", () => {
    // Initialise
    let gotchi = new Aavegotchi('1')
    gotchi.locked = false;
    gotchi.kinship = BIGINT_ZERO;
    gotchi.save()

    // prepare event
    let newMockevent = newMockEvent();
    let event = new AavegotchiInteract(
        newMockevent.address,
        newMockevent.logIndex,
        newMockevent.transactionLogIndex,
        newMockevent.logType,
        newMockevent.block,
        newMockevent.transaction,
        newMockevent.parameters
    );
    event.parameters = new Array();

    let _tokenId = new ethereum.EventParam("_tokenId",  ethereum.Value.fromI32(1));
    event.parameters.push(_tokenId);
    

    // // create mock for updateAavegotchi and getAavegotchi
    createMockedFunction(
        newMockevent.address,
        "getAavegotchi",
        "getAavegotchi(uint256):((uint256,string,address,uint256,uint256,int16[6],int16[6],uint16[16],address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,(uint256,uint256,(string,string,string,int8[6],bool[16],uint8[],(uint8,uint8,uint8,uint8),uint256,uint256,uint256,uint32,uint8,bool,uint16,bool,uint8,int16,uint32))[]))"
    )
    .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
    .returns(getAavegotchiMock(event))

    // execute handler with event
    handleAavegotchiInteract(event);

    // assert and clear store
    assert.fieldEquals("Aavegotchi", "1", "kinship", "1");
    clearStore();
})

test("Don't count as interacted if gotchi is portal", () => {

    // Initialise
    let gotchi = new Aavegotchi('1')
    gotchi.locked = false;
    gotchi.kinship = BIGINT_ZERO;
    gotchi.save()
    

    // prepare event
    let newMockevent = newMockEvent();
    let event = new AavegotchiInteract(
        newMockevent.address,
        newMockevent.logIndex,
        newMockevent.transactionLogIndex,
        newMockevent.logType,
        newMockevent.block,
        newMockevent.transaction,
        newMockevent.parameters
    );

    let _tokenId = new ethereum.EventParam("_tokenId", ethereum.Value.fromUnsignedBigInt(BIGINT_ONE));
    event.parameters.push(_tokenId);
    let contractAddress = Address.fromString("0x86935F11C86623deC8a25696E1C19a8659CbF95d");
    event.address = contractAddress

    // create mock for updateAavegotchi and getAavegotchi
    createMockedFunction(
        contractAddress,
        "getAavegotchi",
        "getAavegotchi(uint256):((uint256,string,address,uint256,uint256,int16[6],int16[6],uint16[16],address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,(uint256,uint256,(string,string,string,int8[6],bool[16],uint8[],(uint8,uint8,uint8,uint8),uint256,uint256,uint256,uint32,uint8,bool,uint16,bool,uint8,int16,uint32))[]))"
    )
    .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
    .returns(getAavegotchiMock(event, BigInt.fromI32(2)))

    // execute handler with event
    handleAavegotchiInteract(event);

    // assert and clear store
    assert.fieldEquals("Aavegotchi", "1", "kinship", "0");
    clearStore();
})
