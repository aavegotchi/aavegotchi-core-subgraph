import {
  OpenPortals,
  PortalData,
  PortalOpened,
  Transfer,
} from "../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { fetchPortalSvgs, getOrCreatePortal } from "../utils/portal-svg/helper";

export function handlePortalOpened(event: PortalOpened): void {
  let id = event.params.tokenId;
  let entity = getOrCreatePortal(event.params.tokenId);
  let svgs = fetchPortalSvgs(id);
  entity.svgs = svgs;
  entity.save();
}

export function handleOpenPortals(event: OpenPortals): void {
  let ids = event.params._tokenIds;
  for (let i = 0; i < ids.length; i++) {
    let id = ids[i];
    let entity = getOrCreatePortal(id);
    let svgs = fetchPortalSvgs(id);
    entity.svgs = svgs;
    entity.save();
  }
}

export function handleTransfer(event: Transfer): void {
  let id = event.params._tokenId;
  let entity = getOrCreatePortal(id);
  let svgs = fetchPortalSvgs(id);
  entity.svgs = svgs;
  entity.save();
}

export function handlePortalData(event: PortalData): void {
  const data = event.params.data;
  if (data.options.length > 0) {
    let id = data.gotchiId;
    let entity = getOrCreatePortal(id);
    let svgs = fetchPortalSvgs(id);

    entity.svgs = svgs;
    entity.save();
  }
}
