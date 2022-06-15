// - event: MintTile(indexed address,indexed uint256,uint256)
// handler: handleMintTile

import { MintTile } from "../../generated/TileDiamond/TileDiamond";
import { BIGINT_ONE } from "../utils/constants";
import { getOrCreateTileType, updateTileType } from "../utils/helpers/tile";

export function handleMintTile(event: MintTile): void {
  let type = getOrCreateTileType(event.params._tileId.toString());
  type.maxQuantity = type.maxQuantity.plus(BIGINT_ONE);
  type.totalQuantity = type.totalQuantity.plus(BIGINT_ONE);
  let updatedType = updateTileType(type);
  if(updatedType) {
    updatedType.save();
  } else {
    type.save();
  }
}
