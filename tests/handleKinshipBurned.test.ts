import {
    test,
    assert,
    clearStore,
    newMockEvent,
} from "matchstick-as/assembly/index";
import { Bytes, ethereum } from "@graphprotocol/graph-ts";
import { handleKinshipBurned } from "../src/mappings/diamond";

import { Aavegotchi } from "../generated/schema";
import { BIGINT_ONE } from "../src/utils/constants";
import { KinshipBurned } from "../generated/RealmDiamond/RealmDiamond";

test("should update kinship of gotchi", () => {
    // Initialise
    let gotchi = new Aavegotchi("1");
    gotchi.locked = false;
    gotchi.kinship = BIGINT_ONE;
    gotchi.gotchiId = BIGINT_ONE;
    gotchi.hauntId = BIGINT_ONE;
    gotchi.name = "Test 123";
    gotchi.nameLowerCase = "test 123";
    gotchi.randomNumber = BIGINT_ONE;
    gotchi.status = BIGINT_ONE;
    gotchi.numericTraits = [1, 2, 3, 4];
    gotchi.modifiedNumericTraits = [1, 2, 3, 4];
    gotchi.equippedWearables = [1, 2, 3, 4];
    gotchi.baseRarityScore = BIGINT_ONE;
    gotchi.collateral = new Bytes(0);
    gotchi.escrow = new Bytes(0);
    gotchi.stakedAmount = BIGINT_ONE;
    gotchi.minimumStake = BIGINT_ONE;
    gotchi.kinship = BIGINT_ONE;
    gotchi.lastInteracted = BIGINT_ONE;
    gotchi.experience = BIGINT_ONE;
    gotchi.toNextLevel = BIGINT_ONE;
    gotchi.usedSkillPoints = BIGINT_ONE;
    gotchi.level = BIGINT_ONE;
    gotchi.baseRarityScore = BIGINT_ONE;
    gotchi.modifiedRarityScore = BIGINT_ONE;
    gotchi.locked = false;
    gotchi.timesTraded = BIGINT_ONE;
    gotchi.save();

    // prepare event
    let newMockevent = newMockEvent();
    let event = new KinshipBurned(
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

    let _tokenId = new ethereum.EventParam(
        "_tokenId",
        ethereum.Value.fromI32(1)
    );
    event.parameters.push(_tokenId);

    let _value = new ethereum.EventParam("_value", ethereum.Value.fromI32(0));
    event.parameters.push(_value);

    // execute handler with event
    handleKinshipBurned(event);

    // assert and clear store
    assert.fieldEquals("Aavegotchi", "1", "kinship", "0");
    clearStore();
});
