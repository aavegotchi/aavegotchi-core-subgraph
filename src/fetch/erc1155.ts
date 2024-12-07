import { BigInt } from "@graphprotocol/graph-ts";

export function replaceURI(uri: string, identifier: BigInt): string {
  return uri.replaceAll(
    "{id}",
    identifier
      .toHex()
      .slice(2)
      .padStart(64, "0")
  );
}
