import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
    afterAll,
    assert,
    beforeAll,
    clearStore,
    describe,
    newMockEvent,
    test,
} from "matchstick-as";
import { UpdateItemType } from "../generated/AavegotchiDiamond/AavegotchiDiamond";
import { handleUpdateItemType } from "../src/mappings/diamond";
import { BIGINT_ONE } from "../src/utils/constants";

let mockEvent = newMockEvent();
describe("handleUpdateItemType", () => {
    beforeAll(() => {
        // prepare event
        let event = new UpdateItemType(
            mockEvent.address,
            mockEvent.logIndex,
            mockEvent.transactionLogIndex,
            mockEvent.logType,
            mockEvent.block,
            mockEvent.transaction,
            mockEvent.parameters,
            null
        );

        event.parameters.push(
            new ethereum.EventParam(
                "_itemId",
                ethereum.Value.fromSignedBigInt(BIGINT_ONE)
            )
        );

        let dimensionsTuple = changetype<ethereum.Tuple>([
            ethereum.Value.fromI32(1),
            ethereum.Value.fromI32(2),
            ethereum.Value.fromI32(3),
            ethereum.Value.fromI32(4),
        ]);

        let tuple = changetype<ethereum.Tuple>([
            ethereum.Value.fromString("itemType"),
            ethereum.Value.fromString("item type description"),
            ethereum.Value.fromString("author"),
            ethereum.Value.fromI32Array([1, 2, 3]),
            ethereum.Value.fromBooleanArray([true, false, true]),
            ethereum.Value.fromI32Array([2, 3, 4]),
            ethereum.Value.fromTuple(dimensionsTuple),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
            ethereum.Value.fromI32(2),
            ethereum.Value.fromBoolean(false),
            ethereum.Value.fromI32(3),
            ethereum.Value.fromBoolean(false),
            ethereum.Value.fromI32(4),
            ethereum.Value.fromI32(5),
            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
        ]);

        event.parameters.push(
            new ethereum.EventParam(
                "_itemType",
                ethereum.Value.fromTuple(tuple)
            )
        );

        handleUpdateItemType(event);
    });

    test("it should update all of fields of entity", () => {
        assert.fieldEquals("ItemType", "1", "id", "1");
        assert.fieldEquals("ItemType", "1", "name", "itemType");
        assert.fieldEquals("ItemType", "1", "svgId", "1");
        assert.fieldEquals("ItemType", "1", "desc", "item type description");
        assert.fieldEquals("ItemType", "1", "author", "author");
        assert.fieldEquals("ItemType", "1", "traitModifiers", "[1, 2, 3]");
        assert.fieldEquals(
            "ItemType",
            "1",
            "slotPositions",
            "[true, false, true]"
        );
        assert.fieldEquals("ItemType", "1", "ghstPrice", "1");
        assert.fieldEquals("ItemType", "1", "maxQuantity", "1");
        assert.fieldEquals("ItemType", "1", "totalQuantity", "1");
        assert.fieldEquals("ItemType", "1", "rarityScoreModifier", "2");
        assert.fieldEquals("ItemType", "1", "canPurchaseWithGhst", "false");
        assert.fieldEquals("ItemType", "1", "minLevel", "3");
        assert.fieldEquals("ItemType", "1", "canBeTransferred", "false");
        assert.fieldEquals("ItemType", "1", "category", "4");
        assert.fieldEquals("ItemType", "1", "kinshipBonus", "5");
        assert.fieldEquals("ItemType", "1", "experienceBonus", "1");
    });

    afterAll(() => {
        clearStore();
    });
});
