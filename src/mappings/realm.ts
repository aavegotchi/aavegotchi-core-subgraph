import { ChannelAlchemica, MintParcel, RealmDiamond, ResyncParcel, Transfer } from "../../generated/RealmDiamond/RealmDiamond";
import { Parcel } from "../../generated/schema";
import { getOrCreateAavegotchi, getOrCreateChanneledAlchemica, getOrCreateParcel, getOrCreateUser } from "../utils/helpers/diamond";

// Realm
export function handleResyncParcel(event: ResyncParcel): void {
    let parcel = Parcel.load(event.params._tokenId.toString())!;

    let contract = RealmDiamond.bind(event.address);
    let parcelInfo = contract.try_getParcelInfo(event.params._tokenId);

    if (!parcelInfo.reverted) {
        let parcelMetadata = parcelInfo.value;
        parcel.parcelId = parcelMetadata.parcelId;
        parcel.tokenId = event.params._tokenId;
        parcel.coordinateX = parcelMetadata.coordinateX;
        parcel.coordinateY = parcelMetadata.coordinateY;
        parcel.district = parcelMetadata.district;
        parcel.parcelHash = parcelMetadata.parcelAddress;

        parcel.size = parcelMetadata.size;

        let boostArray = parcelMetadata.boost;
        parcel.fudBoost = boostArray[0];
        parcel.fomoBoost = boostArray[1];
        parcel.alphaBoost = boostArray[2];
        parcel.kekBoost = boostArray[3];
    }

    //update auction too

    // Entities can be written to the store with `.save()`
    parcel.save();
}

export function handleTransferParcel(event: Transfer): void {
    let user = getOrCreateUser(event.params._to.toHexString());
    user.save();

    let parcel = Parcel.load(event.params._tokenId.toString())!;
    parcel.owner = user.id;
    parcel.save();
}

export function handleMintParcel(event: MintParcel): void {
    let parcel = getOrCreateParcel(
        event.params._tokenId,
        event.params._owner,
        event.address
    );
    parcel.save();
}

export function handleChannelAlchemica(event: ChannelAlchemica): void {
    let gotchi = getOrCreateAavegotchi(event.params._gotchiId.toString(), event)!;
    let parcel = Parcel.load(event.params._realmId.toString())!;
    let channeledAlchemica = getOrCreateChanneledAlchemica(gotchi, parcel, event);

    channeledAlchemica.alchemica = event.params._alchemica;
    channeledAlchemica.spiloverRadius = event.params._spilloverRadius;
    channeledAlchemica.spiloverRate = event.params._spilloverRate;
    channeledAlchemica.save();

    gotchi.lastChanneledAlchemica = event.block.timestamp;
    gotchi.save();
}
