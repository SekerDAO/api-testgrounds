const ethers = require('ethers');
const fs = require('fs');
const path = require('path');
const { create, urlSource } = require('ipfs-http-client')
const client = create('https://ipfs.infura.io:5001')

const artToken = JSON.parse(fs.readFileSync(path.join(__dirname + '/ArtToken.json')));
const TWartToken = JSON.parse(fs.readFileSync(path.join(__dirname + '/TWdomainToken.json')));
const houseTokenDAO = JSON.parse(fs.readFileSync(path.join(__dirname + '/HouseTokenDAO.json')));
const govToken = JSON.parse(fs.readFileSync(path.join(__dirname + '/GovToken.json')));
const weth = JSON.parse(fs.readFileSync(path.join(__dirname + '/WETH9.json')));

let provider = new ethers.providers.InfuraProvider("rinkeby", "292c366623594a44a3d5e76a68d1d9d2");

let signer = new ethers.Wallet('0x011f5d8c37def36f4bd85f8b1a8e82bf104abdaac8c0710ab70e5f86dba180cc', provider)

let twAddress = '0x70Fbd853bD5407043abA9885d8901554daa01c8d'

async function getBalance(_signer) {
	let balance = await _signer.getBalance();
	console.log(balance.toString())
}

async function getAddress(_signer) {
	let address = await _signer.address;
	console.log(address)
}

async function deployERC20(_signer, totalSupply, name, symbol) {
    // convert _totalSupply to 18 decimals
    let _ONE = ethers.BigNumber.from('1000000000000000000')
    let _totalSupply = ethers.BigNumber.from(totalSupply)
    let _totalSupply18Decimals = _totalSupply.mul(_ONE)

    let token = new ethers.ContractFactory(govToken.abi, govToken.bytecode, _signer);
    let contract = await token.deploy(name, symbol, totalSupply);
    console.log(contract.address);
    console.log(contract.deployTransaction.hash);
    await contract.deployed()
    console.log('transaction mined')
}

async function approve(_signer, _provider, address, amount, dao) {
	let erc20Contract = new ethers.Contract(address, govToken.abi, _provider)
	let erc20ContractWithSigner = erc20Contract.connect(_signer)

	let _tx = await erc20ContractWithSigner.approve(dao, amount)

    provider.once(_tx.hash, (receipt) => {
        console.log('Transaction Minded: ' + receipt.transactionHash);
        console.log(receipt);
    })
}

// --------- deploy House Gov DAO ---------

async function deployWeth(_signer) {
    let _weth = new ethers.ContractFactory(weth.abi, weth.bytecode, _signer);
    let contract = await _weth.deploy();
    console.log(contract.address);
    console.log(contract.deployTransaction.hash);
    await contract.deployed()
    console.log('transaction mined')
}

async function deployHouseGovDAO(
	_signer,
	heads,
	govToken,
	entryAmount,
	proposalTime,
	daoSupply,
	threshold,
    minimumProposalAmount,
    entryReward,
    weth
) {
    let dao = new ethers.ContractFactory(houseTokenDAO.abi, houseTokenDAO.bytecode, _signer);
    let contract = await dao.deploy(heads, govToken, entryAmount, proposalTime, daoSupply, threshold, minimumProposalAmount, entryReward, weth);
    console.log(contract.address);
    console.log(contract.deployTransaction.hash);
    await contract.deployed()
    console.log('transaction mined')
}

async function initHouseDAO(_signer, _provider, address) {
	let daoContract = new ethers.Contract(address, houseTokenDAO.abi, _provider)
	let daoContractWithSigner = daoContract.connect(_signer)

	let _tx = await daoContractWithSigner.init()

    provider.once(_tx.hash, (receipt) => {
        console.log('Transaction Minded: ' + receipt.transactionHash);
        console.log(receipt);
    })
}


async function addMoreContribution(_signer, _provider, contribution) {

}

async function fundingPropsal(_signer, _provider, address, roles, recipient, funding, proposalType) {
	let daoContract = new ethers.Contract(address, houseTokenDAO.abi, _provider)
	let daoContractWithSigner = daoContract.connect(_signer)

	let options = {
		"gasLimit": 500000
	}

	let _tx = await daoContractWithSigner.submitProposal(roles, recipient, funding, proposalType, options)

    provider.once(_tx.hash, (receipt) => {
        console.log('Transaction Minded: ' + receipt.transactionHash);
        console.log(receipt);
		// var event = daoContract.ProposalCreated(function(error, result) {
		//    if (!error)console.log(result);
		// });
    })
    daoContract.once('ProposalCreated', function(error, event){ console.log(event.args.number.toString()); });
	// var event = daoContract.ProposalCreated(function(error, result) {
	//    if (!error)console.log(result);
	// });
}

