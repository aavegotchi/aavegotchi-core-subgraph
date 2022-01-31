require("dotenv").config();
const config = {
  endpoint: process.env.GRAPH_URL,
  endpointProd: process.env.GRAPH_URL_PROD,
  rpcUrl: process.env.RPC_URL,
};

module.exports = config;
