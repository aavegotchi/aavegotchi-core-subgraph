import {
  AavegotchiDiamond,
  AavegotchiInteract,
  BuyPortals,
  PortalOpened,
  ClaimAavegotchi,
  IncreaseStake,
  DecreaseStake,
  UseConsumables,
  SpendSkillpoints,
  EquipWearables,
  SetAavegotchiName,
  GrantExperience,
  Xingyun,
  ERC721ExecutedListing,
  ERC721ListingAdd,
  ERC721ListingCancelled,
  ERC721ListingRemoved,
  ERC1155ListingAdd,
  ERC1155ExecutedListing,
  ERC1155ListingCancelled,
  ERC1155ListingRemoved,
  Transfer,
  TransferSingle,
  TransferBatch,
} from "../../generated/AavegotchiDiamond/AavegotchiDiamond";
import {
  getOrCreateUser,
  getOrCreatePortal,
  getOrCreateAavegotchiOption,
  getOrCreateAavegotchi,
  updateAavegotchiInfo,
  getStatisticEntity,
  getOrCreateERC1155Listing,
  getOrCreateERC721Listing,
  updateERC1155ListingInfo,
  updateERC721ListingInfo,
} from "../utils/helpers/diamond";
import {
  BIGINT_ONE,
  PORTAL_STATUS_BOUGHT,
  PORTAL_STATUS_OPENED,
  PORTAL_STATUS_CLAIMED,
} from "../utils/constants";
import { BigInt, log } from "@graphprotocol/graph-ts";

// - event: BuyPortals(indexed address,indexed address,uint256,uint256,uint256)
//   handler: handleBuyPortals

export function handleBuyPortals(event: BuyPortals): void {
  let buyer = getOrCreateUser(event.params._from.toHexString());
  let owner = getOrCreateUser(event.params._to.toHexString());
  let stats = getStatisticEntity();

  let baseId = event.params._tokenId;

  for (let i = 0; i < event.params._numAavegotchisToPurchase.toI32(); i++) {
    let portal = getOrCreatePortal(baseId.plus(BigInt.fromI32(i)).toString());

    portal.status = PORTAL_STATUS_BOUGHT;
    portal.owner = owner.id;
    portal.buyer = buyer.id;

    portal.save();
  }

  stats.portalsBought = stats.portalsBought.plus(
    event.params._numAavegotchisToPurchase
  );

  stats.save();
  buyer.save();
  owner.save();
}

// - event: Xingyun(indexed address,indexed address,uint256,uint256,uint256)
//   handler: handleXingyun

export function handleXingyun(event: Xingyun): void {
  let buyer = getOrCreateUser(event.params._from.toHexString());
  let owner = getOrCreateUser(event.params._to.toHexString());
  let stats = getStatisticEntity();

  let baseId = event.params._tokenId;

  for (let i = 0; i < event.params._numAavegotchisToPurchase.toI32(); i++) {
    let portal = getOrCreatePortal(baseId.plus(BigInt.fromI32(i)).toString());

    portal.status = PORTAL_STATUS_BOUGHT;
    portal.owner = owner.id;
    portal.buyer = buyer.id;

    portal.save();
  }

  stats.portalsBought = stats.portalsBought.plus(
    event.params._numAavegotchisToPurchase
  );

  stats.save();
  buyer.save();
  owner.save();
}

// - event: PortalOpened(indexed uint256)
//   handler: handlePortalOpened

