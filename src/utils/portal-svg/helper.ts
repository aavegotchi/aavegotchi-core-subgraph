import { Address, BigInt } from "@graphprotocol/graph-ts";
import { PortalSVG } from "../../../generated/schema";
import { AAVEGOTCHI_DIAMOND } from "../constants";
import { AavegotchiDiamond } from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";

export function getOrCreatePortal(portalId: BigInt): PortalSVG {
  let id = portalId.toString();
  let entity = PortalSVG.load(id);
  if (!entity) {
    entity = new PortalSVG(id);
    entity.svgs = [];
  }
  return entity;
}

export function fetchPortalSvgs(id: BigInt): Array<string> {
  let contract = AavegotchiDiamond.bind(Address.fromString(AAVEGOTCHI_DIAMOND));

  let svgsData = contract.try_portalAavegotchisSvg(id);
  if (svgsData.reverted) {
    return [];
  }

  let svgs = svgsData.value;
  return svgs;
}
