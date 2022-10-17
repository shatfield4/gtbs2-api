const ethers = require('ethers')
const GTBCarsABI = require('../abi/GTBCars.json')
const GTBItemsABI = require('../abi/GTBItems.json')
const GTBS2ABI = require('../abi/GTBS2.json')
const dotenv = require('dotenv').config()


const JSON_RPC = process.env.JSON_RPC
const provider = new ethers.providers.JsonRpcProvider(JSON_RPC)

// Initialize contracts
const carsContractAddress = process.env.CARS_CONTRACT_ADDRESS
const carsContract = new ethers.Contract(carsContractAddress, GTBCarsABI, provider)
const itemsContractAddress = process.env.ITEMS_CONTRACT_ADDRESS
const itemsContract = new ethers.Contract(itemsContractAddress, GTBCarsABI, provider)
const gtbs2ContractAddress = process.env.GTBS2_CONTRACT_ADDRESS
const gtbs2Contract = new ethers.Contract(gtbs2ContractAddress, GTBS2ABI, provider)


exports.carsContract = carsContract
exports.itemsContract = itemsContract
exports.gtbs2Contract = gtbs2Contract