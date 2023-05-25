import { test, assert } from "matchstick-as/assembly/index";
import {
    handleERC721BuyOrderAdded,
    handleERC721BuyOrderExecuted,
} from "../src/mappings/diamond";
import {
    erc721BuyOrderAddedMockEvent,
    erc721BuyOrderExecutedMockEvent,
} from "./mocks";

test("erc721buyOrderAdded should create erc721buyorder entity", () => {
    let event = erc721BuyOrderAddedMockEvent();

    handleERC721BuyOrderAdded(event);

    assert.fieldEquals(
        "ERC721BuyOrder",
        "1",
        "id",
        event.params.buyOrderId.toString()
    );
    assert.fieldEquals(
        "ERC721BuyOrder",
        "1",
        "buyer",
        event.params.buyer.toHexString()
    );
    assert.fieldEquals(
        "ERC721BuyOrder",
        "1",
        "erc721TokenAddress",
        event.params.erc721TokenAddress.toHexString()
    );
    assert.fieldEquals(
        "ERC721BuyOrder",
        "1",
        "erc721TokenId",
        event.params.erc721TokenId.toString()
    );
    assert.fieldEquals(
        "ERC721BuyOrder",
        "1",
        "category",
        event.params.category.toString()
    );
    assert.fieldEquals(
        "ERC721BuyOrder",
        "1",
        "priceInWei",
        event.params.priceInWei.toString()
    );
    assert.fieldEquals(
        "ERC721BuyOrder",
        "1",
        "duration",
        event.params.duration.toString()
    );
    assert.fieldEquals(
        "ERC721BuyOrder",
        "1",
        "validationHash",
        event.params.validationHash.toHexString()
    );
    assert.fieldEquals(
        "ERC721BuyOrder",
        "1",
        "createdAt",
        event.params.time.toString()
    );
});

test("erc721buyOrderExecuted should update erc721buyorder entity", () => {
    let event = erc721BuyOrderExecutedMockEvent();

    handleERC721BuyOrderExecuted(event);

    assert.fieldEquals(
        "ERC721BuyOrder",
        "1",
        "id",
        event.params.buyOrderId.toString()
    );
    assert.fieldEquals(
        "ERC721BuyOrder",
        "1",
        "buyer",
        event.params.buyer.toHexString()
    );
    assert.fieldEquals(
        "ERC721BuyOrder",
        "1",
        "seller",
        event.params.seller.toHexString()
    );
    assert.fieldEquals(
        "ERC721BuyOrder",
        "1",
        "erc721TokenAddress",
        event.params.erc721TokenAddress.toHexString()
    );
    assert.fieldEquals(
        "ERC721BuyOrder",
        "1",
        "erc721TokenId",
        event.params.erc721TokenId.toString()
    );
    assert.fieldEquals(
        "ERC721BuyOrder",
        "1",
        "priceInWei",
        event.params.priceInWei.toString()
    );
    assert.fieldEquals(
        "ERC721BuyOrder",
        "1",
        "executedAt",
        event.params.time.toString()
    );
});
