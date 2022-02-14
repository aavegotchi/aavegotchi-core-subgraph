import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { ClaimAavegotchi, ERC721ExecutedListing, ERC721ListingAdd, ERC721ListingCancelled, UpdateERC1155Listing } from "../generated/AavegotchiDiamond/AavegotchiDiamond";
import { BIGINT_ONE } from "../src/utils/constants";
import { newMockEvent } from 'matchstick-as/assembly/index'

let contractAddress = Address.fromString("0x86935F11C86623deC8a25696E1C19a8659CbF95d");

export function getAavegotchiMock(event: ethereum.Event, status: BigInt = BigInt.fromI32(3)): ethereum.Value[]  {

    return [
        ethereum.Value.fromTuple(changetype<ethereum.Tuple>([
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromString("yes"),
        ethereum.Value.fromAddress(event.address),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(status),
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
    ]))]
    
}

export function getERC721ListingMock(event: ethereum.Event, category: BigInt = BigInt.fromI32(3)): ethereum.Value[] {
    //getERC721Listing(uint256):((uint256,address,address,uint256,uint256,uint256,uint256,uint256,bool))
    return [
        ethereum.Value.fromTuple(changetype<ethereum.Tuple>([
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromAddress(event.address),
            ethereum.Value.fromAddress(event.address),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigInt(category),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromBoolean(true),
    ]))]
}

export function getERC115ListingMock(category: BigInt = BigInt.fromI32(3)): ethereum.Value[] {
    //getERC721Listing(uint256):((uint256,address,address,uint256,uint256,uint256,uint256,uint256,bool))
    return [(
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromAddress(contractAddress),
        ethereum.Value.fromAddress(contractAddress),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(category),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromBoolean(true)
    )]
}



export function getERC721ListingExecutedEvent(categoryId: BigInt): ERC721ExecutedListing {
    let newMockevent = newMockEvent();
    let event = new ERC721ExecutedListing(
        newMockevent.address,
        newMockevent.logIndex,
        newMockevent.transactionLogIndex,
        newMockevent.logType,
        newMockevent.block,
        newMockevent.transaction,
        newMockevent.parameters
    );
    event.parameters = new Array<ethereum.EventParam>();
    event.block.number = BIGINT_ONE;

    let listingId = new ethereum.EventParam("BigInt", ethereum.Value.fromUnsignedBigInt(BIGINT_ONE));
    event.parameters.push(listingId);

    let seller = new ethereum.EventParam("address", ethereum.Value.fromAddress(Address.fromString("0x86935F11C86623deC8a25696E1C19a8659CbF95d")));
    event.parameters.push(seller);

    let buyer = new ethereum.EventParam("address", ethereum.Value.fromAddress(Address.fromString("0x86935F11C86623deC8a25696E1C19a8659CbF95d")));
    event.parameters.push(buyer);

    let erc721TokenAddress = new ethereum.EventParam("address", ethereum.Value.fromAddress(Address.fromString("0x86935F11C86623deC8a25696E1C19a8659CbF95d")));
    event.parameters.push(erc721TokenAddress);

    let erc721TokenId = new ethereum.EventParam("BigInt", ethereum.Value.fromUnsignedBigInt(BIGINT_ONE))
    event.parameters.push(erc721TokenId);
    let category = new ethereum.EventParam("BigInt", ethereum.Value.fromUnsignedBigInt(categoryId))
    event.parameters.push(category);
    let priceInWei = new ethereum.EventParam("BigInt", ethereum.Value.fromUnsignedBigInt(BIGINT_ONE))
    event.parameters.push(priceInWei);
    let time = new ethereum.EventParam("BigInt", ethereum.Value.fromUnsignedBigInt(BIGINT_ONE))
    event.parameters.push(time);
    let contractAddress = Address.fromString("0x86935F11C86623deC8a25696E1C19a8659CbF95d");
    event.address = contractAddress
    return event;
}

