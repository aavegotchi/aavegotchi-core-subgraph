import { test, assert, clearStore, createMockedFunction } from "matchstick-as/assembly/index";
import { Address, ethereum } from "@graphprotocol/graph-ts";
import { handleERC1155ListingUpdated } from "../src/mappings/diamond";
import { BIGINT_ONE } from "../src/utils/constants";
import { getERC1155ListingUpdateEvent, getERC115ListingMock } from "./mocks";
import { ItemType } from "../generated/schema";

test("handleERC1155ListingUpdate - should update price and quantity of listing", () => {
    // init
    let itemType = new ItemType("1");
    itemType.save();
    
    // prepare event
    let event = getERC1155ListingUpdateEvent()
    
    // mock call
    createMockedFunction(
        event.address,
        "getERC1155Listing",
        "getERC1155Listing(uint256):((uint256,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,bool))"
    )
    .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
    .returns([
        ethereum.Value.fromTuple(changetype<ethereum.Tuple>([
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromAddress(event.address),
        ethereum.Value.fromAddress(event.address),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ethereum.Value.fromBoolean(true),
        ethereum.Value.fromBoolean(true)
    ]))]);

    // execute handler with event
    handleERC1155ListingUpdated(event);
        
    // assert and clear store
    assert.fieldEquals("ERC1155Listing", "1", "quantity", '1');
    assert.fieldEquals("ERC1155Listing", "1", "priceInWei", '1');
    clearStore();
})