async function joinDAOProposal(_signer, _provider, contribution, roles) {

}

async function headOfHouseEnterMember() {
	
}

async function vote() {

}

async function withdraw(_signer, _provider, amount) {

}

async function sendNFT(_signer, _provider, address, id) {

}

async function gettersHouseGov(_provider, address) {
	let daoContract = new ethers.Contract(address, houseTokenDAO.abi, _provider)
	let entry = await daoContract.entryAmount()
	console.log('entry amount: ' + entry.toString())
	// let member = await daoContract.members(wallet.address)
	// console.log(member)
	let proposal = await daoContract.proposals(1)
	console.log(proposal)
	let threshold = await daoContract.threshold()
	console.log('vote threshold: ' + threshold.toString())
    let totalProposalCount = await daoContract.totalProposalCount()
    console.log('proposal count: ' + totalProposalCount)
    let memberCount = await daoContract.memberCount()
    console.log('member count: ' + memberCount)
    let proposalTime = await daoContract.proposalTime()
    console.log('proposal max time: ' + proposalTime)
    let gracePeriod = await daoContract.gracePeriod()
    console.log('grace period: ' + gracePeriod)
    let totalContribution = await daoContract.totalContribution()
    console.log('total contribution: ' + totalContribution)
    let balance = await daoContract.balance()
    console.log('dao balance: ' + balance)
    let minimumProposalAmount = await daoContract.minimumProposalAmount()
    console.log('minimum gov tokens for proposal: ' + minimumProposalAmount)
    let totalGovernanceSupply = await daoContract.totalGovernanceSupply()
    console.log('total governance supply: ' + totalGovernanceSupply)
    let remainingSupply = await daoContract.remainingSupply()
    console.log('remaining gov token supply: ' + remainingSupply)
    let entryReward = await daoContract.entryReward()
    console.log('entry gov token reward: ' + entryReward)
    // address public governanceToken;
    // address public WETH = address(0);
}


// --------- house nft dao ---------

// --------- house msig dao ---------

// --------- gallery dao ---------

// --------- deploy nfts ---------

async function deployTWDomain(_signer) {
    let factory = new ethers.ContractFactory(TWartToken.abi, TWartToken.bytecode, _signer);
    let contract = await factory.deploy("Walk", "TWD");
    console.log(contract.address);
    console.log(contract.deployTransaction.hash);
    await contract.deployed()
    console.log('transaction mined')
}

async function deployCustomDomain(_signer, name, symbol) {
    let factory = new ethers.ContractFactory(artToken.abi, artToken.bytecode, _signer);
    let contract = await factory.deploy(name, symbol);
    console.log(contract.address);
    console.log(contract.deployTransaction.hash);
    await contract.deployed()
    console.log('transaction mined')
}

// --------- create nfts ---------

async function createNFTCustomDomain(_signer, _provider, _nftAddress, _uri, _numberOfEditions) {
	let nftContract = new ethers.Contract(_nftAddress, artToken.abi, _provider)
	let nftContractWithSigner = nftContract.connect(_signer)
	let _tx = await nftContractWithSigner.mintEdition(_uri, _numberOfEditions)

    provider.once(_tx.hash, (receipt) => {
        console.log('Transaction Minded: ' + receipt.transactionHash);
        console.log(receipt);
    })
}

async function createWithNFTTWDomain(_signer, _provider, uri, numberOfEditions) {
	let twContract = new ethers.Contract(twAddress, TWartToken.abi, _provider)
	let twContractWithSigner = twContract.connect(_signer)
	let _tx = await twContractWithSigner.mintEdition(uri, numberOfEditions)

    provider.once(_tx.hash, (receipt) => {
        console.log('Transaction Minded: ' + receipt.transactionHash);
        console.log(receipt);
    })
}

// --------- utility functions ---------

async function getMetadataURI(_provider, _nftAddress, _nftId) {
	let nftContract = new ethers.Contract(_nftAddress, artToken.abi, _provider)
	let uri = await nftContract.tokenURI(_nftId)
	console.log(uri)
	return uri
}

async function isSigned(_provider, _nftId, _nftAddress) {
	let nftContract = new ethers.Contract(_nftAddress, artToken.abi, _provider)

	try {
		let signature = await nftContract.getSignature(_nftId)
		//console.log(signature)
		return true
	} catch(err) {
		//console.log(err.reason)
		return false
	}
}

async function getSignature(_provider, _nftAddress, _nftId) {
	let nftContract = new ethers.Contract(_nftAddress, artToken.abi, _provider)
	try {
		let signature = await nftContract.getSignature(_nftId)
		//console.log(signature)
		return signature
	} catch(err) {
		//console.log(err.reason)
		return Error('signature does not exist')
	}
}

