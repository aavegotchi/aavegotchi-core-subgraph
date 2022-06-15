import { MintInstallation } from "../../generated/InstallationDiamond/InstallationDiamond";
import { BIGINT_ONE } from "../utils/constants";
import { getOrCreateInstallationType, updateInstallationType } from "../utils/helpers/installation";

//         - event: MintInstallation(indexed address,indexed uint256,uint256)
export function handleMintInstallation(event: MintInstallation): void {
  let type = getOrCreateInstallationType(event.params._installationId.toString());
  type.maxQuantity = type.maxQuantity.plus(BIGINT_ONE);
  type.totalQuantity = type.totalQuantity.plus(BIGINT_ONE);
  let updatedType = updateInstallationType(type);
  if(updatedType) {
    updatedType.save();
  }

}
