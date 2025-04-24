import { Address } from "@graphprotocol/graph-ts";

import { updateOwnership } from "./helpers";
import {
  TransferBatch,
  TransferSingle,
} from "../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { PendingEquip } from "../../generated/schema";

export function handleTransferSingle(e: TransferSingle): void {
  const from = e.params._from;
  const to = e.params._to;

  // 1) Normal balance book-keeping
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

  // 2) If it went _into_ the diamond it MIGHT be an equip leg,
  //    so remember who sent it.
  if (to.equals(e.address)) {
    const key = `${e.transaction.hash.toHex()}-${e.logIndex.toString()}`;
    let p = new PendingEquip(key);
    p.sender = from; // wallet that paid the item
    p.itemId = e.params._id;
    p.amount = e.params._value;
    p.save();
  }
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
