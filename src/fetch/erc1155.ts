import { Address, BigInt } from "@graphprotocol/graph-ts";

import {
    User,
    ERC1155Contract,
    ERC1155Token,
    ERC1155Balance,
} from "../../generated/schema";

import { IERC1155 } from "../../generated/FAKEGotchisCardDiamond/IERC1155";

import { constants } from "@amxx/graphprotocol-utils";
import { getOrCreateUser } from "../utils/helpers/diamond";

export function replaceURI(uri: string, identifier: BigInt): string {
    return uri.replaceAll(
        "{id}",
        identifier
            .toHex()
            .slice(2)
            .padStart(64, "0")
    );
}

export function fetchERC1155(address: Address): ERC1155Contract {
    let contract = ERC1155Contract.load(address);
    if (!contract) {
        contract = new ERC1155Contract(address);
        contract.asAccount = address.toHex();
        contract.save();

        let account = getOrCreateUser(address.toHex());
        account.asERC1155 = address;
        account.save();
    }

    return contract;
}

export function fetchERC1155Token(
    contract: ERC1155Contract,
    identifier: BigInt
): ERC1155Token {
    let id = contract.id
        .toHex()
        .concat("/")
        .concat(identifier.toHex());
    let token = ERC1155Token.load(id);

    if (token == null) {
        let erc1155 = IERC1155.bind(Address.fromBytes(contract.id));
        let try_uri = erc1155.try_uri(identifier);
        token = new ERC1155Token(id);
        token.contract = contract.id;
        token.identifier = identifier;
        token.totalSupply = fetchERC1155Balance(token as ERC1155Token, null).id;
        token.uri = try_uri.reverted
            ? null
            : replaceURI(try_uri.value, identifier);
        token.save();
    }

    return token as ERC1155Token;
}

export function fetchERC1155Balance(
    token: ERC1155Token,
    account: User | null
): ERC1155Balance {
    let id = token.id
        .concat("/")
        .concat(account ? account.id.toString() : "totalSupply");
    let balance = ERC1155Balance.load(id);

    if (balance == null) {
        balance = new ERC1155Balance(id);
        balance.contract = token.contract;
        balance.token = token.id;
        balance.account = account ? account.id : null;
        balance.value = constants.BIGDECIMAL_ZERO;
        balance.valueExact = constants.BIGINT_ZERO;
        balance.save();
    }

    return balance as ERC1155Balance;
}
