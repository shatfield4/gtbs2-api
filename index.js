const express = require('express')
const path = require('path')
const fs = require('fs')
const ethers = require('ethers')

const HOST = "http://localhost" // const HOST = "apiv2.grandtheftbacon.com"
const PORT = process.env.PORT || 80
const JSON_RPC = "https://mainnet.infura.io/v3/36c8e03c7ac84172ba1193c00c954e25"

// Initialize contracts
const abi = [{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]
const provider = ethers.getDefaultProvider()
const contractAddress = "0x47b513D33D6E2B6F071b09CFbd7F4eDfF29CE07A"
const carsContract = new ethers.Contract(contractAddress, abi, provider)

const app = express()
  .set('port', PORT)
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')

// Static public files
app.use(express.static(path.join(__dirname, 'public')))

// Send alive response
app.get('/', function(req, res) {
  res.send({'response' : 'alive'})
})

// Expose /cars/images folder
app.use('/cars/images', express.static('./storage/cars/images'));

// Metadata endpoint for cars contract
app.get('/nft/cars/:token_id', async function(req, res) {
    const tokenId = parseInt(req.params.token_id).toString()
    const maxSupply = 500

    let totalSupply = await carsContract.totalSupply() // Get current totalSupply from cars contract to make sure token is minted

    // Check that tokenId provided is a valid tokenId
    if (parseInt(tokenId) < 1 || parseInt(tokenId) > maxSupply || tokenId > Number(ethers.utils.formatUnits(totalSupply, 0))) {
        errorData = {
            'Error' : 'Token ID does not exist'
        }
        res.send(errorData)
        return;
    }



    // Get car type from gtbCars contract (ethers.js call getTokenTraits() and store in carType)

    /*
    *  ETHERS CALL
    */
   
    let carType = 2;
    carType = (Number(ethers.utils.formatUnits(await carsContract.totalSupply(), 0)) - 3829).toString()

    fs.readFile('./storage/cars/metadata/' + tokenId + '.json', (err, fileObj) => {
    if (err) throw err;
    let file = JSON.parse(fileObj);
    let jsonAttributes = file['attributes'];



    // Append carType to jsonAttributes
    jsonAttributes.push({
        "trait_type": "Type",
        "value": carType
    })

    // Set name for car based on carType recieved from gtbCars smart contract
    let carName;
    switch(carType) {
        case "0": {
            carName = `Police Cruiser #${tokenId}`
            break
        }
        case "1": {
            carName = `Getaway Car #${tokenId}`
            break
        }
        case "2": {
            carName = `Supercar #${tokenId}`
            break
        }
    }
    const data = {
        "name": carName,
        "description": "GTB Cars add advantages to your heists no matter which side you are on. If you are lucky enough to get 1 of 500 cars, be wise with how you use it...",
        "image": `${HOST}/cars/images/${tokenId}.png`,
        "attributes": jsonAttributes,
    }
    res.send(data)

    });


 
})

// Route for Bacons S2

// Route for Cars

// Route for Items

// Expose /items/images folder
app.use('/items/images', express.static('./storage/items/images'));

app.listen(app.get('port'), function() {
  console.log('GTBS2 API is running on port: ', app.get('port'));
})
