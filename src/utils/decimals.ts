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
    const permissions = ["no permissions", "channellingAllowed"];
    for (let i = 0; i < permissions.length; i++) {
        const value = bitmap.rightShift(<u8>i * 8).bitAnd(BigInt.fromI32(0xff));
        if (i === 1) {
            lending.channellingAllowed = value != BIGINT_ZERO;
        }
    }

    return lending;
}
