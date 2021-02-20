import { Aavegotchi, Portal, User } from "../../../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";

export function getOrCreatePortal(
  id: String,
  createIfNotFound: boolean = true
): Portal {
  let portal = Portal.load(id);

  if (portal == null && createIfNotFound) {
    portal = new Portal(id);
  }

  return portal as Portal;
}

export function getOrCreateAavegotchi(
  id: String,
  createIfNotFound: boolean = true
): Aavegotchi {
  let gotchi = Aavegotchi.load(id);

  if (gotchi == null && createIfNotFound) {
    gotchi = new Aavegotchi(id);
  }

  return gotchi as Aavegotchi;
}

export function getOrCreateUser(
  id: String,
  createIfNotFound: boolean = true
): User {
  let user = User.load(id);

  if (user == null && createIfNotFound) {
    user = new User(id);
  }

  return user as User;
}
