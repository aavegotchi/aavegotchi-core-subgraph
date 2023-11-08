import {
    Address,
    BigInt,
    Bytes,
    JSONValue,
    TypedMap
} from "@graphprotocol/graph-ts";

import {
    User,
    FakeGotchiNFTContract,
    FakeGotchiNFTToken,
} from "../../generated/schema";

import { constants } from "@amxx/graphprotocol-utils";

import { IERC721 } from "../../generated/FAKEGotchisNFTDiamond/IERC721";
import { getOrCreateUser } from "../utils/helpers/diamond";

export function fetchERC721(address: Address): FakeGotchiNFTContract | null {
    let erc721 = IERC721.bind(address);

    // Try load entry
    let contract = FakeGotchiNFTContract.load(address);
    if (contract != null) {
        return contract;
    }

    // Detect using ERC165
    let detectionId = address.concat(Bytes.fromHexString("80ac58cd")); // Address + ERC721
    let detectionAccount = User.load(detectionId.toHex());

    // On missing cache
    if (detectionAccount == null) {
        detectionAccount = new User(detectionId.toHex());
        detectionAccount.gotchisLentOut = new Array<BigInt>();
        detectionAccount.gotchisBorrowed = new Array<BigInt>();

        detectionAccount.fakeGotchis = "{}";
        let introspection_01ffc9a7 = true;
        let introspection_80ac58cd = true;
        let introspection_00000000 = true;
        let isERC721 =
            introspection_01ffc9a7 &&
            introspection_80ac58cd &&
            introspection_00000000;
        detectionAccount.asERC721 = isERC721 ? address : null;

        detectionAccount.amountFakeGotchis = 0;

        detectionAccount.currentUniquePiecesOwned = 0;
        detectionAccount.currentUniquePiecesOwnedArray = "{}";
        detectionAccount.totalUniquePiecesOwned = 0;
        detectionAccount.totalUniquePiecesOwnedArray = "{}";

        detectionAccount.totalPiecesOwnedArray = "{}";

        detectionAccount.save();
    }

    // If an ERC721, build entry
    if (detectionAccount.asERC721) {
        contract = new FakeGotchiNFTContract(address);
        let try_name = erc721.try_name();
        let try_symbol = erc721.try_symbol();
        contract.name = try_name.reverted ? "" : try_name.value;
        contract.symbol = try_symbol.reverted ? "" : try_symbol.value;
        contract.supportsMetadata = true;
        contract.asAccount = address.toHex();
        contract.save();

        let account = getOrCreateUser(address.toHex());
        account.asERC721 = address;
        account.save();
    }

    return contract;
}

export function fetchFakeGotchiNFTToken(
    contract: FakeGotchiNFTContract,
    identifier: BigInt
): FakeGotchiNFTToken {
    let id = contract.id
        .toHex()
        .concat("/")
        .concat(identifier.toHex());
    let token = FakeGotchiNFTToken.load(id);

    if (token == null) {
        token = new FakeGotchiNFTToken(id);
        token.contract = contract.id;
        token.identifier = identifier;
        token.approval = getOrCreateUser(constants.ADDRESS_ZERO.toHex()).id;

        if (contract.supportsMetadata) {
            let erc721 = IERC721.bind(Address.fromBytes(contract.id));
            let try_tokenURI = erc721.try_tokenURI(identifier);
            token.uri = try_tokenURI.reverted ? "" : try_tokenURI.value;
        }
    }

    return token as FakeGotchiNFTToken;
}