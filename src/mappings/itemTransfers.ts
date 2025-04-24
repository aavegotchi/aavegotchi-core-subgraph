import { Address } from "@graphprotocol/graph-ts";

import { AAVEGOTCHI_ADDRESS, updateOwnership } from "./helpers";
import {
  TransferBatch,
  TransferSingle,
} from "../../generated/AavegotchiDiamond/AavegotchiDiamond";

export function handleTransferSingle(e: TransferSingle): void {
  const from = e.params._from;
  const to = e.params._to;

  // prevent updating balances when equipping/unequipping and delegating?
  if (to.equals(AAVEGOTCHI_ADDRESS)) return;

  if (from.notEqual(Address.zero()))
    updateOwnership(
      e.params._id.toString(),
      from,
      e.params._value.neg(),
      e.block.timestamp
    );

  if (to.notEqual(Address.zero()))
    updateOwnership(
      e.params._id.toString(),
      to,
      e.params._value,
      e.block.timestamp
    );
}

export function handleTransferBatch(event: TransferBatch): void {
  const from = event.params._from;
  const to = event.params._to;
  const ids = event.params._ids;
  const amounts = event.params._values;
  const timestamp = event.block.timestamp;

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i].toString();
    const amount = amounts[i];

    if (from.notEqual(Address.zero())) {
      updateOwnership(id, from, amount.neg(), timestamp);
    }

    if (to.notEqual(Address.zero())) {
      updateOwnership(id, to, amount, timestamp);
    }
  }
}