export function handlePortalOpened(event: PortalOpened): void {
  let contract = AavegotchiDiamond.bind(event.address);
  let portal = getOrCreatePortal(event.params.tokenId.toString());
  let response = contract.try_portalAavegotchiTraits(event.params.tokenId);
  let stats = getStatisticEntity();

  if (!response.reverted) {
    let array = response.value;

    for (let i = 0; i < 10; i++) {
      let possibleAavegotchiTraits = array[i];
      let gotchi = getOrCreateAavegotchiOption(
        portal.id.concat("-").concat(BigInt.fromI32(i).toString())
      );
      gotchi.portal = portal.id;
      gotchi.owner = portal.owner;
      gotchi.randomNumber = possibleAavegotchiTraits.randomNumber;
      gotchi.numericTraits = possibleAavegotchiTraits.numericTraits;
      gotchi.collateralType = possibleAavegotchiTraits.collateralType;
      gotchi.minimumStake = possibleAavegotchiTraits.minimumStake;

      gotchi.save();
    }
  }

  portal.status = PORTAL_STATUS_OPENED;

  stats.portalsOpened = stats.portalsOpened.plus(BIGINT_ONE);

  stats.save();
  portal.save();
}

// - event: ClaimAavegotchi(indexed uint256)
//   handler: handleClaimAavegotchi

export function handleClaimAavegotchi(event: ClaimAavegotchi): void {
  let portal = getOrCreatePortal(event.params._tokenId.toString());
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString());
  let stats = getStatisticEntity();

  gotchi.owner = portal.owner;
  gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);

  portal.gotchi = gotchi.id;
  portal.status = PORTAL_STATUS_CLAIMED;

  stats.aavegotchisClaimed = stats.aavegotchisClaimed.plus(BIGINT_ONE);

  stats.save();
  gotchi.save();
  portal.save();
}

// - event: IncreaseStake(indexed uint256,uint256)
//   handler: handleIncreaseStake

export function handleIncreaseStake(event: IncreaseStake): void {
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString());

  gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);

  gotchi.save();
}

// - event: DecreaseStake(indexed uint256,uint256)
//   handler: handleDecreaseStake

export function handleDecreaseStake(event: DecreaseStake): void {
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString());

  gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);

  gotchi.save();
}

// - event: SpendSkillpoints(indexed uint256,int8[4])
//   handler: handleSpendSkillpoints

export function handleSpendSkillpoints(event: SpendSkillpoints): void {
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString());

  gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);

  gotchi.save();
}

// - event: EquipWearables(indexed uint256,uint256,uint256)
//   handler: handleEquipWearables

export function handleEquipWearables(event: EquipWearables): void {
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString());

  gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);

  gotchi.save();
}

// - event: SetAavegotchiName(indexed uint256,string,string)
//   handler: handleSetAavegotchiName

export function handleSetAavegotchiName(event: SetAavegotchiName): void {
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString());

  gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);

  gotchi.save();
}

// - event: UseConsumables(indexed uint256,uint256[],uint256[])
//   handler: handleUseConsumables

export function handleUseConsumables(event: UseConsumables): void {
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString());

  gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);

  gotchi.save();
}

// - event: GrantExperience(uint256[],uint32[])
//   handler: handleGrantExperience

export function handleGrantExperience(event: GrantExperience): void {
  let ids = event.params._tokenIds;
  let gotchi = getOrCreateAavegotchi(ids[0].toString());
  for (let i = 0; i < ids.length; i++) {
    gotchi = getOrCreateAavegotchi(ids[i].toString());

    gotchi = updateAavegotchiInfo(gotchi, ids[i], event);

    gotchi.save();
  }
}

// - event: AavegotchiInteract(indexed uint256,uint256)
//   handler: handleAavegotchiInteract

export function handleAavegotchiInteract(event: AavegotchiInteract): void {
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString());

  gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);
  gotchi.timesInteracted = gotchi.timesInteracted.plus(BIGINT_ONE);

  gotchi.save();
}

//ERC721 Transfer
export function handleTransfer(event: Transfer): void {
  let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString());
  gotchi.owner = event.params._to.toHexString();
  gotchi.save();
}

//ERC1155 Transfers
/*
export function handleTransferSingle(event: TransferSingle): void {}

export function handleTransferBatch(event: TransferBatch): void {}

//ERC721 Marketplace Facet

/*
-event:  ERC721ListingAdd(
        uint256 indexed listingId,
        address indexed seller,
        address erc721TokenAddress,
        uint256 erc721TokenId,
        uint256 indexed category,
        uint256 time
    );
-handler: handleERC721ListingAdd
*/

