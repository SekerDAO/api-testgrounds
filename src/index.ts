const ethers = require('ethers');
const fs = require('fs');
const path = require('path');
const { create, urlSource } = require('ipfs-http-client')
//const { create: ipfsHttpClient } = require('ipfs-http-client')
const client = create('https://ipfs.infura.io:5001')

// ERC721 with art token extension
const artToken = JSON.parse(fs.readFileSync(path.join(__dirname + '/ArtToken.json')));
const TWartToken = JSON.parse(fs.readFileSync(path.join(__dirname + '/TWdomainToken.json')));
const houseTokenDAO = JSON.parse(fs.readFileSync(path.join(__dirname + '/HouseTokenDAO.json')));
const govToken = JSON.parse(fs.readFileSync(path.join(__dirname + '/GovToken.json')));

let provider = new ethers.providers.InfuraProvider("rinkeby", "292c366623594a44a3d5e76a68d1d9d2");

let wallet = new ethers.Wallet('0x011f5d8c37def36f4bd85f8b1a8e82bf104abdaac8c0710ab70e5f86dba180cc', provider)

let twAddress = '0x70Fbd853bD5407043abA9885d8901554daa01c8d'
let twContract = new ethers.Contract(twAddress, TWartToken.abi, provider)
let twContractWithSigner = twContract.connect(wallet)

async function getBalance() {
	let balance = await wallet.getBalance();
	console.log(balance.toString())
}

async function getAddress() {
	let address = await wallet.address;
	console.log(address)
}

async function deployERC20(totalSupply, name, symbol) {
    let token = new ethers.ContractFactory(govToken.abi, govToken.bytecode, wallet);
    let contract = await token.deploy(name, symbol, totalSupply);
    console.log(contract.address);
    console.log(contract.deployTransaction.hash);
    await contract.deployed()
    console.log('transaction mined')
}

async function approve(address, amount, dao) {
	let erc20Contract = new ethers.Contract(address, govToken.abi, provider)
	let erc20ContractWithSigner = erc20Contract.connect(wallet)

	let _tx = await erc20ContractWithSigner.approve(dao, amount)

    provider.once(_tx.hash, (receipt) => {
        console.log('Transaction Minded: ' + receipt.transactionHash);
        console.log(receipt);
    })
}

// --------- deploy House Gov DAO ---------
// address[] memory heads,
// address _governanceToken,
// uint _entryAmount,
// uint _proposalTime,
// uint _totalGovernanceSupply,
// uint _threshold

async function deployHouseGovDAO(heads, govToken, entryAmount, proposalTime, totalSupply, threshold) {
    // Create an instance of a Contract Factory
    let dao = new ethers.ContractFactory(houseTokenDAO.abi, houseTokenDAO.bytecode, wallet);

    // Notice we pass in "Hello World" as the parameter to the constructor
    let contract = await dao.deploy(heads, govToken, entryAmount, proposalTime, totalSupply, threshold);

    // The address the Contract WILL have once mined
    // See: https://ropsten.etherscan.io/address/0x2bd9aaa2953f988153c8629926d22a6a5f69b14e
    console.log(contract.address);
    // "0x2bD9aAa2953F988153c8629926D22A6a5F69b14E"

    // The transaction that was sent to the network to deploy the Contract
    // See: https://ropsten.etherscan.io/tx/0x159b76843662a15bd67e482dcfbee55e8e44efad26c5a614245e12a00d4b1a51
    console.log(contract.deployTransaction.hash);
    // "0x159b76843662a15bd67e482dcfbee55e8e44efad26c5a614245e12a00d4b1a51"

    // The contract is NOT deployed yet; we must wait until it is mined
    await contract.deployed()
    console.log('transaction mined')
}

async function initHouseDAO(address) {
	let daoContract = new ethers.Contract(address, houseTokenDAO.abi, provider)
	let daoContractWithSigner = daoContract.connect(wallet)

	let _tx = await daoContractWithSigner.init()

    provider.once(_tx.hash, (receipt) => {
        console.log('Transaction Minded: ' + receipt.transactionHash);
        console.log(receipt);
    })
}

async function headOfHouseEnterMember(address, contribution) {

}

async function addMoreContribution(contribution) {

}

