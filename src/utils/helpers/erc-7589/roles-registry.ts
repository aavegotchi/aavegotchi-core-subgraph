import { RolesRegistry } from "../../../../generated/schema"

/**
 * @notice Find or create a RolesRegistry entity.
 * @dev This function is used to find or create a RolesRegistry entity.
 * @param rolesRegistryAddress The address of the roles registry.
 * @returns The RolesRegistry entity.
 */
export function findOrCreateRolesRegistry(rolesRegistryAddress: string): RolesRegistry {
  let rolesRegistry = RolesRegistry.load(rolesRegistryAddress)

  if (!rolesRegistry) {
    rolesRegistry = new RolesRegistry(rolesRegistryAddress)
    rolesRegistry.save()
  }

  return rolesRegistry
}
