import { BigInt, Address, ethereum, store } from "@graphprotocol/graph-ts";
import { ItemTypeOwnership } from "../../generated/schema";

const MIGRATION_BLOCK = BigInt.fromI32(35999793);
const AAVEGOTCHI_ADDRESS = Address.fromString(
  "0x86935F11C86623deC8a25696E1C19a8659CbF95d"
);

// Address of the actual wearable token contract
export const WEARABLE_TOKEN_ADDRESS = Address.fromString(
  "0x58de9AaBCaeEC0f69883C94318810ad79Cc6a44f"
);

export function shouldSkipTransfer(event: ethereum.Event): boolean {
  if (!isWearableTransfer(event.address)) return true;

  // if (
  //   event.address == AAVEGOTCHI_ADDRESS &&
  //   event.block.number.gt(MIGRATION_BLOCK)
  // ) {
  //   return true;
  // }

  return false;
}

export function updateOwnership(
  itemTypeId: string,
  owner: Address,
  amount: BigInt,
  timestamp: BigInt
): void {
  const ownershipId = `${itemTypeId}-${owner.toHexString()}`;
  let ownership = ItemTypeOwnership.load(ownershipId);

  if (!ownership) {
    ownership = new ItemTypeOwnership(ownershipId);
    ownership.itemType = itemTypeId;
    ownership.owner = owner;
    ownership.balance = BigInt.fromI32(0);
  }

  ownership.balance = ownership.balance.plus(amount);
  ownership.lastUpdated = timestamp;

  if (ownership.balance.equals(BigInt.fromI32(0))) {
    store.remove("ItemTypeOwnership", ownershipId);
  } else {
    ownership.save();
  }
}

export function isWearableTransfer(tokenAddress: Address): boolean {
  // Check if the token address in the event matches the wearable token address
  return (
    tokenAddress.equals(WEARABLE_TOKEN_ADDRESS) ||
    tokenAddress.equals(AAVEGOTCHI_ADDRESS)
  );
}
