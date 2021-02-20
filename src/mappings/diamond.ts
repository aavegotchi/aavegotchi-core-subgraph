import { BuyPortals } from "../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { getOrCreateUser, getOrCreatePortal, getOrCreateAavegotchi } from "../utils/helpers";
import { BigInt } from "@graphprotocol/graph-ts";

// - event: BuyPortals(indexed address,indexed address,uint256,uint256,uint256)
//   handler: handleBuyPortals

export function handleBuyPortals(event: BuyPortals): void {
  let buyer = getOrCreateUser(event.params._from.toHexString())
  let owner = getOrCreateUser(event.params._to.toHexString())

  let baseId = event.params._tokenId;

  for(let i = 0; i < event.params._numAavegotchisToPurchase.toI32(); i++) {
    let portal = getOrCreatePortal(baseId.plus(BigInt.fromI32(i)).toString())

    portal.status = "Bought"
    portal.owner = owner.id
    portal.buyer = buyer.id

    portal.save()
  }


  buyer.save()
  owner.save()
}
