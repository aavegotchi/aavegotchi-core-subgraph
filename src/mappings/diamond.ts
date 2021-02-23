import {
  BuyPortals,
  PortalOpened,
  ClaimAavegotchi,
  AavegotchiDiamond as DiamondContract
} from "../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { Aavegotchi } from "../../generated/schema";
import {
  getOrCreateUser,
  getOrCreatePortal,
  getOrCreateAavegotchiOption,
  getOrCreateAavegotchi
} from "../utils/helpers";
import { BigInt, ethereum, log } from "@graphprotocol/graph-ts";

export function updateAavegotchiInfo(gotchi: Aavegotchi, id: BigInt, event: ethereum.Event): Aavegotchi {
  let contract = DiamondContract.bind(event.address);
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

  return gotchi as Aavegotchi
}

// - event: BuyPortals(indexed address,indexed address,uint256,uint256,uint256)
//   handler: handleBuyPortals

export function handleBuyPortals(event: BuyPortals): void {
  let buyer = getOrCreateUser(event.params._from.toHexString());
  let owner = getOrCreateUser(event.params._to.toHexString());

  let baseId = event.params._tokenId;

  for (let i = 0; i < event.params._numAavegotchisToPurchase.toI32(); i++) {
    let portal = getOrCreatePortal(baseId.plus(BigInt.fromI32(i)).toString());

    portal.status = "Bought";
    portal.owner = owner.id;
    portal.buyer = buyer.id;

    portal.save();
  }

  buyer.save();
  owner.save();
}

// - event: PortalOpened(indexed uint256)
//   handler: handlePortalOpened

export function handlePortalOpened(event: PortalOpened): void {
  let contract = DiamondContract.bind(event.address);
  let portal = getOrCreatePortal(event.params.tokenId.toString());
  let response = contract.try_portalAavegotchiTraits(event.params.tokenId);

  if (!response.reverted) {
    let array = response.value;
    // Assigning the first option just to get the proper types for the variables. Can be optimized later
    let possibleAavegotchiTraits = array[0];
    let gotchi = getOrCreateAavegotchiOption(
      portal.id.concat("-").concat(BigInt.fromI32(0).toString())
    );

    for (let i = 0; i < array.length; i++) {
      possibleAavegotchiTraits = array[i];
      gotchi = getOrCreateAavegotchiOption(
        portal.id.concat("-").concat(BigInt.fromI32(i).toString())
      );
      gotchi.portal = portal.id;
      gotchi.owner = portal.owner;
      gotchi.randomNumber = possibleAavegotchiTraits.randomNumber;
      gotchi.numericTraits = possibleAavegotchiTraits.numericTraits;
      gotchi.numericTraitsUint = possibleAavegotchiTraits.numericTraitsUint;
      gotchi.collateralType = possibleAavegotchiTraits.collateralType;
      gotchi.minimumStake = possibleAavegotchiTraits.minimumStake;

      gotchi.save();
    }
  }

  portal.status = "Opened";
  portal.save();
}

// - event: ClaimAavegotchi(indexed uint256)
//   handler: handleClaimAavegotchi

export function handleClaimAavegotchi(event: ClaimAavegotchi): void {
  let portal = getOrCreatePortal(event.params._tokenId.toString());

  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString());
  gotchi.portal = portal.id;
  gotchi.owner = portal.owner;

  gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);

  gotchi.save();

  portal.gotchi = gotchi.id;
  portal.status = "Claimed";
  portal.save();
}
