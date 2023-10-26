import { OwnershipTransferred } from "@openzeppelin/subgraphs/generated/schema";

import { OwnershipTransferred as OwnershipTransferredEvent } from "@openzeppelin/subgraphs/generated/ownable/Ownable";

import { events, transactions } from "@amxx/graphprotocol-utils";

import { fetchOwnable } from "@openzeppelin/subgraphs/src/fetch/ownable";
import { getOrCreateUser } from "../utils/helpers/diamond";
import { Bytes } from "@graphprotocol/graph-ts";

export function handleOwnershipTransferred(
    event: OwnershipTransferredEvent
): void {
    let contract = fetchOwnable(event.address);
    let owner = getOrCreateUser(event.params.newOwner.toHex());

    contract.owner = Bytes.fromHexString(owner.id);
    contract.save();

    let ev = new OwnershipTransferred(events.id(event));
    ev.emitter = contract.id;
    ev.transaction = transactions.log(event).id;
    ev.timestamp = event.block.timestamp;
    ev.contract = contract.id;
    ev.owner = Bytes.fromHexString(owner.id);
    ev.save();
}
