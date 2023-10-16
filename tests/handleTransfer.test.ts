import {
    Address,
    BigInt,
    Bytes,
    ethereum,
    store,
} from "@graphprotocol/graph-ts";
import {
    describe,
    test,
    beforeAll,
    newMockEvent,
    assert,
    createMockedFunction,
} from "matchstick-as/assembly/index";
import { Transfer } from "../generated/FAKEGotchisNFTDiamond/IERC721";
import {
    Account,
    ERC721Token,
    MetadataActionLog,
    NFTHolder,
    NFTStatistic,
    Transaction,
} from "../generated/schema";
import {
    ADDRESS_DEAD,
    ADDRESS_ZERO,
    BIGINT_ONE,
    BIGINT_ZERO,
} from "../src/constants";
import { handleTransfer } from "../src/diamonds/fakeGotchisNFT";

export function createTransferEvent(
    from: string,
    to: string,
    tokenId: i32
): Transfer {
    let mockEvent = newMockEvent();
    let event = new Transfer(
        mockEvent.address,
        mockEvent.logIndex,
        mockEvent.transactionLogIndex,
        mockEvent.logType,
        mockEvent.block,
        mockEvent.transaction,
        mockEvent.parameters,
        null
    );
    event.parameters = new Array();
    let fromAddress = new ethereum.EventParam(
        "_from",
        ethereum.Value.fromAddress(Address.fromString(from))
    );
    let toAddress = new ethereum.EventParam(
        "_to",
        ethereum.Value.fromAddress(Address.fromString(to))
    );
    let tokenIdNumber = new ethereum.EventParam(
        "_tokenId",
        ethereum.Value.fromI32(tokenId)
    );

    event.parameters.push(fromAddress);
    event.parameters.push(toAddress);
    event.parameters.push(tokenIdNumber);

    return event;
}

const sender = "0xacb0ba5da1101f204356420f87e1f1047ac65c8c";
const receiver = "0x46a3a41bd932244dd08186e4c19f1a7e48cbcdf4";
const tokenId = 1;
const event = createTransferEvent(sender, receiver, tokenId);

