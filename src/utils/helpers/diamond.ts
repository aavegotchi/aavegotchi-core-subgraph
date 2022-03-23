import {
  AavegotchiDiamond,
  ERC1155ExecutedListing,
  ERC721ExecutedListing,
  ERC721ListingAdd,
  ERC721ListingCancelled,
} from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";

import {RealmDiamond} from "../../../generated/RealmDiamond/RealmDiamond"

import {
  Aavegotchi,
  AavegotchiOption,
  ERC721Listing,
  ERC1155Listing,
  Portal,
  User,
  Statistic,
  ItemType,
  WearableSet,
  ERC1155Purchase,
  Parcel,
  Whitelist,
  GotchiLending,
} from "../../../generated/schema";
import { BIGINT_ZERO } from "../constants";
import { Address, BigInt, Bytes, ethereum, log } from "@graphprotocol/graph-ts";

export function getOrCreatePortal(
  id: string,
  createIfNotFound: boolean = true
): Portal {
  let portal = Portal.load(id);

  if (portal == null && createIfNotFound) {
    portal = new Portal(id);
    portal.timesTraded = BIGINT_ZERO;
    portal.historicalPrices = [];
    portal.hauntId = BIGINT_ZERO;
  }

  return portal as Portal;
}

export function getOrCreateAavegotchiOption(
  id: string,
  createIfNotFound: boolean = true
): AavegotchiOption {
  let option = AavegotchiOption.load(id);

  if (option == null && createIfNotFound) {
    option = new AavegotchiOption(id);
  }

  return option as AavegotchiOption;
}

export function getOrCreateAavegotchi(
  id: string,
  event: ethereum.Event,
): Aavegotchi {
  let gotchi = Aavegotchi.load(id);

  if (gotchi == null) {
    gotchi = new Aavegotchi(id);
    gotchi.gotchiId = BigInt.fromString(id);
    gotchi.createdAt = event.block.number;
    gotchi.timesTraded = BIGINT_ZERO;
    gotchi.historicalPrices = [];
  }

  return gotchi as Aavegotchi;
}

export function getOrCreateUser(
  id: string,
  createIfNotFound: boolean = true
): User {
  let user = User.load(id);

  if (user == null && createIfNotFound) {
    user = new User(id);
  }

  return user as User;
}

export function getOrCreateERC721Listing(
  id: string,
  createIfNotFound: boolean = true
): ERC721Listing {
  let listing = ERC721Listing.load(id);

  if (listing == null && createIfNotFound) {
    listing = new ERC721Listing(id);
    listing.blockCreated = BIGINT_ZERO;
    listing.timeCreated = BIGINT_ZERO;
  }

  return listing as ERC721Listing;
}

export function getOrCreateERC1155Listing(
  id: string,
  createIfNotFound: boolean = true
): ERC1155Listing {
  let listing = ERC1155Listing.load(id);

  if (listing == null && createIfNotFound) {
    listing = new ERC1155Listing(id);
  }

  return listing as ERC1155Listing;
}

export function getOrCreateERC1155Purchase(
  id: string,
  buyer: Address,
  createIfNotFound: boolean = true
): ERC1155Purchase {
  let listing = ERC1155Purchase.load(id);

  if (listing == null && createIfNotFound) {
    listing = new ERC1155Purchase(id);
  }

  return listing as ERC1155Purchase;
}

export function getOrCreateItemType(
  id: string,
  createIfNotFound: boolean = true
): ItemType {
  let itemType = ItemType.load(id);

  if (itemType == null && createIfNotFound) {
    itemType = new ItemType(id);
    itemType.consumed = BIGINT_ZERO;
  }

  return itemType as ItemType;
}

export function getOrCreateWearableSet(
  id: string,
  createIfNotFound: boolean = true
): WearableSet {
  let set = WearableSet.load(id);

  if (set == null && createIfNotFound) {
    set = new WearableSet(id);
  }

  return set as WearableSet;
}

/*
export function getOrCreateUpgrade(
  id: string,
  createIfNotFound: boolean = true
): Upgrade {
  let upgrade = Upgrade.load(id);
  if (upgrade == null && createIfNotFound) {
    upgrade = new Upgrade(id);
  }

  return upgrade as Upgrade;
}
*/