async function isSignableNFT(_provider, _nftAddress) {
	let nftContract = new ethers.Contract(_nftAddress, artToken.abi, _provider)

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

async function isOwnerOfDomain(_signer, _provider, _nftAddress) {
	let nftContract = new ethers.Contract(_nftAddress, artToken.abi, _provider)
	let isArtist = await nftContract.artist()
	return isArtist == _signer.address
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

async function getIPFSmetadata(cid) {
	try {
		let res = await client.get(cid)
		for await (let value of res) {
			for await (let content of value.content) {
				console.log(content.toString('utf8')) // 1, then 2, then 3, then 4, then 5 (with delay between)
			}
		}
	} catch (err) {
		console.log(err)
	}
}

async function postIPFSmedia(data) {
	try {
		let res = await client.add(data)
		console.log(res)
	} catch (err) {
		console.log(err)
	}
}

async function getIPFSmedia(cid) {
	try {
		let res = await client.get(cid)
		for await (let value of res) {
			for await (let content of value.content) {
				// content will be a buffer of the image
			}
		}
	} catch (err) {
		console.log(err)
	}
}
// --------- tests ---------

async function main() {
	getBalance(signer)
	getAddress(signer)
	//deployTWDomain(signer)
	//deployCustomDomain(signer, 'Nathan', 'NTG')
	//createNFTCustomDomain(signer, provider, '0xd814af0897BAedB22D8Bb0cF6d44609a22a5934D', 'https://gateway.ipfs.io/ipfs/QmUEmPcSXxyQa8HFmU2A3vRQN6HbeqiYGmv29srB7FZkVq/metadata', 10)
	//createWithNFTTWDomain(signer, provider, 'https://gateway.ipfs.io/ipfs/QmZuwWhEGkUKZgC2GzNrfCRKcrKbxYxskjSnTgpMQY9Dy2/metadata/', 1)
	//getMetadataURI(provider, '0xd814af0897BAedB22D8Bb0cF6d44609a22a5934D', 7)
	let hash = await getMetadataURI(provider, '0xa5676205dBd9ffa11038eB4661f785942E7701D5', 2)
	//let isOwner = await checkOwnership(provider, '0x1b4deF26044A75A26B808B4824E502Ab764c5027', '0xb4e4ad7b0A1dCF480592FcC8B0E008FBdE45e03D', 7)
	// console.log('0x1b4deF26044A75A26B808B4824E502Ab764c5027 owns Id 7: ' + isOwner)
	// let signed = await isSigned(provider, 1, '0xb4e4ad7b0A1dCF480592FcC8B0E008FBdE45e03D')
	// console.log('TokenId 1 is signed: ' + signed)
	// let test = await isSignableNFT(provider, '0x58dd43b4991bfaf5a7e838766a4595262136f7fb')
	// console.log('this nft is signable: ' + test)
	let isArtist = await isOwnerOfDomain(signer, provider, '0xd814af0897BAedB22D8Bb0cF6d44609a22a5934D')
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
	getIPFSmetadata('QmZ5GKfE2SqgFfo3yGyqybDfsoh1JzXQuPsaWqqrZLC1z2')
	getIPFSmedia('Qmej3G9ygDzjawBJtx3yh3WBCgZZAB8Vr9xnyAeHsmUrzD')

	//deployERC20(signer, ethers.BigNumber.from('10000000000000000000000000'), 'TW Governance', 'TWG')
	//deployWeth(signer)
	// deployHouseGovDAO(
	// 	signer,
	// 	[signer.address], // head of house
	// 	'0xB0E6d5A58E7b959492647CB32b62C449F4139EFC', // gov token addres
	// 	0, // min entry fee in gov tokens
	// 	1, // number of days proposals are active
	// 	ethers.BigNumber.from('5000000000000000000000000'), // total gov tokens supplied to contract
	// 	10, // number of votes wieghted to pass
	// 	0, // minimum tokens owned to create proposal
	// 	0, // reward of gov tokens when becmoing a member
	// 	'0x83b89e0995c2c96216da14b9f9ae6e6b20c1ae89' // weth address
	// )

	//approve(signer, provider, '0xB0E6d5A58E7b959492647CB32b62C449F4139EFC', ethers.BigNumber.from('5000000000000000000000000'), '0x7977de766D174cE17230fa35169021d6cF926732')
	//initHouseDAO(signer, provider, '0x7977de766D174cE17230fa35169021d6cF926732')
	//gettersHouseGov(provider, '0x7977de766D174cE17230fa35169021d6cF926732')
	let roles = {
		'headOfHouse': false,
		'member': false
	}
	fundingPropsal(
		signer,
		provider,
		'0x7977de766D174cE17230fa35169021d6cF926732',
		0,
		'0xd814af0897BAedB22D8Bb0cF6d44609a22a5934D',
		0,
		0
	)
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

