import {
  BuyPortals,
  PortalOpened,
  AavegotchiDiamond as DiamondContract
} from "../../generated/AavegotchiDiamond/AavegotchiDiamond";
import {
  getOrCreateUser,
  getOrCreatePortal,
  getOrCreateAavegotchi
} from "../utils/helpers";
import { BigInt } from "@graphprotocol/graph-ts";

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

  // struct PortalAavegotchiTraitsIO {
  //      uint256 randomNumber;
  //      int256[] numericTraits;
  //      uint256 numericTraitsUint;
  //      address collateralType;
  //      uint256 minimumStake;
  //  }

  if (!response.reverted) {
    let array = response.value;
    // Assigning the first option just to get the proper types for the variables. Can be optimized later
    let possibleAavegotchiTraits = array[0];
    let aavegotchi = getOrCreateAavegotchi(
      portal.id.concat("-").concat(BigInt.fromI32(0).toString())
    );

    for (let i = 0; i < array.length; i++) {
      possibleAavegotchiTraits = array[i];
      aavegotchi = getOrCreateAavegotchi(
        portal.id.concat("-").concat(BigInt.fromI32(i).toString())
      );
      aavegotchi.portal = portal.id;
      aavegotchi.owner = portal.owner;
      aavegotchi.status = "Open";
      aavegotchi.randomNumber = possibleAavegotchiTraits.randomNumber;
      aavegotchi.numericTraits = possibleAavegotchiTraits.numericTraits;
      aavegotchi.numericTraitsUint = possibleAavegotchiTraits.numericTraitsUint;
      aavegotchi.collateralType = possibleAavegotchiTraits.collateralType;
      aavegotchi.minimumStake = possibleAavegotchiTraits.minimumStake;

      aavegotchi.save();
    }
  }

  portal.status = "Open";
  portal.save();
}
