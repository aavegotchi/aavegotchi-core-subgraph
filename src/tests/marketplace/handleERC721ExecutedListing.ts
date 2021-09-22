import { test, assert, clearStore, createMockedFunction } from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { handleERC721ExecutedListing, handleERC721ListingAdd, handleERC721ListingCancelled } from "../../mappings/diamond";
import { BIGINT_ONE } from "../../utils/constants";
import { getERC721ListingAddEvent, getERC721ListingCancelledEvent, getERC721ListingExecutedEvent, getERC721ListingMock } from "../../utils/helpers/mocks";
import { getOrCreatePortal } from "../../utils/helpers/diamond";

export function handleERC721ExecutedListingTests(): void {

    test("handleERC721ExecutedListing - should add price to historicalPrices of aavegotchi if listing is aavegotchi", () => {
        // prepare event
        let event = getERC721ListingExecutedEvent(BigInt.fromI32(3))

        //try_getERC721Listing
        createMockedFunction(
            Address.fromString("0x86935F11C86623deC8a25696E1C19a8659CbF95d"),
            "getERC721Listing",
            "getERC721Listing(uint256):((uint256,address,address,uint256,uint256,uint256,uint256,uint256,bool))"
        )
        .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
        .returns(getERC721ListingMock())

        // execute handler with event
        handleERC721ExecutedListing(event);
            
        // assert and clear store
        assert.fieldEquals("Aavegotchi", "1", "historicalPrices", '[1]');
        clearStore();
    })

    test("handleERC721ExecutedListing - should add price to historicalPrices of portal if listing is portal", () => {
        // prepare event
        let event = getERC721ListingExecutedEvent(BigInt.fromI32(1))
        let portal = getOrCreatePortal("1", true);
        portal.save();


        createMockedFunction(
            Address.fromString("0x86935F11C86623deC8a25696E1C19a8659CbF95d"),
            "getERC721Listing",
            "getERC721Listing(uint256):((uint256,address,address,uint256,uint256,uint256,uint256,uint256,bool))"
        )
        .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
        .returns(getERC721ListingMock(BigInt.fromI32(2)))

        // execute handler with event
        handleERC721ExecutedListing(event);

        // assert and clear store
        assert.fieldEquals("Portal", "1", "historicalPrices", '[1]');
        clearStore();
    })

    test("handleERC721ExecutedListing - should set blockCreated to block number when listing gets created",  () => {
               // prepare event
        let event = getERC721ListingAddEvent(BigInt.fromI32(3))

        //try_getERC721Listing
        createMockedFunction(
            Address.fromString("0x86935F11C86623deC8a25696E1C19a8659CbF95d"),
            "getERC721Listing",
            "getERC721Listing(uint256):((uint256,address,address,uint256,uint256,uint256,uint256,uint256,bool))"
        )
        .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
        .returns(getERC721ListingMock())
        handleERC721ListingAdd(event);
        assert.fieldEquals("ERC721Listing", "1", "blockCreated", '1');
        clearStore();
    })

    test("handleERC721ExecutedListing - reorg: should set block created if cancel events happens before add",  () => {
        // prepare event
        let event = getERC721ListingCancelledEvent(BigInt.fromI32(3))

        //try_getERC721Listing
        createMockedFunction(
            Address.fromString("0x86935F11C86623deC8a25696E1C19a8659CbF95d"),
            "getERC721Listing",
            "getERC721Listing(uint256):((uint256,address,address,uint256,uint256,uint256,uint256,uint256,bool))"
        )
        .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
        .returns(getERC721ListingMock())


        handleERC721ListingCancelled(event);
        assert.fieldEquals("ERC721Listing", "1", "blockCreated", '1');
        clearStore();
    })
}