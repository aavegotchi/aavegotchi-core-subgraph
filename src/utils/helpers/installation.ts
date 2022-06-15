import { Address, BigInt } from "@graphprotocol/graph-ts";
import { InstallationDiamond } from "../../../generated/InstallationDiamond/InstallationDiamond";
import { InstallationType, TileType } from "../../../generated/schema";
import { TileDiamond } from "../../../generated/TileDiamond/TileDiamond";
import { BIGINT_ZERO, INSTALLATION_DIAMOND, TILE_DIAMOND } from "../constants";

export function getOrCreateInstallationType(
  id: string,
  createIfNotFound: boolean = true
): InstallationType {
  let installationType = InstallationType.load(id);

  if (installationType == null && createIfNotFound) {
    installationType = new InstallationType(id);
    installationType.consumed = BIGINT_ZERO;
    installationType.name = "";
    installationType.svgId = BIGINT_ZERO;
    installationType.ghstPrice = BIGINT_ZERO;
    installationType.maxQuantity = BIGINT_ZERO;
    installationType.totalQuantity = BIGINT_ZERO;
    installationType.rarityScoreModifier = 0;
    installationType.canPurchaseWithGhst = true;
    installationType.category = 6;
  }

  return installationType;
}

export function updateInstallationType(installationType: InstallationType): InstallationType | false {
    let contract = InstallationDiamond.bind(Address.fromString(INSTALLATION_DIAMOND));
    let response = contract.try_getInstallationType(BigInt.fromString(installationType.id));
    if(response.reverted) {
      return false;
    }

    installationType.name = response.value.name;
    installationType.deprecated = response.value.deprecated;
    return installationType;
}


