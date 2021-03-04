import {
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
  AavegotchiDiamond,
  Xingyun
} from "../../generated/AavegotchiDiamond/AavegotchiDiamond";
import {
  getOrCreateUser,
  getOrCreatePortal,
  getOrCreateAavegotchiOption,
  getOrCreateAavegotchi,
  updateAavegotchiInfo
} from "../utils/helpers";
import { BigInt, log } from "@graphprotocol/graph-ts";

// - event: BuyPortals(indexed address,indexed address,uint256,uint256,uint256)
//   handler: handleBuyPortals

export function handleBuyPortals(event: BuyPortals): void {
  log.warning("[BUY PORTAL] Called", []);
  let buyer = getOrCreateUser(event.params._from.toHexString());
  let owner = getOrCreateUser(event.params._to.toHexString());

  let baseId = event.params._tokenId;

  for (let i = 0; i < event.params._numAavegotchisToPurchase.toI32(); i++) {
    let portal = getOrCreatePortal(baseId.plus(BigInt.fromI32(i)).toString());

    portal.status = "Bought";
    portal.owner = owner.id;
    portal.buyer = buyer.id;

    portal.save();
    log.warning("[BUY PORTAL] Created and saved portal {}", [portal.id]);
  }

  buyer.save();
  owner.save();
}

// - event: Xingyun(indexed address,indexed address,uint256,uint256,uint256)
//   handler: handleXingyun

export function handleXingyun(event: Xingyun): void {
  log.warning("[Xingyun] Called", []);
  let buyer = getOrCreateUser(event.params._from.toHexString());
  let owner = getOrCreateUser(event.params._to.toHexString());

  let baseId = event.params._tokenId;

  for (let i = 0; i < event.params._numAavegotchisToPurchase.toI32(); i++) {
    let portal = getOrCreatePortal(baseId.plus(BigInt.fromI32(i)).toString());

    portal.status = "Bought";
    portal.owner = owner.id;
    portal.buyer = buyer.id;

    portal.save();
    log.warning("[BUY PORTAL] Created and saved portal {}", [portal.id]);
  }

  buyer.save();
  owner.save();
}

// - event: PortalOpened(indexed uint256)
//   handler: handlePortalOpened

export function handlePortalOpened(event: PortalOpened): void {
  let contract = AavegotchiDiamond.bind(event.address);
  let portal = getOrCreatePortal(event.params.tokenId.toString());
  let response = contract.try_portalAavegotchiTraits(event.params.tokenId);

  log.warning("[PORTAL OPENED] Using portal {}", [portal.id]);

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

      gotchi.save();
      log.warning("Saved possible gotchi number {}", [
        BigInt.fromI32(i).toString()
      ]);
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
  gotchi.owner = portal.owner;

  gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);

  portal.gotchi = gotchi.id;
  portal.status = "Claimed";

  gotchi.save();
  portal.save();
}

// - event: IncreaseStake(indexed uint256,uint256)
//   handler: handleIncreaseStake

export function handleIncreaseStake(event: IncreaseStake): void {
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString());

  gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);

  gotchi.save();
}

// - event: DecreaseStake(indexed uint256,uint256)
//   handler: handleDecreaseStake

export function handleDecreaseStake(event: DecreaseStake): void {
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString());

  gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);

  gotchi.save();
}

// - event: SpendSkillpoints(indexed uint256,int8[4])
//   handler: handleSpendSkillpoints

export function handleSpendSkillpoints(event: SpendSkillpoints): void {
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString());

  gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);

  gotchi.save();
}

// - event: EquipWearables(indexed uint256,uint256,uint256)
//   handler: handleEquipWearables

export function handleEquipWearables(event: EquipWearables): void {
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString());

  gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);

  gotchi.save();
}

// - event: SetAavegotchiName(indexed uint256,string,string)
//   handler: handleSetAavegotchiName

export function handleSetAavegotchiName(event: SetAavegotchiName): void {
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString());

  gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);

  gotchi.save();
}

// - event: UseConsumables(indexed uint256,uint256[],uint256[])
//   handler: handleUseConsumables

export function handleUseConsumables(event: UseConsumables): void {
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString());

  gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);

  gotchi.save();
}

// - event: GrantExperience(uint256[],uint32[])
//   handler: handleGrantExperience

export function handleGrantExperience(event: GrantExperience): void {
  let ids = event.params._tokenIds;
  let gotchi = getOrCreateAavegotchi(ids[0].toString());
  for (let i = 0; i < ids.length; i++) {
    gotchi = getOrCreateAavegotchi(ids[i].toString());

    gotchi = updateAavegotchiInfo(gotchi, ids[i], event);

    gotchi.save();
  }
}
