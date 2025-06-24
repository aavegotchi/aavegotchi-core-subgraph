import { Address } from "@graphprotocol/graph-ts";
import {
  TransferBatch,
  TransferSingle,
} from "../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { updateOwnership } from "../utils/helpers/diamond";

export function handleTransferSingle(event: TransferSingle): void {
  const from = event.params._from;
  const to = event.params._to;
  const id = event.params._id.toString();

  // if (from.notEqual(Address.zero())) {
  //   updateOwnership(id, from, amount.neg(), timestamp);
  // }

  if (to.notEqual(Address.zero())) {
    updateOwnership(id, to);
  }
}

export function handleTransferBatch(event: TransferBatch): void {
  const from = event.params._from;
  const to = event.params._to;
  const ids = event.params._ids;

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i].toString();

    // if (from.notEqual(Address.zero())) {
    //   updateOwnership(id, from, amount.neg(), timestamp);
    // }

    if (to.notEqual(Address.zero())) {
      updateOwnership(id, to);
    }
  }
}
