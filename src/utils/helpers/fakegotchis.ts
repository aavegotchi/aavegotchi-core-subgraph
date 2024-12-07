import { Address } from "@graphprotocol/graph-ts";
import {
  FakeGotchiCardBalance,
  FakeGotchiNFTToken,
  User,
} from "../../../generated/schema";
import { getOrCreateUser } from "./aavegotchi";
import { constants } from "@amxx/graphprotocol-utils";
import { BigInt } from "@graphprotocol/graph-ts";
import { AavegotchiDiamond } from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";

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

    let erc721 = AavegotchiDiamond.bind(Address.fromBytes(contract));
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

export function fetchFakeGotchiCardBalance(
  token: BigInt,
  account: User | null,
  contract: Address
): FakeGotchiCardBalance {
  let id = token
    .toString()
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
