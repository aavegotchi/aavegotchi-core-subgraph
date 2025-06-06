import { ERC1155BuyOrderExecution } from "../../../generated/schema";

import { ERC1155BuyOrder } from "../../../generated/schema";

import { Address, Bytes, ethereum } from "@graphprotocol/graph-ts";
import {
  Aavegotchi,
  ClaimedToken,
  ERC1155Listing,
  ERC1155Purchase,
  ERC721BuyOrder,
  ERC721Listing,
  GotchiLending,
  ItemType,
  Statistic,
  User,
  WearableSet,
  WearablesConfig,
  Whitelist,
} from "../../../generated/schema";

import { AavegotchiOption, Portal } from "../../../generated/schema";
import { BIGINT_ZERO, PORTAL_STATUS_BOUGHT } from "../constants";
import {
  AavegotchiDiamond,
  ERC1155ExecutedListing,
} from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { getFakeGotchiNFTToken } from "./fakegotchis";
import { BigInt } from "@graphprotocol/graph-ts";
import { log } from "@graphprotocol/graph-ts";

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
    portal.status = PORTAL_STATUS_BOUGHT;
  }

  return portal as Portal;
}

export function getOrCreateAavegotchiOption(
  portalId: string,
  i: i32,
  createIfNotFound: boolean = true
): AavegotchiOption {
  let id = portalId.concat("-").concat(BigInt.fromI32(i).toString());
  let option = AavegotchiOption.load(id);

  if (option == null && createIfNotFound) {
    option = new AavegotchiOption(id);
    option.portalOptionId = i;
  }

  return option as AavegotchiOption;
}

