import {
  AavegotchiDiamond,
  AavegotchiInteract,
  BuyPortals,
  PortalOpened,
  ClaimAavegotchi,
  IncreaseStake,
  DecreaseStake,
  UseConsumables,
  SpendSkillpoints,
  EquipWearables,
  SetAavegotchiName,
  GrantExperience,
  Xingyun,
  ERC721ExecutedListing,
  ERC721ListingAdd,
  ERC721ListingCancelled,
  ERC721ListingRemoved,
  ERC1155ListingAdd,
  ERC1155ExecutedListing,
  ERC1155ListingCancelled,
  ERC1155ListingRemoved,
  Transfer,
  AddItemType,
  AddWearableSet,
  PurchaseItemsWithGhst,
  PurchaseItemsWithVouchers,
  MigrateVouchers,
  UpdateWearableSet,
  ItemTypeMaxQuantity,
  ExperienceTransfer,
  ItemModifiersSet,
  WearableSlotPositionsSet,
  MintPortals,
} from "../../generated/AavegotchiDiamond/AavegotchiDiamond";
import {
  getOrCreateUser,
  getOrCreatePortal,
  getOrCreateAavegotchiOption,
  getOrCreateAavegotchi,
  updateAavegotchiInfo,
  getStatisticEntity,
  getOrCreateERC1155Listing,
  getOrCreateERC721Listing,
  updateERC1155ListingInfo,
  updateERC721ListingInfo,
  getOrCreateItemType,
  getOrCreateWearableSet,
  getOrCreateERC1155Purchase,
  updateERC1155PurchaseInfo,
} from "../utils/helpers/diamond";
import {
  BIGINT_ONE,
  PORTAL_STATUS_BOUGHT,
  PORTAL_STATUS_OPENED,
  PORTAL_STATUS_CLAIMED,
  BIGINT_ZERO,
} from "../utils/constants";
import { BigInt, log } from "@graphprotocol/graph-ts";

export function handleBuyPortals(event: BuyPortals): void {
  let contract = AavegotchiDiamond.bind(event.address);
  let buyer = getOrCreateUser(event.params._from.toHexString());
  let owner = getOrCreateUser(event.params._to.toHexString());
  let stats = getStatisticEntity();

  let baseId = event.params._tokenId;

  for (let i = 0; i < event.params._numAavegotchisToPurchase.toI32(); i++) {
    let id = baseId.plus(BigInt.fromI32(i));
    let portal = getOrCreatePortal(id.toString());

    //Add portal hauntId
    let portalResponse = contract.try_getAavegotchi(id);
    if (!portalResponse.reverted) {
      portal.hauntId = portalResponse.value.hauntId;
    }

    portal.status = PORTAL_STATUS_BOUGHT;
    portal.gotchiId = event.params._tokenId;
    portal.owner = owner.id;
    portal.buyer = buyer.id;

    portal.save();
  }

  stats.portalsBought = stats.portalsBought.plus(
    event.params._numAavegotchisToPurchase
  );

  stats.save();
  buyer.save();
  owner.save();
}

export function handleXingyun(event: Xingyun): void {
  let contract = AavegotchiDiamond.bind(event.address);
  let buyer = getOrCreateUser(event.params._from.toHexString());
  let owner = getOrCreateUser(event.params._to.toHexString());
  let stats = getStatisticEntity();

  let baseId = event.params._tokenId;

  for (let i = 0; i < event.params._numAavegotchisToPurchase.toI32(); i++) {
    let id = baseId.plus(BigInt.fromI32(i));
    let portal = getOrCreatePortal(id.toString());

    portal.hauntId = BIGINT_ONE;
    portal.status = PORTAL_STATUS_BOUGHT;
    portal.gotchiId = event.params._tokenId;
    portal.boughtAt = event.block.number;
    portal.owner = owner.id;
    portal.buyer = buyer.id;
    portal.timesTraded = BIGINT_ZERO;

    portal.save();
  }

  stats.portalsBought = stats.portalsBought.plus(
    event.params._numAavegotchisToPurchase
  );

  stats.save();
  buyer.save();
  owner.save();
}

// - event: PortalOpened(indexed uint256)
//   handler: handlePortalOpened

//@ts-ignore
function calculateBaseRarityScore(numericTraits: Array<i32>): i32 {
  let rarityScore = 0;

  for (let index = 0; index < numericTraits.length; index++) {
    let element = numericTraits[index];

    if (element < 50) rarityScore = rarityScore + (100 - element);
    else rarityScore = rarityScore + (element + 1);
  }

  return rarityScore;
}

