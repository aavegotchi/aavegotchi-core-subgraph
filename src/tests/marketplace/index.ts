import { handleERC1155ListingUpdateTests } from "./handleERC1155ListingUpdate";
import { handleERC721ExecutedListingTests } from "./handleERC721ExecutedListing";

export function runAllMarketplaceTests(): void {
    handleERC721ExecutedListingTests();
    handleERC1155ListingUpdateTests();
}