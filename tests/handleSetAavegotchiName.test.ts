import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
    test,
    assert,
    clearStore,
    createMockedFunction,
} from "matchstick-as/assembly/index";
import { Aavegotchi, ERC721Listing } from "../generated/schema";
import { handleSetAavegotchiName } from "../src/mappings/diamond";
import { BIGINT_ONE, BIGINT_ZERO, ZERO_ADDRESS } from "../src/utils/constants";
import { getAavegotchiMock, getSetNameEvent } from "./mocks";

test("should update nameToLower on Listing entity of Aavegotchi", () => {
    let event = getSetNameEvent();

    // init
    let gotchi = new Aavegotchi("1");
    gotchi.activeListing = BIGINT_ONE;
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
    gotchi.historicalPrices = [];
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

    let listing = new ERC721Listing("1");
    listing.cancelled = false;
    listing.nameLowerCase = "TEST123";
    listing.category = BIGINT_ZERO;
    listing.erc721TokenAddress = Address.fromString(ZERO_ADDRESS);
    listing.tokenId = BIGINT_ZERO;
    listing.seller = Address.fromString(ZERO_ADDRESS);
    listing.timeCreated = BIGINT_ZERO;
    listing.cancelled = false;
    listing.priceInWei = BIGINT_ZERO;
    listing.gotchi = "1";
    listing.blockCreated = BIGINT_ZERO;
    listing.save();

    // create mock for updateAavegotchi and getAavegotchi
    createMockedFunction(
        event.address,
        "getAavegotchi",
        "getAavegotchi(uint256):((uint256,string,address,uint256,uint256,int16[6],int16[6],uint16[16],address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,(uint256,uint256,(string,string,string,int8[6],bool[16],uint8[],(uint8,uint8,uint8,uint8),uint256,uint256,uint256,uint32,uint8,bool,uint16,bool,uint8,int16,uint32))[]))"
    )
        .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
        .returns(getAavegotchiMock(event));

    handleSetAavegotchiName(event);

    assert.fieldEquals("ERC721Listing", "1", "nameLowerCase", "yes");
    clearStore();
});