export function getOrCreateAavegotchi(
  id: string,
  event: ethereum.Event,
  createIfNotFound: boolean = true
): Aavegotchi | null {
  let gotchi = Aavegotchi.load(id);

  if (gotchi == null && createIfNotFound) {
    gotchi = new Aavegotchi(id);
    gotchi.gotchiId = BigInt.fromString(id);
    gotchi.createdAt = event.block.number;
    gotchi.timesTraded = BIGINT_ZERO;
    gotchi.historicalPrices = [];
    gotchi.kinship = BigInt.fromI32(50);
    gotchi.withSetsRarityScore = BIGINT_ZERO;
    gotchi = updateAavegotchiInfo(gotchi, BigInt.fromString(gotchi.id), event);
    gotchi = updateAavegotchiWearables(gotchi, event);
    gotchi.equippedDelegatedWearables = new Array<i32>(16).fill(0);
  } else if (gotchi == null && !createIfNotFound) {
    return null;
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
    user.gotchisLentOut = new Array<BigInt>();
    user.gotchisBorrowed = new Array<BigInt>();
    user.fakeGotchis = "{}";
    user.amountFakeGotchis = 0;

    user.currentUniqueFakeGotchisOwned = 0;
    user.currentUniqueFakeGotchisOwnedArray = "{}";
    user.totalUniqueFakeGotchisOwned = 0;
    user.totalUniqueFakeGotchisOwnedArray = "{}";

    user.totalFakeGotchisOwnedArray = "{}";
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
): ItemType | null {
  let itemType = ItemType.load(id);

  if (itemType == null && createIfNotFound) {
    itemType = new ItemType(id);
    itemType.consumed = BIGINT_ZERO;
  }

  return itemType;
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

    if (listing.blockCreated.equals(BIGINT_ZERO)) {
      listing.blockCreated = event.block.number;
    }

    let erc721Token = getFakeGotchiNFTToken(
      listingInfo.erc721TokenAddress,
      listingInfo.erc721TokenId
    );

    if (erc721Token != null) {
      listing.fakeGotchi_name = erc721Token.name;
      listing.fakeGotchi_publisher = erc721Token.publisher;
      listing.fakeGotchi_description = erc721Token.description;
      listing.fakeGotchi_artist = erc721Token.artist;
      listing.fakeGotchi_artistName = erc721Token.artistName;
      listing.fakeGotchi_editions = erc721Token.editions;
      listing.fakeGotchi_publisherName = erc721Token.publisherName;
    }

    if (listing.category.toI32() <= 2) {
      let portal = getOrCreatePortal(
        listingInfo.erc721TokenId.toString(),
        false
      );

      if (portal) {
        listing.hauntId = portal.hauntId;
        if (portal.historicalPrices && portal.historicalPrices!.length > 0) {
          listing.soldBefore = true;
        } else {
          listing.soldBefore = false;
        }
      }
    } else {
      let aavegotchi = getOrCreateAavegotchi(
        listingInfo.erc721TokenId.toString(),
        event,
        false
      );

      if (aavegotchi) {
        listing.hauntId = aavegotchi.hauntId;
        listing.kinship = aavegotchi.kinship;
        listing.experience = aavegotchi.experience;
        listing.baseRarityScore = aavegotchi.baseRarityScore;
        listing.modifiedRarityScore = aavegotchi.modifiedRarityScore;
        listing.equippedWearables = aavegotchi.equippedWearables;
        listing.amountEquippedWearables = aavegotchi.equippedWearables.filter(
          (e) => e != 210 && e != 0
        ).length; // without haunt1 background
        if (
          aavegotchi.historicalPrices &&
          aavegotchi.historicalPrices!.length > 0
        ) {
          listing.soldBefore = true;
        } else {
          listing.soldBefore = false;
        }
        listing.claimedAt = aavegotchi.claimedAt;
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
export function itemMaxQuantityToRarity(bigInt: BigInt): BigInt {
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
    } else if (listing.category.toI32() < 3) {
      let itemType = getOrCreateItemType(
        listingInfo.erc1155TypeId.toString(),
        false
      );

      if (!itemType) {
        return listing;
      }

      listing.rarityLevel = itemMaxQuantityToRarity(itemType.maxQuantity);
      // brs modifier
      listing.rarityScoreModifier = BigInt.fromI32(
        itemType.rarityScoreModifier
      );

      // trait modifier
      listing.nrgTraitModifier = BigInt.fromI32(itemType.traitModifiers![0]);
      listing.aggTraitModifier = BigInt.fromI32(itemType.traitModifiers![1]);
      listing.spkTraitModifier = BigInt.fromI32(itemType.traitModifiers![2]);
      listing.brnTraitModifier = BigInt.fromI32(itemType.traitModifiers![3]);
      listing.eysTraitModifier = BigInt.fromI32(itemType.traitModifiers![4]);
      listing.eycTraitModifier = BigInt.fromI32(itemType.traitModifiers![5]);
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
  listing.recipient = event.params.buyer;

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
  event: ethereum.Event,
  updateListing: boolean = true
): Aavegotchi {
  let contract = AavegotchiDiamond.bind(event.address);
  let response = contract.try_getAavegotchi(id);

  if (!response.reverted) {
    let gotchiInfo = response.value;

    let owner = getOrCreateUser(gotchiInfo.owner.toHexString());
    owner.save();
    gotchi.owner = owner.id;
    if (!gotchi.originalOwner) {
      gotchi.originalOwner = owner.id;
    }
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

    //Update individual traits
    gotchi.baseEnergy = gotchiInfo.numericTraits[0];
    gotchi.baseAggression = gotchiInfo.numericTraits[1];
    gotchi.baseSpookiness = gotchiInfo.numericTraits[2];
    gotchi.baseBrain = gotchiInfo.numericTraits[3];
    gotchi.eyeShape = gotchiInfo.numericTraits[4];
    gotchi.eyeColor = gotchiInfo.numericTraits[5];

    gotchi.modifiedEnergy = gotchiInfo.modifiedNumericTraits[0];
    gotchi.modifiedAggression = gotchiInfo.modifiedNumericTraits[1];
    gotchi.modifiedSpookiness = gotchiInfo.modifiedNumericTraits[2];
    gotchi.modifiedBrain = gotchiInfo.modifiedNumericTraits[3];

    if (!gotchi.withSetsRarityScore) {
      gotchi.withSetsRarityScore = gotchiInfo.modifiedRarityScore;
      gotchi.withSetsNumericTraits = gotchiInfo.modifiedNumericTraits;
    }

    if (gotchi.lending) {
      let lending = getOrCreateGotchiLending(gotchi.lending!);
      lending.gotchiKinship = gotchi.kinship;
      lending.gotchiBRS = gotchi.withSetsRarityScore;
      lending.save();
    }

    if (gotchi.activeListing && updateListing) {
      let listing = getOrCreateERC721Listing(gotchi.activeListing!.toString());
      listing.kinship = gotchi.kinship;
      listing.experience = gotchi.experience;
      listing.nameLowerCase = gotchi.nameLowerCase;
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
      listing.save();
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

    stats.aavegotchisBorrowed = BIGINT_ZERO;
    stats.aavegotchisSacrificed = BIGINT_ZERO;

    stats.burnedCards = 0;
    stats.burnedNFTs = 0;
    stats.totalNFTs = 0;
    stats.totalFakeGotchiOwners = 0;
    stats.totalFakeGotchiPieces = 0;
    stats.totalNFTsArray = "{}";
    stats.totalFakeGotchiOwnersArray = new Array<Bytes>();
    stats.tokenIdCounter = 0;
    stats.totalEditionsCirculating = 0;
    stats.totalEditionsMinted = 0;
    stats.totalEditionsCirculatingArray = "{}";

    stats.save();
  }

  return stats as Statistic;
}

export function updateAavegotchiWearables(
  gotchi: Aavegotchi,
  event: ethereum.Event
): Aavegotchi {
  let contract = AavegotchiDiamond.bind(event.address);

  let bigInts = new Array<BigInt>();
  let equippedWearables = gotchi.equippedWearables;

  for (let index = 0; index < equippedWearables.length; index++) {
    let element = equippedWearables[index];
    bigInts.push(BigInt.fromI32(element));
  }

  let equippedSets = contract.try_findWearableSets(bigInts);

  if (!equippedSets.reverted) {
    log.warning("Equipped sets for GotchiID {} length {}", [
      gotchi.id,
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
        let longestSetLength = 0;
        //Iterate through all the possible equipped sets
        for (let index = 0; index < foundSetIDs.length; index++) {
          let setID = foundSetIDs[index];
          let setInfo = setTypes[setID.toI32()];
          let setLength = setInfo.wearableIds.length;

          if (setLength >= longestSetLength) {
            longestSetLength = setLength;
            bestSetID = setID.toI32();
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

  return gotchi;
}

// @ts-ignore
export function calculateBaseRarityScore(numericTraits: Array<i32>): i32 {
  let rarityScore = 0;

  for (let index = 0; index < numericTraits.length; index++) {
    let element = numericTraits[index];

    if (element < 50) rarityScore = rarityScore + (100 - element);
    else rarityScore = rarityScore + (element + 1);
  }

  return rarityScore;
}

// wearables config
export function createOrUpdateWearablesConfig(
  owner: Bytes,
  tokenId: BigInt,
  wearablesConfigId: i32,
  event: ethereum.Event
): WearablesConfig | null {
  let contract = AavegotchiDiamond.bind(event.address);
  let ownerAddress = Address.fromString(owner.toHexString());
  let gotchi = getOrCreateAavegotchi(tokenId.toString(), event)!;
  let user = getOrCreateUser(ownerAddress.toHexString())!;
  let id = `${user.id}-${tokenId}-${wearablesConfigId}`

  let response = contract.try_getWearablesConfig(
    ownerAddress,
    tokenId,
    wearablesConfigId
  );

  if (response.reverted) {
    return null;
  }

  let result = response.value;

  let wearablesConfig = WearablesConfig.load(id);
  if (!wearablesConfig) {
    wearablesConfig = new WearablesConfig(id);
    wearablesConfig.wearablesConfigId = wearablesConfigId;
    wearablesConfig.gotchi = gotchi.id;
    wearablesConfig.gotchiTokenId = tokenId;
    wearablesConfig.owner = user.id;
    wearablesConfig.ownerAddress = ownerAddress;
  }
  wearablesConfig.name = result.name;
  wearablesConfig.wearables = result.wearables;
  wearablesConfig.save();
  return wearablesConfig;
}

// whitelist
export function createOrUpdateWhitelist(
  id: BigInt,
  event: ethereum.Event
): Whitelist | null {
  let contract = AavegotchiDiamond.bind(event.address);
  let response = contract.try_getWhitelist(id);

  if (response.reverted) {
    return null;
  }

  let result = response.value;

  let members = result.addresses;
  let name = result.name;

  let whitelist = Whitelist.load(id.toString());
  if (!whitelist) {
    whitelist = new Whitelist(id.toString());
    whitelist.maxBorrowLimit = 1;
    whitelist.name = name;
  }

  let user = getOrCreateUser(result.owner.toHexString());
  user.save();
  whitelist.owner = user.id;
  whitelist.ownerAddress = result.owner;
  whitelist.members = members.map<Bytes>((e) => e);

  whitelist.save();
  return whitelist;
}

export function getOrCreateGotchiLending(listingId: BigInt): GotchiLending {
  let lending = GotchiLending.load(listingId.toString());
  if (!lending) {
    lending = new GotchiLending(listingId.toString());
    lending.cancelled = false;
    lending.completed = false;
    lending.whitelist = null;
    lending.whitelistMembers = [];
    lending.whitelistId = null;
    lending.channellingAllowed = false;
  }

  return lending;
}

export function getOrCreateClaimedToken(
  tokenAddress: Bytes,
  lending: GotchiLending
): ClaimedToken {
  let id = lending.id + "_" + tokenAddress.toHexString();
  let ctoken = ClaimedToken.load(id);
  if (ctoken == null) {
    ctoken = new ClaimedToken(id);
    ctoken.amount = BIGINT_ZERO;
    ctoken.lending = lending.id;
    ctoken.token = tokenAddress;
  }

  return ctoken;
}

export function getOrCreateWhitelist(
  whitelistId: BigInt,
  event: ethereum.Event
): Whitelist | null {
  let id = whitelistId.toString();
  let whitelist = Whitelist.load(id);
  if (!whitelist) {
    whitelist = createOrUpdateWhitelist(whitelistId, event);
  }

  return whitelist;
}

export function getOrCreateERC721BuyOrder(id: string): ERC721BuyOrder {
  let entity = ERC721BuyOrder.load(id);
  if (!entity) {
    entity = new ERC721BuyOrder(id);
    entity.canceled = false;
  }

  return entity;
}

export function getOrCreateERC1155BuyOrder(id: string): ERC1155BuyOrder {
  let entity = ERC1155BuyOrder.load(id);
  if (!entity) {
    entity = new ERC1155BuyOrder(id);
    entity.canceled = false;
  }

  return entity;
}

export function getOrCreateERC1155BuyOrderExecution(
  id: string
): ERC1155BuyOrderExecution {
  let entity = ERC1155BuyOrderExecution.load(id);
  if (!entity) {
    entity = new ERC1155BuyOrderExecution(id);
  }
  return entity;
}
