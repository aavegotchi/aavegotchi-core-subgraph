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
  UpdateERC1155Listing,
  RemoveExperience,
  UpdateItemPrice,
  GotchiLendingCancel,
  GotchiLendingExecute,
  GotchiLendingEnd,
  GotchiLendingClaim,
  GotchiLendingAdd,
  WhitelistCreated,
  WhitelistUpdated,
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
  getOrCreateParcel,
  updateAavegotchiWearables,
  calculateBaseRarityScore,
  getOrCreateGotchiLending,
  updateGotchiLending,
  createOrUpdateWhitelist,
  getOrCreateClaimedToken,
} from "../utils/helpers/diamond";
import {
  BIGINT_ONE,
  PORTAL_STATUS_BOUGHT,
  PORTAL_STATUS_OPENED,
  PORTAL_STATUS_CLAIMED,
  BIGINT_ZERO,
  ZERO_ADDRESS,
} from "../utils/constants";
import { Address, BigInt, log } from "@graphprotocol/graph-ts";

import { Parcel } from "../../generated/schema";
import {
  RealmDiamond,
  MintParcel,
  ResyncParcel,
} from "../../generated/RealmDiamond/RealmDiamond";

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
    let portal = getOrCreatePortal(baseId.toString());

    portal.hauntId = BIGINT_ONE;
    portal.status = PORTAL_STATUS_BOUGHT;
    portal.gotchiId = baseId;
    portal.boughtAt = event.block.number;
    portal.owner = owner.id;
    portal.buyer = buyer.id;
    portal.timesTraded = BIGINT_ZERO;

    portal.save();

    baseId = baseId.plus(BIGINT_ONE);
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
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString(), event)!;
  let stats = getStatisticEntity();

  gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);
  gotchi.claimedAt = event.block.number;
  gotchi.gotchiId = event.params._tokenId;

  portal.gotchi = gotchi.id;
  let zeroUser = getOrCreateUser(ZERO_ADDRESS);
  portal.owner = zeroUser.id;
  portal.status = PORTAL_STATUS_CLAIMED;
  portal.claimedAt = event.block.number;

  if(portal.activeListing) {
    let listing = getOrCreateERC721Listing(portal.activeListing!.toString());
    listing.cancelled = true;
    listing.save();
  }

  stats.aavegotchisClaimed = stats.aavegotchisClaimed.plus(BIGINT_ONE);

  stats.save();
  gotchi.save();
  portal.save();
  zeroUser.save();
}

// - event: IncreaseStake(indexed uint256,uint256)
//   handler: handleIncreaseStake

export function handleIncreaseStake(event: IncreaseStake): void {
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString(), event)!;
  gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);
  gotchi.save();
}

// - event: DecreaseStake(indexed uint256,uint256)
//   handler: handleDecreaseStake

export function handleDecreaseStake(event: DecreaseStake): void {
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString(), event)!;
  gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);
  gotchi.save();
}

// - event: SpendSkillpoints(indexed uint256,int8[4])
//   handler: handleSpendSkillpoints

export function handleSpendSkillpoints(event: SpendSkillpoints): void {
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString(), event)!;
  gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);
  updateAavegotchiWearables(gotchi, event);
}

// - event: EquipWearables(indexed uint256,uint256,uint256)
//   handler: handleEquipWearables

export function handleEquipWearables(event: EquipWearables): void {
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString(), event)!;

  gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);

  updateAavegotchiWearables(gotchi, event);
}

// - event: SetAavegotchiName(indexed uint256,string,string)
//   handler: handleSetAavegotchiName

export function handleSetAavegotchiName(event: SetAavegotchiName): void {
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString(), event)!;
  gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);
  gotchi.save();

  if(gotchi.activeListing) {
    let listing = getOrCreateERC721Listing(gotchi.activeListing!.toString(), false);
    listing.nameLowerCase = gotchi.nameLowerCase;
    listing.save();
  }
}

// - event: UseConsumables(indexed uint256,uint256[],uint256[])
//   handler: handleUseConsumables

export function handleUseConsumables(event: UseConsumables): void {
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString(), event)!;
  gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);
  gotchi.save();

  // maintain consumed
  let itemTypes = event.params._itemIds;
  let quantities = event.params._quantities;
  for (let i = 0; i < event.params._itemIds.length; i++) {
    let itemType = getOrCreateItemType(itemTypes[i].toString());
    itemType.consumed = itemType.consumed.plus(quantities[i]);
    itemType.save();
  }
}

