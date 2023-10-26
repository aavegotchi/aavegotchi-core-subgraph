import {
    ERC721Transfer,
    MetadataActionLog,
    MetadataDecline,
    MetadataFlag,
    MetadataLike,
    ReviewPass
} from "../../generated/schema";

import {
    MetadataActionLog as MetadataActionLogEvent,
    MetadataLike as MetadataLikeEvent,
    MetadataDecline as MetadataDeclineEvent,
    ReviewPass as ReviewPassEvent,
    Approval as ApprovalEvent,
    ApprovalForAll as ApprovalForAllEvent,
    Transfer as TransferEvent,
    MetadataFlag as MetadataFlagEvent
} from "../../generated/FAKEGotchisNFTDiamond/IERC721";
import { events, transactions } from "@amxx/graphprotocol-utils";

import {
    addToOwnersIfNotExists,
    removeFromOwnersIfExistsAndBalanceNotZero,
    updateAccountStatsFrom,
    updateAccountStatsTo,
    updateTotalStatsBurn,
    updateTotalStatsMint
} from "../fetch/account";


import {
    METADATA_STATUS_APPROVED,
    METADATA_STATUS_DECLINED,
    METADATA_STATUS_PAUSED,
    METADATA_STATUS_PENDING
} from "../constants";

import {
    fetchERC721,
    fetchERC721Token,
    fetchERC721Operator
} from "../fetch/erc721";
import { BigInt } from "@graphprotocol/graph-ts";
import {
    getNFTHolder,
    getOrCreateNFTStatistic,
    getOrCreateStats,
    isBurn,
    isMint,
    isTransfer
} from "../helper/entities";
import { getOrCreateUser } from "../utils/helpers/diamond";

export function handleTransfer(event: TransferEvent): void {
    const isMintFlag = isMint(event);
    const isBurnFlag = isBurn(event);
    const isTransferFlag = isTransfer(event);

    // fetch contract
    const contract = fetchERC721(event.address);
    if (contract == null) {
        return;
    }
    contract.save();

    // fetch sender and receiver
    let from = getOrCreateUser(event.params._from.toHexString());
    let to = getOrCreateUser(event.params._to.toHexString());

    // update token owner
    let token = fetchERC721Token(contract, event.params._tokenId);
    token.owner = to.id;
    token.save();

    // create event entity
    let ev = new ERC721Transfer(events.id(event));
    ev.emitter = contract.id.toHexString();
    ev.transaction = transactions.log(event).id;
    ev.timestamp = event.block.timestamp;
    ev.contract = contract.id;
    ev.token = token.id;
    ev.from = from.id;
    ev.to = to.id;
    ev.save();

    // fetch metadata
    let metadata = MetadataActionLog.load(token.metadata!)!;
    let nftStats = getOrCreateNFTStatistic(metadata.id);

    let stats = getOrCreateStats();
    // update account entity
    if (isMintFlag || isTransferFlag) {
        to = updateAccountStatsTo(to, metadata.id);
        to.amountTokens = to.amountTokens + 1;

        let receiver = getNFTHolder(event.params._to, metadata.id);
        receiver.amount = receiver.amount + 1;
        receiver.save();

        // nftStats = updateHolderMint(nftStats, event.params._to, 1);
        if (receiver.amount == 1) {
            nftStats.amountHolder = nftStats.amountHolder + 1;
        }

        stats = addToOwnersIfNotExists(stats, event.params._to);
    }

    if (isBurnFlag || isTransferFlag) {
        from = updateAccountStatsFrom(from, metadata.id);
        from.amountTokens = from.amountTokens - 1;

        let sender = getNFTHolder(event.params._from, metadata.id);
        sender.amount = sender.amount - 1;
        sender.save();

        if (sender.amount == 0) {
            nftStats.amountHolder = nftStats.amountHolder - 1;
        }

        stats = removeFromOwnersIfExistsAndBalanceNotZero(
            stats,
            event.params._from,
            from.amountTokens
        );
    }

    if (isMintFlag) {
        stats = updateTotalStatsMint(stats, metadata);

        nftStats.totalSupply = nftStats.totalSupply + 1;
        let tokens = nftStats.tokenIds;
        tokens.push(event.params._tokenId);
        nftStats.tokenIds = tokens;
    }

    if (isBurnFlag) {
        stats = updateTotalStatsBurn(stats, metadata);

        nftStats.burned = nftStats.burned + 1;
        nftStats.totalSupply = nftStats.totalSupply - 1;

        let tokens = nftStats.tokenIds;
        let index = tokens.indexOf(event.params._tokenId);
        tokens.splice(index, 1);
        nftStats.tokenIds = tokens;

        token.editions = token.editions - 1;

        metadata.editions = metadata.editions - 1;
    }

    nftStats.save();
    metadata.save();
    stats.save();
    to.save();
    from.save();
}

