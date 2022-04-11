const jsonDiff = require("json-diff");

function compare(result1, result2) {
  const comparedResult = jsonDiff.diff(result1, result2);
  if (comparedResult == undefined) {
    return true;
  }

  console.log(JSON.stringify(comparedResult));
  return false;
}

module.exports = compare;
