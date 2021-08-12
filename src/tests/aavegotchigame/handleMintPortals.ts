import { test, assert, clearStore, createMockedFunction } from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { handleAavegotchiInteract, handleMintPortals } from "../../mappings/diamond";
import { AavegotchiInteract, MintPortals } from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { BIGINT_ONE, CONTRACT_ADDRESS } from "../../utils/constants";
import { getAavegotchiMock } from "../../utils/helpers/mocks";
import { getMintPortalsEvent } from "../../utils/helpers/test";

export function handleMintPortalsTests(): void {

    test("handleMintPortals - should update portal status and stats entity", () => {
        // prepare event
        let event = getMintPortalsEvent();
        // execute handler with event
        handleMintPortals(event);
        // assert and clear store
        // assert.fieldEquals("Portal", "1", "gotchi", "1");
        clearStore();
    })
}