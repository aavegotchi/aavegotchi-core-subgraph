// import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
// import { createMockedFunction } from "matchstick-as";
// // import { AAVEGOTCHI_STATUS_CLAIMED, BIGINT_ONE, CONTRACT_ADDRESS } from "../constants";

import { Address, ethereum } from "@graphprotocol/graph-ts";
import { log } from "matchstick-as/assembly/log";
import { MintPortals, MintPortals__Params } from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { BIGINT_ONE, CONTRACT_ADDRESS } from "../constants";

// let contractAddress = Address.fromString("0x86935F11C86623deC8a25696E1C19a8659CbF95d");

// class AavegotchiMockResultOptions {
//     status: BigInt = AAVEGOTCHI_STATUS_CLAIMED;
// }

// export function getAavegotchiMockResult(options: AavegotchiMockResultOptions = new AavegotchiMockResultOptions()): ethereum.Value[]  {

//     let returnArr: ethereum.Value[] = [
//         ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
//         ethereum.Value.fromString("yes"),
//         ethereum.Value.fromAddress(contractAddress),
//         ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
//         ethereum.Value.fromUnsignedBigInt(options.status),
//         ethereum.Value.fromSignedBigIntArray([BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE]),
//         ethereum.Value.fromSignedBigIntArray([BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE]),
//         ethereum.Value.fromUnsignedBigIntArray([BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE]),
//         ethereum.Value.fromAddress(contractAddress),
//         ethereum.Value.fromAddress(contractAddress),
//         ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
//         ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
//         ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
//         ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
//         ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
//         ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
//         ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
//         ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
//         ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
//         ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
//         ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
//         ethereum.Value.fromBoolean(true),
//         ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
//         ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
//         ethereum.Value.fromString("yes"),
//         ethereum.Value.fromString("yes"),
//         ethereum.Value.fromString("yes"),
//         ethereum.Value.fromSignedBigIntArray([BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE]),
//         ethereum.Value.fromBooleanArray([true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]),
//         ethereum.Value.fromUnsignedBigIntArray([BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE]),
//         ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
//         ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
//         ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
//         ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
//         ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
//         ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
//         ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
//         ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
//         ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
//         ethereum.Value.fromBoolean(true),
//         ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
//         ethereum.Value.fromBoolean(true),
//         ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
//         ethereum.Value.fromSignedBigInt(BIGINT_ONE),
//         ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)
//     ];

//     let tuppleArray: ethereum.Value[] = [ethereum.Value.fromTuple(returnArr as ethereum.Tuple)]
//     return tuppleArray;
// }

// export function createMock(fnName: string, fnSignature: string, args: ethereum.Value[], returnValue: ethereum.Value[]) {
//     createMockedFunction(
//         Address.fromString(CONTRACT_ADDRESS),
//         fnName,
//         fnSignature
//     )
//     .withArgs(args)
//     .returns(returnValue)
// }


export function getMintPortalsEvent(): MintPortals {

    let event = new MintPortals();
    event.block.number = BIGINT_ONE;
    
    event.parameters = new Array<ethereum.EventParam>();
    let _from = new ethereum.EventParam();
    _from.value = ethereum.Value.fromAddress(Address.fromString("0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7"));
    
    let _to = new ethereum.EventParam();
    _to.value = ethereum.Value.fromAddress(Address.fromString(CONTRACT_ADDRESS));
    
    let _tokenId = new ethereum.EventParam();
    _tokenId.value = ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)
    
    let _numAavegotchisToPurchase = new ethereum.EventParam();
    _numAavegotchisToPurchase.value = ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)
    
    let _hauntId = new ethereum.EventParam();
    _hauntId.value = ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)
    
    event.address = Address.fromString(CONTRACT_ADDRESS);


    let params = new MintPortals__Params(event);
    log.info("test");
    log.info(params._from.toString());
    log.info("test2");


    return event;
}