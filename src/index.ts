const ethers = require('ethers');
const fs = require('fs');
const path = require('path');

// mainnet simple deposit relay
const artTokenABI = JSON.parse(fs.readFileSync(path.join(__dirname + '/ArtTokenABI.json')));