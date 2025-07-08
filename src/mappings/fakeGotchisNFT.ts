import {
  FakeGotchiNFTTransfer,
  MetadataActionLog,
} from "../../generated/schema";

import {
  MetadataActionLog as MetadataActionLogEvent,
  MetadataLike as MetadataLikeEvent,
  Transfer as TransferEvent,
  MetadataFlag as MetadataFlagEvent,
} from "../../generated/FAKEGotchisNFTDiamond/IERC721";
import { events } from "@amxx/graphprotocol-utils";

import {
  addToOwnersIfNotExists,
  removeFromOwnersIfExistsAndBalanceNotZero,
  updateAccountStatsFrom,
  updateAccountStatsTo,
  updateTotalStatsBurn,
  updateTotalStatsMint,
} from "../fetch/account";

import {
  METADATA_STATUS_APPROVED,
  METADATA_STATUS_PAUSED,
} from "../utils/constants";

import { fetchFakeGotchiNFTToken } from "../utils/helpers/fakegotchis";
import { BigInt } from "@graphprotocol/graph-ts";
import {
  getFakeGotchiHolder,
  getOrCreateFakeGotchiStatistic,
  getOrCreateStats,
  isBurn,
  isMint,
  isTransfer,
} from "../helper/entities";
import { getOrCreateUser } from "../utils/helpers/aavegotchi";
import { FixBurnedStats } from "../../generated/FAKEGotchisCardDiamond/IERC721";

export function handleTransfer(event: TransferEvent): void {
  const isMintFlag = isMint(event);
  const isBurnFlag = isBurn(event);
  const isTransferFlag = isTransfer(event);

  // fetch sender and receiver
  let from = getOrCreateUser(event.params._from.toHexString());
  let to = getOrCreateUser(event.params._to.toHexString());

  // update token owner
  let token = fetchFakeGotchiNFTToken(event.address, event.params._tokenId);
  token.owner = to.id;
  token.save();

  // create event entity
  let ev = new FakeGotchiNFTTransfer(events.id(event));
  ev.transaction = event.transaction.hash;
  ev.timestamp = event.block.timestamp;
  ev.token = token.id;
  ev.from = from.id;
  ev.to = to.id;
  ev.save();

  // fetch metadata
  let metadata = MetadataActionLog.load(token.metadata!)!;
  let nftStats = getOrCreateFakeGotchiStatistic(metadata.id);

  let stats = getOrCreateStats();
  // update account entity
  if (isMintFlag || isTransferFlag) {
    to = updateAccountStatsTo(to, metadata.id);
    to.amountFakeGotchis = to.amountFakeGotchis + 1;

    let receiver = getFakeGotchiHolder(event.params._to, metadata.id);
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
    from.amountFakeGotchis = from.amountFakeGotchis - 1;

    let sender = getFakeGotchiHolder(event.params._from, metadata.id);
    sender.amount = sender.amount - 1;
    sender.save();

    if (sender.amount == 0) {
      nftStats.amountHolder = nftStats.amountHolder - 1;
    }

    stats = removeFromOwnersIfExistsAndBalanceNotZero(
      stats,
      event.params._from,
      from.amountFakeGotchis
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

export function handleMetadataActionLog(event: MetadataActionLogEvent): void {
  let ev = MetadataActionLog.load(event.params.id.toString());
  if (!ev) {
    ev = new MetadataActionLog(event.params.id.toString());
    ev.flagCount = 0;
    ev.likeCount = 0;
  }
  let artist = getOrCreateUser(event.params.metaData.artist.toHexString());
  let publisher = getOrCreateUser(
    event.params.metaData.publisher.toHexString()
  );

  ev.emitter = event.address.toHexString();
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
      let token = fetchFakeGotchiNFTToken(event.address, BigInt.fromI32(id));
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
      token.thumbnailHash = event.params.metaData.thumbnailHash;
      token.thumbnailType = event.params.metaData.thumbnailType;
      token.save();
    }
    stats.save();
  }

  artist.save();
  publisher.save();
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
}

export function handleMetadataLike(event: MetadataLikeEvent): void {
  let metadata = MetadataActionLog.load(event.params._id.toString())!;
  metadata.likeCount = metadata.likeCount + 1;
  metadata.save();

  let liker = getOrCreateUser(event.params._likedBy.toHexString());
  liker.save();
}

export function handleFixBurnedStats(event: FixBurnedStats): void {
  for (let i = 0; i < event.params.metadataIds.length; i++) {
    let metadataId = event.params.metadataIds[i].toString();
    let burnedCount = event.params.burnedCounts[i];

    let metadata = MetadataActionLog.load(metadataId)!;
    let nftStats = getOrCreateFakeGotchiStatistic(metadataId);

    // Fix metadata.editions and burned count
    metadata.editions = nftStats.totalSupply;
    nftStats.burned = burnedCount.toI32();

    // Sort the existing tokenIds (this fixes the ordering issue)
    let sortedTokenIds = nftStats.tokenIds.sort((a, b) => {
      if (a.lt(b)) return -1;
      if (a.gt(b)) return 1;
      return 0;
    });
    nftStats.tokenIds = sortedTokenIds;

    metadata.save();
    nftStats.save();
  }
}
