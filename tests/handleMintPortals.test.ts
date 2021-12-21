import { test, assert, clearStore, createMockedFunction, newMockEvent } from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { handleAavegotchiInteract, handleMintPortals } from "../src/mappings/diamond";
import { AavegotchiInteract, MintPortals } from "../generated/AavegotchiDiamond/AavegotchiDiamond";
import { BIGINT_ONE } from "../src/utils/constants";
import { getAavegotchiMock } from "../src/utils/helpers/mocks";


test("handleMintPortals - should update portal status and stats entity", () => {
    // prepare event
    let newMockevent = newMockEvent();
    let event = new MintPortals(
        newMockevent.address,
        newMockevent.logIndex,
        newMockevent.transactionLogIndex,
        newMockevent.logType,
        newMockevent.block,
        newMockevent.transaction,
        newMockevent.parameters
    );
    event.parameters = new Array();
    let _tokenId = new ethereum.EventParam("_tokenId", ethereum.Value.fromUnsignedBigInt(BIGINT_ONE));
    event.parameters.push(_tokenId);

    // create mock for updateAavegotchi and getAavegotchi
    createMockedFunction(
        newMockevent.address,
        "getAavegotchi",
        "getAavegotchi(uint256):((uint256,string,address,uint256,uint256,int16[6],int16[6],uint16[16],address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,(uint256,uint256,(string,string,string,int8[6],bool[16],uint8[],(uint8,uint8,uint8,uint8),uint256,uint256,uint256,uint32,uint8,bool,uint16,bool,uint8,int16,uint32))[]))"
    )
    .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
    .returns(getAavegotchiMock())

    // execute handler with event
    handleMintPortals(event);

    // assert and clear store
    assert.fieldEquals("Aavegotchi", "1", "timesInteracted", "1");
    clearStore();
})