async function fundingPropsal(address, roles, recipient, funding, proposalType) {
	let daoContract = new ethers.Contract(address, houseTokenDAO.abi, provider)
	let daoContractWithSigner = daoContract.connect(wallet)

	let options = {
		"gasLimit": 500000
	}

	let _tx = await daoContractWithSigner.submitProposal(roles, recipient, funding, proposalType, options)

    provider.once(_tx.hash, (receipt) => {
        console.log('Transaction Minded: ' + receipt.transactionHash);
        console.log(receipt);
    })
}

async function joinDAOProposal(contribution, roles) {

}

async function withdraw(amount) {

}

async function sendNFT(address, id) {

}

async function getThingsHouse(address) {
	let daoContract = new ethers.Contract(address, houseTokenDAO.abi, provider)
	let entry = await daoContract.entryAmount()
	console.log(entry.toString())
	// let member = await daoContract.members(wallet.address)
	// console.log(member)
	let proposal = await daoContract.proposals(1)
	console.log(proposal)
	let threshold = await daoContract.threshold()
	console.log(threshold)
	// // use shares on member struct for balances
	// uint public totalProposalCount = 0;
	// uint public proposalTime;
	// uint public gracePeriod = 3 days;

	// uint public totalContribution;
	// uint public balance;

	// uint public threshold;
	// uint public entryAmount;
	// uint public totalGovernanceSupply;
	// uint public remainingSupply;
	// // address private initialCoordinator;

	// address public governanceToken;
}

// --------- house nft dao ---------

// --------- house msig dao ---------

// --------- gallery dao ---------

// --------- deploy nfts ---------

async function deployTWDomain() {
    // Create an instance of a Contract Factory
    let factory = new ethers.ContractFactory(TWartToken.abi, TWartToken.bytecode, wallet);

    // Notice we pass in "Hello World" as the parameter to the constructor
    let contract = await factory.deploy("Walk", "TWD");

    // The address the Contract WILL have once mined
    // See: https://ropsten.etherscan.io/address/0x2bd9aaa2953f988153c8629926d22a6a5f69b14e
    console.log(contract.address);
    // "0x2bD9aAa2953F988153c8629926D22A6a5F69b14E"

    // The transaction that was sent to the network to deploy the Contract
    // See: https://ropsten.etherscan.io/tx/0x159b76843662a15bd67e482dcfbee55e8e44efad26c5a614245e12a00d4b1a51
    console.log(contract.deployTransaction.hash);
    // "0x159b76843662a15bd67e482dcfbee55e8e44efad26c5a614245e12a00d4b1a51"

    // The contract is NOT deployed yet; we must wait until it is mined
    await contract.deployed()
    console.log('transaction mined')
}

async function deployCustomDomain(name, symbol) {
    // Create an instance of a Contract Factory
    let factory = new ethers.ContractFactory(artToken.abi, artToken.bytecode, wallet);

    // Notice we pass in "Hello World" as the parameter to the constructor
    let contract = await factory.deploy(name, symbol);

    // The address the Contract WILL have once mined
    // See: https://ropsten.etherscan.io/address/0x2bd9aaa2953f988153c8629926d22a6a5f69b14e
    console.log(contract.address);
    // "0x2bD9aAa2953F988153c8629926D22A6a5F69b14E"

    // The transaction that was sent to the network to deploy the Contract
    // See: https://ropsten.etherscan.io/tx/0x159b76843662a15bd67e482dcfbee55e8e44efad26c5a614245e12a00d4b1a51
    console.log(contract.deployTransaction.hash);
    // "0x159b76843662a15bd67e482dcfbee55e8e44efad26c5a614245e12a00d4b1a51"

    // The contract is NOT deployed yet; we must wait until it is mined
    await contract.deployed()
    console.log('transaction mined')
}

// --------- create nfts ---------

async function createNFTCustomDomain(_nftAddress, _uri, _numberOfEditions) {
	let nftContract = new ethers.Contract(_nftAddress, artToken.abi, provider)
	let nftContractWithSigner = nftContract.connect(wallet)
	let _tx = await nftContractWithSigner.mintEdition(_uri, _numberOfEditions)

    provider.once(_tx.hash, (receipt) => {
        console.log('Transaction Minded: ' + receipt.transactionHash);
        console.log(receipt);
    })
}

