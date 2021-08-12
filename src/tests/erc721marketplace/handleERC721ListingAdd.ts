import { test, assert, clearStore, createMockedFunction } from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { handleERC721ListingAdd } from "../../mappings/diamond";
import { AavegotchiInteract, ERC721ListingAdd, MintPortals } from "../../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { BIGINT_ONE } from "../../utils/constants";
import { getAavegotchiMock } from "../../utils/helpers/mocks";

export function handleERC721ListingAddTest(): void {

    test("handleERC721ListingAdd - happy case", () => {
        // prepare event
        let event = new ERC721ListingAdd();
        event.block.number = BIGINT_ONE;
        let _tokenId = new ethereum.EventParam();
        _tokenId.value = ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)
        event.parameters.push(_tokenId);
        let contractAddress = Address.fromString("0x86935F11C86623deC8a25696E1C19a8659CbF95d");
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
        handleERC721ListingAdd(event);

        // assert and clear store
        // should set experience from gotchi a
        assert.fieldEquals("Aavegotchi", "1", "timesInteracted", "1");
        clearStore();
    })
}