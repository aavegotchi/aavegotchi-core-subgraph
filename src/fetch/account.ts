import { Address, BigInt, Bytes, json, log } from "@graphprotocol/graph-ts";

import {
    User,
    MetadataActionLog,
    NFTStatistic,
    Statistic,
} from "../../generated/schema";
import { BIGINT_ONE, BIGINT_ZERO } from "../constants";
import { createJsonFromJSONObject } from "../helper/json";

export function updateAccountStatsFrom(
    account: User,
    metadataId: string
): User {
    const parsedJsonCurrent = json.fromString(
        account.currentUniquePiecesOwnedArray
    );
    const jsonObjCurrent = parsedJsonCurrent.toObject();

    // fetch amount of first series
    const entryCurrent = jsonObjCurrent.get(metadataId);

    let newAmount = BIGINT_ONE;
    if (entryCurrent) {
        newAmount = entryCurrent.toBigInt().minus(BIGINT_ONE);
    }
    if (newAmount.equals(BIGINT_ZERO)) {
        account.currentUniquePiecesOwned = account.currentUniquePiecesOwned - 1;
    }

    // received on token of that series, therefore +1
    jsonObjCurrent.set(metadataId, json.fromString(newAmount.toString()));

    let newString = createJsonFromJSONObject(jsonObjCurrent);

    account.currentUniquePiecesOwnedArray = newString;

    return account;
}

export function updateAccountStatsTo(
    account: User,
    metadataId: string
): User {
    const parsedJsonTotal = json.fromString(
        account.totalUniquePiecesOwnedArray
    );
    const jsonObjTotal = parsedJsonTotal.toObject();

    const parsedJsonCurrent = json.fromString(
        account.currentUniquePiecesOwnedArray
    );
    const jsonObjCurrent = parsedJsonCurrent.toObject();

    if (jsonObjTotal == null || jsonObjCurrent == null) {
        return account;
    }

    // fetch amount of first series
    const entryTotal = jsonObjTotal.get(metadataId);
    const entryCurrent = jsonObjCurrent.get(metadataId);

    let newAmount = BIGINT_ONE;
    if (entryCurrent) {
        newAmount = entryCurrent.toBigInt().plus(BIGINT_ONE);
    }

    if (!entryTotal) {
        account.totalUniquePiecesOwned = account.totalUniquePiecesOwned + 1;
        jsonObjTotal.set(metadataId, json.fromString(newAmount.toString()));
    }

    // update currentPiecesOwned
    if (newAmount.equals(BIGINT_ONE)) {
        // new piece
        account.currentUniquePiecesOwned = account.currentUniquePiecesOwned + 1;
    }

    // received on token of that series, therefore +1
    jsonObjCurrent.set(metadataId, json.fromString(newAmount.toString()));

    // create new json object string
    let newString = createJsonFromJSONObject(jsonObjTotal);

    account.totalUniquePiecesOwnedArray = newString;

    newString = createJsonFromJSONObject(jsonObjCurrent);

    account.currentUniquePiecesOwnedArray = newString;

    return account;
}

export function updateTotalStatsMint(
    stats: Statistic,
    metaData: MetadataActionLog
): Statistic {
    const parsedJsonTotal = json.fromString(
        stats.totalEditionsCirculatingArray
    );
    const jsonObjTotal = parsedJsonTotal.toObject();
    const element = jsonObjTotal.get(metaData.id);
    if (!element) {
        stats.totalEditionsCirculating = stats.totalEditionsCirculating + 1;
        jsonObjTotal.set(metaData.id, json.fromString("1"));
        stats.totalEditionsMinted = stats.totalEditionsMinted + 1;
    } else {
        const newAmount = element.toI64() + 1;
        if (newAmount == 1) {
            stats.totalEditionsCirculating = stats.totalEditionsCirculating + 1;
        }
        jsonObjTotal.set(metaData.id, json.fromString(newAmount.toString()));
    }

    stats.totalEditionsCirculatingArray = createJsonFromJSONObject(
        jsonObjTotal
    );

    stats.totalNFTs = stats.totalNFTs + 1;

    return stats;
}

export function updateTotalStatsBurn(
    stats: Statistic,
    metaData: MetadataActionLog
): Statistic {
    const parsedJsonTotal = json.fromString(
        stats.totalEditionsCirculatingArray
    );
    const jsonObjTotal = parsedJsonTotal.toObject();
    const element = jsonObjTotal.get(metaData.id);
    if (element) {
        const newAmount = element.toI64() - 1;
        if (newAmount == 0) {
            stats.totalEditionsCirculating = stats.totalEditionsCirculating - 1;
        }

        jsonObjTotal.set(metaData.id, json.fromString(newAmount.toString()));
    }

    stats.totalEditionsCirculatingArray = createJsonFromJSONObject(
        jsonObjTotal
    );

    stats.totalNFTs = stats.totalNFTs - 1;
    stats.burnedNFTs = stats.burnedNFTs + 1;
    return stats;
}

export function addToOwnersIfNotExists(
    totalStats: Statistic,
    owner: Bytes
): Statistic {
    let ownersArray = totalStats.totalOwnersArray;
    if (ownersArray.indexOf(owner) == -1) {
        ownersArray.push(owner);
        totalStats.totalOwnersArray = ownersArray;
        totalStats.totalOwners = ownersArray.length;
    }

    return totalStats;
}

export function removeFromOwnersIfExistsAndBalanceNotZero(
    totalStats: Statistic,
    owner: Bytes,
    amount: i32
): Statistic {
    if (amount > 0) {
        return totalStats;
    }

    let ownersArray = totalStats.totalOwnersArray;
    let index = ownersArray.indexOf(owner);
    if (index != -1) {
        ownersArray.splice(index, 1);
        totalStats.totalOwnersArray = ownersArray;
        totalStats.totalOwners = ownersArray.length;
    }

    return totalStats;
}