// - event: GrantExperience(uint256[],uint32[])
//   handler: handleGrantExperience

export function handleGrantExperience(event: GrantExperience): void {
  let ids = event.params._tokenIds;
  //let xpAmounts = event.params._xpValues;

  for (let i = 0; i < ids.length; i++) {
    let tokenID = ids[i];
    let gotchi = getOrCreateAavegotchi(tokenID.toString(), event, false);

    if(gotchi) {
      gotchi = updateAavegotchiInfo(gotchi, tokenID, event);
      gotchi.save();
    }
    
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
  }
}

export function handleRemoveExperience(event: RemoveExperience): void {
  let ids = event.params._tokenIds;
  for (let i = 0; i < ids.length; i++) {
    let tokenID = ids[i];
    let gotchi = getOrCreateAavegotchi(tokenID.toString(), event)!;
    gotchi = updateAavegotchiInfo(gotchi, tokenID, event);

    gotchi.save();
  }
}

export function handleExperienceTransfer(event: ExperienceTransfer): void {
  let tokenID = event.params._toTokenId;

  let gotchi = getOrCreateAavegotchi(tokenID.toString(), event)!;
  gotchi = updateAavegotchiInfo(gotchi, tokenID, event);
  gotchi.save();
}

// - event: AavegotchiInteract(indexed uint256,uint256)
//   handler: handleAavegotchiInteract

export function handleAavegotchiInteract(event: AavegotchiInteract): void {
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString(), event, false);
  if(!gotchi) {
    return;
  }

  gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);
  // persist only if gotchi is already claimed
  if (gotchi.status.equals(BigInt.fromI32(3))) {
    gotchi.save();
  }

}

