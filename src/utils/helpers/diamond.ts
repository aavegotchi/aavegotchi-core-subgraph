import {
  AavegotchiDiamond
} from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";

import { Aavegotchi, AavegotchiOption, Portal, User } from "../../../generated/schema";
import { BigInt, ethereum, log } from "@graphprotocol/graph-ts";

export function getOrCreatePortal(
  id: String,
  createIfNotFound: boolean = true
): Portal {
  let portal = Portal.load(id);

  if (portal == null && createIfNotFound) {
    portal = new Portal(id);
  }

  return portal as Portal;
}

export function getOrCreateAavegotchiOption(
  id: String,
  createIfNotFound: boolean = true
): AavegotchiOption {
  let option = AavegotchiOption.load(id);

  if (option == null && createIfNotFound) {
    option = new AavegotchiOption(id);
  }

  return option as AavegotchiOption;
}

export function getOrCreateAavegotchi(
  id: String,
  createIfNotFound: boolean = true
): Aavegotchi {
  let gotchi = Aavegotchi.load(id);

  if (gotchi == null && createIfNotFound) {
    gotchi = new Aavegotchi(id);
  }

  return gotchi as Aavegotchi;
}

export function getOrCreateUser(
  id: String,
  createIfNotFound: boolean = true
): User {
  let user = User.load(id);

  if (user == null && createIfNotFound) {
    user = new User(id);
  }

  return user as User;
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
      event.transaction.hash.toHexString()
    ]);
  }

  return gotchi as Aavegotchi;
}
