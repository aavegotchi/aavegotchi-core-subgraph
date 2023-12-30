import { Address, BigInt } from "@graphprotocol/graph-ts";

import {
    User,
    FakeGotchiCardBalance,
} from "../../generated/schema";

import { constants } from "@amxx/graphprotocol-utils";

export function replaceURI(uri: string, identifier: BigInt): string {
    return uri.replaceAll(
        "{id}",
        identifier
            .toHex()
            .slice(2)
            .padStart(64, "0")
    );
}

export function fetchFakeGotchiCardBalance(
    token: BigInt,
    account: User | null,
    contract: Address
): FakeGotchiCardBalance {
    let id = token.toString()
        .concat("/")
        .concat(account ? account.id.toString() : "totalSupply");
    let balance = FakeGotchiCardBalance.load(id);

    if (balance == null) {
        balance = new FakeGotchiCardBalance(id);
        balance.contract = contract;
        balance.token = token;
        balance.account = account ? account.id : null;
        balance.value = constants.BIGDECIMAL_ZERO;
        balance.valueExact = constants.BIGINT_ZERO;
        balance.save();
    }

    return balance as FakeGotchiCardBalance;
}
