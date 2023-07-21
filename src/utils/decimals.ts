import { BigDecimal, BigInt, log, ByteArray } from "@graphprotocol/graph-ts";
import { GotchiLending } from "../../generated/schema";
import { BIGINT_ZERO } from "./constants";

export const DEFAULT_DECIMALS = 18;

export function pow(base: BigDecimal, exponent: number): BigDecimal {
    let result = base;

    if (exponent == 0) {
        return BigDecimal.fromString("1");
    }

    for (let i = 2; i <= exponent; i++) {
        result = result.times(base);
    }

    return result;
}

export function toDecimal(
    value: BigInt,
    decimals: number = DEFAULT_DECIMALS
): BigDecimal {
    let precision = BigInt.fromI32(10)
        .pow(<u8>decimals)
        .toBigDecimal();

    return value.divDecimal(precision);
}

export function updatePermissionsFromBitmap(
    lending: GotchiLending,
    bitmap: BigInt
): GotchiLending {
    const permissions = bitmap.bitAnd(BigInt.fromI32(0xff));
    const channelling = bitmap.rightShift(<u8>8).bitAnd(BigInt.fromI32(0xff));

    lending.channellingAllowed = !(
        permissions == BIGINT_ZERO || channelling == BIGINT_ZERO
    );

    return lending;
}
