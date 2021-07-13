import ethers = from 'ethers'
import fs = from 'fs'
import path = from 'path'
import { executeContractCallWithSigners, buildContractCall  } from './utils'

let provider = new ethers.providers.InfuraProvider("rinkeby", "292c366623594a44a3d5e76a68d1d9d2")
let signer = new ethers.Wallet('0x011f5d8c37def36f4bd85f8b1a8e82bf104abdaac8c0710ab70e5f86dba180cc', provider)

const artToken = JSON.parse(fs.readFileSync(path.join(__dirname + '/ArtToken.json')))
const TWartToken = JSON.parse(fs.readFileSync(path.join(__dirname + '/TWdomainToken.json')))
const govToken = JSON.parse(fs.readFileSync(path.join(__dirname + '/GovToken.json')))
const weth = JSON.parse(fs.readFileSync(path.join(__dirname + '/WETH9.json')))
const factory = JSON.parse(fs.readFileSync(path.join(__dirname + '/GnosisProxyFactory.json')))
const safe = JSON.parse(fs.readFileSync(path.join(__dirname + '/SafeL2.json')))
const governance = JSON.parse(fs.readFileSync(path.join(__dirname + '/GovModule.json')))

async function deployFactory(_signer) {
    const Factory = new ethers.ContractFactory(factory.abi, factory.bytecode, _signer)
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

async function setupSafe(singletonAddress, factory) {
    const GnosisSafeL2 = new ethers.ContractFactory(safe.abi, safe.bytecode, _signer)
    const template = await factory.callStatic.createProxy(singleton.address, "0x")
    await factory.createProxy(singleton.address, "0x").then((tx: any) => tx.wait())
    const safe = GnosisSafeL2.attach(template);
	safe.setup([wallet.address], 1, AddressZero, "0x", AddressZero, AddressZero, 0, AddressZero)
	console.log("Gnosis Safe is setup")
	return safe
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