export function updateERC721ListingInfo(
  listing: ERC721Listing,
  listingID: BigInt,
  event: ethereum.Event
): ERC721Listing {
  let contract = AavegotchiDiamond.bind(event.address);
  let response = contract.try_getERC721Listing(listingID);

  if (!response.reverted) {
    let listingInfo = response.value;
    listing.category = listingInfo.category;
    listing.erc721TokenAddress = listingInfo.erc721TokenAddress;
    listing.tokenId = listingInfo.erc721TokenId;
    listing.seller = listingInfo.seller;
    listing.timeCreated = listingInfo.timeCreated;
    listing.timePurchased = listingInfo.timePurchased;
    listing.priceInWei = listingInfo.priceInWei;
    listing.cancelled = listingInfo.cancelled;

    if(listing.blockCreated.equals(BIGINT_ZERO)) {
      listing.blockCreated = event.block.number;
    }

    if (listing.category.toI32() <= 2) {
      let portal = getOrCreatePortal(
        listingInfo.erc721TokenId.toString(),
        false
      );

      if (portal) {
        listing.hauntId = portal.hauntId;
      }
    } else {
      let aavegotchi = getOrCreateAavegotchi(
        listingInfo.erc721TokenId.toString(),
        event
      );

      if (aavegotchi) {
        listing.hauntId = aavegotchi.hauntId;
        listing.kinship = aavegotchi.kinship;
        listing.baseRarityScore = aavegotchi.baseRarityScore;
        listing.modifiedRarityScore = aavegotchi.modifiedRarityScore;
        listing.equippedWearables = aavegotchi.equippedWearables;
      }
    }
  } else {
    log.warning("Listing {} couldn't be updated at block: {} tx_hash: {}", [
      listingID.toString(),
      event.block.number.toString(),
      event.transaction.hash.toHexString(),
    ]);
  }

  return listing as ERC721Listing;
}

//@ts-ignore
function itemMaxQuantityToRarity(bigInt: BigInt): BigInt {
  let quantity = bigInt.toI32();
  if (quantity >= 1000) return BigInt.fromI32(0);
  if (quantity >= 500) return BigInt.fromI32(1);
  if (quantity >= 250) return BigInt.fromI32(2);
  if (quantity >= 100) return BigInt.fromI32(3);
  if (quantity >= 10) return BigInt.fromI32(4);
  if (quantity >= 1) return BigInt.fromI32(5);
  return BigInt.fromI32(0);
}

export function updateERC1155ListingInfo(
  listing: ERC1155Listing,
  listingID: BigInt,
  event: ethereum.Event
): ERC1155Listing {
  let contract = AavegotchiDiamond.bind(event.address);
  let response = contract.try_getERC1155Listing(listingID);
  if (!response.reverted) {
    let listingInfo = response.value;
    listing.category = listingInfo.category;
    listing.erc1155TokenAddress = listingInfo.erc1155TokenAddress;
    listing.erc1155TypeId = listingInfo.erc1155TypeId;
    listing.seller = listingInfo.seller;
    listing.timeCreated = listingInfo.timeCreated;
    listing.timeLastPurchased = listingInfo.timeLastPurchased;
    listing.priceInWei = listingInfo.priceInWei;
    listing.sold = listingInfo.sold;
    listing.cancelled = listingInfo.cancelled;
    listing.quantity = listingInfo.quantity;

    //tickets
    if (listing.category.toI32() === 3) {
      let rarityLevel = listing.erc1155TypeId;
      listing.rarityLevel = rarityLevel;

      //items
    } else {
      let itemType = getOrCreateItemType(
        listingInfo.erc1155TypeId.toString(),
        false
      );

      if (itemType) {
        listing.rarityLevel = itemMaxQuantityToRarity(itemType.maxQuantity);
      }
    }
  } else {
    log.warning("Listing {} couldn't be updated at block: {} tx_hash: {}", [
      listingID.toString(),
      event.block.number.toString(),
      event.transaction.hash.toHexString(),
    ]);
  }

  return listing as ERC1155Listing;
}