export function handleApproval(event: ApprovalEvent): void {
    let contract = fetchERC721(event.address);
    if (contract != null) {
        let token = fetchERC721Token(contract, event.params._tokenId);
        let owner = getOrCreateUser(event.params._owner.toHexString());
        let approved = getOrCreateUser(event.params._approved.toHexString());

        token.owner = owner.id;
        token.approval = approved.id;

        token.save();
        owner.save();
        approved.save();

        // let ev = new Approval(events.id(event))
        // ev.emitter     = contract.id
        // ev.transaction = transactions.log(event).id
        // ev.timestamp   = event.block.timestamp
        // ev.token       = token.id
        // ev.owner       = owner.id
        // ev.approved    = approved.id
        // ev.save()
    }
}

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
    let contract = fetchERC721(event.address);
    if (contract != null) {
        let owner = getOrCreateUser(event.params._owner.toHexString());
        let operator = getOrCreateUser(event.params._operator.toHexString());
        let delegation = fetchERC721Operator(contract, owner, operator);

        delegation.approved = event.params._approved;

        delegation.save();

        // 	let ev = new ApprovalForAll(events.id(event))
        // 	ev.emitter     = contract.id
        // 	ev.transaction = transactions.log(event).id
        // 	ev.timestamp   = event.block.timestamp
        // 	ev.delegation  = delegation.id
        // 	ev.owner       = owner.id
        // 	ev.operator    = operator.id
        // 	ev.approved    = event.params.approved
        // 	ev.save()
    }
}

export function handleMetadataActionLog(event: MetadataActionLogEvent): void {
    let contract = fetchERC721(event.address);
    if (contract != null) {
        let ev = MetadataActionLog.load(event.params.id.toString());
        if (!ev) {
            ev = new MetadataActionLog(event.params.id.toString());
            ev.flagCount = 0;
            ev.likeCount = 0;
        }
        let artist = getOrCreateUser(event.params.metaData.artist.toHexString());
        let publisher = getOrCreateUser(event.params.metaData.publisher.toHexString());

        ev.emitter = contract.id.toHexString();
        ev.transaction = transactions.log(event).id;
        ev.timestamp = event.block.timestamp;
        ev.minted = event.params.metaData.minted;
        ev.artist = artist.id;
        ev.artistName = event.params.metaData.artistName;
        ev.createdAt = event.params.metaData.createdAt;
        ev.description = event.params.metaData.description;
        ev.externalLink = event.params.metaData.externalLink;
        ev.fileHash = event.params.metaData.fileHash;
        ev.name = event.params.metaData.name;
        ev.publisher = publisher.id;
        ev.publisherName = event.params.metaData.publisherName;
        ev.royalty = event.params.metaData.royalty;
        ev.status = event.params.metaData.status;
        ev.editions = event.params.metaData.editions;
        ev.fileType = event.params.metaData.fileType;
        ev.thumbnailHash = event.params.metaData.thumbnailHash;
        ev.thumbnailType = event.params.metaData.thumbnailType;

        ev.save();

        if (ev.status == METADATA_STATUS_APPROVED) {
            // Update Global Stats
            let stats = getOrCreateStats();
            stats.totalFakeGotchiPieces = stats.totalFakeGotchiPieces + 1;

            // create tokens tokens and attach metadata
            let startId = stats.tokenIdCounter;
            stats.tokenIdCounter = stats.tokenIdCounter + ev.editions;
            for (let i = 0; i < ev.editions; i++) {
                let id = startId + i;
                let token = fetchERC721Token(contract, BigInt.fromI32(id));
                token.metadata = ev.id;
                token.owner = ev.publisher!;
                token.contract = event.address;
                token.artist = event.params.metaData.artist.toHexString();
                token.artistName = event.params.metaData.artistName;
                token.description = event.params.metaData.description;
                token.externalLink = event.params.metaData.externalLink;
                token.fileHash = event.params.metaData.fileHash;
                token.name = event.params.metaData.name;
                token.publisher = event.params.metaData.publisher.toHexString();
                token.publisherName = event.params.metaData.publisherName;
                token.editions = event.params.metaData.editions;
                token.fileType = event.params.metaData.fileType;
                token.thumbnailHash = event.params.metaData.thumbnailHash;
                token.thumbnailType = event.params.metaData.thumbnailType;
                token.save();
            }
            stats.save();
        }
    }
}

