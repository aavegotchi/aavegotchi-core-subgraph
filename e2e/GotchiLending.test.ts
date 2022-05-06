const query = require("./helper/query");
const config = require("./helper/config");
const compare = require("./helper/compare");

describe("GotchiLending E2E", () => {
    it("should track claimed tokens", async () => {
        let queryString = `
            {claimedTokens(first: 5 block: {number: 27000000}) {
                token
                amount
                lending {
                id
                }
            }}
        `;

        let expectedResult = {
            "data": {
                "claimedTokens": [
                {
                    "token": "0x403e967b044d4be25170310157cb1a4bf10bdd0f",
                    "amount": "4000000000000000000",
                    "lending": {
                    "id": "100000"
                    }
                },
                {
                    "token": "0x42e5e06ef5b90fe15f853f59299fc96259209c5c",
                    "amount": "0",
                    "lending": {
                    "id": "100000"
                    }
                },
                {
                    "token": "0x44a6e0be76e1d9620a7f76588e4509fe4fa8e8c8",
                    "amount": "4000000000000000000",
                    "lending": {
                    "id": "100000"
                    }
                },
                {
                    "token": "0x6a3e7c3c6ef65ee26975b12293ca1aad7e1daed2",
                    "amount": "3000000000000000000",
                    "lending": {
                    "id": "100000"
                    }
                },
                {
                    "token": "0x403e967b044d4be25170310157cb1a4bf10bdd0f",
                    "amount": "94000000000000000000",
                    "lending": {
                    "id": "10000"
                    }
                }]
            }
        }

        const result = await query(config.endpoint, queryString);
        expect(result).toStrictEqual(expectedResult);
    })

    it("should have gotchisLentOut and gotchisBorrowed in user entity", async () => {
        const queryString = `{
            users(block: {number: 27538488} where: {id: "0x1ad3d72e54fb0eb46e87f82f77b284fc8a66b16c"}) {
                gotchisBorrowed
                gotchisLentOut
            }
        }`;

        const {data} = await query(config.endpoint, queryString);
        expect(data).toStrictEqual({
            "users": [
            {
                "gotchisBorrowed": [],
                "gotchisLentOut": [
                "20695",
                "12509"
                ]
            }
            ]
        });
    })

    it("should have gotchi lending entity", async () => {
        let queryString = `
            {gotchiLendings(first: 5 block: {number: 27000000}) {
                gotchi {
                    id
                }
            }}
        `;

        let expectedResult = {
            "data": {
                "gotchiLendings": [
                {
                    "gotchi": {
                    "id": "20203"
                    }
                },
                {
                    "gotchi": {
                    "id": "21821"
                    }
                },
                {
                    "gotchi": {
                    "id": "12492"
                    }
                },
                {
                    "gotchi": {
                    "id": "4435"
                    }
                },
                {
                    "gotchi": {
                    "id": "11808"
                    }
                }
                ]
            }
        };

        let result = await query(config.endpoint, queryString);
        expect(result).toStrictEqual(expectedResult);
    })
})