export function handlePortalOpened(event: PortalOpened): void {
  let contract = AavegotchiDiamond.bind(event.address);
  let portal = getOrCreatePortal(event.params.tokenId.toString());
  let response = contract.try_portalAavegotchiTraits(event.params.tokenId);
  let stats = getStatisticEntity();

  if (!response.reverted) {
    let array = response.value;

    for (let i = 0; i < 10; i++) {
      let possibleAavegotchiTraits = array[i];
      let gotchi = getOrCreateAavegotchiOption(
        portal.id.concat("-").concat(BigInt.fromI32(i).toString())
      );
      gotchi.portal = portal.id;
      gotchi.owner = portal.owner;
      gotchi.randomNumber = possibleAavegotchiTraits.randomNumber;
      gotchi.numericTraits = possibleAavegotchiTraits.numericTraits;
      gotchi.collateralType = possibleAavegotchiTraits.collateralType;
      gotchi.minimumStake = possibleAavegotchiTraits.minimumStake;
      //calculate base rarity score
      gotchi.baseRarityScore = calculateBaseRarityScore(gotchi.numericTraits);

      gotchi.save();
    }
  }

  portal.status = PORTAL_STATUS_OPENED;
  portal.openedAt = event.block.number;

  stats.portalsOpened = stats.portalsOpened.plus(BIGINT_ONE);

  stats.save();
  portal.save();
}

// - event: ClaimAavegotchi(indexed uint256)
//   handler: handleClaimAavegotchi

export function handleClaimAavegotchi(event: ClaimAavegotchi): void {
  let portal = getOrCreatePortal(event.params._tokenId.toString());
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString(), event);
  let stats = getStatisticEntity();

  gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);
  gotchi.owner = portal.owner;
  gotchi.claimedAt = event.block.number;
  gotchi.gotchiId = event.params._tokenId;

  portal.gotchi = gotchi.id;
  portal.status = PORTAL_STATUS_CLAIMED;
  portal.claimedAt = event.block.number;

  stats.aavegotchisClaimed = stats.aavegotchisClaimed.plus(BIGINT_ONE);

  stats.save();
  gotchi.save();
  portal.save();
}

// - event: IncreaseStake(indexed uint256,uint256)
//   handler: handleIncreaseStake

export function handleIncreaseStake(event: IncreaseStake): void {
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString(), event);

  gotchi.stakedAmount = gotchi.stakedAmount.plus(event.params._stakeAmount);
  gotchi.save();
}

// - event: DecreaseStake(indexed uint256,uint256)
//   handler: handleDecreaseStake

export function handleDecreaseStake(event: DecreaseStake): void {
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString(), event);

  gotchi.stakedAmount = gotchi.stakedAmount.minus(event.params._reduceAmount);

  gotchi.save();
}

// - event: SpendSkillpoints(indexed uint256,int8[4])
//   handler: handleSpendSkillpoints

export function handleSpendSkillpoints(event: SpendSkillpoints): void {
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString(), event);

  gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);

  //Then update withSetsNumericTraits

  gotchi.save();
}

// - event: EquipWearables(indexed uint256,uint256,uint256)
//   handler: handleEquipWearables