describe("handleTransfer", () => {
    beforeAll(() => {
        const transaction = new Transaction("abc");
        const log = new MetadataActionLog("1");
        log.emitter = Bytes.fromHexString(sender);
        log.transaction = transaction.id;
        log.timestamp = BIGINT_ZERO;
        log.editions = 1;

        const tokenEntityId = event.transaction
            .to!.toHex()
            .concat("/")
            .concat(BIGINT_ONE.toHex());
        const token = new ERC721Token(tokenEntityId);
        token.metadata = "1";
        token.contract = ADDRESS_DEAD;
        token.identifier = BIGINT_ONE;
        token.owner = ADDRESS_DEAD;
        token.approval = ADDRESS_ZERO;
        token.editions = 0;

        const senderAccount = new Account(Bytes.fromHexString(sender));
        senderAccount.totalPiecesOwnedArray = "{}";
        senderAccount.totalUniquePiecesOwnedArray = "{}";
        senderAccount.totalUniquePiecesOwned = 0;
        senderAccount.currentUniquePiecesOwned = 0;
        senderAccount.currentUniquePiecesOwnedArray = "{}";
        senderAccount.tokens = "{}";
        senderAccount.amountTokens = 0;

        const holder = new NFTHolder(
            "0x46a3a41bd932244dd08186e4c19f1a7e48cbcdf4-1"
        );
        holder.amount = 0;
        holder.holder = Address.fromString(receiver);
        holder.nftStats = "1";

        store.set("MetadataActionLog", "1", log);
        store.set("ERC721Token", tokenEntityId, token);
        store.set("Account", sender, senderAccount);
        // store.set("NFTStatistic", "1", nftStats);
        store.set(
            "NFTHolder",
            "0x46a3a41bd932244dd08186e4c19f1a7e48cbcdf4-1",
            holder
        );

        createMockedFunction(
            event.transaction.to!,
            "name",
            "name():(string)"
        ).returns([ethereum.Value.fromString("Ghost")]);

        createMockedFunction(
            event.transaction.to!,
            "symbol",
            "symbol():(string)"
        ).returns([ethereum.Value.fromString("GHST")]);

        createMockedFunction(
            event.transaction.to!,
            "tokenURI",
            "tokenURI(uint256):(string)"
        )
            .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
            .returns([ethereum.Value.fromString("https://app.aavegotchi.com")]);

        createMockedFunction(
            event.transaction.to!,
            "tokenURI",
            "tokenURI(uint256):(string)"
        )
            .withArgs([
                ethereum.Value.fromUnsignedBigInt(BIGINT_ONE.plus(BIGINT_ONE)),
            ])
            .returns([ethereum.Value.fromString("https://app.aavegotchi.com")]);
    });

    test("it should update total, nft and holder stats if tx is mint", () => {
        const event = createTransferEvent(
            ADDRESS_ZERO.toHexString(),
            receiver,
            tokenId
        );
        handleTransfer(event);

        // total stats
        assert.fieldEquals(
            "TotalStatistic",
            "0",
            "totalEditionsCirculating",
            "1"
        );
        assert.fieldEquals("TotalStatistic", "0", "totalEditionsMinted", "1");
        assert.fieldEquals("TotalStatistic", "0", "totalNFTs", "1");
        assert.fieldEquals("TotalStatistic", "0", "burnedNFTs", "0");
        assert.fieldEquals("TotalStatistic", "0", "totalOwners", "1");

        // nft stats
        assert.fieldEquals("NFTStatistic", "1", "burned", "0");
        assert.fieldEquals("NFTStatistic", "1", "amountHolder", "1");
        assert.fieldEquals("NFTStatistic", "1", "totalSupply", "1");
        assert.fieldEquals("NFTStatistic", "1", "metadata", "1");
        assert.fieldEquals("NFTStatistic", "1", "tokenIds", "[1]");

        // NFT Holder Stats
        let idSender = receiver + "-1";
        assert.fieldEquals("NFTHolder", idSender, "holder", receiver);
        assert.fieldEquals("NFTHolder", idSender, "amount", "1");
        assert.fieldEquals("NFTHolder", idSender, "nftStats", "1");

        // account stats
        assert.fieldEquals("Account", receiver, "totalUniquePiecesOwned", "1");
        assert.fieldEquals(
            "Account",
            receiver,
            "currentUniquePiecesOwned",
            "1"
        );
    });

    test("it should update total, nft and holder stats if tx is transfer", () => {
        const event = createTransferEvent(receiver, sender, tokenId);
        handleTransfer(event);

        // Total Stats
        assert.fieldEquals(
            "TotalStatistic",
            "0",
            "totalEditionsCirculating",
            "1"
        );
        assert.fieldEquals("TotalStatistic", "0", "totalEditionsMinted", "1");
        assert.fieldEquals("TotalStatistic", "0", "totalNFTs", "1");
        assert.fieldEquals("TotalStatistic", "0", "burnedNFTs", "0");
        assert.fieldEquals("TotalStatistic", "0", "totalOwners", "1");

        // NFT Stats
        assert.fieldEquals("NFTStatistic", "1", "burned", "0");
        assert.fieldEquals("NFTStatistic", "1", "amountHolder", "1");
        assert.fieldEquals("NFTStatistic", "1", "totalSupply", "1");
        assert.fieldEquals("NFTStatistic", "1", "metadata", "1");
        assert.fieldEquals("NFTStatistic", "1", "tokenIds", "[1]");

        // NFT Holder Stats
        let idSender = receiver + "-1";
        assert.fieldEquals("NFTHolder", idSender, "holder", receiver);
        assert.fieldEquals("NFTHolder", idSender, "amount", "0");
        assert.fieldEquals("NFTHolder", idSender, "nftStats", "1");

        let idReceiver = sender + "-1";
        assert.fieldEquals("NFTHolder", idReceiver, "holder", sender);
        assert.fieldEquals("NFTHolder", idReceiver, "amount", "1");
        assert.fieldEquals("NFTHolder", idReceiver, "nftStats", "1");

        // Account
        assert.fieldEquals("Account", receiver, "totalUniquePiecesOwned", "1");
        assert.fieldEquals(
            "Account",
            receiver,
            "currentUniquePiecesOwned",
            "0"
        );

        assert.fieldEquals("Account", sender, "totalUniquePiecesOwned", "1");
        assert.fieldEquals("Account", sender, "currentUniquePiecesOwned", "1");
    });

    test("it should update total, nft and holder stats if tx is burn", () => {
        const event = createTransferEvent(
            sender,
            ADDRESS_ZERO.toHexString(),
            tokenId
        );
        handleTransfer(event);

        // Total Stats
        assert.fieldEquals(
            "TotalStatistic",
            "0",
            "totalEditionsCirculating",
            "0"
        );
        assert.fieldEquals("TotalStatistic", "0", "totalEditionsMinted", "1");
        assert.fieldEquals("TotalStatistic", "0", "totalNFTs", "0");
        assert.fieldEquals("TotalStatistic", "0", "burnedNFTs", "1");
        assert.fieldEquals("TotalStatistic", "0", "totalOwners", "0");

        // NFT Stats
        assert.fieldEquals("NFTStatistic", "1", "burned", "1");
        assert.fieldEquals("NFTStatistic", "1", "amountHolder", "0");
        assert.fieldEquals("NFTStatistic", "1", "totalSupply", "0");
        assert.fieldEquals("NFTStatistic", "1", "metadata", "1");
        assert.fieldEquals("NFTStatistic", "1", "tokenIds", "[]");

        // NFT Holder Stats
        let idSender = sender + "-1";
        assert.fieldEquals("NFTHolder", idSender, "holder", sender);
        assert.fieldEquals("NFTHolder", idSender, "amount", "0");
        assert.fieldEquals("NFTHolder", idSender, "nftStats", "1");

        // Account
        assert.fieldEquals("Account", sender, "totalUniquePiecesOwned", "1");
        assert.fieldEquals("Account", sender, "currentUniquePiecesOwned", "0");
    });
});