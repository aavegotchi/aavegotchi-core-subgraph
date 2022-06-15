import { Address, BigInt } from "@graphprotocol/graph-ts";
import { TileType } from "../../../generated/schema";
import { TileDiamond } from "../../../generated/TileDiamond/TileDiamond";
import { BIGINT_ZERO, TILE_DIAMOND } from "../constants";

export function getOrCreateTileType(
  id: string
): TileType {
  let tileType = TileType.load(id);

  if (tileType == null) {
    tileType = new TileType(id);
    tileType.consumed = BIGINT_ZERO;
    tileType.name = "";
    tileType.svgId = BIGINT_ZERO;
    tileType.ghstPrice = BIGINT_ZERO;
    tileType.maxQuantity = BIGINT_ZERO;
    tileType.totalQuantity = BIGINT_ZERO;
    tileType.rarityScoreModifier = 0;
    tileType.canPurchaseWithGhst = true;
    tileType.category = 5;
  }

  return tileType
}

export function updateTileType(tileType: TileType): TileType | null {
    let contract = TileDiamond.bind(Address.fromString(TILE_DIAMOND));
    let response = contract.try_getTileType(BigInt.fromString(tileType.id));
    if(response.reverted) {
      return null;
    }

    tileType.name = response.value.name;
    tileType.deprecated = response.value.deprecated;
    return tileType;
}


