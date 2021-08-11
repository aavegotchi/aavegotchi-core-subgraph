import { test, assert, clearStore, createMockedFunction } from "matchstick-as/assembly/index";
import { Address, ethereum } from "@graphprotocol/graph-ts";
import { handleAavegotchiInteract, handleERC721ListingCancelled } from "../mappings/diamond";
import { AavegotchiInteract, ERC721ListingCancelled } from "../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { BIGINT_ONE } from "../utils/constants";

export function runTests(): void {

    test("handleERC721ListingCancelled - should set listing to cancelled" ,() => {
        let listingId = new ethereum.EventParam();
        listingId.value = ethereum.Value.fromSignedBigInt(BIGINT_ONE);
        let event = new ERC721ListingCancelled();
        event.parameters.push(listingId);
        handleERC721ListingCancelled(event);
        assert.fieldEquals("ERC721Listing", "1", "cancelled", "true");
        clearStore();
    })

    test("handleAavegotchiInteract - should not count as interacted if gotchi is portal", () => {
        // prepare event
        let event = new AavegotchiInteract();
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
        .returns([
            // (
                ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
                ethereum.Value.fromString("yes"),
                ethereum.Value.fromAddress(contractAddress),
                ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
                ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
                ethereum.Value.fromSignedBigIntArray([BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE]),
                ethereum.Value.fromSignedBigIntArray([BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE]),
                ethereum.Value.fromUnsignedBigIntArray([BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE]),
                ethereum.Value.fromAddress(contractAddress),
                ethereum.Value.fromAddress(contractAddress),
                ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
                ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
                ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
                ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
                ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
                ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
                ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
                ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
                ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
                ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
                ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
                ethereum.Value.fromBoolean(true),
                // (
                    ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
                    ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
                    // (
                        ethereum.Value.fromString("yes"),
                        ethereum.Value.fromString("yes"),
                        ethereum.Value.fromString("yes"),
                        ethereum.Value.fromSignedBigIntArray([BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE]),
                        ethereum.Value.fromBooleanArray([true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]),
                        ethereum.Value.fromUnsignedBigIntArray([BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE,BIGINT_ONE]),
                        // (
                            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
                            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
                            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
                            ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
                        // ),
                        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
                        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
                        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
                        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
                        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
                        ethereum.Value.fromBoolean(true),
                        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
                        ethereum.Value.fromBoolean(true),
                        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE),
                        ethereum.Value.fromSignedBigInt(BIGINT_ONE),
                        ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)
                    // )
                // )
        // )
        ])

        // execute handler with event
        handleAavegotchiInteract(event);

        // assert and clear store
        assert.fieldEquals("Aavegotchi", "1", "timesInteracted", "1");
        clearStore();
    })
}