export function updateERC1155PurchaseInfo(
  listing: ERC1155Purchase,
  event: ERC1155ExecutedListing
): ERC1155Purchase {
  let listingInfo = event.params;

  listing.category = listingInfo.category;
  listing.listingID = listingInfo.listingId;
  listing.erc1155TokenAddress = listingInfo.erc1155TokenAddress;
  listing.erc1155TypeId = listingInfo.erc1155TypeId;
  listing.seller = listingInfo.seller;
  listing.timeLastPurchased = listingInfo.time;
  listing.priceInWei = listingInfo.priceInWei;
  listing.quantity = event.params._quantity;
  listing.buyer = event.params.buyer;

  //tickets
  if (listing.category.equals(BigInt.fromI32(3))) {
    let rarityLevel = listingInfo.erc1155TypeId;
    listing.rarityLevel = rarityLevel;

    //items
  } else {
    let itemType = getOrCreateItemType(
      listingInfo.erc1155TypeId.toString(),
      false
    );

    if (itemType) {
      listing.rarityLevel = itemMaxQuantityToRarity(itemType.maxQuantity);
    }
  }

  return listing as ERC1155Purchase;
}

export function updateAavegotchiInfo(
  gotchi: Aavegotchi,
  id: BigInt,
  event: ethereum.Event
): Aavegotchi {
  let contract = AavegotchiDiamond.bind(event.address);
  let response = contract.try_getAavegotchi(id);

  if (!response.reverted) {
    let gotchiInfo = response.value;

    gotchi.name = gotchiInfo.name;
    gotchi.nameLowerCase = gotchiInfo.name.toLowerCase();
    gotchi.randomNumber = gotchiInfo.randomNumber;
    gotchi.status = gotchiInfo.status;
    gotchi.numericTraits = gotchiInfo.numericTraits;
    gotchi.modifiedNumericTraits = gotchiInfo.modifiedNumericTraits;

    gotchi.equippedWearables = gotchiInfo.equippedWearables;
    gotchi.collateral = gotchiInfo.collateral;
    gotchi.escrow = gotchiInfo.escrow;
    gotchi.stakedAmount = gotchiInfo.stakedAmount;
    gotchi.minimumStake = gotchiInfo.minimumStake;

    gotchi.kinship = gotchiInfo.kinship;
    gotchi.lastInteracted = gotchiInfo.lastInteracted;
    gotchi.experience = gotchiInfo.experience;
    gotchi.toNextLevel = gotchiInfo.toNextLevel;
    gotchi.usedSkillPoints = gotchiInfo.usedSkillPoints;
    gotchi.level = gotchiInfo.level;
    gotchi.hauntId = gotchiInfo.hauntId;
    gotchi.baseRarityScore = gotchiInfo.baseRarityScore;
    gotchi.modifiedRarityScore = gotchiInfo.modifiedRarityScore;

    if (!gotchi.withSetsRarityScore) {
      gotchi.withSetsRarityScore = gotchiInfo.modifiedRarityScore;
      gotchi.withSetsNumericTraits = gotchiInfo.modifiedNumericTraits;
    }

    gotchi.locked = gotchiInfo.locked;
  } else {
    log.warning("Aavegotchi {} couldn't be updated at block: {} tx_hash: {}", [
      id.toString(),
      event.block.number.toString(),
      event.transaction.hash.toHexString(),
    ]);
  }

  return gotchi as Aavegotchi;
}

export function updateItemTypeInfo(
  itemType: ItemType,
  itemId: BigInt,
  event: ethereum.Event
): ItemType {
  let contract = AavegotchiDiamond.bind(event.address);
  let response = contract.try_getItemType(itemId);

  log.warning("Adding item type {}", [itemId.toString()]);

  if (!response.reverted) {
    let itemInfo = response.value;
    itemType.name = itemInfo.name;
    itemType.svgId = itemId;
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
  } else {
    log.warning("Listing {} couldn't be updated at block: {} tx_hash: {}", [
      itemType.id.toString(),
      event.block.number.toString(),
      event.transaction.hash.toHexString(),
    ]);
  }

  return itemType as ItemType;
}