export function handleEquipWearables(event: EquipWearables): void {
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString(), event);

  gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);

  let contract = AavegotchiDiamond.bind(event.address);

  let bigInts = new Array<BigInt>(gotchi.equippedWearables.length);
  let equippedWearables = gotchi.equippedWearables;

  for (let index = 0; index < equippedWearables.length; index++) {
    let element = equippedWearables[index];
    bigInts.push(BigInt.fromI32(element));
  }

  let equippedSets = contract.try_findWearableSets(bigInts);

  if (!equippedSets.reverted) {
    log.warning("Equipped sets for GotchiID {} length {}", [
      event.params._tokenId.toString(),
      BigInt.fromI32(equippedSets.value.length).toString(),
    ]);

    if (equippedSets.value.length > 0) {
      //Find the best set
      let foundSetIDs = equippedSets.value;

      //Retrieve sets from onchain
      let getSetTypes = contract.try_getWearableSets();

      if (!getSetTypes.reverted) {
        let setTypes = getSetTypes.value;

        let bestSetID = 0;
        let highestBRSBonus = 0;

        //Iterate through all the possible equipped sets
        for (let index = 0; index < foundSetIDs.length; index++) {
          let setID = foundSetIDs[index];
          let setInfo = setTypes[setID.toI32()];
          let traitBonuses = setInfo.traitsBonuses;

          let brsBonus = traitBonuses[0];

          if (brsBonus >= highestBRSBonus) {
            highestBRSBonus = brsBonus;
            bestSetID = setID.toI32();
          } else {
          }
        }

        log.warning("Best set: for GotchiID {} {} {}", [
          gotchi.gotchiId.toString(),
          setTypes[bestSetID].name,
          bestSetID.toString(),
        ]);

        let setBonuses = setTypes[bestSetID].traitsBonuses;

        //Add the set bonuses on to the modified numeric traits (which already include wearable bonuses, but not rarityScore modifiers)
        let brsBonus = setBonuses[0];

        let beforeSetBonus = calculateBaseRarityScore(
          gotchi.modifiedNumericTraits
        );

        //Before modifying
        let withSetsNumericTraits = gotchi.modifiedNumericTraits;

        //Add in the individual bonuses
        for (let index = 0; index < 4; index++) {
          withSetsNumericTraits[index] =
            withSetsNumericTraits[index] + setBonuses[index + 1];
        }

        //Get the post-set bonus
        let afterSetBonus = calculateBaseRarityScore(withSetsNumericTraits);

        //Get the difference
        let bonusDifference = afterSetBonus - beforeSetBonus;

        //Update the traits
        gotchi.withSetsNumericTraits = withSetsNumericTraits;

        //Add on the bonus differences to the modified rarity score
        gotchi.withSetsRarityScore = gotchi.modifiedRarityScore
          .plus(BigInt.fromI32(bonusDifference))
          .plus(BigInt.fromI32(brsBonus));

        //Equip the set
        gotchi.equippedSetID = BigInt.fromI32(bestSetID);

        //Set the name
        gotchi.equippedSetName = setTypes[bestSetID].name;
      }

      gotchi.possibleSets = BigInt.fromI32(equippedSets.value.length);
    } else {
      gotchi.equippedSetID = null;
      gotchi.equippedSetName = "";
      gotchi.withSetsRarityScore = gotchi.modifiedRarityScore;
      gotchi.withSetsNumericTraits = gotchi.modifiedNumericTraits;
    }
  } else {
    gotchi.withSetsRarityScore = gotchi.modifiedRarityScore;
    gotchi.withSetsNumericTraits = gotchi.modifiedNumericTraits;
    log.warning("Find wearable sets reverted at block: {} tx_hash: {}", [
      event.block.number.toString(),
      event.transaction.hash.toHexString(),
    ]);
  }

  gotchi.save();
}

// - event: SetAavegotchiName(indexed uint256,string,string)
//   handler: handleSetAavegotchiName

export function handleSetAavegotchiName(event: SetAavegotchiName): void {
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString(), event);

  gotchi.name = event.params._newName;

  gotchi.save();
}

// - event: UseConsumables(indexed uint256,uint256[],uint256[])
//   handler: handleUseConsumables

export function handleUseConsumables(event: UseConsumables): void {
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString(), event);

  gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);

  gotchi.save();
}

// - event: GrantExperience(uint256[],uint32[])
//   handler: handleGrantExperience

export function handleGrantExperience(event: GrantExperience): void {
  let ids = event.params._tokenIds;
  //let xpAmounts = event.params._xpValues;

  for (let i = 0; i < ids.length; i++) {
    let tokenID = ids[i];

    let gotchi = getOrCreateAavegotchi(tokenID.toString(), event);
    gotchi = updateAavegotchiInfo(gotchi, tokenID, event);
    /*
    let xpAmount = xpAmounts[i];

    let gotchi = getOrCreateAavegotchi(tokenID.toString(), event);

    if (gotchi.owner === "0x0000000000000000000000000000000000000000") {
      //Don't do anything, this aavegotchi has been sacrificed
    } else {
      gotchi.experience = gotchi.experience.plus(xpAmount);

      if (gotchi.experience.gt(BigInt.fromI32(490050))) {
        gotchi.level = BigInt.fromI32(99);
      } else {
        //@ts-ignore
        let level = (Math.sqrt(2 * gotchi.experience.toI32()) / 10) as i32;
        gotchi.level = BigInt.fromI32(level + 1);
      }
    }
    */

    gotchi.save();
  }
}