async function createWithNFTTWDomain(uri, numberOfEditions) {
	let _tx = await twContractWithSigner.mintEdition(uri, numberOfEditions)

    provider.once(_tx.hash, (receipt) => {
        console.log('Transaction Minded: ' + receipt.transactionHash);
        console.log(receipt);
    })
}

// --------- utility functions ---------

async function getMetadataURI(_nftAddress, _nftId) {
	let nftContract = new ethers.Contract(_nftAddress, artToken.abi, provider)
	let uri = await nftContract.tokenURI(_nftId)
	console.log(uri)
}

async function getMetadataIPFS(IPFShash) {

}

async function isSigned(_nftId, _nftAddress) {
	let nftContract = new ethers.Contract(_nftAddress, artToken.abi, provider)

	try {
		let signature = await nftContract.getSignature(_nftId)
		//console.log(signature)
		return true
	} catch(err) {
		//console.log(err.reason)
		return false
	}
}

async function getSignature(_nftId) {
	try {
		let signature = await twContractWithSigner.getSignature(_nftId)
		//console.log(signature)
		return signature
	} catch(err) {
		//console.log(err.reason)
		return Error('signature does not exist')
	}
}

async function isSignableNFT(_nftAddress) {
	let nftContract = new ethers.Contract(_nftAddress, artToken.abi, provider)

	try {
		let signature = await nftContract.getSignature(1)
		return true
	} catch(err) {
		if(err.reason) {
			if(err.reason === 'cannot estimate gas; transaction may fail or may require manual gas limit') {
				return false
			}
			if(err.reason === 'ERC721Extensions: no signature exists for this Id') {
				return true
			}
		} else {
			return false
		}
	}
}

async function checkOwnership(_provider, _walletAddress, _nftAddress, _nftId) {
	let nftContract = new ethers.Contract(_nftAddress, artToken.abi, _provider)
	let nftContractWithSigner = nftContract.connect(wallet)
	let owner = await nftContractWithSigner.ownerOf(_nftId)
	return owner === _walletAddress
}

async function signData() {

}

async function storeSignature() {

}

async function isOwnerOfDomain(_nftAddress) {
	let nftContract = new ethers.Contract(_nftAddress, artToken.abi, provider)
	let isArtist = await nftContract.artist()
	return isArtist == wallet.address
}

// --------- ipfs ---------

async function postIPFSmetadata(data) {
	try {
		let res = await client.add(JSON.stringify(data))
		console.log(res)
	} catch (err) {
		console.log(err)
	}
}

async function postIPFSmedia(data) {
	try {
		let res = await client.add(JSON.stringify(data))
		console.log(res)
	} catch (err) {
		console.log(err)
	}
}

// --------- tests ---------

