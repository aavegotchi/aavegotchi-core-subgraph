import {
    test,
    assert,
    clearStore,
    createMockedFunction,
} from "matchstick-as/assembly/index";
import { Address, ethereum } from "@graphprotocol/graph-ts";
import { handleERC1155ListingUpdated } from "../src/mappings/diamond";
import { BIGINT_ONE, ZERO_ADDRESS } from "../src/utils/constants";
import { getERC1155ListingUpdateEvent, getERC115ListingMock } from "./mocks";
import { ERC1155Listing, ItemType } from "../generated/schema";

test("handleERC1155ListingUpdate - should update price and quantity of listing", () => {
    // init
    let itemType = new ItemType("1");
    itemType.svgId = BIGINT_ONE;
    itemType.name = "Test";
    itemType.ghstPrice = BIGINT_ONE;
    itemType.maxQuantity = BIGINT_ONE;
    itemType.totalQuantity = BIGINT_ONE;
    itemType.traitModifiers = [1, 1, 1, 1, 1, 1];
    itemType.rarityScoreModifier = 1;
    itemType.canPurchaseWithGhst = true;
    itemType.canBeTransferred = true;
    itemType.category = 1;
    itemType.consumed = BIGINT_ONE;
    itemType.save();

    let listing = new ERC1155Listing("1");
    listing.category = BIGINT_ONE;
    listing.erc1155TokenAddress = Address.fromString(ZERO_ADDRESS);
    listing.erc1155TypeId = BIGINT_ONE;
    listing.seller = Address.fromString(ZERO_ADDRESS);
    listing.priceInWei = BIGINT_ONE;
    listing.quantity = BIGINT_ONE;
    listing.cancelled = false;
    listing.timeCreated = BIGINT_ONE;
    listing.timeLastPurchased = BIGINT_ONE;
    listing.sold = false;
    listing.save();

    // prepare event
    let event = getERC1155ListingUpdateEvent();

    // mock call
    createMockedFunction(
        event.address,
        "getERC1155Listing",
        "getERC1155Listing(uint256):((uint256,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,bool))"
    )
        .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
        .returns([
            ethereum.Value.fromTuple(
                changetype<ethereum.Tuple>([
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
                    ethereum.Value.fromBoolean(true),
                ])
            ),
        ]);

    // execute handler with event
    handleERC1155ListingUpdated(event);

    // assert and clear store
    assert.fieldEquals("ERC1155Listing", "1", "quantity", "1");
    assert.fieldEquals("ERC1155Listing", "1", "priceInWei", "1");
    clearStore();
});