export function getERC1155ListingUpdateEvent(): UpdateERC1155Listing {
    let newMockevent = newMockEvent();
    let event = new UpdateERC1155Listing(
        newMockevent.address,
        newMockevent.logIndex,
        newMockevent.transactionLogIndex,
        newMockevent.logType,
        newMockevent.block,
        newMockevent.transaction,
        newMockevent.parameters
    );
    event.parameters = new Array<ethereum.EventParam>();
    event.block.number = BIGINT_ONE;

    let listingId = new ethereum.EventParam("listingId", ethereum.Value.fromUnsignedBigInt(BIGINT_ONE));
    event.parameters.push(listingId);

    let quantity = new ethereum.EventParam("quantity", ethereum.Value.fromUnsignedBigInt(BIGINT_ONE));
    event.parameters.push(quantity);

    let price = new ethereum.EventParam("priceInWei", ethereum.Value.fromUnsignedBigInt(BIGINT_ONE));
    event.parameters.push(price);

    let time = new ethereum.EventParam("time", ethereum.Value.fromUnsignedBigInt(BIGINT_ONE));
    event.parameters.push(time);

    return event;
}

export function getERC721ListingAddEvent(categoryId: BigInt): ERC721ListingAdd {
    let newMockevent = newMockEvent();
    let event = new ERC721ListingAdd(
        newMockevent.address,
        newMockevent.logIndex,
        newMockevent.transactionLogIndex,
        newMockevent.logType,
        newMockevent.block,
        newMockevent.transaction,
        newMockevent.parameters
    );
    event.parameters = new Array<ethereum.EventParam>();
    event.block.number = BIGINT_ONE;

    let listingId = new ethereum.EventParam("listingId", ethereum.Value.fromUnsignedBigInt(BIGINT_ONE));
    event.parameters.push(listingId);

    let seller = new ethereum.EventParam("seller", ethereum.Value.fromAddress(Address.fromString("0x86935F11C86623deC8a25696E1C19a8659CbF95d")));
    event.parameters.push(seller);

    let erc721TokenAddress = new ethereum.EventParam("erc721TokenAddress", ethereum.Value.fromAddress(Address.fromString("0x86935F11C86623deC8a25696E1C19a8659CbF95d")));
    event.parameters.push(erc721TokenAddress);

    let erc721TokenId = new ethereum.EventParam("erc721TokenId", ethereum.Value.fromUnsignedBigInt(BIGINT_ONE));
    event.parameters.push(erc721TokenId);

    let category = new ethereum.EventParam("category", ethereum.Value.fromUnsignedBigInt(categoryId));
    event.parameters.push(category);
    
    let time = new ethereum.EventParam("time", ethereum.Value.fromUnsignedBigInt(BIGINT_ONE));
    event.parameters.push(time);
    
    let contractAddress = Address.fromString("0x86935F11C86623deC8a25696E1C19a8659CbF95d");
    event.address = contractAddress
    return event;
}


export function getERC721ListingCancelledEvent(categoryId: BigInt): ERC721ListingCancelled {
    let newMockevent = newMockEvent();
    let event = new ERC721ListingCancelled(
        newMockevent.address,
        newMockevent.logIndex,
        newMockevent.transactionLogIndex,
        newMockevent.logType,
        newMockevent.block,
        newMockevent.transaction,
        newMockevent.parameters
    );
    event.parameters = new Array<ethereum.EventParam>();
    event.block.number = BIGINT_ONE;

    let listingId = new ethereum.EventParam("BigInt",  ethereum.Value.fromUnsignedBigInt(BIGINT_ONE));
    event.parameters.push(listingId);

    let category = new ethereum.EventParam("BigInt",  ethereum.Value.fromUnsignedBigInt(categoryId));
    event.parameters.push(category);
    
    let time = new ethereum.EventParam("BigInt", ethereum.Value.fromUnsignedBigInt(BIGINT_ONE));
    event.parameters.push(time);
    
    let contractAddress = Address.fromString("0x86935F11C86623deC8a25696E1C19a8659CbF95d");
    event.address = contractAddress
    return event;
}


export function getClaimAavegotchiEvent(): ClaimAavegotchi {
    let newMockevent = newMockEvent();
    let event = new ClaimAavegotchi(
        newMockevent.address,
        newMockevent.logIndex,
        newMockevent.transactionLogIndex,
        newMockevent.logType,
        newMockevent.block,
        newMockevent.transaction,
        newMockevent.parameters
    );
    event.parameters = new Array<ethereum.EventParam>();
    event.block.number = BIGINT_ONE;

    event.parameters.push(new ethereum.EventParam("BigInt",  ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)));
        
    let contractAddress = Address.fromString("0x86935F11C86623deC8a25696E1C19a8659CbF95d");
    event.address = contractAddress
    return event;
}