import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { ERC721ExecutedListing, ERC721ListingAdd, MintPortals, UpdateERC1155Listing } from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { BIGINT_ONE, CONTRACT_ADDRESS } from "../constants";

export function getMintPortalsEvent(): MintPortals {

    let event = new MintPortals();
    event.block.number = BIGINT_ONE;
    
    event.parameters = new Array<ethereum.EventParam>();
    let _from = new ethereum.EventParam();
    _from.value = ethereum.Value.fromAddress(Address.fromString("0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7"));
    event.parameters.push(_from)
    
    let _to = new ethereum.EventParam();
    _to.value = ethereum.Value.fromAddress(Address.fromString(CONTRACT_ADDRESS));
    event.parameters.push(_to)

    let _tokenId = new ethereum.EventParam();
    _tokenId.value = ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)
    event.parameters.push(_tokenId)
    
    let _numAavegotchisToPurchase = new ethereum.EventParam();
    _numAavegotchisToPurchase.value = ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)
    event.parameters.push(_numAavegotchisToPurchase)
    
    let _hauntId = new ethereum.EventParam();
    _hauntId.value = ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)
    event.parameters.push(_hauntId)
    
    event.address = Address.fromString(CONTRACT_ADDRESS);
    return event;
}

export function getERC721ListingExecutedEvent(categoryId: BigInt  = BigInt.fromI32(3)): ERC721ExecutedListing {
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

export function getERC1155ListingUpdateEvent(_listingId: BigInt = BIGINT_ONE): UpdateERC1155Listing {
    let event = new UpdateERC1155Listing();
    event.parameters = new Array<ethereum.EventParam>();
    event.block.number = BIGINT_ONE;

    let listingId = new ethereum.EventParam();
    listingId.name = "BigInt"
    listingId.value = ethereum.Value.fromUnsignedBigInt(_listingId)
    event.parameters.push(listingId);

    let price = new ethereum.EventParam();
    price.name = "BigInt"
    price.value = ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)
    event.parameters.push(price);


    let quantity = new ethereum.EventParam();
    quantity.name = "BigInt"
    quantity.value = ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)
    event.parameters.push(quantity);


    let contractAddress = Address.fromString("0x86935F11C86623deC8a25696E1C19a8659CbF95d");
    event.address = contractAddress
    return event;
}

export function getERC721ListingAddEvent(categoryId: BigInt): ERC721ListingAdd {
    let event = new ERC721ListingAdd();
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
    
    let time = new ethereum.EventParam();
    time.name = "BigInt"
    time.value = ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)
    event.parameters.push(time);
    
    let contractAddress = Address.fromString("0x86935F11C86623deC8a25696E1C19a8659CbF95d");
    event.address = contractAddress
    return event;
}