import { test, assert, clearStore, createMockedFunction } from "matchstick-as/assembly/index";
import { Address, ethereum } from "@graphprotocol/graph-ts";
import { handleERC1155ListingUpdated } from "../src/mappings/diamond";
import { BIGINT_ONE } from "../src/utils/constants";
import { getERC1155ListingUpdateEvent, getERC115ListingMock } from "./mocks";

test("handleERC1155ListingUpdate - should update price and quantity of listing", () => {
    // prepare event
    let event = getERC1155ListingUpdateEvent()
    
    // mock call
    createMockedFunction(
        event.address,
        "getERC1155Listing",
        "getERC1155Listing(uint256):((uint256,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,bool))"
    )
    .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
    .returns(getERC115ListingMock())

    // execute handler with event
    handleERC1155ListingUpdated(event);
        
    // assert and clear store
    assert.fieldEquals("ERC1155Listing", "1", "quantity", '1');
    assert.fieldEquals("ERC1155Listing", "1", "priceInWei", '1');
    clearStore();
})
