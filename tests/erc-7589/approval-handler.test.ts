import { assert, describe, test, clearStore, afterEach } from 'matchstick-as'
import { createNewRoleApprovalForAllEvent } from './mocks/events'
import { createMockRoleApproval } from './mocks/entities'
import { Addresses, ZERO_ADDRESS } from './helpers/contants'
import { handleRoleApprovalForAll } from '../../src/mappings/erc-7589'
import { validateRoleApproval } from './helpers/assertion'

const grantor = Addresses[0]
const operator = Addresses[1]
const tokenAddress = Addresses[2]
const rolesRegistryAddress = ZERO_ADDRESS

describe('ERC-7589 RoleApprovalForAll Handler', () => {
  afterEach(() => {
    clearStore()
  })

  describe('When RoleApproval exists', () => {
    test('should NOT remove approval when is set to false', () => {
      createMockRoleApproval(grantor, operator, tokenAddress, rolesRegistryAddress, true)
      assert.entityCount('RoleApproval', 1)

      const event = createNewRoleApprovalForAllEvent(grantor, operator, tokenAddress, false)
      handleRoleApprovalForAll(event)

      assert.entityCount('RoleApproval', 1)
      validateRoleApproval(rolesRegistryAddress, grantor, operator, tokenAddress, false)
    })

    test('should update when is set to true', () => {
      createMockRoleApproval(grantor, operator, tokenAddress, rolesRegistryAddress, true)
      assert.entityCount('RoleApproval', 1)

      const event = createNewRoleApprovalForAllEvent(grantor, operator, tokenAddress, true)
      handleRoleApprovalForAll(event)

      assert.entityCount('RoleApproval', 1)
      validateRoleApproval(rolesRegistryAddress, grantor, operator, tokenAddress, true)
    })
  })

  describe('When RoleApproval does not exist', () => {
    test('should create approval when is set to false', () => {
      assert.entityCount('RoleApproval', 0)

      const event = createNewRoleApprovalForAllEvent(grantor, operator, tokenAddress, false)
      handleRoleApprovalForAll(event)

      assert.entityCount('RoleApproval', 1)
      validateRoleApproval(rolesRegistryAddress, grantor, operator, tokenAddress, false)
    })

    test('should create approval when approval is set to true', () => {
      assert.entityCount('RoleApproval', 0)

      const event = createNewRoleApprovalForAllEvent(grantor, operator, tokenAddress, true)
      handleRoleApprovalForAll(event)

      assert.entityCount('RoleApproval', 1)
      validateRoleApproval(rolesRegistryAddress, grantor, operator, tokenAddress, true)
    })
  })
})
