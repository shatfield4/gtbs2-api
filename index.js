const express = require('express')
const path = require('path')
const fs = require('fs')
const ethers = require('ethers')
const sqlite3 = require('sqlite3')
const GTBCarsABI = require('./abi/GTBCars.json')

const HOST = "http://localhost" // const HOST = "apiv2.grandtheftbacon.com"
const PORT = process.env.PORT || 80
const JSON_RPC = "https://goerli.infura.io/v3/7b050d0db39f444e849f866cfac6c585"
// const JSON_RPC = "https://mainnet.infura.io/v3/36c8e03c7ac84172ba1193c00c954e25"

// Initialize contracts
const provider = ethers.getDefaultProvider("goerli")
// const contractAddress = "0x47b513D33D6E2B6F071b09CFbd7F4eDfF29CE07A" 
const contractAddress = "0xF3c7921a05506e1dA50647dc4c024FF17A0C20d2" // Goerli cars contract
const carsContract = new ethers.Contract(contractAddress, GTBCarsABI, provider)

let db = new sqlite3.Database('./gtbs2.db')

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

// Check if car is stored in DB taking in tokenId as param
function checkCarDB(tokenId){
    return new Promise((resolve, reject) => {
        let sqlCheckExists = `SELECT token_id, name, description, image, attributes FROM cars WHERE token_id=${tokenId}`

        db.get(sqlCheckExists, (err, row) => {
            if (err) {
                reject(err)
                return console.error(err.message)
            } else {
                if(row){
                    const data = {
                        "name": row.name,
                        "description": row.description,
                        "image": row.image,
                        "attributes": JSON.parse(row.attributes),
                    }
                    resolve(data)
                } else {
                    resolve(null)
                }
            }
        })
    })
}

// Metadata endpoint for cars contract
app.get('/nft/cars/:token_id', async function(req, res) {

    const tokenId = parseInt(req.params.token_id).toString()
    let data = await checkCarDB(tokenId)

    if (data === null){
        const maxSupply = 500
        // Get current totalSupply from cars contract to make sure token is minted
        let totalSupply = await carsContract.totalSupply()
        // Check that tokenId provided is a valid tokenId
        if (parseInt(tokenId) < 1 || parseInt(tokenId) > maxSupply || tokenId > Number(ethers.utils.formatUnits(totalSupply, 0))) {
            errorData = {
                'Error' : 'Token ID does not exist'
            }
            res.send(errorData)
            return;
        }
    
        // Get car type from gtbCars contract (ethers.js call getTokenTraits() and store in carType)
        let carTokenTraits = await carsContract.getTokenTraits(tokenId)
        let {0: carType, 1: alpharank} = carTokenTraits
        // Convert carType to string
        carType = ethers.utils.formatUnits(carType, 0).toString()
    
        data = await new Promise((resolve, reject) => {
            fs.readFile('./storage/cars/metadata/' + tokenId + '.json', (err, fileObj) => {
                if (err) throw err;
                let file = JSON.parse(fileObj);
                let jsonAttributes = file['attributes'];
        
                // Set name for car based on carType recieved from gtbCars smart contract
                let carName
                let typeName
                switch(carType) {
                    case "0": {
                        carName = `Police Cruiser #${tokenId}`
                        typeName = 'Police Cruiser'
                        break
                    }
                    case "1": {
                        carName = `Getaway Car #${tokenId}`
                        typeName = 'Getaway Car'
                        break
                    }
                    case "2": {
                        carName = `Supercar #${tokenId}`
                        typeName = 'Supercar'
                        break
                    }
                }
        
                // Append carType to jsonAttributes
                jsonAttributes.push({
                    "trait_type": "Type",
                    "value": typeName
                })
        
                // Serialize data from blockchain
                let dataSQL = []
                dataSQL.push(tokenId.toString())
                dataSQL.push(carName.toString())
                dataSQL.push("GTB Cars add advantages to your heists no matter which side you are on. If you are lucky enough to get 1 of 500 cars, be wise with how you use it...")
                dataSQL.push(`${HOST}/cars/images/${tokenId}.png`)
                dataSQL.push(JSON.stringify(jsonAttributes))

                // Construct SQL
                let sqlPlaceholders = dataSQL.map((item) => '\'' + item + '\'' ).join(',')
                let sqlQuery = 'INSERT INTO cars (token_id, name, description, image, attributes) VALUES (' + sqlPlaceholders + ')'

                // Insert into database
                db.run(sqlQuery, function(err) {
                    if (err) {
                        console.log(err)
                        reject(err)
                    }
                })
        
                data = {
                    "name": carName,
                    "description": "GTB Cars add advantages to your heists no matter which side you are on. If you are lucky enough to get 1 of 500 cars, be wise with how you use it...",
                    "image": `${HOST}/cars/images/${tokenId}.png`,
                    "attributes": jsonAttributes,
                }

                resolve(data)
        
            })
        })
        
    }

    res.send(data)
 
})

// Route for Bacons S2
app.get('/nft/bacon2/:token_id', async function(req, res) {
    
})
// Route for Items
app.get('/nft/items/:token_id', async function(req, res) {
    
})
// Expose /items/images folder
app.use('/items/images', express.static('./storage/items/images'));

app.listen(app.get('port'), function() {
  console.log('GTBS2 API is running on port: ', app.get('port'));
})

