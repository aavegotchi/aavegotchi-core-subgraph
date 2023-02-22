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
  ERC1155ExecutedToRecipient,
  ERC721ExecutedToRecipient,
  GotchiLendingEnded,
  GotchiLendingExecuted,
  GotchiLendingCanceled,
  GotchiLendingClaimed,
  GotchiLendingAdded,
  WhitelistAccessRightSet,
  WhitelistOwnershipTransferred,
} from "../../generated/AavegotchiDiamond/AavegotchiDiamond";
import {
  getOrCreateUser,
  getOrCreatePortal,
  getOrCreateAavegotchiOption,
  getOrCreateAavegotchi,
  updateAavegotchiInfo,
  getStatisticEntity,
  getOrCreateERC1155Listing,
  updateERC1155ListingInfo,
  getOrCreateItemType,
  getOrCreateWearableSet,
  updateAavegotchiWearables,
  calculateBaseRarityScore,
  getOrCreateGotchiLending,
  updateGotchiLending,
  createOrUpdateWhitelist,
  getOrCreateClaimedToken,
  getOrCreateWhitelist,
} from "../utils/helpers/diamond";
import {
  BIGINT_ONE,
  PORTAL_STATUS_BOUGHT,
  PORTAL_STATUS_OPENED,
  PORTAL_STATUS_CLAIMED,
  BIGINT_ZERO,
  ZERO_ADDRESS,
  BLOCK_DISABLE_OLD_LENDING_EVENTS,
} from "../utils/constants";
import { BigInt, Bytes } from "@graphprotocol/graph-ts";

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
      let gotchi = getOrCreateAavegotchiOption(portal.id, i);
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
    let itemType = getOrCreateItemType(itemTypes[i].toString())!;
    itemType.consumed = itemType.consumed.plus(quantities[i]);
    itemType.save();
  }
}

// - event: GrantExperience(uint256[],uint32[])
//   handler: handleGrantExperience

export function handleGrantExperience(event: GrantExperience): void {}

export function handleRemoveExperience(event: RemoveExperience): void {}

export function handleExperienceTransfer(event: ExperienceTransfer): void {}

// - event: AavegotchiInteract(indexed uint256,uint256)
//   handler: handleAavegotchiInteract

export function handleAavegotchiInteract(event: AavegotchiInteract): void {}

//ERC721 Transfer
export function handleTransfer(event: Transfer): void {
  let id = event.params._tokenId.toString();
  let newOwner = getOrCreateUser(event.params._to.toHexString());
  newOwner.save();
  let gotchi = getOrCreateAavegotchi(id, event, false);
  let portal = getOrCreatePortal(id, false);
  // ERC721 transfer can be portal or gotchi based, so we have to check it.
  if (gotchi != null) {
    if (!gotchi.modifiedRarityScore) {
      gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);
    }
    gotchi.owner = newOwner.id;
    if (!gotchi.lending) {
      gotchi.originalOwner = newOwner.id;
    }
    gotchi.save();

    if (newOwner.id == "0x0000000000000000000000000000000000000000") {
      let stats = getStatisticEntity();
      stats.aavegotchisSacrificed = stats.aavegotchisSacrificed.plus(
        BIGINT_ONE
      );
      stats.save();
    }
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

export function handleERC721ListingAdd(event: ERC721ListingAdd): void {}

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
): void {}

/*
event: ERC721ListingCancelled(uint256 indexed listingId, uint256 category, uint256 time);
handler: handleERC721ListingCancelled
*/

export function handleERC721ListingCancelled(
  event: ERC721ListingCancelled
): void {}

/*
event: ERC721ListingRemoved(uint256 indexed listingId, uint256 category, uint256 time);
handler:handleERC721ListingRemoved
*/

export function handleERC721ListingRemoved(event: ERC721ListingRemoved): void {}

export function handleERC1155ListingAdd(event: ERC1155ListingAdd): void {}

export function handleERC1155ExecutedListing(
  event: ERC1155ExecutedListing
): void {}

export function handleERC1155ListingCancelled(
  event: ERC1155ListingCancelled
): void {
  let listing = getOrCreateERC1155Listing(event.params.listingId.toString());

  listing = updateERC1155ListingInfo(listing, event.params.listingId, event);

  listing.save();
}

