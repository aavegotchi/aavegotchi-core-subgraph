import { test, assert, clearStore, createMockedFunction } from "matchstick-as/assembly/index";
import { Address, ethereum } from "@graphprotocol/graph-ts";
import { handleERC1155ListingUpdated } from "../../mappings/diamond";
import { BIGINT_ONE } from "../../utils/constants";
import { getERC1155ListingUpdateEvent, getERC721ListingMock } from "../../utils/helpers/mocks";

export function handleERC1155ListingUpdateTests(): void {

    test("handleERC1155ListingUpdate - should update price and quantity of listing", () => {
        // prepare event
        let event = getERC1155ListingUpdateEvent()

        //try_getERC721Listing
        createMockedFunction(
            Address.fromString("0x86935F11C86623deC8a25696E1C19a8659CbF95d"),
            "getERC721Listing",
            "getERC721Listing(uint256):((uint256,address,address,uint256,uint256,uint256,uint256,uint256,bool))"
        )
        .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
        .returns(getERC721ListingMock())

        // execute handler with event
        handleERC1155ListingUpdated(event);
            
        // assert and clear store
        assert.fieldEquals("ERC1155Listing", "1", "quantity", '1');
        assert.fieldEquals("ERC1155Listing", "1", "priceInWei", '1');
        clearStore();
    })

}