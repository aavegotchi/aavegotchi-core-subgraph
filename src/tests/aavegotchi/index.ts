import { handleInteractTests } from "./handleInteract";
import { handleUseConsumablesTest } from "./handleUseConsumable";

export function runAllAavegotchiTests(): void {
    handleInteractTests();
    handleUseConsumablesTest();
}