//ERC721 Transfer
export function handleTransfer(event: Transfer): void {
  let id = event.params._tokenId.toString();
  let newOwner = getOrCreateUser(event.params._to.toHexString());
  newOwner.save();
  let gotchi = getOrCreateAavegotchi(id, event, false);
  let portal = getOrCreatePortal(id, false);
  // ERC721 transfer can be portal or gotchi based, so we have to check it.
  if (gotchi != null) {
    gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);
    gotchi.owner = newOwner.id;
    gotchi.originalOwner = newOwner.id;
    gotchi.save();
  } else {
    portal.owner = newOwner.id;
    portal.save();
  }
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
    let gotchi = getOrCreateAavegotchi(event.params.erc721TokenId.toString(), event)!;
    listing.collateral = gotchi.collateral;
    gotchi.activeListing = event.params.listingId;
    gotchi.save();
    listing.nameLowerCase = gotchi.nameLowerCase;

    // Traits for Filter in v2
    listing.nrgTrait = gotchi.withSetsNumericTraits[0];
    listing.aggTrait = gotchi.withSetsNumericTraits[1];
    listing.spkTrait = gotchi.withSetsNumericTraits[2];
    listing.brnTrait = gotchi.withSetsNumericTraits[3];
    listing.eysTrait = gotchi.withSetsNumericTraits[4];
    listing.eycTrait = gotchi.withSetsNumericTraits[5];
  } else if (listing.category.lt(BigInt.fromI32(3))) {
    let portal = getOrCreatePortal(event.params.erc721TokenId.toString());
    portal.activeListing = event.params.listingId;
    portal.save();
    listing.portal = event.params.erc721TokenId.toString();
  } else if (listing.category == BigInt.fromI32(4)) {
    listing.parcel = event.params.erc721TokenId.toString();

    let parcel = Parcel.load(event.params.erc721TokenId.toString())!;
    parcel.activeListing = event.params.listingId;
    listing.fudBoost = parcel.fudBoost;
    listing.fomoBoost = parcel.fomoBoost;
    listing.alphaBoost = parcel.alphaBoost;
    listing.kekBoost = parcel.kekBoost;

    listing.district = parcel.district;
    listing.size = parcel.size;

    listing.coordinateX = parcel.coordinateX;
    listing.coordinateY = parcel.coordinateY;
    listing.parcelHash = parcel.parcelHash;
  } else {
    //handle external contracts
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

    // add to historical prices
    let historicalPrices = portal.historicalPrices;
    if (historicalPrices == null) {
      historicalPrices = new Array();
    }
    historicalPrices.push(event.params.priceInWei);
    portal.historicalPrices = historicalPrices;
    portal.activeListing = null;
    portal.save();
  }

  //Aavegotchi -- update number of times traded
  else if (event.params.category.equals(BigInt.fromI32(3))) {
    let gotchi = getOrCreateAavegotchi(
      event.params.erc721TokenId.toString(),
      event
    )!;
    gotchi.timesTraded = gotchi.timesTraded.plus(BIGINT_ONE);

    // add to historical prices
    let historicalPrices = gotchi.historicalPrices;
    if (historicalPrices == null) {
      historicalPrices = new Array();
    }
    historicalPrices.push(event.params.priceInWei);
    gotchi.historicalPrices = historicalPrices;
    gotchi.activeListing = null;
    gotchi.save();
  } else if (event.params.category == BigInt.fromI32(4)) {
    let listing = getOrCreateERC721Listing(event.params.listingId.toString());
    listing = updateERC721ListingInfo(listing, event.params.listingId, event);

    listing.buyer = event.params.buyer;
    listing.timePurchased = event.params.time;
    listing.save();

    //Parcel -- update number of times traded

    let parcel = getOrCreateParcel(
      event.params.erc721TokenId,
      event.params.buyer,
      event.params.erc721TokenAddress
    );
    parcel.timesTraded = parcel.timesTraded.plus(BIGINT_ONE);
    parcel.activeListing = null;
    // add to historical prices
    let historicalPrices = parcel.historicalPrices;
    if (historicalPrices == null) {
      historicalPrices = new Array();
    }
    historicalPrices.push(event.params.priceInWei);
    parcel.historicalPrices = historicalPrices;
    parcel.save();
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

  if(listing.category.lt(BigInt.fromI32(3))) {
    let portal = getOrCreatePortal(listing.tokenId.toString());
    portal.activeListing = null;
    portal.save();
  } else if(listing.category.equals(BigInt.fromI32(3))) {
    let gotchi = getOrCreateAavegotchi(listing.tokenId.toString(), event)!;
    gotchi.activeListing = null;
    gotchi.save();
  } else if(listing.category.equals(BigInt.fromI32(4))) {
    let parcel = getOrCreateParcel(listing.tokenId, listing.seller, Address.fromString(listing.erc721TokenAddress.toHexString()));
    parcel.activeListing = null;
    parcel.save();
  }

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

  if(listing.category.lt(BigInt.fromI32(3))) {
    let portal = getOrCreatePortal(listing.tokenId.toString());
    portal.activeListing = null;
    portal.save();
  } else if(listing.category.equals(BigInt.fromI32(3))) {
    let gotchi = getOrCreateAavegotchi(listing.tokenId.toString(), event)!;
    gotchi.activeListing = null;
    gotchi.save();
  } else if(listing.category.equals(BigInt.fromI32(4))) {
    let parcel = getOrCreateParcel(listing.tokenId, listing.seller, Address.fromString(listing.erc721TokenAddress.toHexString()));
    parcel.activeListing = null;
    parcel.save();
  }

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
    let portal = getOrCreatePortal(baseId.toString());

    portal.hauntId = event.params._hauntId;
    portal.status = PORTAL_STATUS_BOUGHT;
    portal.gotchiId = baseId;
    portal.boughtAt = event.block.number;
    portal.owner = owner.id;
    portal.buyer = buyer.id;
    portal.timesTraded = BIGINT_ZERO;

    portal.save();
    baseId = baseId.plus(BIGINT_ONE);
  }

  stats.portalsBought = stats.portalsBought.plus(
    event.params._numAavegotchisToPurchase
  );

  stats.save();
  buyer.save();
  owner.save();
}

export function handleERC1155ListingUpdated(event: UpdateERC1155Listing): void {
  let listing = getOrCreateERC1155Listing(event.params.listingId.toString());
  listing = updateERC1155ListingInfo(listing, event.params.listingId, event);
  listing.save();
}

