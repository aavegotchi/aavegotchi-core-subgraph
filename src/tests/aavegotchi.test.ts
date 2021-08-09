import { test } from "matchstick-as/assembly/index";
import { ethereum } from "@graphprotocol/graph-ts";
import { handleAavegotchiInteract } from "../mappings/diamond";
import { AavegotchiInteract } from "../../generated/AavegotchiDiamond/AavegotchiDiamond";


export function runTests(): void {
    test("should not count +1 if gotchi is still portal", () => {
        let _tokenId = new ethereum.EventParam();
        _tokenId.value = ethereum.Value.fromI32(2);
        // mock getGotchi
        
        const event = new AavegotchiInteract();
        event.parameters.push(_tokenId);
        handleAavegotchiInteract(event);
        
    });
}