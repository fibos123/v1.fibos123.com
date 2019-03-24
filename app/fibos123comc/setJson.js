var FIBOS = require('fibos.js');
const config = require('./config');
const fs = require('fs');
const sites = JSON.parse(fs.readFileSync("./sites.json"));

var fibosContract = FIBOS({
    chainId: config.client.chainId,
    keyProvider: config.accountContract.privateKey, 
    httpEndpoint: config.client.httpEndpoint,
    logger: {
        log: null,
        error: null
    }
}); 

var ctx = fibosContract.contractSync(config.testContract.name);

var res = ctx.updateSync("sites", JSON.stringify(sites), {
    authorization: config.testContract.name
});

console.log(res)