async function main() {
	getBalance()
	getAddress()
	//deployTWDomain()
	//deployCustomDomain('Nathan', 'NTG')
	//createNFTCustomDomain('0xd814af0897BAedB22D8Bb0cF6d44609a22a5934D', 'https://gateway.ipfs.io/ipfs/QmUEmPcSXxyQa8HFmU2A3vRQN6HbeqiYGmv29srB7FZkVq/metadata', 10)
	//createWithNFTTWDomain('https://gateway.ipfs.io/ipfs/QmZuwWhEGkUKZgC2GzNrfCRKcrKbxYxskjSnTgpMQY9Dy2/metadata/', 1)
	//getMetadataURI('0xd814af0897BAedB22D8Bb0cF6d44609a22a5934D', 7)
	getMetadataURI('0x70Fbd853bD5407043abA9885d8901554daa01c8d', 24)
	//let isOwner = await checkOwnership(provider, '0x1b4deF26044A75A26B808B4824E502Ab764c5027', '0xb4e4ad7b0A1dCF480592FcC8B0E008FBdE45e03D', 7)
	// console.log('0x1b4deF26044A75A26B808B4824E502Ab764c5027 owns Id 7: ' + isOwner)
	// let signed = await isSigned(1, '0xb4e4ad7b0A1dCF480592FcC8B0E008FBdE45e03D')
	// console.log('TokenId 1 is signed: ' + signed)
	// let test = await isSignableNFT('0x58dd43b4991bfaf5a7e838766a4595262136f7fb')
	// console.log('this nft is signable: ' + test)
	let isArtist = await isOwnerOfDomain('0xd814af0897BAedB22D8Bb0cF6d44609a22a5934D')
	console.log(isArtist)

	// let metadata = {
	// 	"name": "Test NFT",
	// 	"description": "A decription of the specific nft", 
	// 	"external_url": "https://tokenwalk.com/nftaddress/nftid", 
	// 	"image": "https://ipfs.io/ipfs/Qmej3G9ygDzjawBJtx3yh3WBCgZZAB8Vr9xnyAeHsmUrzD",
	// 	"media":{
	// 		"uri":"https://ipfs.io/ipfs/Qmej3G9ygDzjawBJtx3yh3WBCgZZAB8Vr9xnyAeHsmUrzD",
	// 		"dimensions":"2188x2500","size":"22142080","mimeType":"video/mp4"
	// 	},
	// 	"name": "Name of art",
	// 	"attributes": {
	// 		"original" : "false",
	// 		"edition-number" : "1",
	// 		"royalty" : "10%"
	// 	} 
	// }
	//postIPFSmetadata(metadata)
	//postIPFSmedia(metadata)

	//deployERC20(1000000, 'TW Governance', 'TWG')
	// deployHouseGovDAO(
	// 	[wallet.address], // head of house
	// 	'0xD53d734D5fa5202547Dbe51219E7fC024D4e8472', // gov token addres
	// 	100, // min entry fee in gov tokens
	// 	1, // number of days proposals are active
	// 	500000, // total gov tokens supplied to contract
	// 	10 // number of votes wieghted to pass
	// )
	//approve('0xD53d734D5fa5202547Dbe51219E7fC024D4e8472', 500000, '0x28E70Df62f5E5bf950f286852b71911408D669b9')
	//initHouseDAO('0x28E70Df62f5E5bf950f286852b71911408D669b9')
	//getThingsHouse('0x28E70Df62f5E5bf950f286852b71911408D669b9')
	// let roles = {
	// 	'headOfHouse': true,
	// 	'member': true
	// }
	// fundingPropsal(
	// 	'0x28E70Df62f5E5bf950f286852b71911408D669b9',
	// 	roles,
	// 	'0xd814af0897BAedB22D8Bb0cF6d44609a22a5934D',
	// 	20,
	// 	0
	// )
}
// {
// "name":"INCENDIES",
// "description":"INCENDIES depicts our hero as they set their gaze on the fiery dusk of Planet NC-137. \nWhat awaits them as the darkness of night approaches?",
// "attributes":
// {
// 	"artist":"davidalabo",
// 	"scarcity":"ultrarare",
// 	"tags":
// 	["visual","african","black","surreal","surrealism","trippy","psychedelic","desert","landscape","sci-fi","contemporary","visionary art","dali","gradient","colour","color","colors","art","beautiful","vibrant","minimalist","emerging","mountain","illustration","mountains"],
// 	"asset_type":"image/jpeg",
// 	"asset_size_in_bytes":46677427
// },
// "external_uri":"https://knownorigin.io/0xcf615a332888ab78a529bcb60d4de02a45eddbcf",
// "image":"https://ipfs.infura.io/ipfs/QmafyTqm9y6Wvg9L8mQbrK6yzaMrJuecffDsoJSCV8GkNd/asset.jpeg",
// "artist":"0xcf615a332888ab78a529bcb60d4de02a45eddbcf"
// }

// {
// 	"name":"Climax",
// 	"createdBy":"Jason Ebeyer",
// 	"yearCreated":"2020",
// 	"description":"Climax, 2020 /\nOriginal audio by the\nartist.\nThis is the final artwork I will be tokenizing for 2020.",
// 	"image":"https://ipfs.pixura.io/ipfs/QmZypyoMVJ9JVR13236MtsJGs3rCUA7hYhmuhEzuFCdAGH/ezgif-4-bf3426aef3bd.gif",
// 	"media":{
// 		"uri":"https://ipfs.pixura.io/ipfs/QmNZ3XMiLR9sArTqiSQEWTcmfR83QLJbfTXYBXTF5wyChR/Emerge.mp4",
// 		"dimensions":"2188x2500","size":"22142080","mimeType":"video/mp4"
// 	},
// 	"tags":["jasonebeyer","3dart","3Dart","animation","erotic","surreal","dreamy"]}

main()

