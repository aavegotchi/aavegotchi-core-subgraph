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
  ResetSkillpoints,
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
  WhitelistCreated,
  WhitelistUpdated,
  ERC1155ExecutedToRecipient,
  ERC721ExecutedToRecipient,
  GotchiLendingEnded,
  GotchiLendingExecuted,
  GotchiLendingCanceled,
  GotchiLendingClaimed,
  GotchiLendingAdded1,
  GotchiLendingExecuted1,
  GotchiLendingCancelled,
  GotchiLendingClaimed1,
  GotchiLendingAdded,
  WhitelistAccessRightSet,
  WhitelistOwnershipTransferred,
  UpdateItemType,
  ERC721ListingWhitelistSet,
  ERC1155ListingWhitelistSet,
  ERC721ListingPriceUpdate,
  ERC1155ListingPriceUpdate,
  GotchiLendingEnded1,
  ERC721BuyOrderAdded,
  ERC721BuyOrderExecuted,
  ERC721BuyOrderCanceled,
  RoleGranted,
  RoleRevoked,
  TokensCommitted,
  TokensReleased,
  EquipDelegatedWearables,
  ERC1155BuyOrderAdd,
  ERC1155BuyOrderExecute,
  ERC1155BuyOrderCancel,
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
  updateAavegotchiWearables,
  calculateBaseRarityScore,
  getOrCreateGotchiLending,
  createOrUpdateWhitelist,
  getOrCreateClaimedToken,
  getOrCreateWhitelist,
  itemMaxQuantityToRarity,
  getOrCreateERC721BuyOrder,
  getOrCreateERC1155BuyOrder,
  getOrCreateERC1155BuyOrderExecution,
} from "../utils/helpers/aavegotchi";

import { getOrCreateParcel } from "../utils/helpers/realm";

import {
  BIGINT_ONE,
  PORTAL_STATUS_BOUGHT,
  PORTAL_STATUS_OPENED,
  PORTAL_STATUS_CLAIMED,
  BIGINT_ZERO,
  ZERO_ADDRESS,
  STATUS_AAVEGOTCHI,
} from "../utils/constants";
import { Address, BigInt, log, Bytes } from "@graphprotocol/graph-ts";

import { /*Parcel,*/ Parcel, TokenCommitment } from "../../generated/schema";
// import {
//   RealmDiamond,
//   MintParcel,
//   ResyncParcel,
//   KinshipBurned,
// } from "../../generated/RealmDiamond/RealmDiamond";
import { updatePermissionsFromBitmap } from "../utils/decimals";
import * as erc7589 from "./erc-7589";
import { generateTokenCommitmentId } from "../utils/helpers/erc-7589";
import {
  KinshipBurned,
  MintParcel,
  RealmDiamond,
  ResyncParcel,
} from "../../generated/AavegotchiDiamond/RealmDiamond";

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
  gotchi.claimedTime = event.block.timestamp;
  gotchi.gotchiId = event.params._tokenId;

  portal.gotchi = gotchi.id;
  let zeroUser = getOrCreateUser(ZERO_ADDRESS);
  portal.owner = zeroUser.id;
  portal.status = PORTAL_STATUS_CLAIMED;
  portal.claimedAt = event.block.number;
  portal.claimedTime = event.block.timestamp;

  if (portal.activeListing) {
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
  gotchi = updateAavegotchiWearables(gotchi, event);

  if (gotchi.status.equals(STATUS_AAVEGOTCHI)) {
    gotchi.save();
  }
}

// - event: ResetSkillpoints(indexed uint256)
//   handler: handleResetSkillpoints

export function handleResetSkillpoints(event: ResetSkillpoints): void {
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString(), event)!;
  gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);
  gotchi = updateAavegotchiWearables(gotchi, event);

  if (gotchi.status.equals(STATUS_AAVEGOTCHI)) {
    gotchi.save();
  }
}

// - event: EquipWearables(indexed uint256,uint256,uint256)
//   handler: handleEquipWearables

export function handleEquipWearables(event: EquipWearables): void {
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString(), event)!;

  gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);

  gotchi = updateAavegotchiWearables(gotchi, event);

  if (gotchi.status.equals(STATUS_AAVEGOTCHI)) {
    gotchi.save();
  }
}

// - event: EquipDelegatedWearables(indexed uint256,uint256[16],uint256[16])
//   handler: handleEquipDelegatedWearables

