import { BigInt, log } from "@graphprotocol/graph-ts";
import {
  AavegotchiDiamond,
  Transfer,
} from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";
import {
  PORTAL_STATUS_BOUGHT,
  PORTAL_STATUS_OPENED,
  STATUS_AAVEGOTCHI,
  STATUS_OPEN_PORTAL,
} from "../constants";
import { STATUS_CLOSED_PORTAL } from "../constants";
import {
  calculateBaseRarityScore,
  getOrCreateAavegotchi,
  getOrCreateAavegotchiOption,
  getOrCreatePortal,
  updateAavegotchiInfo,
  updateAavegotchiWearables,
} from "./diamond";
import { getOrCreateUser } from "./diamond";

//ERC721 Transfer - polter only
export function handleTransfer(event: Transfer): void {
  //we need to start handling the bridge case, where a portal or an aavegotchi comes through, never being opened or claimed

  let contract = AavegotchiDiamond.bind(event.address);
  let newOwner = getOrCreateUser(event.params._to.toHexString());
  newOwner.save();

  let tokenId = event.params._tokenId.toString();

  //first, pull the aavegotchi info from onchain
  let gotchiResponse = contract.try_getAavegotchi(BigInt.fromString(tokenId));

  if (!gotchiResponse.reverted) {
    if (gotchiResponse.value.status.equals(STATUS_CLOSED_PORTAL)) {
      let portal = getOrCreatePortal(tokenId, true);
      portal.status = PORTAL_STATUS_BOUGHT;
      portal.owner = newOwner.id;
      portal.save();
    } else if (gotchiResponse.value.status.equals(STATUS_OPEN_PORTAL)) {
      let portal = getOrCreatePortal(tokenId, true);
      portal.status = PORTAL_STATUS_OPENED;

      //todo
      // portal.openedAt = gotchiResponse.value.ope

      let openPortalResponse = contract.try_portalAavegotchiTraits(
        BigInt.fromString(tokenId)
      );
      // let stats = getStatisticEntity();

      if (!openPortalResponse.reverted) {
        let array = openPortalResponse.value;
        for (let i = 0; i < 10; i++) {
          let possibleAavegotchiTraits = array[i];
          let gotchi = getOrCreateAavegotchiOption(portal.id, i);
          gotchi.portal = portal.id;
          gotchi.owner = portal.owner;
          gotchi.randomNumber = possibleAavegotchiTraits.randomNumber;
          gotchi.numericTraits = possibleAavegotchiTraits.numericTraits;
          gotchi.collateralType = possibleAavegotchiTraits.collateralType;
          gotchi.minimumStake = possibleAavegotchiTraits.minimumStake;
          //calculate base rarity score
          gotchi.baseRarityScore = calculateBaseRarityScore(
            gotchi.numericTraits
          );

          gotchi.save();
        }
      }

      //portal traits

      portal.save();
    } else if (gotchiResponse.value.status.equals(STATUS_AAVEGOTCHI)) {
      let gotchi = getOrCreateAavegotchi(tokenId, event, true);

      if (gotchi) {
        gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);
        gotchi = updateAavegotchiWearables(gotchi, event);
        gotchi.claimedAt = event.block.number;
        gotchi.claimedTime = event.block.timestamp;
        gotchi.gotchiId = event.params._tokenId;

        gotchi.save();
      }

      // portal.gotchi = gotchi.id;
      // let zeroUser = getOrCreateUser(ZERO_ADDRESS);
      // portal.owner = zeroUser.id;
      // portal.status = PORTAL_STATUS_CLAIMED;
      // portal.claimedAt = event.block.number;
      // portal.claimedTime = event.block.timestamp;

      // if (portal.activeListing) {
      //   let listing = getOrCreateERC721Listing(
      //     portal.activeListing!.toString()
      //   );
      //   listing.cancelled = true;
      //   listing.save();
      // }
    } else {
      log.error("Aavegotchi is not in the correct status: {}", [tokenId]);
    }

    // } else {
    //   log.error("Failed to get aavegotchi info for tokenId: {}", [tokenId]);
    // }

    // let gotchi = getOrCreateAavegotchi(tokenId, event, true);
    // let portal = getOrCreatePortal(tokenId, true);

    // if (gotchi == null && portal == null) {
    // }

    //handle buy portals

    // let buyer = getOrCreateUser(event.params._from.toHexString());
    // let owner = getOrCreateUser(event.params._to.toHexString());
    // let stats = getStatisticEntity();

    // let baseId = event.params._tokenId;

    // for (let i = 0; i < event.params._numAavegotchisToPurchase.toI32(); i++) {
    // let id = baseId.plus(BigInt.fromI32(i));
    // let portal = getOrCreatePortal(id.toString());

    //Add portal hauntId

    // }

    // stats.portalsBought = stats.portalsBought.plus(
    // event.params._numAavegotchisToPurchase
    // );

    //handle open portals
    // let contract = AavegotchiDiamond.bind(event.address);
    // let portal = getOrCreatePortal(event.params.tokenId.toString());

    //handle claim aavegotchis
    // let portal = getOrCreatePortal(event.params._tokenId.toString());
    // let gotchi = getOrCreateAavegotchi(event.params._tokenId.toString(), event)!;
    // let stats = getStatisticEntity();

    // stats.aavegotchisClaimed = stats.aavegotchisClaimed.plus(BIGINT_ONE);

    // stats.save();
    // gotchi.save();
    // portal.save();
    // zeroUser.save();

    // ERC721 transfer can be portal or gotchi based, so we have to check it.
    // if (gotchi != null) {
    //   if (!gotchi.modifiedRarityScore) {
    //     gotchi = updateAavegotchiInfo(gotchi, event.params._tokenId, event);
    //   }
    //   gotchi.owner = newOwner.id;
    //   gotchi.originalOwner = newOwner.id;
    //   gotchi.save();

    if (newOwner.id == "0x0000000000000000000000000000000000000000") {
      // let stats = getStatisticEntity();
      // stats.aavegotchisSacrificed = stats.aavegotchisSacrificed.plus(
      //   BIGINT_ONE;
      // );
      // stats.save();
    }
    // } else {
    //   portal.owner = newOwner.id;
    //   portal.save();
    // }
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
}
