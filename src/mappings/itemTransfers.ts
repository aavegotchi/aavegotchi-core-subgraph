import { Address } from "@graphprotocol/graph-ts";
import {
  TransferBatch,
  TransferSingle,
} from "../../generated/AavegotchiDiamond/AavegotchiDiamond";
import {
  updateOwnership,
  missingFromBaseSepolia,
} from "../utils/helpers/diamond";
import { log } from "@graphprotocol/graph-ts";

export function handleTransferSingle(event: TransferSingle): void {
  const from = event.params._from;
  const to = event.params._to;
  const id = event.params._id.toString();
  const amount = event.params._value;
  const timestamp = event.block.timestamp;

  // Debug logging for missing IDs from Base Sepolia
  if (missingFromBaseSepolia.includes(id)) {
    log.warning(
      "🔍 DEBUGGING: TransferSingle for missing ID {} - From: {} To: {} Amount: {} Block: {} TxHash: {}",
      [
        id,
        from.toHexString(),
        to.toHexString(),
        amount.toString(),
        event.block.number.toString(),
        event.transaction.hash.toHexString(),
      ]
    );
  }

  if (from.notEqual(Address.zero())) {
    updateOwnership(id, from, amount.neg(), timestamp);
  }

  if (to.notEqual(Address.zero())) {
    updateOwnership(id, to, amount, timestamp);
  }
}

export function handleTransferBatch(event: TransferBatch): void {
  const from = event.params._from;
  const to = event.params._to;
  const ids = event.params._ids;
  const amounts = event.params._values;
  const timestamp = event.block.timestamp;

  // Check if any of the IDs in the batch are in the missing list
  const missingIds: string[] = [];
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i].toString();
    if (missingFromBaseSepolia.includes(id)) {
      missingIds.push(id);
    }
  }

  if (missingIds.length > 0) {
    log.warning(
      "🔍 DEBUGGING: TransferBatch with missing IDs {} - From: {} To: {} Block: {} TxHash: {}",
      [
        missingIds.join(", "),
        from.toHexString(),
        to.toHexString(),
        event.block.number.toString(),
        event.transaction.hash.toHexString(),
      ]
    );
  }

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
