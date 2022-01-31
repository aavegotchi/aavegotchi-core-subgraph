const query = require("./helper/query");
const config = require("./helper/config");
const compare = require("./helper/compare");

describe("Aavegotchis", () => {
  it("should not contain an entity with claimedAt: null", async () => {
    const queryString = `
      { aavegotchis(first: 1000 where: {claimedAt: null}) {
          id
          claimedAt
      }}
    `;

    const {data} = await query(config.endpoint, queryString);
    expect(data.aavegotchis).toHaveLength(0);
  });

  it("should not have different owners after upgrade", async () => {
    const queryString = `
      { aavegotchis(first: 1000) {
        id
        owner
    }}
    `

    const result = await query(config.endpoint, queryString);
    const resultCmp = await query(config.endpointProd, queryString);
    const response = compare(result.data, resultCmp.data)
    expect(response).toBe(true);
  })
});
