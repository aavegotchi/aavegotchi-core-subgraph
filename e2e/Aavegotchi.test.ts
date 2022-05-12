const query = require("./helper/query");
const config = require("./helper/config");
const compare = require("./helper/compare");

describe("Aavegotchis E2E", () => {
  it("should not have a gotchi without claimedAt attribute (null)", async () => {
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
      { aavegotchis(first: 1000 orderBy: claimedAt) {
        id
        owner {
          id
        }
    }}
    `

    const result = await query(config.endpoint, queryString);
    const resultCmp = await query(config.endpointProd, queryString);
    const response = compare(resultCmp.data, result.data)
    expect(response).toBe(true);
  })

  it("should not have an gotchi without owner(null)", async () => {
    const queryString = `
    {
      aavegotchis(where: {owner:null}) {
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

  it("should have only gotchis with status claimed(3) or sacrificed(0)", async () => {
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

  it("should have multiple gotchis with status sacrificed (0)", async () => {
    const queryString = `
    {
      aavegotchis(first: 1000 where: {status: "0"}) {
        id
        gotchiId
        status
        owner {
          id
        }
      }
    }
    `
  
    const {data} = await query(config.endpoint, queryString);
    expect(data.aavegotchis).not.toHaveLength(0);
  })

  it("should maintain proper kinship level on lendings", async () => {
    const queryString = `{
      gotchiLendings(block: {number:27091286} where:{gotchiTokenId:"4430" id:"166650"}) {
        id
        completed
        cancelled
        gotchi {
          kinship
          lending
        } 
        gotchiKinship
        gotchiTokenId
      }
    }`;

    const result = await query(config.endpoint, queryString);
    const expectedResult = {
      "data": {
        "gotchiLendings": [
          {
            "id": "166650",
            "completed": false,
            "cancelled": false,
            "gotchi": {
              "kinship": "665",
              "lending": "166650"
            },
            "gotchiKinship": "665",
            "gotchiTokenId": "4430"
          }
        ]
      }
    }
    expect(result).toStrictEqual(expectedResult);

  })
});