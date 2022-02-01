const query = require("./helper/query");
const config = require("./helper/config");
const compare = require("./helper/compare");

describe("Aavegotchis", () => {
  it("should not contain an aavegotchi entity with claimedAt: null", async () => {
    const queryString = `
      { aavegotchis(first: 1000 where: {claimedAt: null, status: "3"}) {
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

  it("should not contain an aavegotchi entity with status equals 3 and owners: null", async () => {
    const queryString = `
    {
      aavegotchis(where: {owner:null, status: "3"}) {
        id
        gotchiId
        owner {
          id
        }
      }
    }
    `

    const {data} = await query(config.endpoint, queryString);
    expect(data.aavegotchis).toHaveLength(0);
  })

  it("should not contain an aavegotchi entity with status not equal 3 or 0", async () => {
    const queryString = `
    {
      aavegotchis(first: 1000 where: {status_not_in: ["0", "3"]}) {
        id
        gotchiId
        status
      }
    }
    `
  
    const {data} = await query(config.endpoint, queryString);
    expect(data.aavegotchis).toHaveLength(0);
  })
});