export function getStatisticEntity(): Statistic {
  let stats = Statistic.load("0");

  if (stats == null) {
    stats = new Statistic("0");

    stats.portalsBought = BIGINT_ZERO;
    stats.portalsOpened = BIGINT_ZERO;
    stats.aavegotchisClaimed = BIGINT_ZERO;
    stats.erc721ActiveListingCount = BIGINT_ZERO;
    stats.erc1155ActiveListingCount = BIGINT_ZERO;
    stats.erc721TotalVolume = BIGINT_ZERO;
    stats.erc1155TotalVolume = BIGINT_ZERO;

    //new
    stats.totalWearablesVolume = BIGINT_ZERO;
    stats.totalConsumablesVolume = BIGINT_ZERO;
    stats.totalTicketsVolume = BIGINT_ZERO;

    stats.save();
  }

  return stats as Statistic;
}

export function getOrCreateParcel(
  tokenId: BigInt,
  owner: Bytes,
  tokenAddress: Address
): Parcel {
  let parcel = Parcel.load(tokenId.toString());

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (parcel == null) {
    parcel = new Parcel(tokenId.toString());
    parcel.timesTraded = BIGINT_ZERO;
  }

  log.debug("token address: {}", [tokenAddress.toHexString()]);

  let contract = RealmDiamond.bind(tokenAddress);
  let parcelInfo = contract.try_getParcelInfo(tokenId);

  if (parcelInfo.reverted) {
  } else {
    let parcelMetadata = parcelInfo.value;
    parcel.parcelId = parcelMetadata.parcelId;
    parcel.tokenId = tokenId;

    let user = getOrCreateUser(owner.toHexString());
    user.save();
    parcel.owner = user.id;

    parcel.coordinateX = parcelMetadata.coordinateX;
    parcel.coordinateY = parcelMetadata.coordinateY;
    parcel.district = parcelMetadata.district;
    parcel.parcelHash = parcelMetadata.parcelAddress;

    let boostArray = parcelMetadata.boost;
    parcel.fudBoost = boostArray[0];
    parcel.fomoBoost = boostArray[1];
    parcel.alphaBoost = boostArray[2];
    parcel.kekBoost = boostArray[3];

    parcel.size = parcelMetadata.size;
  }

  return parcel as Parcel;
}


// whitelist

export function createOrUpdateWhitelist(id: BigInt, event: ethereum.Event) {
  let contract = AavegotchiDiamond.bind(event.address);
  let response = contract.try_getWhitelist(id);
  
  if(response.reverted) {
    return false;
  }

  let result = response.value;

  let members = result.addresses;
  let name = result.name;

  let whitelist = Whitelist.load(id.toString());
  if(!whitelist) {
    whitelist = new Whitelist(id.toString());
    whitelist.name = name;
  }

  whitelist.members = members;
  whitelist.save();
}

export function getOrCreateGotchiLending(listingId: BigInt): GotchiLending {
    let lending = GotchiLending.load(listingId.toString());
    if(!lending) {
      lending = new GotchiLending(listingId.toString());
      lending.agreed = false;
      lending.cancelled = false;
      lending.finished = false;
    }

    return lending;
}

export function updateGotchiLending(lending: GotchiLending, event: ethereum.Event): GotchiLending {
  let contract = AavegotchiDiamond.bind(event.address);
  let response = contract.try_getGotchiLendingListingInfo(BigInt.fromString(lending.id));
  if(response.reverted) {
    return lending;
  }

  let listingResult = response.value.value0;
  let gotchiResult = response.value.value1;

  lending.borrower = listingResult.borrower.toHexString();
  lending.cancelled = listingResult.canceled;
  lending.completed = listingResult.completed;
  lending.gotchiTokenId = listingResult.erc721TokenId;
  lending.gotchiBRS = gotchiResult.baseRarityScore;
  lending.gotchiKinship = gotchiResult.kinship;

  lending.tokensToShare = listingResult.includeList.map(e => e.toHexString());
  lending.upfrontCost = listingResult.initialCost;

  lending.lastClaimed = listingResult.lastClaimed;

  lending.lender = listingResult.lender.toHexString(); 
  lending.originalOwner = listingResult.originalOwner.toHexString();

  lending.period = listingResult.period;

  lending.splitOwner = listingResult.revenueSplit[0];
  lending.splitBorrower = listingResult.revenueSplit[1];
  lending.splitOther = listingResult.revenueSplit[2];

  lending.thirdPartyAddress = listingResult.thirdParty.toHexString();
  lending.timeAgreed = listingResult.timeAgreed;
  lending.timeCreated = listingResult.timeCreated;

  return lending;
}