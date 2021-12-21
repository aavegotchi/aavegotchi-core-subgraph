import { test, assert, clearStore, createMockedFunction, newMockEvent } from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { handleUseConsumables } from "../src/mappings/diamond";
import { UseConsumables } from "../generated/AavegotchiDiamond/AavegotchiDiamond";
import { BIGINT_ONE } from "../src/utils/constants";
import { getAavegotchiMock } from "./mocks";
import { Aavegotchi } from "../generated/schema";


test("handleUseConsumable - happy case", () => {
    
    let gotchi = new Aavegotchi("1");
    gotchi.gotchiId = BIGINT_ONE;
    gotchi.locked = true;
    gotchi.save();

    let newMockevent = newMockEvent();
    let event = new UseConsumables(
        newMockevent.address,
        newMockevent.logIndex,
        newMockevent.transactionLogIndex,
        newMockevent.logType,
        newMockevent.block,
        newMockevent.transaction,
        newMockevent.parameters
    );
    let params = new Array<ethereum.EventParam>();

    let _tokenId = new ethereum.EventParam("_tokenId", ethereum.Value.fromUnsignedBigInt(BIGINT_ONE));
    params.push(_tokenId);

    let _itemIds = new ethereum.EventParam("_itemIds", ethereum.Value.fromUnsignedBigIntArray([
        BIGINT_ONE
    ]));
    params.push(_itemIds);

    let _quantities = new ethereum.EventParam("_quantities", ethereum.Value.fromUnsignedBigIntArray([
        BigInt.fromI32(2)
    ]));
    params.push(_quantities);

    event.parameters = params;  

    // create mock for updateAavegotchi and getAavegotchi
    createMockedFunction(
        newMockevent.address,
        "getAavegotchi",
        "getAavegotchi(uint256):((uint256,string,address,uint256,uint256,int16[6],int16[6],uint16[16],address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,(uint256,uint256,(string,string,string,int8[6],bool[16],uint8[],(uint8,uint8,uint8,uint8),uint256,uint256,uint256,uint32,uint8,bool,uint16,bool,uint8,int16,uint32))[]))"
    )
    .withArgs([_tokenId.value])
    .returns([
        ethereum.Value.fromTuple([
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromString("yes"),
        ethereum.Value.fromAddress(event.address),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromI32(3),
        ethereum.Value.fromSignedBigIntArray([BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE]),
        ethereum.Value.fromSignedBigIntArray([BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE]),
        ethereum.Value.fromUnsignedBigIntArray([BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE]),
        ethereum.Value.fromAddress(event.address),
        ethereum.Value.fromAddress(event.address),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromBoolean(true),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromString("yes"),
        ethereum.Value.fromString("yes"),
        ethereum.Value.fromString("yes"),
        ethereum.Value.fromSignedBigIntArray([BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE]),
        ethereum.Value.fromBooleanArray([true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]),
        ethereum.Value.fromUnsignedBigIntArray([BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE]),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromBoolean(true),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromBoolean(true),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromSignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)
    ] as ethereum.Tuple)])

    // execute handler with event
    handleUseConsumables(event);

    // assert and clear store
    // should count used consumables
    assert.fieldEquals("ItemType", "1", "consumed", "1");
    clearStore();
})