export function handleEquipDelegatedWearables(
  event: EquipDelegatedWearables
): void {
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString(), event)!;

  if (gotchi.status.equals(STATUS_AAVEGOTCHI)) {
    const oldDepositIds = event.params._oldCommitmentIds;
    const newDepositIds = event.params._newCommitmentIds;

    for (let i = 0; i < oldDepositIds.length; i++) {
      if (oldDepositIds[i] == newDepositIds[i]) continue;
      if (oldDepositIds[i] != BigInt.zero()) {
        const oldTokenCommitment = TokenCommitment.load(
          generateTokenCommitmentId(
            event.address.toHexString(),
            oldDepositIds[i]
          )
        );
        if (oldTokenCommitment) {
          oldTokenCommitment.usedBalance = oldTokenCommitment.usedBalance.minus(
            BigInt.fromI32(1)
          );
          oldTokenCommitment.save();
        }
      }

      if (newDepositIds[i] != BigInt.zero()) {
        const newTokenCommitment = TokenCommitment.load(
          generateTokenCommitmentId(
            event.address.toHexString(),
            newDepositIds[i]
          )
        );
        if (newTokenCommitment) {
          newTokenCommitment.usedBalance = newTokenCommitment.usedBalance.plus(
            BigInt.fromI32(1)
          );
          newTokenCommitment.save();
        }
      }
    }
    gotchi.equippedDelegatedWearables = event.params._newCommitmentIds.map<i32>(
      (id) => id.toI32()
    );
    gotchi.save();
  }
}

// - event: SetAavegotchiName(indexed uint256,string,string)
//   handler: handleSetAavegotchiName

