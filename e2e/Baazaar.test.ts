const query = require("./helper/query");
const config = require("./helper/config");
const compare = require("./helper/compare");

describe("ERC721 Listings E2E", () => {

    it("should have trait values if item is an aavegotchi", async () => {
        let queryString = `
            {erc721Listings(where: {gotchi_not: null} block: {number: 11518482} first: 5) {
                nrgTrait
                aggTrait
                spkTrait
                brnTrait
                eysTrait
                eycTrait
            }}
        `

        let expectedResult = {
            "data": {
                "erc721Listings": [
                {
                    "nrgTrait": "97",
                    "aggTrait": "15",
                    "spkTrait": "94",
                    "brnTrait": "81",
                    "eysTrait": "65",
                    "eycTrait": "79"
                },
                {
                    "nrgTrait": "75",
                    "aggTrait": "90",
                    "spkTrait": "0",
                    "brnTrait": "53",
                    "eysTrait": "13",
                    "eycTrait": "89"
                },
                {
                    "nrgTrait": "92",
                    "aggTrait": "55",
                    "spkTrait": "63",
                    "brnTrait": "71",
                    "eysTrait": "31",
                    "eycTrait": "96"
                },
                {
                    "nrgTrait": "56",
                    "aggTrait": "96",
                    "spkTrait": "51",
                    "brnTrait": "6",
                    "eysTrait": "98",
                    "eycTrait": "88"
                },
                {
                    "nrgTrait": "93",
                    "aggTrait": "89",
                    "spkTrait": "90",
                    "brnTrait": "6",
                    "eysTrait": "89",
                    "eycTrait": "97"
                }
                ]
            }
        }

        const result = await query(config.endpoint, queryString);
        expect(result).toStrictEqual(expectedResult);
    })

    it("should have amount equipped wearables if item is an aavegotchi", async () => {
        let queryString = `
            {erc721Listings(where:{gotchi_not: null,  amountEquippedWearables_gt: 0} first: 5 block: {number: 11518482}) {
                amountEquippedWearables
            }}
        `

        let expectedResult = {
            "data": {
                "erc721Listings": [
                {
                    "amountEquippedWearables": 4
                },
                {
                    "amountEquippedWearables": 1
                },
                {
                    "amountEquippedWearables": 3
                },
                {
                    "amountEquippedWearables": 3
                },
                {
                    "amountEquippedWearables": 3
                }
                ]
            }
        }

        const result = await query(config.endpoint, queryString);
        expect(result).toStrictEqual(expectedResult);
    })

    it("should have a flag whether item (portal or aavegotchi) was sold before or not", async () => {
        let queryString = `
            {erc721Listings(first: 5 block: {number: 11518482}) {
                soldBefore
            }}
        `

        let expectedResult = {
            "data": {
                "erc721Listings": [
                {
                    "soldBefore": false
                },
                {
                    "soldBefore": false
                },
                {
                    "soldBefore": false
                },
                {
                    "soldBefore": true
                },
                {
                    "soldBefore": false
                }
                ]
            }
        }

        const result = await query(config.endpoint, queryString);
        expect(result).toStrictEqual(expectedResult);
    })

    it("should have a claimedAt attribute if item is an aavegotchi", async () => {
        let queryString = `
            {erc721Listings(where: {gotchi_not: null} first: 5 block: {number:11518482}) {
                claimedAt
            }}
        `

        let expectedResult = {
            "data": {
                "erc721Listings": [
                {
                    "claimedAt": "11518187"
                },
                {
                    "claimedAt": "11518269"
                },
                {
                    "claimedAt": "11518300"
                },
                {
                    "claimedAt": "11518082"
                },
                {
                    "claimedAt": "11517696"
                }
                ]
            }
        }

        const result = await query(config.endpoint, queryString);
        expect(result).toStrictEqual(expectedResult);
    })

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

describe("ERC1155 Listings E2E", () => {

    it("should have trait modifiers", async () => {
        let queryString = `
            {erc1155Listings(first: 5 block: {number: 11518482}) {
                nrgTraitModifier
                aggTraitModifier
                spkTraitModifier
                brnTraitModifier
                eysTraitModifier
                eycTraitModifier
            }}
        `

        let expectedResult = {
            "data": {
                "erc1155Listings": [
                {
                    "nrgTraitModifier": "0",
                    "aggTraitModifier": "0",
                    "spkTraitModifier": "2",
                    "brnTraitModifier": "2",
                    "eysTraitModifier": "0",
                    "eycTraitModifier": "0"
                },
                {
                    "nrgTraitModifier": "0",
                    "aggTraitModifier": "0",
                    "spkTraitModifier": "0",
                    "brnTraitModifier": "-1",
                    "eysTraitModifier": "0",
                    "eycTraitModifier": "0"
                },
                {
                    "nrgTraitModifier": "0",
                    "aggTraitModifier": "0",
                    "spkTraitModifier": "0",
                    "brnTraitModifier": "1",
                    "eysTraitModifier": "0",
                    "eycTraitModifier": "0"
                },
                {
                    "nrgTraitModifier": "0",
                    "aggTraitModifier": "0",
                    "spkTraitModifier": "2",
                    "brnTraitModifier": "2",
                    "eysTraitModifier": "0",
                    "eycTraitModifier": "0"
                },
                {
                    "nrgTraitModifier": "2",
                    "aggTraitModifier": "0",
                    "spkTraitModifier": "0",
                    "brnTraitModifier": "0",
                    "eysTraitModifier": "0",
                    "eycTraitModifier": "0"
                }
                ]
            }
        }

        const result = await query(config.endpoint, queryString);
        expect(result).toStrictEqual(expectedResult);
    })

})