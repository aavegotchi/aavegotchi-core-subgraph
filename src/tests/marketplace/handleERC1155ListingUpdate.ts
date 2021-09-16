import { test, assert, clearStore, createMockedFunction } from "matchstick-as/assembly/index";
import { Address, ethereum } from "@graphprotocol/graph-ts";
import { handleERC1155ListingUpdated } from "../../mappings/diamond";
import { BIGINT_ONE } from "../../utils/constants";
import { getERC721ListingMock, mockGetERC1155Listing } from "../../utils/helpers/mocks";
import { getERC1155ListingUpdateEvent } from "../../utils/helpers/events";

export function handleERC1155ListingUpdateTests(): void {

    test("handleERC1155ListingUpdate - should update price and quantity of listing", () => {
        mockGetERC1155Listing([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
        
        // prepare event
        let event = getERC1155ListingUpdateEvent(BIGINT_ONE)        
        // execute handler with event
        handleERC1155ListingUpdated(event);
            
        // assert and clear store
        assert.fieldEquals("ERC1155Listing", "1", "quantity", '1');
        assert.fieldEquals("ERC1155Listing", "1", "priceInWei", '1');
        clearStore();
    })

}