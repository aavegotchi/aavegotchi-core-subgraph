import { Address, ethereum, store } from "@graphprotocol/graph-ts";
import {
    test,
    assert,
    clearStore,
    createMockedFunction,
} from "matchstick-as/assembly/index";
import { ERC721Listing, Portal } from "../generated/schema";
import { handleClaimAavegotchi } from "../src/mappings/diamond";
import {
    BIGINT_ONE,
    BIGINT_ZERO,
    PORTAL_STATUS_BOUGHT,
    ZERO_ADDRESS,
} from "../src/utils/constants";
import { getAavegotchiMock, getClaimAavegotchiEvent } from "./mocks";

test("should cancel active listing", () => {
    let event = getClaimAavegotchiEvent();

    // init
    let portal = new Portal("1");
    portal.activeListing = BIGINT_ONE;
    portal.buyer = ZERO_ADDRESS;
    portal.hauntId = BIGINT_ONE;
    portal.owner = ZERO_ADDRESS;
    portal.activeListing = BIGINT_ONE;
    portal.status = PORTAL_STATUS_BOUGHT;
    portal.timesTraded = BIGINT_ONE;
    portal.save();

    let listing = new ERC721Listing("1");
    listing.cancelled = false;
    listing.nameLowerCase = "TEST123";
    listing.category = BIGINT_ZERO;
    listing.erc721TokenAddress = Address.fromString(ZERO_ADDRESS);
    listing.tokenId = BIGINT_ZERO;
    listing.seller = Address.fromString(ZERO_ADDRESS);
    listing.timeCreated = BIGINT_ZERO;
    listing.cancelled = false;
    listing.priceInWei = BIGINT_ZERO;
    listing.gotchi = "1";
    listing.blockCreated = BIGINT_ZERO;
    listing.save();

    // create mock for updateAavegotchi and getAavegotchi
    createMockedFunction(
        event.address,
        "getAavegotchi",
        "getAavegotchi(uint256):((uint256,string,address,uint256,uint256,int16[6],int16[6],uint16[16],address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,(uint256,uint256,(string,string,string,int8[6],bool[16],uint8[],(uint8,uint8,uint8,uint8),uint256,uint256,uint256,uint32,uint8,bool,uint16,bool,uint8,int16,uint32))[]))"
    )
        .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
        .returns(getAavegotchiMock(event));

    handleClaimAavegotchi(event);

    assert.fieldEquals("ERC721Listing", "1", "cancelled", "true");
});
