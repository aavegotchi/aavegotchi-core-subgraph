import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { Transfer } from "../../generated/FAKEGotchisNFTDiamond/IERC721";
import {
    NFTHolder,
    NFTStatistic,
    Statistic
} from "../../generated/schema";
import { ADDRESS_BURN, ADDRESS_DEAD, ADDRESS_ZERO, BIGINT_ZERO } from "../constants";

// export function getOrCreateCard(id: BigInt): Card

export function getOrCreateStats(): Statistic {
    let stat = Statistic.load("0");
    if (!stat) {
        stat = new Statistic("0");
        stat.burnedCards = 0;
        stat.burnedNFTs = 0;
        stat.totalNFTs = 0;
        stat.totalOwners = 0;
        stat.totalFakeGotchiPieces = 0;
        stat.totalNFTsArray = "{}";
        stat.totalOwnersArray = new Array<Bytes>();
        stat.tokenIdCounter = 0;
        stat.totalEditionsCirculating = 0;
        stat.totalEditionsMinted = 0;
        stat.totalEditionsCirculatingArray = "{}";

        stat.portalsBought = BIGINT_ZERO;
        stat.portalsOpened = BIGINT_ZERO;
        stat.aavegotchisClaimed = BIGINT_ZERO;
        stat.erc721ActiveListingCount = BIGINT_ZERO;
        stat.erc1155ActiveListingCount = BIGINT_ZERO;
        stat.erc721TotalVolume = BIGINT_ZERO;
        stat.erc1155TotalVolume = BIGINT_ZERO;

        //new
        stat.totalWearablesVolume = BIGINT_ZERO;
        stat.totalConsumablesVolume = BIGINT_ZERO;
        stat.totalTicketsVolume = BIGINT_ZERO;

        stat.aavegotchisBorrowed = BIGINT_ZERO;
        stat.aavegotchisSacrificed = BIGINT_ZERO;
    }

    return stat;
}

export function getOrCreateNFTStatistic(metadataId: string): NFTStatistic {
    let stat = NFTStatistic.load(metadataId);
    if (!stat) {
        stat = new NFTStatistic(metadataId);
        stat.burned = 0;
        stat.metadata = metadataId;
        stat.amountHolder = 0;
        stat.totalSupply = 0;
        stat.tokenIds = new Array<BigInt>();
    }

    return stat;
}

export function getNFTHolder(
    holderAddress: Address,
    metadataId: string
): NFTHolder {
    let id = holderAddress.toHexString() + "-" + metadataId;
    let holder = NFTHolder.load(id);
    if (!holder) {
        holder = new NFTHolder(id);
        holder.amount = 0;
        holder.holder = holderAddress;
        holder.nftStats = metadataId;
    }

    return holder;
}

export function isMint(event: Transfer): boolean {
    let from = event.params._from;

    if ([ADDRESS_ZERO, ADDRESS_BURN].indexOf(from) !== -1) {
        return true;
    }

    return false;
}

export function isBurn(event: Transfer): boolean {
    let to = event.params._to;

    if ([ADDRESS_ZERO, ADDRESS_BURN, ADDRESS_DEAD].indexOf(to) !== -1) {
        return true;
    }

    return false;
}

export function isTransfer(event: Transfer): boolean {
    if (!isBurn(event) && !isMint(event)) {
        return true;
    }

    return false;
}