export function handleExperienceTransfer(event: ExperienceTransfer): void {
  let tokenID = event.params._toTokenId;
  let xpAmount = event.params.experience;

  let gotchi = getOrCreateAavegotchi(tokenID.toString(), event);

  gotchi.experience = gotchi.experience.plus(xpAmount);

  if (gotchi.experience.gt(BigInt.fromI32(490050))) {
    gotchi.level = BigInt.fromI32(99);
  } else {
    //@ts-ignore
    let level = (Math.sqrt(2 * gotchi.experience.toI32()) / 10) as i32;
    gotchi.level = BigInt.fromI32(level + 1);
  }

  gotchi.save();
}

// - event: AavegotchiInteract(indexed uint256,uint256)
//   handler: handleAavegotchiInteract

export function handleAavegotchiInteract(event: AavegotchiInteract): void {
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString(), event);
  gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);

  gotchi.save();
}

//ERC721 Transfer
export function handleTransfer(event: Transfer): void {
  let id = event.params._tokenId.toString();
  let newOwner = getOrCreateUser(event.params._to.toHexString());
  let gotchi = getOrCreateAavegotchi(id, event, false);
  let portal = getOrCreatePortal(id, false);

  // ERC721 transfer can be portal or gotchi based, so we have to check it.
  if (gotchi) {
    gotchi.owner = newOwner.id;
    gotchi.save();
  }

  if (portal) {
    portal.owner = newOwner.id;
    portal.save();
  }

  newOwner.save();
}

//ERC1155 Transfers
/*
export function handleTransferSingle(event: TransferSingle): void {}

export function handleTransferBatch(event: TransferBatch): void {}

//ERC721 Marketplace Facet

/*
-event:  ERC721ListingAdd(
        uint256 indexed listingId,
        address indexed seller,
        address erc721TokenAddress,
        uint256 erc721TokenId,
        uint256 indexed category,
        uint256 time
    );
-handler: handleERC721ListingAdd
*/

export function handleERC721ListingAdd(event: ERC721ListingAdd): void {
  let listing = getOrCreateERC721Listing(event.params.listingId.toString());
  listing = updateERC721ListingInfo(listing, event.params.listingId, event);

  if (listing.category == BigInt.fromI32(3)) {
    listing.gotchi = event.params.erc721TokenId.toString();
  } else {
    listing.portal = event.params.erc721TokenId.toString();
  }

  listing.save();
}

/* -event: ERC721ExecutedListing(
        uint256 indexed listingId,
        address indexed seller,
        address buyer,
        address erc721TokenAddress,
        uint256 erc721TokenId,
        uint256 indexed category,
        uint256 priceInWei,
        uint256 time
    );
    */
//handler: handleERC721ExecutedListing

export function handleERC721ExecutedListing(
  event: ERC721ExecutedListing
): void {
  let listing = getOrCreateERC721Listing(event.params.listingId.toString());
  listing = updateERC721ListingInfo(listing, event.params.listingId, event);

  listing.buyer = event.params.buyer;
  listing.timePurchased = event.params.time;
  listing.save();

  //Portal -- update number of times traded
  if (event.params.category.lt(BigInt.fromI32(3))) {
    let portal = getOrCreatePortal(event.params.erc721TokenId.toString());
    portal.timesTraded = portal.timesTraded.plus(BIGINT_ONE);
    portal.save();
  }

  //Aavegotchi -- update number of times traded
  else if (event.params.category.equals(BigInt.fromI32(3))) {
    let gotchi = getOrCreateAavegotchi(
      event.params.erc721TokenId.toString(),
      event
    );
    gotchi.timesTraded = gotchi.timesTraded.plus(BIGINT_ONE);
    gotchi.save();
  }

  let stats = getStatisticEntity();
  stats.erc721TotalVolume = stats.erc721TotalVolume.plus(
    event.params.priceInWei
  );
  stats.save();
}

/*
event: ERC721ListingCancelled(uint256 indexed listingId, uint256 category, uint256 time);
handler: handleERC721ListingCancelled
*/

export function handleERC721ListingCancelled(
  event: ERC721ListingCancelled
): void {
  let listing = getOrCreateERC721Listing(event.params.listingId.toString());
  listing = updateERC721ListingInfo(listing, event.params.listingId, event);

  listing.cancelled = true;
  listing.save();
}

