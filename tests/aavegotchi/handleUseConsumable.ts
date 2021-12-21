import { test, assert, clearStore, createMockedFunction } from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { handleUseConsumables } from "../../src/mappings/diamond";
import { UseConsumables } from "../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { BIGINT_ONE } from "../../src/utils/constants";
import { getAavegotchiMock } from "../../src/utils/helpers/mocks";
import { Aavegotchi } from "../../generated/schema";

export function handleUseConsumablesTest(): void {

    test("handleUseConsumable - happy case", () => {
        
        let gotchi = new Aavegotchi("1");
        gotchi.gotchiId = BIGINT_ONE;
        gotchi.save();

        let event = new UseConsumables();
        let params = new Array<ethereum.EventParam>();

        let _tokenId = new ethereum.EventParam();
        _tokenId.name = "_tokenId";
        _tokenId.value = ethereum.Value.fromUnsignedBigInt(BIGINT_ONE);
        params.push(_tokenId);

        let _itemIds = new ethereum.EventParam();
        _itemIds.name = "_itemIds";
        _itemIds.value = ethereum.Value.fromUnsignedBigIntArray([
            BIGINT_ONE
        ]);
        params.push(_itemIds);

        let _quantities = new ethereum.EventParam();
        _quantities.name = "_quantities";
        _quantities.value = ethereum.Value.fromUnsignedBigIntArray([
            BigInt.fromI32(2)
        ]);
        params.push(_quantities);

        event.parameters = params;  
        let contractAddress = Address.fromString("0x86935F11C86623deC8a25696E1C19a8659CbF95d");
        event.address = contractAddress

        // create mock for updateAavegotchi and getAavegotchi
        createMockedFunction(
            contractAddress,
            "getAavegotchi",
            "getAavegotchi(uint256):((uint256,string,address,uint256,uint256,int16[6],int16[6],uint16[16],address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,(uint256,uint256,(string,string,string,int8[6],bool[16],uint8[],(uint8,uint8,uint8,uint8),uint256,uint256,uint256,uint32,uint8,bool,uint16,bool,uint8,int16,uint32))[]))"
        )
        .withArgs([_tokenId.value])
        .returns(getAavegotchiMock())

        // execute handler with event
        handleUseConsumables(event);

        // assert and clear store
        // should count used consumables
        assert.fieldEquals("ItemType", "1", "consumed", "2");
        clearStore();
    })
}