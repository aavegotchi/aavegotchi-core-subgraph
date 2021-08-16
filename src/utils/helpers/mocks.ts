import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { ERC721ExecutedListing } from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { BIGINT_ONE, CONTRACT_ADDRESS } from "../constants";

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


export function getERC721ListingExecutedEvent(categoryId: BigInt): ERC721ExecutedListing {
    let event = new ERC721ExecutedListing();
    event.parameters = new Array<ethereum.EventParam>();
    event.block.number = BIGINT_ONE;

    let listingId = new ethereum.EventParam();
    listingId.name = "BigInt"
    listingId.value = ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)
    event.parameters.push(listingId);

    let seller = new ethereum.EventParam();
    seller.name = "address"
    seller.value = ethereum.Value.fromAddress(Address.fromString("0x86935F11C86623deC8a25696E1C19a8659CbF95d"))
    event.parameters.push(seller);

    let buyer = new ethereum.EventParam();
    buyer.name = "address"
    buyer.value = ethereum.Value.fromAddress(Address.fromString("0x86935F11C86623deC8a25696E1C19a8659CbF95d"))
    event.parameters.push(buyer);

    let erc721TokenAddress = new ethereum.EventParam();
    erc721TokenAddress.name = "address"
    erc721TokenAddress.value = ethereum.Value.fromAddress(Address.fromString("0x86935F11C86623deC8a25696E1C19a8659CbF95d"))
    event.parameters.push(erc721TokenAddress);

    let erc721TokenId = new ethereum.EventParam();
    erc721TokenId.name = "BigInt"
    erc721TokenId.value = ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)
    event.parameters.push(erc721TokenId);
    let category = new ethereum.EventParam();
    category.name = "BigInt"
    category.value = ethereum.Value.fromUnsignedBigInt(categoryId)
    event.parameters.push(category);
    let priceInWei = new ethereum.EventParam();
    priceInWei.name = "BigInt"
    priceInWei.value = ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)
    event.parameters.push(priceInWei);
    let time = new ethereum.EventParam();
    time.name = "BigInt"
    time.value = ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)
    event.parameters.push(time);
    let contractAddress = Address.fromString("0x86935F11C86623deC8a25696E1C19a8659CbF95d");
    event.address = contractAddress
    return event;
}