import {
    test,
    assert,
    clearStore,
    createMockedFunction,
} from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
    handleERC721ExecutedListing,
    handleERC721ListingAdd,
    handleERC721ListingCancelled,
} from "../src/mappings/diamond";
import { BIGINT_ONE, BIGINT_ZERO, ZERO_ADDRESS } from "../src/utils/constants";
import {
    getERC721ListingAddEvent,
    getERC721ListingCancelledEvent,
    getERC721ListingExecutedEvent,
    getERC721ListingMock,
} from "./mocks";
import { getOrCreatePortal } from "../src/utils/helpers/diamond";
import { Aavegotchi } from "../generated/schema";

test("should add gotchi name lower case if token is an aavegtochi", () => {
    // prepare event
    let event = getERC721ListingAddEvent(BigInt.fromI32(3));

    let gotchi = new Aavegotchi("1");
    gotchi.locked = false;
    gotchi.gotchiId = BIGINT_ONE;
    gotchi.kinship = BIGINT_ZERO;
    gotchi.gotchiId = BIGINT_ONE;
    // gotchi.portal = "1";
    gotchi.hauntId = BIGINT_ONE;
    gotchi.name = "Test";
    gotchi.nameLowerCase = "test";
    gotchi.randomNumber = BIGINT_ONE;
    gotchi.status = BigInt.fromI32(3);
    gotchi.numericTraits = [1, 1, 1, 1, 1, 1];
    gotchi.modifiedNumericTraits = [1, 1, 1, 1, 1, 1];
    gotchi.equippedWearables = [1, 1, 1, 1, 1, 1];
    gotchi.equippedDelegatedWearables = [0, 0, 0, 0, 0, 0];
    gotchi.collateral = Address.fromString(ZERO_ADDRESS);
    gotchi.escrow = Address.fromString(ZERO_ADDRESS);
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

    //try_getERC721Listing
    createMockedFunction(
        event.address,
        "getERC721Listing",
        "getERC721Listing(uint256):((uint256,address,address,uint256,uint256,uint256,uint256,uint256,bool))"
    )
        .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
        .returns(getERC721ListingMock(event));

    // execute handler with event
    handleERC721ListingAdd(event);

    // assert and clear store
    assert.fieldEquals("ERC721Listing", "1", "nameLowerCase", "test");
    clearStore();
});
