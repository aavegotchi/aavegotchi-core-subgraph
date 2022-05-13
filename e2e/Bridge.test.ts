const query = require("./helper/query");
const config = require("./helper/config");
const compare = require("./helper/compare");

describe("Bridge E2E", () => {
  it("should change owner on bridge back", async () => {
    const queryString = `
    {portal(id: "8107", block: {number: 20055551 }) {
        owner {
          id
        }
      }}
    `;

    const result = await query(config.endpoint, queryString);

    expect(result.data.portal.owner.id).toBe("0x86935f11c86623dec8a25696e1c19a8659cbf95d");


    const queryStringNew = `
    {portal(id: "8107", block: {number: 20055552 }) {
        owner {
          id
        }
      }}
    `;

     const resultNew = await query(config.endpoint, queryStringNew);

    expect(resultNew.data.portal.owner.id).toBe("0xaba3abe71987030782b3312f23ca0f199791a748");
  })

})