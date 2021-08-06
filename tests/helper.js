const { exec } = require("child_process");
const { createApolloFetch } = require("apollo-fetch");
const config = require("./config");
const { patching } = require("gluegun");
const path = require("path");
const fs = require("fs");
const os = require("os");


function setEnvValue(key, value) {

    // read file from hdd & split if from a linebreak to a array
    const ENV_VARS = fs.readFileSync("./.env", "utf8").split(os.EOL);

    // find the env we want based on the key
    const target = ENV_VARS.indexOf(ENV_VARS.find((line) => {
        return line.match(new RegExp(key));
    }));

    // replace the key/value with the new value
    ENV_VARS.splice(target, 1, `${key}=${value}`);

    // write everything back to the file system
    fs.writeFileSync("./.env", ENV_VARS.join(os.EOL));

}


setEnvValue("VAR1", "ENV_1_VAL");
const srcDir = path.join(__dirname, "..");

const fetchSubgraphs = createApolloFetch({uri: config.graphUrl})

async function startTestEnvironment(blockNumber) {
    // patch subgraph 
    // await patching.replace(
    //     path.join(srcDir, "subgraph.yaml"),
    //     "BLOCKPLACEHOLDER",
    //     blockNumber
    // );

    // await patching.replace(
    //     path.join(srcDir, "./.env.test"),
    //     "BLOCKPLACEHOLDER",
    //     blockNumber
    // );
    exec(`sudo docker-compose -f ./testEnvironment/docker-compose.yml --env-file ./.env up -d `, console.log)

    // @todo: optimize
    await new Promise((resolve) => {
        setTimeout(() => {
            createSubgraph();
            console.log("Subgraph created")
            setTimeout(() => {
                deploySubgraph();
                console.log("Subgraph deployed")
                setTimeout(() => {
                    console.log("ready to execute tests");
                    resolve(true);
                }, 5000)
            }, 4000)
        }, 5000)
    })
    
    
    
    
    
}

function stopTestEnvironment() {
    exec("sudo docker-compose down -v")
}

function createSubgraph() {
    exec("yarn create-local")
}

function deploySubgraph() {
    exec("yarn deploy-local")
}

function removeSubgraph() {
    exec("yarn remove-local")
}

async function executeQuery(query) {
    return await fetchSubgraphs({query});
}

module.exports = {
    startTestEnvironment,
    createSubgraph,
    removeSubgraph,
    deploySubgraph,
    executeQuery,
    stopTestEnvironment
}