export function handleERC721ListingAdd(event: ERC721ListingAdd): void {
  let listing = getOrCreateERC721Listing(event.params.listingId.toString());
  listing = updateERC721ListingInfo(listing, event.params.listingId, event);

  listing.save();
}

/* -event: ERC721ExecutedListing(
        uint256 indexed listingId,
        address indexed seller,
        address buyer,
        address erc721TokenAddress,
        uint256 erc721TokenId,
        uint256 indexed category,
        uint256 priceInWei,
        uint256 time
    );
    */
//handler: handleERC721ExecutedListing

export function handleERC721ExecutedListing(
  event: ERC721ExecutedListing
): void {
  let listing = getOrCreateERC721Listing(event.params.listingId.toString());

  listing = updateERC721ListingInfo(listing, event.params.listingId, event);
  listing.save();

  let stats = getStatisticEntity();
  stats.erc721TotalVolume = stats.erc721TotalVolume.plus(
    event.params.priceInWei
  );
  stats.save();
}

/*
event: ERC721ListingCancelled(uint256 indexed listingId, uint256 category, uint256 time);
handler: handleERC721ListingCancelled
*/

export function handleERC721ListingCancelled(
  event: ERC721ListingCancelled
): void {
  let listing = getOrCreateERC721Listing(event.params.listingId.toString());

  listing = updateERC721ListingInfo(listing, event.params.listingId, event);
  listing.save();
}

/*
event: ERC721ListingRemoved(uint256 indexed listingId, uint256 category, uint256 time);
handler:handleERC721ListingRemoved
*/

export function handleERC721ListingRemoved(event: ERC721ListingRemoved): void {
  let listing = getOrCreateERC721Listing(event.params.listingId.toString());

  listing = updateERC721ListingInfo(listing, event.params.listingId, event);
  listing.save();
}

/* ERC1155 MARKETPLACE */

/*
-event: ERC1155ListingAdd(
  uint256 indexed listingId,
  address indexed seller,
  address erc1155TokenAddress,
  uint256 erc1155TypeId,
  uint256 indexed category,
  uint256 quantity,
  uint256 priceInWei,
  uint256 time

-handler: handleERC1155ListingAdd
*/

export function handleERC1155ListingAdd(event: ERC1155ListingAdd): void {
  let listing = getOrCreateERC1155Listing(event.params.listingId.toString());
  listing = updateERC1155ListingInfo(listing, event.params.listingId, event);

  listing.save();
}

/*
-event: ERC1155ExecutedListing(
        uint256 indexed listingId,
        address indexed seller,
        address buyer,
        address erc1155TokenAddress,
        uint256 erc1155TypeId,
        uint256 indexed category,
        uint256 _quantity,
        uint256 priceInWei,
        uint256 time
    )
-handler: handleERC1155ExecutedListing
    */

export function handleERC1155ExecutedListing(
  event: ERC1155ExecutedListing
): void {
  let listing = getOrCreateERC1155Listing(event.params.listingId.toString());
  listing = updateERC1155ListingInfo(listing, event.params.listingId, event);

  listing.save();

  let stats = getStatisticEntity();
  let volume = event.params.priceInWei.times(event.params._quantity);
  stats.erc1155TotalVolume = stats.erc1155TotalVolume.plus(volume);
  stats.save();
}

export function handleERC1155ListingCancelled(
  event: ERC1155ListingCancelled
): void {
  let listing = getOrCreateERC1155Listing(event.params.listingId.toString());
  listing = updateERC1155ListingInfo(listing, event.params.listingId, event);

  listing.save();
}

export function handleERC1155ListingRemoved(
  event: ERC1155ListingRemoved
): void {
  let listing = getOrCreateERC1155Listing(event.params.listingId.toString());
  listing = updateERC1155ListingInfo(listing, event.params.listingId, event);

  listing.save();
}
