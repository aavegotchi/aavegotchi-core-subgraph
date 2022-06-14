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
                    "id": "22239"
                    }
                },
                {
                    "gotchi": {
                    "id": "2575"
                    }
                },
                {
                    "gotchi": {
                    "id": "15823"
                    }
                },
                {
                    "gotchi": {
                    "id": "20203"
                    }
                },
                {
                    "gotchi": {
                    "id": "21821"
                    }
                }
                ]
            }
        };

        let result = await query(config.endpoint, queryString);
        expect(result).toStrictEqual(expectedResult);
    })

    it("should change owner, not originalOwner", async()=> {
        let borrower = "0xf06dcbec97d02e0df8d304bdbbb7ccab587c3e1f";
        let originalOwner = "0x1ad3d72e54fb0eb46e87f82f77b284fc8a66b16c";
        let getQuery = block => `{
            gotchiLending(id:"900596" block: {number:${block}}) {
              originalOwner
              borrower
              completed
              cancelled
                gotchi {
                originalOwner {
                  id
                }
                owner {
                  id
                }
              }
              }
          }`;

          let furtherBlocks = [29521786, 29521787, 29521811];
          let block = furtherBlocks[0]
          let firstResult = await query(config.endpoint, getQuery(block));
          console.log(JSON.stringify(firstResult));
          block = furtherBlocks[1];
          let secondResult = await query(config.endpoint, getQuery(block));
          console.log(JSON.stringify(secondResult));
          block = furtherBlocks[2];
          let thirdResult = await query(config.endpoint, getQuery(block));
          console.log(JSON.stringify(thirdResult));
          expect(firstResult.data.gotchiLending.gotchi.originalOwner.id).toStrictEqual(originalOwner);
          expect(secondResult.data.gotchiLending.gotchi.originalOwner.id).toStrictEqual(originalOwner);
          expect(thirdResult.data.gotchiLending.gotchi.originalOwner.id).toStrictEqual(originalOwner);

          expect(firstResult.data.gotchiLending.gotchi.owner.id).toStrictEqual(originalOwner);
          expect(secondResult.data.gotchiLending.gotchi.owner.id).toStrictEqual(borrower);
          expect(thirdResult.data.gotchiLending.gotchi.owner.id).toStrictEqual(originalOwner);


    })
})