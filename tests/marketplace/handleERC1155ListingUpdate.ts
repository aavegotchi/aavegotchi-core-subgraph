import { test, assert, clearStore, createMockedFunction } from "matchstick-as/assembly/index";
import { Address, ethereum } from "@graphprotocol/graph-ts";
import { handleERC1155ListingUpdated } from "../../src/mappings/diamond";
import { BIGINT_ONE } from "../../src/utils/constants";
import { getERC1155ListingUpdateEvent, getERC721ListingMock } from "../../src/utils/helpers/mocks";

export function handleERC1155ListingUpdateTests(): void {

    test("handleERC1155ListingUpdate - should update price and quantity of listing", () => {
        // prepare event
        let event = getERC1155ListingUpdateEvent()
        
        // execute handler with event
        handleERC1155ListingUpdated(event);
            
        // assert and clear store
        assert.fieldEquals("ERC1155Listing", "1", "quantity", '1');
        assert.fieldEquals("ERC1155Listing", "1", "priceInWei", '1');
        clearStore();
    })

}