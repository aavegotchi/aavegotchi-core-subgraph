import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { AavegotchiDiamond } from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { AavegotchiSVG } from "../../../generated/schema";

export function updateSvg(
  gotchi: BigInt,
  contractAddress: Address
): AavegotchiSVG | null {
  let contract = AavegotchiDiamond.bind(contractAddress);
  let svg = contract.try_getAavegotchiSvg(gotchi);
  if (svg.reverted) {
    return null; // just skip
  }

  let gotchiEntity = getOrCreateAavegotchi(gotchi);
  gotchiEntity.svg = svg.value;
  return gotchiEntity;
}

export function updateSideViews(
  gotchi: BigInt,
  contractAddress: Address
): AavegotchiSVG | null {
  let contract = AavegotchiDiamond.bind(contractAddress);
  let svgs = contract.try_getAavegotchiSideSvgs(gotchi);

  if (svgs.reverted) {
    return null; // just skip
  }
  let gotchiEntity = getOrCreateAavegotchi(gotchi);
  let svgsValue = svgs.value;
  gotchiEntity.svg = svgsValue[0];
  gotchiEntity.left = svgsValue[1];
  gotchiEntity.right = svgsValue[2];
  gotchiEntity.back = svgsValue[3];
  return gotchiEntity;
}

export function getOrCreateAavegotchi(gotchi: BigInt): AavegotchiSVG {
  let gotchiEntity = AavegotchiSVG.load(gotchi.toString());
  if (!gotchiEntity) {
    gotchiEntity = new AavegotchiSVG(gotchi.toString());
  }

  return gotchiEntity as AavegotchiSVG;
}