export function handleSetAavegotchiName(event: SetAavegotchiName): void {
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString(), event)!;
  gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);
  gotchi.save();

  if (gotchi.activeListing) {
    let listing = getOrCreateERC721Listing(
      gotchi.activeListing!.toString(),
      false
    );
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
    let itemType = getOrCreateItemType(itemTypes[i].toString())!;
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

    if (gotchi) {
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
  if (event.block.number.le(BigInt.fromI32(40000000))) {
    return;
  }

  let gotchi = getOrCreateAavegotchi(
    event.params._tokenId.toString(),
    event,
    false
  );
  if (!gotchi || !gotchi.status.equals(BigInt.fromI32(3))) {
    return;
  }

  gotchi.kinship = event.params.kinship;
  gotchi.lastInteracted = event.block.timestamp;
  // gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);
  gotchi.save();
}

//ERC721 Transfer
export function handleTransfer(event: Transfer): void {
  let id = event.params._tokenId.toString();
  let newOwner = getOrCreateUser(event.params._to.toHexString());
  newOwner.save();
  let gotchi = getOrCreateAavegotchi(id, event, false);
  let portal = getOrCreatePortal(id, true);
  // ERC721 transfer can be portal or gotchi based, so we have to check it.
  if (gotchi != null) {
    if (!gotchi.modifiedRarityScore) {
      gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);
    }

    //If the Gotchi is being transferred from the socket Vault, we need to sync its metadata
    if (
      event.params._from.equals(
        Address.fromString("0xf1d1d61eedda7a10b494af7af87d932ac910f3c5")
      ) ||
      event.params._from.equals(
        Address.fromString("0xF1D1d61EEDDa7a10b494aF7af87D932AC910f3C5")
      )
    ) {
      log.debug("Syncing metadata for Gotchi {} from socket vault", [
        event.params._tokenId.toString(),
      ]);

      //Update all the gotchi's metadata
      gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);
      gotchi = updateAavegotchiWearables(gotchi, event);
    }

    gotchi.owner = newOwner.id;
    gotchi.originalOwner = newOwner.id;
    gotchi.save();

    if (newOwner.id == "0x0000000000000000000000000000000000000000") {
      let stats = getStatisticEntity();
      stats.aavegotchisSacrificed =
        stats.aavegotchisSacrificed.plus(BIGINT_ONE);
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

export function handleERC721ListingAdd(event: ERC721ListingAdd): void {
  let listing = getOrCreateERC721Listing(event.params.listingId.toString());
  listing = updateERC721ListingInfo(listing, event.params.listingId, event);

  if (listing.category == BigInt.fromI32(3)) {
    listing.gotchi = event.params.erc721TokenId.toString();
    let gotchi = getOrCreateAavegotchi(
      event.params.erc721TokenId.toString(),
      event
    )!;
    gotchi.locked = true;
    listing.collateral = gotchi.collateral;
    gotchi.activeListing = event.params.listingId;
    gotchi.save();
    listing.nameLowerCase = gotchi.nameLowerCase;

    // Traits for Filter in v2
    if (
      gotchi.withSetsNumericTraits != null &&
      gotchi.withSetsNumericTraits!.length == 6
    ) {
      listing.nrgTrait = BigInt.fromI32(gotchi.withSetsNumericTraits![0]);
      listing.aggTrait = BigInt.fromI32(gotchi.withSetsNumericTraits![1]);
      listing.spkTrait = BigInt.fromI32(gotchi.withSetsNumericTraits![2]);
      listing.brnTrait = BigInt.fromI32(gotchi.withSetsNumericTraits![3]);
      listing.eysTrait = BigInt.fromI32(gotchi.withSetsNumericTraits![4]);
      listing.eycTrait = BigInt.fromI32(gotchi.withSetsNumericTraits![5]);
    }
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
    gotchi.locked = false;
    gotchi.save();
  } else if (event.params.category == BigInt.fromI32(4)) {
    let listing = getOrCreateERC721Listing(event.params.listingId.toString());
    listing = updateERC721ListingInfo(listing, event.params.listingId, event);

    listing.buyer = event.params.buyer;
    listing.timePurchased = event.params.time;
    listing.save();

    //Parcel -- update number of times traded

    // let parcel = getOrCreateParcel(
    //   event.params.erc721TokenId,
    //   event.params.buyer,
    //   event.params.erc721TokenAddress
    // );
    // parcel.timesTraded = parcel.timesTraded.plus(BIGINT_ONE);
    // parcel.activeListing = null;
    // // add to historical prices
    // let historicalPrices = parcel.historicalPrices;
    // if (historicalPrices == null) {
    //   historicalPrices = new Array();
    // }
    // historicalPrices.push(event.params.priceInWei);
    // parcel.historicalPrices = historicalPrices;
    // parcel.save();
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

  if (listing.category.lt(BigInt.fromI32(3))) {
    let portal = getOrCreatePortal(listing.tokenId.toString());
    portal.activeListing = null;
    portal.save();
  } else if (listing.category.equals(BigInt.fromI32(3))) {
    let gotchi = getOrCreateAavegotchi(listing.tokenId.toString(), event)!;
    gotchi.activeListing = null;
    gotchi.locked = false;
    gotchi.save();
  } else if (listing.category.equals(BigInt.fromI32(4))) {
    // let parcel = getOrCreateParcel(
    //   listing.tokenId,
    //   listing.seller,
    //   Address.fromString(listing.erc721TokenAddress.toHexString()),
    //   false
    // );
    // parcel.activeListing = null;
    // parcel.save();
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

  if (listing.category.lt(BigInt.fromI32(3))) {
    let portal = getOrCreatePortal(listing.tokenId.toString());
    portal.activeListing = null;
    portal.save();
  } else if (listing.category.equals(BigInt.fromI32(3))) {
    let gotchi = getOrCreateAavegotchi(listing.tokenId.toString(), event)!;
    gotchi.activeListing = null;
    gotchi.locked = false;
    gotchi.save();
  } else if (listing.category.equals(BigInt.fromI32(4))) {
    let parcel = getOrCreateParcel(
      listing.tokenId,
      listing.seller,
      Address.fromString(listing.erc721TokenAddress.toHexString()),
      false
    );
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
  let itemType = getOrCreateItemType(event.params._itemType.svgId.toString())!;

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

    let itemType = getOrCreateItemType(itemId.toString())!;
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

    let itemType = getOrCreateItemType(itemId.toString())!;
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

    let itemType = getOrCreateItemType(itemId.toString())!;
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

    let itemType = getOrCreateItemType(itemId.toString())!;
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

export function handleERC1155ListingUpdated(event: UpdateERC1155Listing): void {
  let listing = getOrCreateERC1155Listing(event.params.listingId.toString());
  listing = updateERC1155ListingInfo(listing, event.params.listingId, event);
  listing.save();
}

export function handleUpdateItemPrice(event: UpdateItemPrice): void {
  let item = getOrCreateItemType(event.params._itemId.toString())!;
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

export function handleWhitelistOwnershipTransferred(
  event: WhitelistOwnershipTransferred
): void {
  createOrUpdateWhitelist(event.params.whitelistId, event);
}

export function handleGotchiLendingCancel(event: GotchiLendingCancel): void {
  let lending = getOrCreateGotchiLending(event.params.listingId);
  // skip if old lending
  if (lending.lender === null) {
    return;
  }
  // lending = updateGotchiLending(lending, event);
  lending.cancelled = true;
  lending.save();
}

export function handleERC1155ExecutedToRecipient(
  event: ERC1155ExecutedToRecipient
): void {
  let listingUpdateInfo = event.params;

  //Update ERC1155Purchase
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

  purchase.buyer = event.params.buyer;
  purchase.recipient = event.params.recipient;
  purchase.listingID = event.params.listingId;

  // listing
  let listing = getOrCreateERC1155Listing(event.params.listingId.toString());
  purchase.category = listing.category;
  purchase.erc1155TokenAddress = listing.erc1155TokenAddress;
  purchase.erc1155TypeId = listing.erc1155TypeId;
  purchase.quantity = BIGINT_ONE;
  purchase.priceInWei = listing.priceInWei;
  purchase.timeLastPurchased = event.block.timestamp;
  purchase.category = listing.category;
  purchase.erc1155TokenAddress = listing.erc1155TokenAddress;
  purchase.erc1155TypeId = listing.erc1155TypeId;
  purchase.seller = listing.seller;
  purchase.timeLastPurchased = event.block.timestamp;
  purchase.priceInWei = listing.priceInWei;
  purchase.quantity = purchase.quantity
    ? purchase.quantity.plus(BIGINT_ONE)
    : BIGINT_ONE;

  //tickets
  if (listing.category.equals(BigInt.fromI32(3))) {
    let rarityLevel = listing.erc1155TypeId;
    purchase.rarityLevel = rarityLevel;

    //items
  } else {
    let itemType = getOrCreateItemType(
      purchase.erc1155TypeId.toString(),
      false
    );

    if (itemType) {
      listing.rarityLevel = itemMaxQuantityToRarity(itemType.maxQuantity);
    }
  }

  purchase.save();
}

export function handleERC721ExecutedToRecipient(
  event: ERC721ExecutedToRecipient
): void {
  // update listing
  let listing = getOrCreateERC721Listing(event.params.listingId.toString());
  listing = updateERC721ListingInfo(listing, event.params.listingId, event);
  listing.recipient = event.params.recipient;
  listing.buyer = event.params.buyer;
  listing.save();
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
  gotchi.lending = BigInt.fromString(lending.id);
  gotchi.locked = true;
  gotchi.save();

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
  let gotchi = getOrCreateAavegotchi(event.params.tokenId.toString(), event)!;
  lending.gotchiBRS = gotchi.withSetsRarityScore;
  lending.gotchiKinship = gotchi.kinship;
  lending.period = event.params.period;
  lending.splitOwner = BigInt.fromI32(event.params.revenueSplit[0]);
  lending.splitBorrower = BigInt.fromI32(event.params.revenueSplit[1]);
  lending.splitOther = BigInt.fromI32(event.params.revenueSplit[2]);
  lending.rentDuration = event.params.period;
  lending.tokensToShare = event.params.revenueTokens.map<Bytes>((e) => e);
  lending.thirdPartyAddress = event.params.thirdParty;
  lending.lastClaimed = event.params.timeClaimed;
  lending.gotchiTokenId = event.params.tokenId;
  lending.gotchi = event.params.tokenId.toString();
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
  // skip if old lending
  if (lending.lender === null) {
    return;
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
  lending.gotchi = event.params.tokenId.toString();
  lending.gotchiTokenId = event.params.tokenId;
  lending.rentDuration = event.params.period;
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

  const gotchi = getOrCreateAavegotchi(lending.gotchi.toString(), event)!;
  gotchi.lending = null;
  gotchi.locked = false;
  gotchi.save();

  lending.gotchiKinship = gotchi.kinship;
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
  lending.rentDuration = event.params.period;
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
  lending.gotchi = event.params.tokenId.toString();

  // update originalOwner to lender
  let gotchi = getOrCreateAavegotchi(lending.gotchi, event)!;
  let lender = getOrCreateUser(lending.lender!.toHexString());
  gotchi.originalOwner = lender.id;
  gotchi.locked = true;
  lender.save();
  gotchi.save();
  lending.gotchiKinship = gotchi.kinship;
  lending.save();

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
  // skip if old lending
  if (lending.lender === null) {
    return;
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
  lending.rentDuration = event.params.period;
  lending.gotchiTokenId = event.params.tokenId;
  lending.gotchi = event.params.tokenId.toString();
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
  gotchi.locked = false;
  gotchi.lending = null;
  gotchi.originalOwner = originalOwner.id;
  gotchi.owner = originalOwner.id;
  gotchi.save();
  lending.gotchiKinship = gotchi.kinship;
  lending.save();

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

export function handleUpdateItemType(event: UpdateItemType): void {
  let item = getOrCreateItemType(event.params._itemType.svgId.toString())!;
  item.name = event.params._itemType.name;
  item.svgId = event.params._itemType.svgId;
  item.desc = event.params._itemType.description;
  item.author = event.params._itemType.author;
  item.traitModifiers = event.params._itemType.traitModifiers;
  item.slotPositions = event.params._itemType.slotPositions;
  item.ghstPrice = event.params._itemType.ghstPrice;
  item.maxQuantity = event.params._itemType.maxQuantity;
  item.totalQuantity = event.params._itemType.totalQuantity;
  item.rarityScoreModifier = event.params._itemType.rarityScoreModifier;
  item.canPurchaseWithGhst = event.params._itemType.canPurchaseWithGhst;
  item.minLevel = event.params._itemType.minLevel;
  item.canBeTransferred = event.params._itemType.canBeTransferred;
  item.category = event.params._itemType.category;
  item.kinshipBonus = event.params._itemType.kinshipBonus;
  item.experienceBonus = event.params._itemType.experienceBonus;
  item.save();
}

export function handleERC721ListingWhitelistSet(
  event: ERC721ListingWhitelistSet
): void {
  let listing = getOrCreateERC721Listing(event.params.listingId.toString());
  let whitelist = getOrCreateWhitelist(event.params.whitelistId, event);
  if (!listing || !whitelist) return;
  listing.whitelist = whitelist.id;
  listing.save();
}

export function handleERC1155ListingPriceUpdate(
  event: ERC1155ListingPriceUpdate
): void {
  let listing = getOrCreateERC1155Listing(event.params.listingId.toString());
  if (!listing) return;
  listing.priceInWei = event.params.priceInWei;
  listing.priceUpdatedAt = event.params.time;
  listing.save();
}

export function handleERC1155ListingWhitelistSet(
  event: ERC1155ListingWhitelistSet
): void {
  let listing = getOrCreateERC1155Listing(event.params.listingId.toString());
  let whitelist = getOrCreateWhitelist(event.params.whitelistId, event);
  if (!listing || !whitelist) return;
  listing.whitelist = whitelist.id;
  listing.save();
}

export function handleERC721ListingPriceUpdate(
  event: ERC721ListingPriceUpdate
): void {
  let listing = getOrCreateERC721Listing(event.params.listingId.toString());
  if (!listing) return;
  listing.priceInWei = event.params.priceInWei;
  listing.priceUpdatedAt = event.params.time;
  listing.save();
}

export function handleGotchiLendingAdded2(event: GotchiLendingAdded1): void {
  let lending = getOrCreateGotchiLending(event.params.param0.listingId);
  lending = updatePermissionsFromBitmap(
    lending,
    event.params.param0.permissions
  );
  lending.upfrontCost = event.params.param0.initialCost;
  lending.rentDuration = event.params.param0.period;
  lending.lender = event.params.param0.lender;
  lending.originalOwner = event.params.param0.originalOwner;
  lending.period = event.params.param0.period;
  lending.splitOwner = BigInt.fromI32(event.params.param0.revenueSplit[0]);
  lending.splitBorrower = BigInt.fromI32(event.params.param0.revenueSplit[1]);
  lending.splitOther = BigInt.fromI32(event.params.param0.revenueSplit[2]);
  lending.tokensToShare = event.params.param0.revenueTokens.map<Bytes>(
    (e) => e
  );
  lending.thirdPartyAddress = event.params.param0.thirdParty;
  lending.timeCreated = event.block.timestamp;
  lending.cancelled = false;
  lending.completed = false;
  if (event.params.param0.whitelistId != BIGINT_ZERO) {
    let whitelist = getOrCreateWhitelist(
      event.params.param0.whitelistId,
      event
    );
    if (whitelist) {
      lending.whitelist = whitelist.id;
      lending.whitelistMembers = whitelist.members;
      lending.whitelistId = event.params.param0.whitelistId;
    }
  }
  let gotchi = getOrCreateAavegotchi(
    event.params.param0.tokenId.toString(),
    event
  )!;
  gotchi.locked = true;
  gotchi.lending = BigInt.fromString(lending.id);
  gotchi.save();

  lending.gotchi = gotchi.id;
  lending.gotchiTokenId = event.params.param0.tokenId;
  lending.gotchiKinship = gotchi.kinship;
  lending.gotchiBRS = gotchi.withSetsRarityScore;

  lending.save();
}

export function handleGotchiLendingExecuted2(
  event: GotchiLendingExecuted1
): void {
  let lending = getOrCreateGotchiLending(event.params.param0.listingId);
  lending = updatePermissionsFromBitmap(
    lending,
    event.params.param0.permissions
  );
  lending.upfrontCost = event.params.param0.initialCost;
  lending.lender = event.params.param0.lender;
  lending.originalOwner = event.params.param0.originalOwner;
  lending.period = event.params.param0.period;
  lending.splitOwner = BigInt.fromI32(event.params.param0.revenueSplit[0]);
  lending.splitBorrower = BigInt.fromI32(event.params.param0.revenueSplit[1]);
  lending.splitOther = BigInt.fromI32(event.params.param0.revenueSplit[2]);
  lending.tokensToShare = event.params.param0.revenueTokens.map<Bytes>(
    (e) => e
  );
  lending.rentDuration = event.params.param0.period;
  lending.thirdPartyAddress = event.params.param0.thirdParty;
  lending.gotchiTokenId = event.params.param0.tokenId;
  lending.gotchi = event.params.param0.tokenId.toString();
  lending.timeAgreed = event.params.param0.timeAgreed;
  lending.cancelled = false;
  lending.completed = false;
  lending.borrower = event.params.param0.borrower;
  if (event.params.param0.whitelistId != BIGINT_ZERO) {
    let whitelist = getOrCreateWhitelist(
      event.params.param0.whitelistId,
      event
    );
    if (whitelist) {
      lending.whitelist = whitelist.id;
      lending.whitelistMembers = whitelist.members;
      lending.whitelistId = event.params.param0.whitelistId;
    }
  }

  // update originalOwner to lender
  let gotchi = getOrCreateAavegotchi(lending.gotchi, event)!;
  let lender = getOrCreateUser(lending.lender!.toHexString());
  gotchi.originalOwner = lender.id;
  gotchi.locked = true;
  lender.save();
  gotchi.save();

  lending.gotchiKinship = gotchi.kinship;
  lending.gotchiBRS = gotchi.withSetsRarityScore;
  lending.save();

  let originalOwner = getOrCreateUser(lending.lender!.toHexString());
  let gotchisLentOut = originalOwner.gotchisLentOut;
  gotchisLentOut.push(lending.gotchiTokenId);
  originalOwner.gotchisLentOut = gotchisLentOut;
  originalOwner.save();

  let borrower = getOrCreateUser(lending.borrower!.toHexString());
  let gotchisBorrowed = borrower.gotchisBorrowed;
  gotchisBorrowed.push(lending.gotchiTokenId);
  borrower.gotchisBorrowed = gotchisBorrowed;
  borrower.save();

  // update stats
  let stats = getStatisticEntity();
  stats.aavegotchisBorrowed = stats.aavegotchisBorrowed.plus(BIGINT_ONE);
  stats.save();
}

export function handleGotchiLendingCancelled2(
  event: GotchiLendingCancelled
): void {
  let lending = getOrCreateGotchiLending(event.params.param0.listingId);
  // skip if old lending
  if (lending.lender === null || lending.gotchiTokenId === null) {
    return;
  }
  lending = updatePermissionsFromBitmap(
    lending,
    event.params.param0.permissions
  );

  let gotchi = getOrCreateAavegotchi(lending.gotchiTokenId.toString(), event)!;

  lending.upfrontCost = event.params.param0.initialCost;
  lending.lender = event.params.param0.lender;
  lending.originalOwner = event.params.param0.originalOwner;
  lending.period = event.params.param0.period;
  lending.splitOwner = BigInt.fromI32(event.params.param0.revenueSplit[0]);
  lending.splitBorrower = BigInt.fromI32(event.params.param0.revenueSplit[1]);
  lending.splitOther = BigInt.fromI32(event.params.param0.revenueSplit[2]);
  lending.tokensToShare = event.params.param0.revenueTokens.map<Bytes>(
    (e) => e
  );
  lending.thirdPartyAddress = event.params.param0.thirdParty;
  lending.gotchiTokenId = event.params.param0.tokenId;
  lending.gotchi = event.params.param0.tokenId.toString();
  lending.cancelled = true;
  lending.completed = false;
  lending.rentDuration = event.params.param0.period;
  if (event.params.param0.whitelistId != BIGINT_ZERO) {
    let whitelist = getOrCreateWhitelist(
      event.params.param0.whitelistId,
      event
    );
    if (whitelist) {
      lending.whitelist = whitelist.id;
      lending.whitelistMembers = whitelist.members;
      lending.whitelistId = event.params.param0.whitelistId;
    }
  }
  lending.cancelled = true;
  lending.timeEnded = event.block.timestamp;
  lending.completed = false;
  lending.gotchiKinship = gotchi.kinship;
  lending.gotchiBRS = gotchi.withSetsRarityScore;
  lending.save();

  gotchi.locked = false;
  gotchi.lending = null;
  gotchi.save();
}

export function handleGotchiLendingClaimed2(
  event: GotchiLendingClaimed1
): void {
  let lending = getOrCreateGotchiLending(event.params.param0.listingId);
  // skip if old lending
  if (lending.lender === null || lending.gotchiTokenId === null) {
    return;
  }
  lending = updatePermissionsFromBitmap(
    lending,
    event.params.param0.permissions
  );
  for (let i = 0; i < event.params.param0.revenueTokens.length; i++) {
    let ctoken = getOrCreateClaimedToken(
      event.params.param0.revenueTokens[i],
      lending
    );
    ctoken.amount = ctoken.amount.plus(event.params.param0.amounts[i]);
    ctoken.save();
  }

  lending.upfrontCost = event.params.param0.initialCost;
  lending.lender = event.params.param0.lender;
  lending.originalOwner = event.params.param0.originalOwner;
  lending.period = event.params.param0.period;
  lending.splitOwner = BigInt.fromI32(event.params.param0.revenueSplit[0]);
  lending.splitBorrower = BigInt.fromI32(event.params.param0.revenueSplit[1]);
  lending.splitOther = BigInt.fromI32(event.params.param0.revenueSplit[2]);
  lending.tokensToShare = event.params.param0.revenueTokens.map<Bytes>(
    (e) => e
  );
  lending.rentDuration = event.params.param0.period;
  lending.thirdPartyAddress = event.params.param0.thirdParty;
  lending.lastClaimed = event.params.param0.timeClaimed;
  lending.gotchiTokenId = event.params.param0.tokenId;
  lending.gotchi = event.params.param0.tokenId.toString();
  lending.borrower = event.params.param0.borrower;
  lending.cancelled = false;
  lending.completed = false;
  if (event.params.param0.whitelistId != BIGINT_ZERO) {
    let whitelist = getOrCreateWhitelist(
      event.params.param0.whitelistId,
      event
    );
    if (whitelist) {
      lending.whitelist = whitelist.id;
      lending.whitelistMembers = whitelist.members;
      lending.whitelistId = event.params.param0.whitelistId;
    }
  }
  lending.save();
}

export function handleGotchiLendingEnded2(event: GotchiLendingEnded1): void {
  let lending = getOrCreateGotchiLending(event.params.param0.listingId);
  // skip if old lending
  if (lending.lender === null || lending.gotchiTokenId === null) {
    return;
  }
  lending = updatePermissionsFromBitmap(
    lending,
    event.params.param0.permissions
  );

  let gotchi = getOrCreateAavegotchi(lending.gotchiTokenId.toString(), event)!;

  lending.upfrontCost = event.params.param0.initialCost;
  lending.lender = event.params.param0.lender;
  lending.originalOwner = event.params.param0.originalOwner;
  lending.period = event.params.param0.period;
  lending.splitOwner = BigInt.fromI32(event.params.param0.revenueSplit[0]);
  lending.splitBorrower = BigInt.fromI32(event.params.param0.revenueSplit[1]);
  lending.splitOther = BigInt.fromI32(event.params.param0.revenueSplit[2]);
  lending.tokensToShare = event.params.param0.revenueTokens.map<Bytes>(
    (e) => e
  );
  lending.rentDuration = event.params.param0.period;
  lending.thirdPartyAddress = event.params.param0.thirdParty;
  lending.gotchiTokenId = event.params.param0.tokenId;
  lending.gotchi = event.params.param0.tokenId.toString();
  lending.completed = true;
  lending.timeEnded = event.block.timestamp;
  if (event.params.param0.whitelistId != BIGINT_ZERO) {
    let whitelist = getOrCreateWhitelist(
      event.params.param0.whitelistId,
      event
    );
    if (whitelist) {
      lending.whitelist = whitelist.id;
      lending.whitelistMembers = whitelist.members;
      lending.whitelistId = event.params.param0.whitelistId;
    }
  }
  lending.timeEnded = event.block.timestamp;
  lending.completed = true;
  lending.gotchiKinship = gotchi.kinship;
  lending.gotchiBRS = gotchi.withSetsRarityScore;
  lending.save();

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

  if (event.params.param0.whitelistId != BIGINT_ZERO) {
    let whitelist = getOrCreateWhitelist(
      event.params.param0.whitelistId,
      event
    );
    if (whitelist) {
      lending.whitelist = whitelist.id;
      lending.whitelistMembers = whitelist.members;
      lending.whitelistId = event.params.param0.whitelistId;
    }
  }

  gotchi.lending = null;
  gotchi.locked = false;
  gotchi.originalOwner = originalOwner.id;
  gotchi.owner = originalOwner.id;
  gotchi.save();

  // update Stats
  let stats = getStatisticEntity();
  stats.aavegotchisBorrowed = stats.aavegotchisBorrowed.minus(BIGINT_ONE);
  stats.save();
}

export function handleERC721BuyOrderAdded(event: ERC721BuyOrderAdded): void {
  // instantiate entity on subgraph
  let entity = getOrCreateERC721BuyOrder(event.params.buyOrderId.toString());
  entity.buyer = event.params.buyer;
  entity.category = event.params.category;
  entity.createdAt = event.params.time;
  entity.duration = event.params.duration;
  entity.erc721TokenAddress = event.params.erc721TokenAddress;
  entity.erc721TokenId = event.params.erc721TokenId;
  entity.priceInWei = event.params.priceInWei;
  entity.validationHash = event.params.validationHash;
  entity.save();
}

export function handleERC721BuyOrderExecuted(
  event: ERC721BuyOrderExecuted
): void {
  // update buy order
  let entity = getOrCreateERC721BuyOrder(event.params.buyOrderId.toString());
  entity.seller = event.params.seller;
  entity.erc721TokenAddress = event.params.erc721TokenAddress;
  entity.erc721TokenId = event.params.erc721TokenId;
  entity.priceInWei = event.params.priceInWei;
  entity.buyer = event.params.buyer;
  entity.executedAt = event.params.time;
  entity.executedAtBlock = event.block.number;
  entity.save();
}

export function handleERC721BuyOrderCanceled(
  event: ERC721BuyOrderCanceled
): void {
  // update buy order
  let entity = getOrCreateERC721BuyOrder(event.params.buyOrderId.toString());
  entity.canceledAt = event.params.time;
  entity.canceled = true;
  entity.save();
}

export function handleKinshipBurned(event: KinshipBurned): void {
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString(), event);
  if (!gotchi) return;
  gotchi.kinship = event.params._value;
  gotchi.save();
}

export function handleRoleGranted(event: RoleGranted): void {
  erc7589.handleRoleGranted(event);
}

export function handleRoleRevoked(event: RoleRevoked): void {
  erc7589.handleRoleRevoked(event);
}

export function handleTokensCommitted(event: TokensCommitted): void {
  erc7589.handleTokensCommitted(event);
}

export function handleTokensReleased(event: TokensReleased): void {
  erc7589.handleTokensReleased(event);
}
export function handleERC1155BuyOrderAdd(event: ERC1155BuyOrderAdd): void {
  // instantiate entity on subgraph
  let entity = getOrCreateERC1155BuyOrder(event.params.buyOrderId.toString());
  entity.buyer = event.params.buyer;
  entity.category = event.params.category;
  entity.createdAt = event.params.time;
  entity.duration = event.params.duration;
  entity.erc1155TokenAddress = event.params.erc1155TokenAddress;
  entity.erc1155TokenId = event.params.erc1155TokenId;
  entity.priceInWei = event.params.priceInWei;
  entity.quantity = event.params.quantity;
  entity.executedQuantity = BIGINT_ZERO;
  entity.save();
}

export function handleERC1155BuyOrderExecute(
  event: ERC1155BuyOrderExecute
): void {
  // update buy order
  let entity = getOrCreateERC1155BuyOrder(event.params.buyOrderId.toString());
  entity.erc1155TokenAddress = event.params.erc1155TokenAddress;
  entity.erc1155TokenId = event.params.erc1155TokenId;
  entity.priceInWei = event.params.priceInWei;
  entity.executedQuantity = entity.executedQuantity.plus(event.params.quantity);
  entity.quantity = entity.quantity.minus(event.params.quantity);
  entity.lastExecutedAt = event.params.time;
  entity.seller = event.params.seller;
  if (entity.quantity == BIGINT_ZERO) {
    entity.completedAt = event.params.time;
  }
  entity.save();

  let execution = getOrCreateERC1155BuyOrderExecution(
    event.params.buyOrderId.toString() + "-" + event.transaction.hash.toHex()
  );

  execution.buyOrder = event.params.buyOrderId.toString();
  execution.buyer = event.params.buyer;
  execution.seller = event.params.seller;
  execution.erc1155TokenAddress = event.params.erc1155TokenAddress;
  execution.erc1155TokenId = event.params.erc1155TokenId;
  execution.category = event.params.category;
  execution.priceInWei = event.params.priceInWei;
  execution.executedAt = event.params.time;
  execution.executedQuantity = event.params.quantity;
  execution.save();
}

export function handleERC1155BuyOrderCancel(
  event: ERC1155BuyOrderCancel
): void {
  // update buy order
  let entity = getOrCreateERC1155BuyOrder(event.params.buyOrderId.toString());
  entity.canceledAt = event.params.time;
  entity.canceled = true;
  entity.save();
}
