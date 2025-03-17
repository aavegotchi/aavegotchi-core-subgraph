import { BigInt, Address } from "@graphprotocol/graph-ts";

import { shouldSkipTransfer, updateOwnership } from "./helpers";
import {
  TransferBatch,
  TransferSingle,
} from "../../generated/AavegotchiDiamond/AavegotchiDiamond";

export function handleTransferSingle(event: TransferSingle): void {
  if (shouldSkipTransfer(event)) {
    return;
  }

  const from = event.params._from;
  const to = event.params._to;
  const id = event.params._id.toString();
  const amount = event.params._value;
  const timestamp = event.block.timestamp;
  const contract = event.address;

  if (from.notEqual(Address.zero())) {
    updateOwnership(id, from, amount.neg(), timestamp, contract);
  }

  if (to.notEqual(Address.zero())) {
    updateOwnership(id, to, amount, timestamp, contract);
  }
}

export function handleTransferBatch(event: TransferBatch): void {
  if (shouldSkipTransfer(event)) return;

  const from = event.params._from;
  const to = event.params._to;
  const ids = event.params._ids;
  const amounts = event.params._values;
  const timestamp = event.block.timestamp;
  const contract = event.address;

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i].toString();
    const amount = amounts[i];

    if (from.notEqual(Address.zero())) {
      updateOwnership(id, from, amount.neg(), timestamp, contract);
    }

    if (to.notEqual(Address.zero())) {
      updateOwnership(id, to, amount, timestamp, contract);
    }
  }
}
