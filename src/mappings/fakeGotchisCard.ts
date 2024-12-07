import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts";

import { User, Generation } from "../../generated/schema";

import {
  TransferBatch as TransferBatchEvent,
  TransferSingle as TransferSingleEvent,
  NewSeriesStarted,
} from "../../generated/FAKEGotchisCardDiamond/IERC1155";

import { constants, decimals } from "@amxx/graphprotocol-utils";

import { fetchFakeGotchiCardBalance } from "../utils/helpers/fakegotchis";
import { getOrCreateUser } from "../utils/helpers/aavegotchi";

function registerTransfer(
  event: ethereum.Event,
  suffix: string,
  contract: Address,
  from: User,
  to: User,
  id: BigInt,
  value: BigInt
): void {
  if (from.id == constants.ADDRESS_ZERO.toHexString()) {
    let totalSupply = fetchFakeGotchiCardBalance(id, null, contract);
    totalSupply.valueExact = totalSupply.valueExact.plus(value);
    totalSupply.value = decimals.toDecimals(totalSupply.valueExact);
    totalSupply.save();
  } else {
    let balance = fetchFakeGotchiCardBalance(id, from, contract);
    balance.valueExact = balance.valueExact.minus(value);
    balance.value = decimals.toDecimals(balance.valueExact);
    balance.save();
  }

  if (to.id == constants.ADDRESS_ZERO.toHexString()) {
    let totalSupply = fetchFakeGotchiCardBalance(id, null, contract);
    totalSupply.valueExact = totalSupply.valueExact.minus(value);
    totalSupply.value = decimals.toDecimals(totalSupply.valueExact);
    totalSupply.save();
  } else {
    let balance = fetchFakeGotchiCardBalance(id, to, contract);
    balance.valueExact = balance.valueExact.plus(value);
    balance.value = decimals.toDecimals(balance.valueExact);
    balance.save();
  }
}

export function handleTransferSingle(event: TransferSingleEvent): void {
  let from = getOrCreateUser(event.params._from.toHex());
  let to = getOrCreateUser(event.params._to.toHex());

  registerTransfer(
    event,
    "",
    event.address,
    from,
    to,
    event.params._id,
    event.params._value
  );
}

export function handleTransferBatch(event: TransferBatchEvent): void {
  let from = getOrCreateUser(event.params._from.toHex());
  let to = getOrCreateUser(event.params._to.toHex());

  let ids = event.params._ids;
  let values = event.params._values;

  // If this equality doesn't hold (some devs actually don't follox the ERC specifications) then we just can't make
  // sens of what is happening. Don't try to make something out of stupid code, and just throw the event. This
  // contract doesn't follow the standard anyway.
  if (ids.length == values.length) {
    for (let i = 0; i < ids.length; ++i) {
      registerTransfer(
        event,
        "/".concat(i.toString()),
        event.address,
        from,
        to,
        ids[i],
        values[i]
      );
    }
  }
}

export function handleNewSeriesStarted(event: NewSeriesStarted): void {
  let series = new Generation(event.params.id.toString());
  series.amount = event.params.amount.toI32();
  series.save();
}
