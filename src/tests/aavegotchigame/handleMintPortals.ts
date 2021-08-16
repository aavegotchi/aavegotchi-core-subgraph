import { test, assert, clearStore } from "matchstick-as/assembly/index";
import { handleMintPortals } from "../../mappings/diamond";
import { BIGINT_ONE, BIGINT_ZERO, PORTAL_STATUS_BOUGHT } from "../../utils/constants";
import { getMintPortalsEvent } from "../../utils/helpers/events";


export function handleMintPortalsTests(): void {

    test("handleMintPortals - should create portal entity and update stats entity", () => {
        // prepare event
        let event = getMintPortalsEvent();
        // execute handler with event
        handleMintPortals(event);
        // assert and clear store
        assert.fieldEquals("Portal", "1", "id", BIGINT_ONE.toString());
        assert.fieldEquals("Portal", "1", "status", PORTAL_STATUS_BOUGHT);
        assert.fieldEquals("Portal", "1", "timesTraded", BIGINT_ZERO.toString());
        assert.fieldEquals("Statistic", "0", "portalsBought", BIGINT_ONE.toString());
        clearStore();
    })
}