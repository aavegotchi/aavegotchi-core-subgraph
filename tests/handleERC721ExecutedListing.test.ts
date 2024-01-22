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
import { Aavegotchi, ERC721Listing, ItemType } from "../generated/schema";

test("handleERC721Listing - should add price to historicalPrices of aavegotchi if listing is aavegotchi", () => {
    // prepare event
    let event = getERC721ListingExecutedEvent(BigInt.fromI32(3));

    let itemType = new ItemType("1");
    itemType.svgId = BIGINT_ONE;
    itemType.name = "Test";
    itemType.ghstPrice = BIGINT_ONE;
    itemType.maxQuantity = BIGINT_ONE;
    itemType.totalQuantity = BIGINT_ONE;
    itemType.rarityScoreModifier = 1;
    itemType.traitModifiers = [1, 1, 1, 1, 1, 1];
    itemType.canPurchaseWithGhst = true;
    itemType.canBeTransferred = true;
    itemType.category = 1;
    itemType.consumed = BIGINT_ONE;
    itemType.save();

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
    listing.erc721TokenAddress = event.params.erc721TokenAddress
    listing.tokenId = BIGINT_ZERO;
    listing.seller = Address.fromString(ZERO_ADDRESS);
    listing.timeCreated = BIGINT_ZERO;
    listing.cancelled = false;
    listing.priceInWei = BIGINT_ZERO;
    listing.gotchi = "1";
    listing.blockCreated = BIGINT_ZERO;
    listing.save();

    //try_getERC721Listing
    createMockedFunction(
        event.address,
        "getERC721Listing",
        "getERC721Listing(uint256):((uint256,address,address,uint256,uint256,uint256,uint256,uint256,bool))"
    )
        .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
        .returns(getERC721ListingMock(event));

    // execute handler with event
    handleERC721ExecutedListing(event);

    // assert and clear store
    assert.fieldEquals("Aavegotchi", "1", "historicalPrices", "[1]");
    clearStore();
});

test("handleERC721Listing - should add price to historicalPrices of portal if listing is portal", () => {
    // prepare event
    let event = getERC721ListingExecutedEvent(BigInt.fromI32(1));
    let portal = getOrCreatePortal("1", true);
    portal.gotchiId = BIGINT_ONE;
    portal.buyer = ZERO_ADDRESS;
    portal.hauntId = BIGINT_ONE;
    portal.owner = ZERO_ADDRESS;
    portal.status = "opened";
    portal.timesTraded = BIGINT_ONE;
    portal.historicalPrices = [];

    portal.save();

    createMockedFunction(
        event.address,
        "getERC721Listing",
        "getERC721Listing(uint256):((uint256,address,address,uint256,uint256,uint256,uint256,uint256,bool))"
    )
        .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
        .returns(getERC721ListingMock(event, BigInt.fromI32(2)));

    // execute handler with event
    handleERC721ExecutedListing(event);

    // assert and clear store
    assert.fieldEquals("Portal", "1", "historicalPrices", "[1]");
    clearStore();
});

test("handleERC721Listing - should set blockCreated to block number when listing gets created", () => {
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
    listing.erc721TokenAddress = event.params.erc721TokenAddress
    listing.tokenId = BIGINT_ZERO;
    listing.seller = Address.fromString(ZERO_ADDRESS);
    listing.timeCreated = BIGINT_ZERO;
    listing.cancelled = false;
    listing.priceInWei = BIGINT_ZERO;
    listing.gotchi = "1";
    listing.blockCreated = BIGINT_ZERO;
    listing.save();

    //try_getERC721Listing
    createMockedFunction(
        event.address,
        "getERC721Listing",
        "getERC721Listing(uint256):((uint256,address,address,uint256,uint256,uint256,uint256,uint256,bool))"
    )
        .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
        .returns(getERC721ListingMock(event));
    handleERC721ListingAdd(event);
    assert.fieldEquals("ERC721Listing", "1", "blockCreated", "1");
    clearStore();
});

test("handleERC721Listing - reorg: should set block created if cancel events happens before add", () => {
    // prepare event
    let event = getERC721ListingCancelledEvent(BigInt.fromI32(3));

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
    listing.erc721TokenAddress = Address.fromString("0x86935F11C86623deC8a25696E1C19a8659CbF95d");
    listing.tokenId = BIGINT_ZERO;
    listing.seller = Address.fromString(ZERO_ADDRESS);
    listing.timeCreated = BIGINT_ZERO;
    listing.cancelled = false;
    listing.priceInWei = BIGINT_ZERO;
    listing.gotchi = "1";
    listing.blockCreated = BIGINT_ZERO;
    listing.save();

    //try_getERC721Listing
    createMockedFunction(
        event.address,
        "getERC721Listing",
        "getERC721Listing(uint256):((uint256,address,address,uint256,uint256,uint256,uint256,uint256,bool))"
    )
        .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
        .returns(getERC721ListingMock(event));

    handleERC721ListingCancelled(event);
    assert.fieldEquals("ERC721Listing", "1", "blockCreated", "1");
    clearStore();
});
