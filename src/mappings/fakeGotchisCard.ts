import { ethereum, BigInt } from "@graphprotocol/graph-ts";

import {
    User,
    ERC1155Contract,
    Generation,
} from "../../generated/schema";

import {
    ApprovalForAll as ApprovalForAllEvent,
    TransferBatch as TransferBatchEvent,
    TransferSingle as TransferSingleEvent,
    URI as URIEvent,
    NewSeriesStarted as NewSeriesStartedEvent,
    NewSeriesStarted,
} from "../../generated/FAKEGotchisCardDiamond/IERC1155";

import {
    constants,
    decimals,
    events,
    transactions,
} from "@amxx/graphprotocol-utils";

import {
    fetchERC1155,
    fetchERC1155Token,
    fetchFakeGotchiCardBalance,
    replaceURI,
} from "../fetch/erc1155";
import { getOrCreateUser } from "../utils/helpers/diamond";

function registerTransfer(
    event: ethereum.Event,
    suffix: string,
    contract: ERC1155Contract,
    from: User,
    to: User,
    id: BigInt,
    value: BigInt
): void {
    let token = fetchERC1155Token(contract, id);

    if (from.id == constants.ADDRESS_ZERO.toHexString()) {
        let totalSupply = fetchFakeGotchiCardBalance(token, null);
        totalSupply.valueExact = totalSupply.valueExact.plus(value);
        totalSupply.value = decimals.toDecimals(totalSupply.valueExact);
        totalSupply.save();
    } else {
        let balance = fetchFakeGotchiCardBalance(token, from);
        balance.valueExact = balance.valueExact.minus(value);
        balance.value = decimals.toDecimals(balance.valueExact);
        balance.save();
    }

    if (to.id == constants.ADDRESS_ZERO.toHexString()) {
        let totalSupply = fetchFakeGotchiCardBalance(token, null);
        totalSupply.valueExact = totalSupply.valueExact.minus(value);
        totalSupply.value = decimals.toDecimals(totalSupply.valueExact);
        totalSupply.save();
    } else {
        let balance = fetchFakeGotchiCardBalance(token, to);
        balance.valueExact = balance.valueExact.plus(value);
        balance.value = decimals.toDecimals(balance.valueExact);
        balance.save();

    }

    token.save();
}

export function handleTransferSingle(event: TransferSingleEvent): void {
    let contract = fetchERC1155(event.address);
    let from = getOrCreateUser(event.params._from.toHex());
    let to = getOrCreateUser(event.params._to.toHex());

    registerTransfer(
        event,
        "",
        contract,
        from,
        to,
        event.params._id,
        event.params._value
    );
}

export function handleTransferBatch(event: TransferBatchEvent): void {
    let contract = fetchERC1155(event.address);
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
                contract,
                from,
                to,
                ids[i],
                values[i]
            );
        }
    }
}

export function handleURI(event: URIEvent): void {
    let contract = fetchERC1155(event.address);
    let token = fetchERC1155Token(contract, event.params._id);
    token.uri = replaceURI(event.params._value, event.params._id);
    token.save();
}

export function handleNewSeriesStarted(event: NewSeriesStarted): void {
    let series = new Generation(event.params.id.toString());
    series.amount = event.params.amount.toI32();
    series.save();
}
