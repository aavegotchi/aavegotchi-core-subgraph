import { AavegotchiDiamond } from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";

import {
  Aavegotchi,
  AavegotchiOption,
  ERC721Listing,
  ERC1155Listing,
  Portal,
  User,
  Statistic,
} from "../../../generated/schema";
import { BIGINT_ZERO } from "../constants";
import { BigInt, ethereum, log } from "@graphprotocol/graph-ts";

export function getOrCreatePortal(
  id: string,
  createIfNotFound: boolean = true
): Portal {
  let portal = Portal.load(id);

  if (portal == null && createIfNotFound) {
    portal = new Portal(id);
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
  createIfNotFound: boolean = true
): Aavegotchi {
  let gotchi = Aavegotchi.load(id);

  if (gotchi == null && createIfNotFound) {
    gotchi = new Aavegotchi(id);
    gotchi.timesInteracted = BIGINT_ZERO;
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
  } else {
    log.warning("Listing {} couldn't be updated at block: {} tx_hash: {}", [
      listingID.toString(),
      event.block.number.toString(),
      event.transaction.hash.toHexString(),
    ]);
  }

  return listing as ERC721Listing;
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
  } else {
    log.warning("Listing {} couldn't be updated at block: {} tx_hash: {}", [
      listingID.toString(),
      event.block.number.toString(),
      event.transaction.hash.toHexString(),
    ]);
  }

  return listing as ERC1155Listing;
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

export function getStatisticEntity(): Statistic {
  let stats = Statistic.load("0");

  if (stats == null) {
    stats = new Statistic("0");

    stats.portalsBought = BIGINT_ZERO;
    stats.portalsOpened = BIGINT_ZERO;
    stats.aavegotchisClaimed = BIGINT_ZERO;

    stats.save();
  }

  return stats as Statistic;
}