export function handleMetadataFlag(event: MetadataFlagEvent): void {
    let metadata = MetadataActionLog.load(event.params._id.toString())!;
    metadata.flagCount = metadata.flagCount + 1;
    if (metadata.flagCount == 10) {
        metadata.status = METADATA_STATUS_PAUSED;
    }
    metadata.save();

    let flagger = getOrCreateUser(event.params._flaggedBy.toHexString());
    flagger.save();

    let metadataflaggedEv = new MetadataFlag(events.id(event));
    let contract = fetchERC721(event.address)!;
    let token = fetchERC721Token(contract, event.params._id);
    metadataflaggedEv.emitter = contract.id.toHexString();
    metadataflaggedEv.transaction = transactions.log(event).id;
    metadataflaggedEv.timestamp = event.block.timestamp;
    metadataflaggedEv.token = token.id;

    metadataflaggedEv.flaggedBy = flagger.id;
    metadataflaggedEv.metadata = metadata.id;
    metadataflaggedEv.save();
}

export function handleMetadataLike(event: MetadataLikeEvent): void {
    let metadata = MetadataActionLog.load(event.params._id.toString())!;
    metadata.likeCount = metadata.likeCount + 1;
    metadata.save();

    let liker = getOrCreateUser(event.params._likedBy.toHexString());
    liker.save();

    let metadatalikedEv = new MetadataLike(events.id(event));
    let contract = fetchERC721(event.address)!;
    let token = fetchERC721Token(contract, event.params._id);
    metadatalikedEv.emitter = contract.id.toHexString();
    metadatalikedEv.transaction = transactions.log(event).id;
    metadatalikedEv.timestamp = event.block.timestamp;
    metadatalikedEv.token = token.id;

    metadatalikedEv.likedBy = liker.id;
    metadatalikedEv.metadata = metadata.id;
    metadatalikedEv.save();
}

export function handleMetadataDecline(event: MetadataDeclineEvent): void {
    let metadata = MetadataActionLog.load(event.params._id.toString())!;
    metadata.status = METADATA_STATUS_DECLINED;
    metadata.save();

    let decliner = getOrCreateUser(event.params._declinedBy.toHexString());
    decliner.save();

    let metadatalikedEv = new MetadataDecline(events.id(event));
    let contract = fetchERC721(event.address)!;
    let token = fetchERC721Token(contract, event.params._id);
    metadatalikedEv.emitter = contract.id.toHexString();
    metadatalikedEv.transaction = transactions.log(event).id;
    metadatalikedEv.timestamp = event.block.timestamp;
    metadatalikedEv.token = token.id;

    metadatalikedEv.declinedBy = decliner.id;
    metadatalikedEv.metadata = metadata.id;
    metadatalikedEv.save();
}

export function handleReviewPass(event: ReviewPassEvent): void {
    let metadata = MetadataActionLog.load(event.params._id.toString())!;
    metadata.status = METADATA_STATUS_PENDING;
    metadata.save();

    let reviewer = getOrCreateUser(event.params._reviewer.toHexString());
    reviewer.save();

    let reviewPassed = new ReviewPass(events.id(event));
    let contract = fetchERC721(event.address)!;
    let token = fetchERC721Token(contract, event.params._id);
    reviewPassed.emitter = contract.id.toHexString();
    reviewPassed.transaction = transactions.log(event).id;
    reviewPassed.timestamp = event.block.timestamp;
    reviewPassed.token = token.id;
    reviewPassed.reviewer = reviewer.id;
    reviewPassed.metadata = metadata.id;
    reviewPassed.save();
}
