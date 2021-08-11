import { runAllAavegotchiTests } from "./aavegotchi";
import { runAllAavegotchiGameTests } from "./aavegotchigame";

export function runTests(): void {
    runAllAavegotchiTests();
    runAllAavegotchiGameTests();
}