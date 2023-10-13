import {
    test,
    assert,
    clearStore,
    createMockedFunction,
    newMockEvent,
} from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { handleUseConsumables } from "../src/mappings/diamond";
import { UseConsumables } from "../generated/AavegotchiDiamond/AavegotchiDiamond";
import { BIGINT_ONE, BIGINT_ZERO, ZERO_ADDRESS } from "../src/utils/constants";
import { getAavegotchiMock } from "./mocks";
import { Aavegotchi, ItemType } from "../generated/schema";

test("handleUseConsumable - happy case", () => {
    let gotchi = new Aavegotchi("1");
    gotchi.gotchiId = BIGINT_ONE;
    gotchi.locked = true;
    gotchi.gotchiId = BIGINT_ONE;
    gotchi.kinship = BIGINT_ZERO;
    // gotchi.portal = "1";
    gotchi.hauntId = BIGINT_ONE;
    gotchi.name = "Test";
    gotchi.nameLowerCase = "test";
    gotchi.randomNumber = BIGINT_ONE;
    gotchi.status = BigInt.fromI32(3);
    gotchi.numericTraits = [1, 1, 1, 1, 1, 1];
    gotchi.modifiedNumericTraits = [1, 1, 1, 1, 1, 1];
    gotchi.equippedWearables = [1, 1, 1, 1, 1, 1];
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
    gotchi.withSetsRarityScore = BIGINT_ONE;
    gotchi.locked = false;
    gotchi.timesTraded = BIGINT_ONE;
    gotchi.save();

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
    itemType.consumed = BIGINT_ZERO;
    itemType.save();

    let newMockevent = newMockEvent();
    let event = new UseConsumables(
        newMockevent.address,
        newMockevent.logIndex,
        newMockevent.transactionLogIndex,
        newMockevent.logType,
        newMockevent.block,
        newMockevent.transaction,
        newMockevent.parameters,
        null
    );
    let params = new Array<ethereum.EventParam>();

    let _tokenId = new ethereum.EventParam(
        "_tokenId",
        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)
    );
    params.push(_tokenId);

    let _itemIds = new ethereum.EventParam(
        "_itemIds",
        ethereum.Value.fromUnsignedBigIntArray([BIGINT_ONE])
    );
    params.push(_itemIds);

    let _quantities = new ethereum.EventParam(
        "_quantities",
        ethereum.Value.fromUnsignedBigIntArray([BigInt.fromI32(2)])
    );
    params.push(_quantities);

    event.parameters = params;

    // create mock for updateAavegotchi and getAavegotchi
    createMockedFunction(
        newMockevent.address,
        "getAavegotchi",
        "getAavegotchi(uint256):((uint256,string,address,uint256,uint256,int16[6],int16[6],uint16[16],address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,(uint256,uint256,(string,string,string,int8[6],bool[16],uint8[],(uint8,uint8,uint8,uint8),uint256,uint256,uint256,uint32,uint8,bool,uint16,bool,uint8,int16,uint32))[]))"
    )
        .withArgs([_tokenId.value])
        .returns(getAavegotchiMock(event));

    // execute handler with event
    handleUseConsumables(event);

    // assert and clear store
    // should count used consumables
    assert.fieldEquals("ItemType", "1", "consumed", "2");
    clearStore();
});
