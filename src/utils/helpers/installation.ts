import { Address, BigInt } from "@graphprotocol/graph-ts";
import { InstallationDiamond } from "../../../generated/InstallationDiamond/InstallationDiamond";
import { InstallationType, TileType } from "../../../generated/schema";
import { TileDiamond } from "../../../generated/TileDiamond/TileDiamond";
import { BIGINT_ZERO, INSTALLATION_DIAMOND, TILE_DIAMOND } from "../constants";

export function getOrCreateInstallationType(
  id: string,
): InstallationType {
  let installationType = InstallationType.load(id);

  if (installationType == null) {
    installationType = new InstallationType(id);
    installationType.name = "";
    installationType.maxQuantity = BIGINT_ZERO;
    installationType.totalQuantity = BIGINT_ZERO;
    installationType.category = 4;
  }

  return installationType;
}

export function updateInstallationType(installationType: InstallationType): InstallationType | null {
    let contract = InstallationDiamond.bind(Address.fromString(INSTALLATION_DIAMOND));
    let response = contract.try_getInstallationType(BigInt.fromString(installationType.id));
    if(response.reverted) {
      return null;
    }

    installationType.name = response.value.name;
    installationType.deprecated = response.value.deprecated;
    return installationType;
}


