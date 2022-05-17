import { ethereum, store } from "@graphprotocol/graph-ts";
import { test, assert, clearStore, createMockedFunction } from "matchstick-as/assembly/index";
import { ERC721Listing, Portal } from "../generated/schema";
import { handleClaimAavegotchi } from "../src/mappings/aavegotchi";
import { BIGINT_ONE } from "../src/utils/constants";
import { getAavegotchiMock, getClaimAavegotchiEvent } from "./mocks";

test("should cancel active listing", () => {
    let event = getClaimAavegotchiEvent();

    // init
    let portal = new Portal("1");
    portal.activeListing = BIGINT_ONE;
    portal.save();

    let listing = new ERC721Listing("1");
    listing.cancelled = false;
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
}) 