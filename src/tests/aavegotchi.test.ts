import { createMockedFunction, test, assert } from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { handleAavegotchiInteract, handleERC721ListingCancelled, handleTransfer } from "../mappings/diamond";
import { AavegotchiDiamond, AavegotchiInteract, ERC721ListingCancelled, Transfer } from "../../generated/AavegotchiDiamond/AavegotchiDiamond";
import { Aavegotchi } from "../../generated/schema";
import { getOrCreateAavegotchi } from "../utils/helpers/diamond";
import { BIGINT_ONE } from "../utils/constants";
import { log } from "matchstick-as/assembly/log";


export function runTests(): void {

//    let aavegotchi = getOrCreateAavegotchi("4430");

    // test("should not count +1 if gotchi is still portal", () => {
    //     let _tokenId = new ethereum.EventParam();
    //     _tokenId.value = ethereum.Value.fromI32(2);
    //     // mock getGotchi
    //     let contractAddress = Address.fromString("0x86935F11C86623deC8a25696E1C19a8659CbF95d");
    //     createMockedFunction(
    //             contractAddress, 
    //             "getAavegotchi", 
    //             "(uint256):((uint256,string,address,uint256,uint256,int16[6],int16[6],uint16[16],address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,(uint256,uint256,(string,string,string,int8[6],bool[16],uint8[],(uint8,uint8,uint8,uint8),uint256,uint256,uint256,uint32,uint8,bool,uint16,bool,uint8,int16,uint32))[]))"
    //         )
    //         .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(4430))])
    //         .returns([
    //             ethereum.Value.fromSignedBigInt(BIGINT_ONE),
    //             ethereum.Value.fromString("string"),
    //             ethereum.Value.fromAddress(contractAddress),
    //             ethereum.Value.fromSignedBigInt(BIGINT_ONE),
    //             ethereum.Value.fromSignedBigInt(BIGINT_ONE),
    //             ethereum.Value.fromSignedBigInt(BIGINT_ONE),
    //             ethereum.Value.fromSignedBigInt(BIGINT_ONE),
    //             ethereum.Value.fromSignedBigInt(BIGINT_ONE),
    //             ethereum.Value.fromAddress(contractAddress),
    //             ethereum.Value.fromAddress(contractAddress),
    //             ethereum.Value.fromSignedBigInt(BIGINT_ONE),
    //             ethereum.Value.fromSignedBigInt(BIGINT_ONE),
    //             ethereum.Value.fromSignedBigInt(BIGINT_ONE),
    //             ethereum.Value.fromSignedBigInt(BIGINT_ONE),
    //             ethereum.Value.fromSignedBigInt(BIGINT_ONE),
    //             ethereum.Value.fromSignedBigInt(BIGINT_ONE),
    //             ethereum.Value.fromSignedBigInt(BIGINT_ONE),
    //             ethereum.Value.fromSignedBigInt(BIGINT_ONE),
    //             ethereum.Value.fromSignedBigInt(BIGINT_ONE),
    //             ethereum.Value.fromSignedBigInt(BIGINT_ONE),
    //             ethereum.Value.fromSignedBigInt(BIGINT_ONE),
    //             ethereum.Value.fromBoolean(true)
    //         ]);

    //     let aavegotchiGame = AavegotchiDiamond.bind(contractAddress);
    //     let event = new AavegotchiInteract();
    //     event.address = Address.fromString("0x86935F11C86623deC8a25696E1C19a8659CbF95d");
    //     event.parameters.push(_tokenId);
    //     handleAavegotchiInteract(event);
        
    // });

    test("handleERC721ListingCancelled - should set listing to cancelled" ,() => {
        let listingId = new ethereum.EventParam();
        listingId.value = ethereum.Value.fromSignedBigInt(BIGINT_ONE);
        let event = new ERC721ListingCancelled()
        event.parameters.push(listingId);
        handleERC721ListingCancelled(event);
        assert.fieldEquals("ERC721Listing", "1", "cancelled", "true");
    })
}