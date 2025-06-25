import { BigInt, Address, ethereum, store } from "@graphprotocol/graph-ts";
import { ItemTypeOwnership } from "../../../generated/schema";

// Address of the actual wearable token contract
export const WEARABLE_TOKEN_ADDRESS = Address.fromString(
  "0x58de9AaBCaeEC0f69883C94318810ad79Cc6a44f"
);

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