/*
event: ERC721ListingRemoved(uint256 indexed listingId, uint256 category, uint256 time);
handler:handleERC721ListingRemoved
*/

export function handleERC721ListingRemoved(event: ERC721ListingRemoved): void {
  let listing = getOrCreateERC721Listing(event.params.listingId.toString());
  listing = updateERC721ListingInfo(listing, event.params.listingId, event);

  listing.cancelled = true;
  listing.save();
}

export function handleERC1155ListingAdd(event: ERC1155ListingAdd): void {
  let listing = getOrCreateERC1155Listing(
    event.params.listingId.toString(),
    true
  );

  listing = updateERC1155ListingInfo(listing, event.params.listingId, event);

  listing.save();
}

/*
-event: ERC1155ExecutedListing(
        uint256 indexed listingId,
        address indexed seller,
        address buyer,
        address erc1155TokenAddress,
        uint256 erc1155TypeId,
        uint256 indexed category,
        uint256 _quantity,
        uint256 priceInWei,
        uint256 time
    )
-handler: handleERC1155ExecutedListing
    */

export function handleERC1155ExecutedListing(
  event: ERC1155ExecutedListing
): void {
  let listing = getOrCreateERC1155Listing(event.params.listingId.toString());
  let listingUpdateInfo = event.params;

  listing = updateERC1155ListingInfo(listing, event.params.listingId, event);

  listing.save();

  //Create new ERC1155Purchase
  let purchaseID =
    listingUpdateInfo.listingId.toString() +
    "_" +
    listingUpdateInfo.buyer.toHexString() +
    "_" +
    event.block.timestamp.toString();
  let purchase = getOrCreateERC1155Purchase(
    purchaseID,
    listingUpdateInfo.buyer
  );
  purchase = updateERC1155PurchaseInfo(purchase, event);
  purchase.save();

  //Update Stats
  let stats = getStatisticEntity();
  let volume = listingUpdateInfo.priceInWei.times(listingUpdateInfo._quantity);
  stats.erc1155TotalVolume = stats.erc1155TotalVolume.plus(volume);

  if (listing.category.toI32() === 0)
    stats.totalWearablesVolume = stats.totalWearablesVolume.plus(volume);
  else if (listing.category.toI32() === 2)
    stats.totalConsumablesVolume = stats.totalConsumablesVolume.plus(volume);
  else if (listing.category.toI32() === 3)
    stats.totalTicketsVolume = stats.totalTicketsVolume.plus(volume);

  stats.save();
}

export function handleERC1155ListingCancelled(
  event: ERC1155ListingCancelled
): void {
  let listing = getOrCreateERC1155Listing(event.params.listingId.toString());

  listing = updateERC1155ListingInfo(listing, event.params.listingId, event);

  listing.save();
}

export function handleERC1155ListingRemoved(
  event: ERC1155ListingRemoved
): void {
  let listing = getOrCreateERC1155Listing(event.params.listingId.toString());

  listing = updateERC1155ListingInfo(listing, event.params.listingId, event);

  listing.save();
}

//ERC1155 Item Types

export function handleAddItemType(event: AddItemType): void {
  let itemType = getOrCreateItemType(event.params._itemType.svgId.toString());

  let itemInfo = event.params._itemType;

  itemType.name = itemInfo.name;
  itemType.svgId = itemInfo.svgId;
  itemType.desc = itemInfo.description;
  itemType.author = itemInfo.author;

  itemType.traitModifiers = itemInfo.traitModifiers;

  itemType.slotPositions = itemInfo.slotPositions;
  itemType.ghstPrice = itemInfo.ghstPrice;
  itemType.maxQuantity = itemInfo.maxQuantity;
  itemType.totalQuantity = itemInfo.totalQuantity;
  itemType.rarityScoreModifier = itemInfo.rarityScoreModifier;
  itemType.canPurchaseWithGhst = itemInfo.canPurchaseWithGhst;
  itemType.minLevel = itemInfo.minLevel;
  itemType.canBeTransferred = itemInfo.canBeTransferred;
  itemType.category = itemInfo.category;
  itemType.kinshipBonus = itemInfo.kinshipBonus;
  itemType.experienceBonus = itemInfo.experienceBonus;

  itemType.save();
}

export function handleItemTypeMaxQuantity(event: ItemTypeMaxQuantity): void {
  let itemIds = event.params._itemIds;
  let quantities = event.params._maxQuanities;

  for (let index = 0; index < itemIds.length; index++) {
    let itemId = itemIds[index];
    let maxQuantity = quantities[index];

    let itemType = getOrCreateItemType(itemId.toString());
    itemType.maxQuantity = maxQuantity;
    itemType.save();
  }
}