export function handleERC1155ListingRemoved(
  event: ERC1155ListingRemoved
): void {}

//ERC1155 Item Types

export function handleAddItemType(event: AddItemType): void {}

export function handleItemTypeMaxQuantity(event: ItemTypeMaxQuantity): void {}

export function handlePurchaseItemsWithGhst(
  event: PurchaseItemsWithGhst
): void {}

export function handlePurchaseItemsWithVouchers(
  event: PurchaseItemsWithVouchers
): void {}

export function handleMigrateVouchers(event: MigrateVouchers): void {}

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
  let itemType = getOrCreateItemType(event.params._wearableId.toString())!;
  itemType.traitModifiers = event.params._traitModifiers;
  itemType.rarityScoreModifier = event.params._rarityScoreModifier;
  itemType.save();
}

export function handleWearableSlotPositionsSet(
  event: WearableSlotPositionsSet
): void {
  let itemType = getOrCreateItemType(event.params._wearableId.toString())!;
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

export function handleERC1155ListingUpdated(
  event: UpdateERC1155Listing
): void {}

export function handleUpdateItemPrice(event: UpdateItemPrice): void {}

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

// Whitelist
export function handleWhitelistCreated(event: WhitelistCreated): void {
  createOrUpdateWhitelist(event.params.whitelistId, event);
}

export function handleWhitelistUpdated(event: WhitelistUpdated): void {
  createOrUpdateWhitelist(event.params.whitelistId, event);
}

export function handleWhitelistOwnershipTransferred(
  event: WhitelistOwnershipTransferred
): void {
  createOrUpdateWhitelist(event.params.whitelistId, event);
}

export function handleGotchiLendingAdd(event: GotchiLendingAdd): void {
  if (event.block.number.gt(BLOCK_DISABLE_OLD_LENDING_EVENTS)) {
    return;
  }
  let lending = getOrCreateGotchiLending(event.params.listingId);
  lending = updateGotchiLending(lending, event);
  lending.save();
}

export function handleGotchiLendingClaim(event: GotchiLendingClaim): void {
  if (event.block.number.gt(BLOCK_DISABLE_OLD_LENDING_EVENTS)) {
    return;
  }
  let lending = getOrCreateGotchiLending(event.params.listingId);
  lending = updateGotchiLending(lending, event);
  for (let i = 0; i < event.params.tokenAddresses.length; i++) {
    let ctoken = getOrCreateClaimedToken(
      event.params.tokenAddresses[i],
      lending
    );
    ctoken.amount = ctoken.amount.plus(event.params.amounts[i]);
    ctoken.save();
  }
  lending.save();
}

export function handleGotchiLendingEnd(event: GotchiLendingEnd): void {
  if (event.block.number.gt(BLOCK_DISABLE_OLD_LENDING_EVENTS)) {
    return;
  }
  let lending = getOrCreateGotchiLending(event.params.listingId);
  lending = updateGotchiLending(lending, event);
  lending.timeEnded = event.block.timestamp;
  lending.save();

  let originalOwner = getOrCreateUser(lending.lender!.toHexString());
  if (originalOwner.gotchisLentOut.length > 0) {
    let newGotchiLentOut = new Array<BigInt>();

    for (let i = 0; i < originalOwner.gotchisLentOut.length; i++) {
      let gotchiId = originalOwner.gotchisLentOut[i];
      if (!gotchiId.equals(lending.gotchiTokenId)) {
        newGotchiLentOut.push(gotchiId);
      }
    }
    originalOwner.gotchisLentOut = newGotchiLentOut;
    originalOwner.save();
  }

  let borrower = getOrCreateUser(lending.borrower!.toHexString());
  if (borrower.gotchisBorrowed.length > 0) {
    let newGotchiLentOut = new Array<BigInt>();

    for (let i = 0; i < borrower.gotchisBorrowed.length; i++) {
      let gotchiId = borrower.gotchisBorrowed[i];
      if (!gotchiId.equals(lending.gotchiTokenId)) {
        newGotchiLentOut.push(gotchiId);
      }
    }
    borrower.gotchisBorrowed = newGotchiLentOut;
    borrower.save();
  }

  let gotchi = getOrCreateAavegotchi(lending.gotchiTokenId.toString(), event)!;
  gotchi.lending = null;
  gotchi.originalOwner = originalOwner.id;
  gotchi.save();

  lending.save();

  let stats = getStatisticEntity();
  stats.aavegotchisBorrowed = stats.aavegotchisBorrowed.minus(BIGINT_ONE);
  stats.save();
}

export function handleGotchiLendingExecute(event: GotchiLendingExecute): void {
  if (event.block.number.gt(BLOCK_DISABLE_OLD_LENDING_EVENTS)) {
    return;
  }
  let lending = getOrCreateGotchiLending(event.params.listingId);
  lending = updateGotchiLending(lending, event);

  // update originalOwner to lender
  let gotchi = getOrCreateAavegotchi(lending.gotchi, event)!;
  let lender = getOrCreateUser(lending.lender!.toHexString());
  gotchi.originalOwner = lender.id;
  lender.save();
  gotchi.save();

  let originalOwner = getOrCreateUser(lending.lender!.toHexString());
  let gotchisLentOut = originalOwner.gotchisLentOut;
  gotchisLentOut.push(lending.gotchiTokenId);
  originalOwner.gotchisLentOut = gotchisLentOut;

  let borrower = getOrCreateUser(lending.borrower!.toHexString());
  let gotchisBorrowed = borrower.gotchisBorrowed;
  gotchisBorrowed.push(lending.gotchiTokenId);
  borrower.gotchisBorrowed = gotchisBorrowed;

  let stats = getStatisticEntity();
  stats.aavegotchisBorrowed = stats.aavegotchisBorrowed.plus(BIGINT_ONE);
  stats.save();

  originalOwner.save();
  borrower.save();
  lending.save();
}

export function handleGotchiLendingCancel(event: GotchiLendingCancel): void {
  if (event.block.number.gt(BLOCK_DISABLE_OLD_LENDING_EVENTS)) {
    return;
  }
  let lending = getOrCreateGotchiLending(event.params.listingId);
  lending = updateGotchiLending(lending, event);
  lending.save();
}

export function handleERC1155ExecutedToRecipient(
  event: ERC1155ExecutedToRecipient
): void {}

export function handleERC721ExecutedToRecipient(
  event: ERC721ExecutedToRecipient
): void {
  // update listing
}

export function handleGotchiLendingAdded(event: GotchiLendingAdded): void {
  let lending = getOrCreateGotchiLending(event.params.listingId);
  lending.upfrontCost = event.params.initialCost;
  lending.rentDuration = event.params.period;
  lending.lender = event.params.lender;
  lending.originalOwner = event.params.originalOwner;
  lending.period = event.params.period;
  lending.splitOwner = BigInt.fromI32(event.params.revenueSplit[0]);
  lending.splitBorrower = BigInt.fromI32(event.params.revenueSplit[1]);
  lending.splitOther = BigInt.fromI32(event.params.revenueSplit[2]);
  lending.tokensToShare = event.params.revenueTokens.map<Bytes>((e) => e);
  lending.thirdPartyAddress = event.params.thirdParty;
  lending.timeCreated = event.params.timeCreated;
  lending.cancelled = false;
  lending.completed = false;
  if (event.params.whitelistId != BIGINT_ZERO) {
    let whitelist = getOrCreateWhitelist(event.params.whitelistId, event);
    if (whitelist) {
      lending.whitelist = whitelist.id;
      lending.whitelistMembers = whitelist.members;
      lending.whitelistId = event.params.whitelistId;
    }
  }
  let gotchi = getOrCreateAavegotchi(event.params.tokenId.toString(), event)!;
  lending.gotchi = gotchi.id;
  lending.gotchiTokenId = event.params.tokenId;
  lending.gotchiKinship = gotchi.kinship;
  lending.gotchiBRS = gotchi.withSetsRarityScore;
  lending.save();
}

export function handleGotchiLendingClaimed(event: GotchiLendingClaimed): void {
  let lending = getOrCreateGotchiLending(event.params.listingId);
  for (let i = 0; i < event.params.revenueTokens.length; i++) {
    let ctoken = getOrCreateClaimedToken(
      event.params.revenueTokens[i],
      lending
    );
    ctoken.amount = ctoken.amount.plus(event.params.amounts[i]);
    ctoken.save();
  }
  lending.upfrontCost = event.params.initialCost;
  lending.lender = event.params.lender;
  lending.originalOwner = event.params.originalOwner;
  lending.period = event.params.period;
  lending.splitOwner = BigInt.fromI32(event.params.revenueSplit[0]);
  lending.splitBorrower = BigInt.fromI32(event.params.revenueSplit[1]);
  lending.splitOther = BigInt.fromI32(event.params.revenueSplit[2]);
  lending.tokensToShare = event.params.revenueTokens.map<Bytes>((e) => e);
  lending.thirdPartyAddress = event.params.thirdParty;
  lending.lastClaimed = event.params.timeClaimed;
  lending.gotchiTokenId = event.params.tokenId;
  lending.borrower = event.params.borrower;
  lending.cancelled = false;
  lending.completed = false;
  if (event.params.whitelistId != BIGINT_ZERO) {
    let whitelist = getOrCreateWhitelist(event.params.whitelistId, event);
    if (whitelist) {
      lending.whitelist = whitelist.id;
      lending.whitelistMembers = whitelist.members;
      lending.whitelistId = event.params.whitelistId;
    }
  }
  lending.save();
}

export function handleGotchiLendingCanceled(
  event: GotchiLendingCanceled
): void {
  let lending = getOrCreateGotchiLending(event.params.listingId);
  lending.upfrontCost = event.params.initialCost;
  lending.lender = event.params.lender;
  lending.originalOwner = event.params.originalOwner;
  lending.period = event.params.period;
  lending.splitOwner = BigInt.fromI32(event.params.revenueSplit[0]);
  lending.splitBorrower = BigInt.fromI32(event.params.revenueSplit[1]);
  lending.splitOther = BigInt.fromI32(event.params.revenueSplit[2]);
  lending.tokensToShare = event.params.revenueTokens.map<Bytes>((e) => e);
  lending.thirdPartyAddress = event.params.thirdParty;
  lending.gotchiTokenId = event.params.tokenId;
  lending.cancelled = true;
  lending.completed = false;
  if (event.params.whitelistId != BIGINT_ZERO) {
    let whitelist = getOrCreateWhitelist(event.params.whitelistId, event);
    if (whitelist) {
      lending.whitelist = whitelist.id;
      lending.whitelistMembers = whitelist.members;
      lending.whitelistId = event.params.whitelistId;
    }
  }
  lending.save();
}

export function handleGotchiLendingExecuted(
  event: GotchiLendingExecuted
): void {
  let lending = getOrCreateGotchiLending(event.params.listingId);
  lending.upfrontCost = event.params.initialCost;
  lending.lender = event.params.lender;
  lending.originalOwner = event.params.originalOwner;
  lending.period = event.params.period;
  lending.splitOwner = BigInt.fromI32(event.params.revenueSplit[0]);
  lending.splitBorrower = BigInt.fromI32(event.params.revenueSplit[1]);
  lending.splitOther = BigInt.fromI32(event.params.revenueSplit[2]);
  lending.tokensToShare = event.params.revenueTokens.map<Bytes>((e) => e);
  lending.thirdPartyAddress = event.params.thirdParty;
  lending.gotchiTokenId = event.params.tokenId;
  lending.timeAgreed = event.params.timeAgreed;
  lending.cancelled = false;
  lending.completed = false;
  lending.borrower = event.params.borrower;
  if (event.params.whitelistId != BIGINT_ZERO) {
    let whitelist = getOrCreateWhitelist(event.params.whitelistId, event);
    if (whitelist) {
      lending.whitelist = whitelist.id;
      lending.whitelistMembers = whitelist.members;
      lending.whitelistId = event.params.whitelistId;
    }
  }
  lending.save();

  if (event.block.number.le(BLOCK_DISABLE_OLD_LENDING_EVENTS)) {
    return;
  }

  // update originalOwner to lender
  let gotchi = getOrCreateAavegotchi(lending.gotchi, event)!;
  let lender = getOrCreateUser(lending.lender!.toHexString());
  gotchi.originalOwner = lender.id;
  lender.save();
  gotchi.save();

  let originalOwner = getOrCreateUser(lending.lender!.toHexString());
  let gotchisLentOut = originalOwner.gotchisLentOut;
  gotchisLentOut.push(lending.gotchiTokenId);
  originalOwner.gotchisLentOut = gotchisLentOut;
  originalOwner.save();

  let borrower = getOrCreateUser(lending.borrower!.toHexString());
  let gotchisBorrowed = borrower.gotchisBorrowed;
  gotchisBorrowed.push(lending.gotchiTokenId);
  borrower.gotchisBorrowed = gotchisBorrowed;

  // update stats
  let stats = getStatisticEntity();
  stats.aavegotchisBorrowed = stats.aavegotchisBorrowed.plus(BIGINT_ONE);
  stats.save();
}

export function handleGotchiLendingEnded(event: GotchiLendingEnded): void {
  let lending = getOrCreateGotchiLending(event.params.listingId);
  lending.upfrontCost = event.params.initialCost;
  lending.lender = event.params.lender;
  lending.originalOwner = event.params.originalOwner;
  lending.period = event.params.period;
  lending.splitOwner = BigInt.fromI32(event.params.revenueSplit[0]);
  lending.splitBorrower = BigInt.fromI32(event.params.revenueSplit[1]);
  lending.splitOther = BigInt.fromI32(event.params.revenueSplit[2]);
  lending.tokensToShare = event.params.revenueTokens.map<Bytes>((e) => e);
  lending.thirdPartyAddress = event.params.thirdParty;
  lending.gotchiTokenId = event.params.tokenId;
  lending.completed = true;
  lending.timeEnded = event.block.timestamp;
  if (event.params.whitelistId != BIGINT_ZERO) {
    let whitelist = getOrCreateWhitelist(event.params.whitelistId, event);
    if (whitelist) {
      lending.whitelist = whitelist.id;
      lending.whitelistMembers = whitelist.members;
      lending.whitelistId = event.params.whitelistId;
    }
  }
  lending.save();

  if (event.block.number.le(BLOCK_DISABLE_OLD_LENDING_EVENTS)) {
    return;
  }
  // remove gotchi from originalOwner gotchisLentout
  let originalOwner = getOrCreateUser(lending.lender!.toHexString());
  if (originalOwner.gotchisLentOut.length > 0) {
    let newGotchiLentOut = new Array<BigInt>();

    for (let i = 0; i < originalOwner.gotchisLentOut.length; i++) {
      let gotchiId = originalOwner.gotchisLentOut[i];
      if (!gotchiId.equals(lending.gotchiTokenId)) {
        newGotchiLentOut.push(gotchiId);
      }
    }
    originalOwner.gotchisLentOut = newGotchiLentOut;
    originalOwner.save();
  }

  // remove gotchi from borrower gotchis borrowed
  let borrower = getOrCreateUser(lending.borrower!.toHexString());
  if (borrower.gotchisBorrowed.length > 0) {
    let newGotchiLentOut = new Array<BigInt>();

    for (let i = 0; i < borrower.gotchisBorrowed.length; i++) {
      let gotchiId = borrower.gotchisBorrowed[i];
      if (!gotchiId.equals(lending.gotchiTokenId)) {
        newGotchiLentOut.push(gotchiId);
      }
    }
    borrower.gotchisBorrowed = newGotchiLentOut;
    borrower.save();
  }

  let gotchi = getOrCreateAavegotchi(lending.gotchiTokenId.toString(), event)!;
  gotchi.lending = null;
  gotchi.originalOwner = originalOwner.id;
  gotchi.save();

  // update Stats
  let stats = getStatisticEntity();
  stats.aavegotchisBorrowed = stats.aavegotchisBorrowed.minus(BIGINT_ONE);
  stats.save();
}

export function handleWhitelistAccessRightSet(
  event: WhitelistAccessRightSet
): void {
  let whitelist = getOrCreateWhitelist(event.params.whitelistId, event);
  if (whitelist == null) {
    return;
  }

  if (event.params.actionRight == BIGINT_ZERO) {
    whitelist.maxBorrowLimit = event.params.accessRight.toI32();
  }

  whitelist.save();
}
