const checkSubgraph = require("../e2e/helper/checkSubgraph");

checkSubgraph().then((result) => {
  if (!result) {
    console.log("Subgraph not ready");
    return process.exit(1);
  }

  console.log("Subgraph ready");
  return process.exit(0);
});
