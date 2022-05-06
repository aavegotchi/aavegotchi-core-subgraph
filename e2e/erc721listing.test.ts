const query = require("./helper/query");
const config = require("./helper/config");
const compare = require("./helper/compare");

describe("ERC721Listings E2E", () => {

    it("should have a collateral, experience and kinship if listing is a gotchi", async () => {
        let queryString = `
        {erc721Listings (first: 5 where: {gotchi_not: null} block: {number: 19000000}) {
            collateral, kinship, experience
          }}
        `

        let result = {
            "data": {
              "erc721Listings": [
                {
                  "collateral": "0xe0b22e0037b130a9f56bbb537684e6fa18192341",
                  "kinship": "51",
                  "experience": "0"
                },
                {
                  "collateral": "0x823cd4264c1b951c9209ad0deaea9988fe8429bf",
                  "kinship": "11",
                  "experience": "35"
                },
                {
                  "collateral": "0xdae5f1590db13e3b40423b5b5c5fbf175515910b",
                  "kinship": "6",
                  "experience": "0"
                },
                {
                  "collateral": "0xe20f7d1f0ec39c4d5db01f53554f2ef54c71f613",
                  "kinship": "36",
                  "experience": "0"
                },
                {
                  "collateral": "0xe20f7d1f0ec39c4d5db01f53554f2ef54c71f613",
                  "kinship": "53",
                  "experience": "0"
                }
              ]
            }
          }

          let fetchedResult = await query(config.endpoint, queryString);
          expect(fetchedResult).toStrictEqual(result);
    })

})