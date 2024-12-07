import { JSONValue } from "@graphprotocol/graph-ts";
import { TypedMap } from "@graphprotocol/graph-ts";

export function createJsonFromJSONObject(
  obj: TypedMap<string, JSONValue>
): string {
  let newString = "{";
  for (let i = 0; i < obj.entries.length; i++) {
    let key = obj.entries[i].key;
    let value = obj.entries[i].value;

    if (i != 0) {
      newString += ",";
    }

    newString += `"${key.toString()}":${value.toBigInt().toString()}`;
  }
  newString += "}";

  return newString;
}
