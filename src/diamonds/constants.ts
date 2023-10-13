import { Address, BigInt } from "@graphprotocol/graph-ts";

export const BIGINT_ZERO = BigInt.fromI32(0);
export const BIGINT_ONE = BigInt.fromI32(1);
export const ADDRESS_ZERO = Address.fromString(
    "0x0000000000000000000000000000000000000000"
);

export const ADDRESS_BURN = Address.fromString(
    "0xffffffffffffffffffffffffffffffffffffffff"
);

export const ADDRESS_DEAD = Address.fromString(
    "0x000000000000000000000000000000000000dead"
);

export const METADATA_STATUS_PENDING = 0;
export const METADATA_STATUS_PAUSED = 1;
export const METADATA_STATUS_APPROVED = 2;
export const METADATA_STATUS_DECLINED = 3;
