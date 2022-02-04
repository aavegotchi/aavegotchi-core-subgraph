import { BigDecimal, BigInt, Address } from "@graphprotocol/graph-ts";
import { toDecimal } from "./decimals";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const PORTAL_STATUS_BOUGHT = "Bought";
export const PORTAL_STATUS_OPENED = "Opened";
export const PORTAL_STATUS_CLAIMED = "Claimed";
export let BIGINT_ZERO = BigInt.fromI32(0);
export let BIGINT_ONE = BigInt.fromI32(1);
export let BIGDECIMAL_ZERO = new BigDecimal(BIGINT_ZERO);
export let BIGDECIMAL_ONE = toDecimal(BigInt.fromI32(10).pow(18));
export let BIGDECIMAL_HUNDRED = toDecimal(BigInt.fromI32(10).pow(20));
export let STATUS_SACRIFICED = BIGINT_ZERO;
export let STATUS_VRF_PENDING = BIGINT_ONE;
export let STATUS_OPEN_PORTAL = BigInt.fromI32(2);
export let STATUS_AAVEGOTCHI = BigInt.fromI32(3);
