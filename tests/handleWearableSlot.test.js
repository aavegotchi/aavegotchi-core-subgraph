const hre = require("hardhat");
const { startTestEnvironment, createSubgraph, deploySubgraph, executeQuery, stopTestEnvironment } = require("./helper")

const query = `{
    itemTypes(first:5) {
        id, traitModifiers, slotPositions
    }
}`

let result1, result2;

describe("handleWearableSlot", () => {
    beforeAll(async() => {
        // start test environment and fork block 17000000
        // await startTestEnvironment(17000000);
        result1 = await executeQuery(query)
        // todo: execute transaction
        result2 = await executeQuery(query)
        console.log(result2);
    })
    afterAll(() => {
        stopTestEnvironment();
    })
    it("changes the possible slots of wearables according to the given event", async () => {
        // assert graphql query 1 positions != graphql query 2 positions
        // assert graphql query 2 positions === bool[] positions
        expect(result1.data).toBe(result2.data);
        
    })
})
