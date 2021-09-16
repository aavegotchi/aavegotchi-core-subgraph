import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { BIGINT_ONE, CONTRACT_ADDRESS } from "../constants";
import { ERC721ExecutedListing, ERC721ListingAdd, UpdateERC1155Listing } from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { createMockedFunction } from "matchstick-as/assembly/index";

let contractAddress = Address.fromString(CONTRACT_ADDRESS);

export function getAavegotchiMock(status: BigInt = BigInt.fromI32(3)): ethereum.Value[]  {

    let returnArr: ethereum.Value[] = [
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromString("yes"),
        ethereum.Value.fromAddress(contractAddress),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(status),
        ethereum.Value.fromSignedBigIntArray([BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE]),
        ethereum.Value.fromSignedBigIntArray([BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE]),
        ethereum.Value.fromUnsignedBigIntArray([BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE]),
        ethereum.Value.fromAddress(contractAddress),
        ethereum.Value.fromAddress(contractAddress),
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
    ];

    let tuppleArray: ethereum.Value[] = [ethereum.Value.fromTuple(returnArr as ethereum.Tuple)]
    return tuppleArray;
}

export function getERC721ListingMock(category: BigInt = BigInt.fromI32(3)): ethereum.Value[] {
    //getERC721Listing(uint256):((uint256,address,address,uint256,uint256,uint256,uint256,uint256,bool))
    let returnArr: ethereum.Value[] = [
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromAddress(contractAddress),
        ethereum.Value.fromAddress(contractAddress),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(category),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromBoolean(true),
    ];

    let tuppleArray: ethereum.Value[] = [ethereum.Value.fromTuple(returnArr as ethereum.Tuple)]
    return tuppleArray;
}

export function mockGetERC1155Listing(args: ethereum.Value[]): void {
    //getERC1155Listing(uint256):((uint256,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,bool))1
    let returnArr: ethereum.Value[] = [
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromAddress(contractAddress),
        ethereum.Value.fromAddress(contractAddress),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromBoolean(true),
        ethereum.Value.fromBoolean(true),
    ];

    let tuppleArray: ethereum.Value[] = [ethereum.Value.fromTuple(returnArr as ethereum.Tuple)]

    createMockedFunction(
        Address.fromString(CONTRACT_ADDRESS),
        "getERC1155Listing",
        "getERC1155Listing(uint256):((uint256,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,bool))"
    )
    .withArgs(args)
    .returns(tuppleArray);
}