export function handleUpdateItemPrice(event: UpdateItemPrice): void {
  let item = getOrCreateItemType(event.params._itemId.toString());
  item.ghstPrice = event.params._priceInWei;
  item.save();
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
// export { runTests } from "../tests/aavegotchi.test";

// Realm
export function handleResyncParcel(event: ResyncParcel): void {
  let parcel = Parcel.load(event.params._tokenId.toString())!;

  let contract = RealmDiamond.bind(event.address);
  let parcelInfo = contract.try_getParcelInfo(event.params._tokenId);

  if (!parcelInfo.reverted) {
    let parcelMetadata = parcelInfo.value;
    parcel.parcelId = parcelMetadata.parcelId;
    parcel.tokenId = event.params._tokenId;
    parcel.coordinateX = parcelMetadata.coordinateX;
    parcel.coordinateY = parcelMetadata.coordinateY;
    parcel.district = parcelMetadata.district;
    parcel.parcelHash = parcelMetadata.parcelAddress;

    parcel.size = parcelMetadata.size;

    let boostArray = parcelMetadata.boost;
    parcel.fudBoost = boostArray[0];
    parcel.fomoBoost = boostArray[1];
    parcel.alphaBoost = boostArray[2];
    parcel.kekBoost = boostArray[3];
  }

  //update auction too

  // Entities can be written to the store with `.save()`
  parcel.save();
}

export function handleTransferParcel(event: Transfer): void {
  let user = getOrCreateUser(event.params._to.toHexString());
  user.save();

  let parcel = Parcel.load(event.params._tokenId.toString())!;
  parcel.owner = user.id;
  parcel.save();
}

export function handleMintParcel(event: MintParcel): void {
  let parcel = getOrCreateParcel(
    event.params._tokenId,
    event.params._owner,
    event.address
  );
  parcel.save();
}

// Whitelist
export function handleWhitelistCreated(event: WhitelistCreated): void {
  createOrUpdateWhitelist(event.params.whitelistId, event);
}

export function handleWhitelistUpdated(event: WhitelistUpdated): void {
  createOrUpdateWhitelist(event.params.whitelistId, event);
}

export function handleGotchiLendingAdd(event: GotchiLendingAdd): void {
  let lending = getOrCreateGotchiLending(event.params.listingId);
  lending = updateGotchiLending(lending, event);
  lending.save();
}

export function handleGotchiLendingClaim(event: GotchiLendingClaim): void {
  let lending = getOrCreateGotchiLending(event.params.listingId);
  lending = updateGotchiLending(lending, event);
  for(let i=0;i<event.params.tokenAddresses.length; i++) {
      let ctoken = getOrCreateClaimedToken(event.params.tokenAddresses[i], lending);
      ctoken.amount = ctoken.amount.plus(event.params.amounts[i]);
      ctoken.save();
  }
  lending.save();
}

export function handleGotchiLendingEnd(event: GotchiLendingEnd): void {
  let lending = getOrCreateGotchiLending(event.params.listingId);
  lending = updateGotchiLending(lending, event);

  
  let originalOwner = getOrCreateUser(lending.lender!.toHexString());
  if(originalOwner.gotchisLentOut.length > 0) {
    let newGotchiLentOut = new Array<BigInt>();

    for(let i=0; i < originalOwner.gotchisLentOut.length; i++) {
      let gotchiId = originalOwner.gotchisLentOut[i];
      if(!gotchiId.equals(lending.gotchiTokenId)) {
        newGotchiLentOut.push(gotchiId)
      }
    }
    originalOwner.gotchisLentOut = newGotchiLentOut;
    originalOwner.save();
  }

  let borrower = getOrCreateUser(lending.borrower!.toHexString());
  if(borrower.gotchisBorrowed.length > 0) {
    let newGotchiLentOut = new Array<BigInt>();

    for(let i=0; i < borrower.gotchisBorrowed.length; i++) {
      let gotchiId = borrower.gotchisBorrowed[i];
      if(!gotchiId.equals(lending.gotchiTokenId)) {
        newGotchiLentOut.push(gotchiId)
      }
    }
    borrower.gotchisBorrowed = newGotchiLentOut;
    borrower.save();
  }

  lending.save();
}

export function handleGotchiLendingExecute(event: GotchiLendingExecute): void {
  let lending = getOrCreateGotchiLending(event.params.listingId);
  lending = updateGotchiLending(lending, event);

  let originalOwner = getOrCreateUser(lending.lender!.toHexString());
  let gotchisLentOut = originalOwner.gotchisLentOut;
  gotchisLentOut.push(lending.gotchiTokenId);
  originalOwner.gotchisLentOut = gotchisLentOut;

  let borrower = getOrCreateUser(lending.borrower!.toHexString());
  let gotchisBorrowed = borrower.gotchisBorrowed;
  gotchisBorrowed.push(lending.gotchiTokenId);
  borrower.gotchisBorrowed = gotchisBorrowed;

  originalOwner.save();
  borrower.save();
  lending.save();
}

export function handleGotchiLendingCancel(event: GotchiLendingCancel): void {
  let lending = getOrCreateGotchiLending(event.params.listingId);
  lending = updateGotchiLending(lending, event);
  lending.save();
}

