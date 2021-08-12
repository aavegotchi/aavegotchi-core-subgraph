export {
  handleBuyPortals,
  handlePortalOpened,
  handleClaimAavegotchi,
  handleDecreaseStake,
  handleIncreaseStake,
  handleSpendSkillpoints,
  handleEquipWearables,
  handleUseConsumables,
  handleSetAavegotchiName,
  handleGrantExperience,
  handleExperienceTransfer,
  handleXingyun,
  handleAavegotchiInteract,
  handleTransfer,
  //erc1155 marketplace
  handleERC1155ExecutedListing,
  handleERC1155ListingCancelled,
  handleERC1155ListingAdd,
  handleERC1155ListingRemoved,
  //erc721 marketplace
  handleERC721ExecutedListing,
  handleERC721ListingAdd,
  handleERC721ListingCancelled,
  handleERC721ListingRemoved,
  //item types
  handleAddItemType,
  handlePurchaseItemsWithGhst,
  handleMigrateVouchers,
  handleItemTypeMaxQuantity,
  handlePurchaseItemsWithVouchers,
  handleAddWearableSet,
  handleUpdateWearableSet,
  handleItemModifiersSet,
  handleWearableSlotPositionsSet
} from "./mappings/diamond";

export { runTests } from "./tests/aavegotchi.test";
