const ethers = require('ethers');
const fs = require('fs');
const path = require('path');

// ERC721 with art token extension
const artTokenABI = JSON.parse(fs.readFileSync(path.join(__dirname + '/ArtTokenABI.json')));

let provider = new ethers.providers.InfuraProvider("rinkeby", "292c366623594a44a3d5e76a68d1d9d2");

let wallet = new ethers.Wallet('0x011f5d8c37def36f4bd85f8b1a8e82bf104abdaac8c0710ab70e5f86dba180cc', provider)

async function getBalance() {
	let balance = await wallet.getBalance();
	console.log(balance.toString())
}

getBalance()