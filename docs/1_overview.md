# Introduction

A Graph Node provides a GraphQL interface which allows to fetch data from the blockchain in a fast and efficient way. This is possible, because the Graph Node listens on the Blockchain and maintains an own state in a dedicated database. 

In order to fetch the data through the GraphQL interface its necessary to install a Subgraph. A Subgraph is a piece of code which contains of three different parts: The Subgraph configuration file, the schema and the handlers. Its purpose is to index data from specific data sources.

The Subgraph configuration file "subgraph.yml" contains, next to some metadata e.g. name and description of the subgraph, datasources and their corressponding event handlers. Right now the Aavegotchi subgraph.yml has only one datasource, which is the AavegotchiDiamond Contract, but multiple event handlers, e.g. when someone interacts with her Aavegotchi on creates a listing on the bazaar.

The Smart Contract emits an event, which is received by the graph node, which then executes the event handler of the specific datasource, e.g. handleAavegotchiInteract. The event handler receives the event and updates the aavegotchi entity in the dedicated database.

Afterwards the data can be queries through the GraphQL interface. Aavegotchi provides three different Subgraphs: One for the Fundraising, one for the Staking and one for the game itself. 

# The Subgraphs 

In the following chapters we describe all developed Subgraphs. The subgraphs are separated by its purpose: Fundraising, Staking, Aavegotchi Game 

## Aavegotchi Game Subgraph

Subgraph Url: https://
Repository: https://github

This subgraph provides all information about the Aavegotchi Game. This includes information about portals, aavegotchis, items as well as listings on the bazaar. Additionally you can fetch some useful statistics

Below you can find some useful queries:

### Fetch Aavegotchi with specific ID

### Fetch Aavegotchis with specific Collateral

### Fetch all available portals from the Bazaar

### Fetch all available Santa Hats from the Bazaar

### Fetch statistics

## Staking Subgraph

Subgraph Url: https://
Repository: https://github

The purpose of this subgraph is to provide all necessary information for the staking. This includes information about how much is staked overall in the appropriate Pools, as well as provide address specific informations.

### Fetch overall information for the GHST-WETH Pool

### Fetch user specific information for the GHST-WETH Pool

## Fundraising 

Subgraph Url: https://
Repository: https://github