export function handlePurchaseItemsWithGhst(
  event: PurchaseItemsWithGhst
): void {
  let itemIds = event.params._itemIds;
  let quantities = event.params._quantities;

  for (let index = 0; index < itemIds.length; index++) {
    let itemId = itemIds[index];
    let quantity = quantities[index];

    let itemType = getOrCreateItemType(itemId.toString());
    itemType.totalQuantity = itemType.totalQuantity.plus(quantity);
    itemType.save();
  }
}

export function handlePurchaseItemsWithVouchers(
  event: PurchaseItemsWithVouchers
): void {
  let itemIds = event.params._itemIds;
  let quantities = event.params._quantities;

  for (let index = 0; index < itemIds.length; index++) {
    let itemId = itemIds[index];
    let quantity = quantities[index];

    let itemType = getOrCreateItemType(itemId.toString());
    itemType.totalQuantity = itemType.totalQuantity.plus(quantity);
    itemType.save();
  }
}

export function handleMigrateVouchers(event: MigrateVouchers): void {
  let itemIds = event.params._ids;
  let quantities = event.params._values;

  for (let index = 0; index < itemIds.length; index++) {
    let itemId = itemIds[index];
    let quantity = quantities[index];

    let itemType = getOrCreateItemType(itemId.toString());
    itemType.totalQuantity = itemType.totalQuantity.plus(quantity);
    itemType.save();
  }
}

export function handleAddWearableSet(event: AddWearableSet): void {
  let set = getOrCreateWearableSet(event.params._wearableSet.name);
  let setInfo = event.params._wearableSet;

  set.name = setInfo.name;
  set.traitBonuses = setInfo.traitsBonuses;
  set.wearableIds = setInfo.wearableIds;
  set.allowedCollaterals = setInfo.allowedCollaterals;

  set.save();
}

export function handleUpdateWearableSet(event: UpdateWearableSet): void {
  let setInfo = event.params._wearableSet;

  let set = getOrCreateWearableSet(event.params._wearableSet.name);
  set.name = setInfo.name;
  set.traitBonuses = setInfo.traitsBonuses;
  set.wearableIds = setInfo.wearableIds;
  set.allowedCollaterals = setInfo.allowedCollaterals;

  set.save();
}

export function handleItemModifiersSet(event: ItemModifiersSet): void {
  let itemType = getOrCreateItemType(event.params._wearableId.toString());
  itemType.traitModifiers = event.params._traitModifiers;
  itemType.rarityScoreModifier = event.params._rarityScoreModifier;
  itemType.save();
}

export function handleWearableSlotPositionsSet(
  event: WearableSlotPositionsSet
): void {
  let itemType = getOrCreateItemType(event.params._wearableId.toString());
  itemType.slotPositions = event.params._slotPositions;
  itemType.save();
}

export function handleMintPortals(event: MintPortals): void {
  let buyer = getOrCreateUser(event.params._from.toHexString());
  let owner = getOrCreateUser(event.params._to.toHexString());
  let stats = getStatisticEntity();

  let baseId = event.params._tokenId;
  for (let i = 0; i < event.params._numAavegotchisToPurchase.toI32(); i++) {
    let id = baseId.plus(BigInt.fromI32(i));
    let portal = getOrCreatePortal(id.toString());

    portal.hauntId = event.params._hauntId;
    portal.status = PORTAL_STATUS_BOUGHT;
    portal.gotchiId = event.params._tokenId;
    portal.boughtAt = event.block.number;
    portal.owner = owner.id;
    portal.buyer = buyer.id;
    portal.timesTraded = BIGINT_ZERO;

    portal.save();
  }

  stats.portalsBought = stats.portalsBought.plus(
    event.params._numAavegotchisToPurchase
  );

  stats.save();
  buyer.save();
  owner.save();
}

//Upgrades

/*
export function handleDiamondCut(event: DiamondCut): void {
  for (let index = 0; index < event.params._diamondCut.length; index++) {
    let upgrade = getOrCreateUpgrade(event.transaction.hash.toHexString());
    const cut = event.params._diamondCut[index];
  }

  upgrade.call;
  let diamond = event.params._diamondCut[0];
  diamond.facetAddress;
}
*/
