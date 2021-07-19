const ethers = require('ethers');
const fs = require('fs');
const path = require('path');
//const { executeContractCallWithSigners, buildContractCall, safeSignMessage } = require('./util.ts')

let provider = new ethers.providers.InfuraProvider("rinkeby", "292c366623594a44a3d5e76a68d1d9d2")
let signer = new ethers.Wallet('0x011f5d8c37def36f4bd85f8b1a8e82bf104abdaac8c0710ab70e5f86dba180cc', provider)

const artToken = JSON.parse(fs.readFileSync(path.join(__dirname + '/ArtToken.json')))
const TWartToken = JSON.parse(fs.readFileSync(path.join(__dirname + '/TWdomainToken.json')))
const govToken = JSON.parse(fs.readFileSync(path.join(__dirname + '/GovToken.json')))
const weth = JSON.parse(fs.readFileSync(path.join(__dirname + '/WETH9.json')))
const gnosisFactory = JSON.parse(fs.readFileSync(path.join(__dirname + '/GnosisProxyFactory.json')))
const safe = JSON.parse(fs.readFileSync(path.join(__dirname + '/SafeL2.json')))
const governance = JSON.parse(fs.readFileSync(path.join(__dirname + '/GovModule.json')))

const deployedFactoryAddress = '0x8b07045a8cD1106a7913d74033E7D373b16F05D7'

async function deployFactory(_signer) {
    const Factory = new ethers.ContractFactory(gnosisFactory.abi, gnosisFactory.bytecode, _signer)
    const factory = await Factory.deploy()
    console.log(factory.address)
    console.log(factory.deployTransaction.hash)
    await factory.deployed()
    console.log('safe proxy factory deployed')
    return factory
}

async function deploySafe(_signer) {
    const GnosisSafeL2 = new ethers.ContractFactory(safe.abi, safe.bytecode, _signer)
    const singleton = await GnosisSafeL2.deploy()
    console.log(singleton.address)
    console.log(singleton.deployTransaction.hash)
    await singleton.deployed()
    console.log('safe singleton deployed')
    return singleton
}

async function setupSafe(factoryAddress, _signer, _provider) {
	//const GnosisSafeL2 = new Contract(singletonAddress, safe.abi, _provider)
    const GnosisSafeL2 = new ethers.ContractFactory(safe.abi, safe.bytecode, _signer)
    const singleton = await GnosisSafeL2.deploy()
    console.log('safe deployed')
    const factory = new ethers.Contract(factoryAddress, gnosisFactory.abi, _signer)
    const template = await factory.callStatic.createProxy(singleton.address, "0x")
    console.log("template address: " + template)
    await factory.createProxy(singleton.address, "0x").then((tx) => tx.wait())
    console.log("proxy created")
    const _safe = GnosisSafeL2.attach(template)
	await _safe.setup([_signer.address], 1, ethers.constants.AddressZero, "0x", ethers.constants.AddressZero, ethers.constants.AddressZero, 0, ethers.constants.AddressZero).then((tx) => tx.wait())
	console.log("Gnosis Safe is setup")
	const owner = await _safe.isOwner(_signer.address)
	console.log(owner)
	return _safe
}

async function deployGovernanceModule(_signer, govTokenAddress, safeAddress) {
	const daoGovContract = new ethers.ContractFactory(governance.abi, governance.bytecode, _signer)
	const DAOGov = await daoGovContract.deploy(
		[_signer.address], // head of house
		govTokenAddress, // gov token addres
		safeAddress, // deployed gnosis safe address
		ethers.BigNumber.from(1), // number of days proposals are active
		ethers.BigNumber.from('1000000000000000000'), // number of votes wieghted to pass
		ethers.BigNumber.from('10000') // min proposal gov token amt
	)
	return DAOGov
}

async function hookUpDAOModule(_signer, provider, govTokenAddress, safeAddress, tokenAmount) {
	const govToken = new Contract(govTokenAddress, governance.abi, provider)
	await govToken.transfer(safeAddress, ethers.BigNumber.from(tokenAmount))

	const safe = new Contract(safeAddress, safe.abi, provider)
	await executeContractCallWithSigners(safe, safe, "addOwnerWithThreshold", [_signer.address, 1], [_signer])

    console.log('governance module attached')
    return true
}

async function createSafeProposal(_signer, safeAddress) {
	const safe = new Contract(safeAddress, safe.abi, provider)

}

async function main() {
	//deployFactory(signer)
	setupSafe('0x055edBee7C16F04a7629611bDAe662d24dFcd0fE', signer, provider)
}

main()