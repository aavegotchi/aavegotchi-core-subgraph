const dotenv = require("dotenv");
dotenv.config();
console.log(process.env.GRAPH_URL)
module.exports = {
    rpcUrl: process.env.RPC_URL,
    graphUrl: process.env.GRAPH_URL
}