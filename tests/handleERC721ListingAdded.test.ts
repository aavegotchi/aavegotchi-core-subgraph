import { test, assert, clearStore, createMockedFunction } from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { handleERC721ExecutedListing, handleERC721ListingAdd, handleERC721ListingCancelled } from "../src/mappings/diamond";
import { BIGINT_ONE } from "../src/utils/constants";
import { getERC721ListingAddEvent, getERC721ListingCancelledEvent, getERC721ListingExecutedEvent, getERC721ListingMock } from "./mocks";
import { getOrCreatePortal } from "../src/utils/helpers/diamond";
import { Aavegotchi } from "../generated/schema";


test("should add gotchi name lower case if listing is a aavegtochi", () => {
    // prepare event
    let event = getERC721ListingAddEvent(BigInt.fromI32(3))

    let gotchi = new Aavegotchi(BIGINT_ONE.toString())
    gotchi.nameLowerCase = "test";
    gotchi.save();

    //try_getERC721Listing
    createMockedFunction(
        event.address,
        "getERC721Listing",
        "getERC721Listing(uint256):((uint256,address,address,uint256,uint256,uint256,uint256,uint256,bool))"
    )
    .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
    .returns(getERC721ListingMock(event))

    // execute handler with event
    handleERC721ListingAdd(event);
        
    // assert and clear store
    assert.fieldEquals("ERC721Listing", "1", "nameLowerCase", 'test');
    clearStore();
})

