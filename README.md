# aavegotchi-matic-subgraph

The official Matic subgraph of Aavegotchi.
The best way to start with the subgraph is our deployed playground URL: https://thegraph.com/explorer/subgraph/aavegotchi/aavegotchi-core-matic?version=current

Additionally you can find the entire documentation of the schema in ./doc/schema
## Setup

If you never worked with the graph before. We recommend to take some time to understand the core concepts of the graph. Further you need a matic archive node and a graph node. 

1. In order to install all lib please run ```yarn```
2. If the graph node runs locally you can simply run ```yarn create-local``` which creates the subgraph on the graph node. 
3. Afterwards you run ```yarn deploy-local``` which deploys the subgraph to the graph nodes which means that the indexing process starts.


## Contribute

If you want to contribute it would be best to start with a ticket which describes the bug or feature request. Often we have some hints. 
We also started separating things. If you contribution does not belong to the core and can be separated you should separate it into an own repository. Otherwise please feel free to fork and create pull requests.

Subgraph development is not easy and takes long time. Especially on short block interval chains like polygon. The aavegotchi subgraph takes right now round about 12hours to index all the existing data.

In order to avoid stupid errors while indexing we started using of Matchstick which is a unit testing tool for subgraph development.
If you contribute it would be very helpful if you provide unit tests which proof that your code works. You can find our tests in the ./src/tests directory.