import {
    test,
    assert,
    clearStore,
    newMockEvent,
} from "matchstick-as/assembly/index";
import { ethereum } from "@graphprotocol/graph-ts";
import {
    handleMintPortals,
    handleUpdateItemPrice,
} from "../src/mappings/diamond";
import {
    MintPortals,
    UpdateItemPrice,
} from "../generated/AavegotchiDiamond/AavegotchiDiamond";
import { BIGINT_ONE } from "../src/utils/constants";
import { ItemType } from "../generated/schema";

test("handleUpdateItemPrice - happy case", () => {
    // prepare event
    let itemType = new ItemType("1");
    itemType.svgId = BIGINT_ONE;
    itemType.name = "Test";
    itemType.ghstPrice = BIGINT_ONE;
    itemType.maxQuantity = BIGINT_ONE;
    itemType.totalQuantity = BIGINT_ONE;
    itemType.rarityScoreModifier = 1;
    itemType.canPurchaseWithGhst = true;
    itemType.canBeTransferred = true;
    itemType.category = 1;
    itemType.consumed = BIGINT_ONE;
    itemType.save();

    let newMockevent = newMockEvent();
    let event = new UpdateItemPrice(
        newMockevent.address,
        newMockevent.logIndex,
        newMockevent.transactionLogIndex,
        newMockevent.logType,
        newMockevent.block,
        newMockevent.transaction,
        newMockevent.parameters,
        null
    );
    event.parameters = new Array();

    let _itemId = new ethereum.EventParam(
        "_itemId",
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)
    );
    event.parameters.push(_itemId);

    let _priceInWei = new ethereum.EventParam(
        "_priceInWei",
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)
    );
    event.parameters.push(_priceInWei);

    // execute handler with event
    handleUpdateItemPrice(event);

    // assert and clear store
    assert.fieldEquals("ItemType", "1", "ghstPrice", "1");
    clearStore();
});
