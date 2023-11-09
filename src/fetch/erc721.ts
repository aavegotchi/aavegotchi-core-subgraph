import {
    Address,
    BigInt,
    Bytes,
    JSONValue,
    TypedMap,
    log
} from "@graphprotocol/graph-ts";

import {
    User,
    FakeGotchiNFTToken,
} from "../../generated/schema";

import { constants } from "@amxx/graphprotocol-utils";

import { IERC721 } from "../../generated/FAKEGotchisNFTDiamond/IERC721";
import { getOrCreateUser } from "../utils/helpers/diamond";

export function fetchFakeGotchiNFTToken(
    contract: Address,
    identifier: BigInt
): FakeGotchiNFTToken {
    let id = contract
        .toHex()
        .concat("/")
        .concat(identifier.toHex());
    let token = FakeGotchiNFTToken.load(id);

    if (token == null) {
        token = new FakeGotchiNFTToken(id);
        token.contract = contract;
        token.identifier = identifier;
        token.approval = getOrCreateUser(constants.ADDRESS_ZERO.toHex()).id;

        let erc721 = IERC721.bind(Address.fromBytes(contract));
        let try_tokenURI = erc721.try_tokenURI(identifier);
        token.uri = try_tokenURI.reverted ? "" : try_tokenURI.value;
    }

    
    return token as FakeGotchiNFTToken;
}

export function getFakeGotchiNFTToken(
    contract: Address,
    identifier: BigInt
): FakeGotchiNFTToken | null {
    let id = contract
        .toHex()
        .concat("/")
        .concat(identifier.toHex());
    let token = FakeGotchiNFTToken.load(id);
    return token;
}