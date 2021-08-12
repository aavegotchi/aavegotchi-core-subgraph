import { test, assert, clearStore, createMockedFunction } from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { handleAavegotchiInteract } from "../../mappings/diamond";
import { AavegotchiInteract } from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { BIGINT_ONE, CONTRACT_ADDRESS } from "../../utils/constants";
import { getAavegotchiMock } from "../../utils/helpers/mocks";

export function handleInteractTests(): void {

    test("handleAavegotchiInteract - should count as interacted if gotchi is claimed", () => {
        // prepare event
        let event = new AavegotchiInteract();
        event.block.number = BIGINT_ONE;
        let _tokenId = new ethereum.EventParam();
        _tokenId.value = ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)
        event.parameters.push(_tokenId);
        let contractAddress = Address.fromString(CONTRACT_ADDRESS);
        event.address = contractAddress

        // create mock for updateAavegotchi and getAavegotchi
        createMockedFunction(
            contractAddress,
            "getAavegotchi",
            "getAavegotchi(uint256):((uint256,string,address,uint256,uint256,int16[6],int16[6],uint16[16],address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,(uint256,uint256,(string,string,string,int8[6],bool[16],uint8[],(uint8,uint8,uint8,uint8),uint256,uint256,uint256,uint32,uint8,bool,uint16,bool,uint8,int16,uint32))[]))"
        )
        .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
        .returns(getAavegotchiMock())

        // execute handler with event
        handleAavegotchiInteract(event);

        // assert and clear store
        assert.fieldEquals("Aavegotchi", "1", "lastInteracted", "1");
        clearStore();
    })

    test("handleAavegotchiInteract - should not count as interacted if gotchi is portal", () => {
        // prepare event
        let event = new AavegotchiInteract();
        event.block.number = BIGINT_ONE;
        let _tokenId = new ethereum.EventParam();
        _tokenId.value = ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)
        event.parameters.push(_tokenId);
        let contractAddress = Address.fromString(CONTRACT_ADDRESS);
        event.address = contractAddress

        // create mock for updateAavegotchi and getAavegotchi
        createMockedFunction(
            contractAddress,
            "getAavegotchi",
            "getAavegotchi(uint256):((uint256,string,address,uint256,uint256,int16[6],int16[6],uint16[16],address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,(uint256,uint256,(string,string,string,int8[6],bool[16],uint8[],(uint8,uint8,uint8,uint8),uint256,uint256,uint256,uint32,uint8,bool,uint16,bool,uint8,int16,uint32))[]))"
        )
        .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
        .returns(getAavegotchiMock(BigInt.fromI32(2)))

        // execute handler with event
        handleAavegotchiInteract(event);

        // assert and clear store
        assert.fieldEquals("Aavegotchi", "1", "lastInteracted", "1");
        clearStore();
    })
}