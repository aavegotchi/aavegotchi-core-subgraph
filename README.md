# aavegotchi-matic-subgraph

The official Matic subgraph of Aavegotchi.
The best way to start with the subgraph is our deployed playground URL: https://thegraph.com/explorer/subgraph/aavegotchi/aavegotchi-core-matic?version=current

Additionally you can find the entire documentation of the schema in ./doc/schema
## Setup

If you never worked with the graph before. We recommend to take some time to understand the core concepts of the graph. A good entry is their [TheGraph Docs](https://thegraph.com/docs/developer/quick-start).

1. Start a graph node, connected to an Polygon Archive Node. 
2. In order to install all lib please run ```yarn```
3. If the graph node runs locally you can simply run ```yarn create-local``` which creates the subgraph on the graph node. 
4. Afterwards you run ```yarn deploy-local``` which deploys the subgraph to the graph nodes and the indexing process starts. This can take up to 24 hours.

## Unit Testing

You can enable unit testing by changing the following line in file `src/index.ts`.
If you create a pull request please leave this line commented out. Otherwise it breaks the deployment!

change
```
// export { runTests } from "./tests/aavegotchi.test";
``` 
to
```
export { runTests } from "./tests/aavegotchi.test";
```

Afterwards you are able to run the unit tests with 
```
yarn test
``` 

Unit Tests allows us to test specific handlers with specific events. We can mock contract calls and check how the handler  assert the state of the subgraph afterwards. It also allows us to clear the state. You can find various examples in src/tests/

```js
test("handleMintPortals - should update portal status and stats entity", () => {
    // prepare event
    let event = new MintPortals();
    event.block.number = BIGINT_ONE;
    let _tokenId = new ethereum.EventParam();
    _tokenId.value = ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)
    event.parameters.push(_tokenId);
    let contractAddress = Address.fromString("0x86935F11C86623deC8a25696E1C19a8659CbF95d");
    event.address = contractAddress;

    // create mock for updateAavegotchi and getAavegotchi
    createMockedFunction(
        contractAddress,
        "getAavegotchi",
        "getAavegotchi(uint256):((uint256,string,...,uint8,int16,uint32))[]))"
    )
    .withArgs([ethereum.Value.fromUnsignedBigInt(BIGINT_ONE)])
    .returns(getAavegotchiMock());

    // execute handler with event
    handleMintPortals(event);

    // assert and clear store
    assert.fieldEquals("Aavegotchi", "1", "timesInteracted", "1");
    clearStore();
});
```

## Contribute

If you want to contribute it would be best to start with a fork. A new branch called feat/name, fix/bug or docs/docTitle for the specific scope. Afterwards please create a PR with a the prefix `WIP:`.

If you implement new handlers or fix something please provide unit tests and provide a deployment with your PR. If your done and your tests work as well as the deployed subgraph please remove the WIP: prefix from the PR.

## Contact

You can find us at the Aavegotchi Discord
- Coderdan
- Frank Pfeift
