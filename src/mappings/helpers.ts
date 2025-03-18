import { BigInt, Address, ethereum, store } from "@graphprotocol/graph-ts";
import { ItemTypeOwnership } from "../../generated/schema";

const MIGRATION_BLOCK = BigInt.fromI32(35999793);
const AAVEGOTCHI_ADDRESS = Address.fromString(
  "0x86935F11C86623deC8a25696E1C19a8659CbF95d"
);

export function shouldSkipTransfer(event: ethereum.Event): boolean {
  if (
    event.address == AAVEGOTCHI_ADDRESS &&
    event.block.number.gt(MIGRATION_BLOCK)
  ) {
    return true;
  }

  return false;
}

export function updateOwnership(
  itemTypeId: string,
  owner: Address,
  amount: BigInt,
  timestamp: BigInt,
  contract: Address
): void {
  const ownershipId = `${itemTypeId}-${owner.toHexString()}`;
  let ownership = ItemTypeOwnership.load(ownershipId);

  if (!ownership) {
    ownership = new ItemTypeOwnership(ownershipId);
    ownership.itemType = itemTypeId;
    ownership.owner = owner;
    ownership.balance = BigInt.fromI32(0);
    ownership.contract = contract;
  }

  ownership.balance = ownership.balance.plus(amount);
  ownership.lastUpdated = timestamp;

  if (ownership.balance.equals(BigInt.fromI32(0))) {
    store.remove("ItemTypeOwnership", ownershipId);
  } else {
    ownership.save();
  }
}
