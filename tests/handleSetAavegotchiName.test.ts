import { ethereum } from "@graphprotocol/graph-ts";
import { test, assert, clearStore, createMockedFunction } from "matchstick-as/assembly/index";
import { Aavegotchi, ERC721Listing } from "../generated/schema";
import { handleSetAavegotchiName } from "../src/mappings/diamond";
import { BIGINT_ONE } from "../src/utils/constants";
import { getAavegotchiMock, getSetNameEvent } from "./mocks";

test("should update nameToLower on Listing entity of Aavegotchi", () => {
    let event = getSetNameEvent();

    // init
    let gotchi = new Aavegotchi("1");
    gotchi.activeListing = BIGINT_ONE;
    gotchi.save();

    let listing = new ERC721Listing("1");
    listing.cancelled = false;
    listing.nameLowerCase = "TEST123"
    listing.save();

    // create mock for updateAavegotchi and getAavegotchi
    createMockedFunction(
        event.address,
        "getAavegotchi",
        "getAavegotchi(uint256):((uint256,string,address,uint256,uint256,int16[6],int16[6],uint16[16],address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,(uint256,uint256,(string,string,string,int8[6],bool[16],uint8[],(uint8,uint8,uint8,uint8),uint256,uint256,uint256,uint32,uint8,bool,uint16,bool,uint8,int16,uint32))[]))"
    )
    .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
    .returns(getAavegotchiMock(event));

    handleSetAavegotchiName(event);

    assert.fieldEquals("ERC721Listing", "1", "nameLowerCase", "yes");
    clearStore();
}) 
