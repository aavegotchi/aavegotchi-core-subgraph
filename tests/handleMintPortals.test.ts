import {
    test,
    assert,
    clearStore,
    newMockEvent,
} from "matchstick-as/assembly/index";
import { ethereum } from "@graphprotocol/graph-ts";
import { handleMintPortals } from "../src/mappings/diamond";
import { MintPortals } from "../generated/AavegotchiDiamond/AavegotchiDiamond";
import { BIGINT_ONE } from "../src/utils/constants";

test("handleMintPortals - should update portal status and stats entity", () => {
    // prepare event
    let newMockevent = newMockEvent();
    let event = new MintPortals(
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
    let _to = new ethereum.EventParam(
        "_to",
        ethereum.Value.fromAddress(newMockevent.address)
    );
    event.parameters.push(_to);
    let _from = new ethereum.EventParam(
        "_from",
        ethereum.Value.fromAddress(newMockevent.address)
    );
    event.parameters.push(_from);

    let _tokenId = new ethereum.EventParam(
        "_tokenId",
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)
    );
    event.parameters.push(_tokenId);

    let _numAavegotchisToPurchase = new ethereum.EventParam(
        "_numAavegotchisToPurchase",
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)
    );
    event.parameters.push(_numAavegotchisToPurchase);

    let _hauntId = new ethereum.EventParam(
        "_hauntId",
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)
    );
    event.parameters.push(_hauntId);

    event.transaction.to = newMockevent.address;
    event.transaction.from = newMockevent.address;

    // execute handler with event
    handleMintPortals(event);

    // assert and clear store
    assert.fieldEquals("Portal", "1", "id", "1");
    clearStore();
});
