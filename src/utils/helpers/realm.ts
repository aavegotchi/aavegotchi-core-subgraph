import { Address } from "@graphprotocol/graph-ts";

import { Bytes } from "@graphprotocol/graph-ts";

import { Parcel } from "../../../generated/schema";
import { BIGINT_ZERO } from "../constants";
import { log } from "@graphprotocol/graph-ts";
// import { RealmDiamond } from "../../../generated/RealmDiamond/RealmDiamond";
import { getOrCreateUser } from "./aavegotchi";
import { BigInt } from "@graphprotocol/graph-ts";

export function getOrCreateParcel(
  tokenId: BigInt,
  owner: Bytes,
  tokenAddress: Address,
  updateParcelInfo: boolean = true
): Parcel {
  let parcel = Parcel.load(tokenId.toString());

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (parcel == null) {
    parcel = new Parcel(tokenId.toString());
    parcel.timesTraded = BIGINT_ZERO;
  }

  if (!updateParcelInfo) {
    return parcel;
  }

  log.debug("token address: {}", [tokenAddress.toHexString()]);

  let contract = /* RealmDiamond.bind(tokenAddress); */ undefined;
  if (!contract) return;

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
