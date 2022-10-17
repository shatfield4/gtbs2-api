const express = require('express')
const path = require('path')
const fs = require('fs')
const ethers = require('ethers')
const web3Contracts = require('./middleware/web3')
const sqlite = require('./middleware/sqlitedb')
const dotenv = require('dotenv').config()

const HOST = process.env.HOST
const PORT = process.env.PORT || 80



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

    // Sanitize input
    if(isNaN(tokenId)){
        errorData = {
            'Error' : 'Token ID does not exist'
        }
        res.send(errorData)
        return;
    }
    let data = await sqlite.checkCarDB(tokenId)

    if (data === null){
        const maxSupply = 500
        // Get current totalSupply from cars contract to make sure token is minted
        let totalSupply = await web3Contracts.carsContract.totalSupply()
        // Check that tokenId provided is a valid tokenId
        if (parseInt(tokenId) < 1 || parseInt(tokenId) > maxSupply || tokenId > Number(ethers.utils.formatUnits(totalSupply, 0))) {
            errorData = {
                'Error' : 'Token ID does not exist'
            }
            res.send(errorData)
            return;
        }
    
        // Get car type from gtbCars contract (ethers.js call getTokenTraits() and store in carType)
        let carTokenTraits = await web3Contracts.carsContract.getTokenTraits(tokenId)
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
                sqlite.db.run(sqlQuery, function(err) {
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
    const tokenId = parseInt(req.params.token_id).toString()

    // Sanitize input
    if(isNaN(tokenId)){
        errorData = {
            'Error' : 'Token ID does not exist'
        }
        res.send(errorData)
        return;
    }
    let data = await sqlite.checkBaconDB(tokenId)
    if (data === null){
        const maxSupply = 10000
        // Get current totalSupply from gtbS2 contract to make sure token is minted
        let totalSupply = await web3Contracts.gtbs2Contract.totalSupply()
        // Check that tokenId provided is a valid tokenId
        if (parseInt(tokenId) < 1 || parseInt(tokenId) > maxSupply || tokenId > Number(ethers.utils.formatUnits(totalSupply, 0))) {
            errorData = {
                'Error' : 'Token ID does not exist'
            }
            res.send(errorData)
            return;
        }
    
        // Get bacon type from gtbS2 contract (ethers.js call getTokenTraits() and store in isCop)
        let baconS2Traits = await web3Contracts.carsContract.getTokenTraits(tokenId)
        let {0: isCop, 1: alpharank} = baconS2Traits
        // Convert isCop to 1 or 0
        isCop = ethers.utils.formatUnits(isCop, 0).toString()
                /*
                 FIX METADATA FOLDERS
                */
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
                        carName = `Cop Bacon S2 #${tokenId}`
                        typeName = 'Bacon'
                        break
                    }
                    case "1": {
                        carName = `Cop Bacon S2 #${tokenId}`
                        typeName = 'Cop Bacon'
                        break
                    }
                }
        
                // Append carType to jsonAttributes
                jsonAttributes.push({
                    "trait_type": "Type",
                    "value": typeName
                })

                /*
                 STOPPED HERE
                */

                // Serialize data from blockchain
                let dataSQL = []
                dataSQL.push(tokenId.toString())
                dataSQL.push(carName.toString())
                dataSQL.push("GTB Cars add advantages to your heists no matter which side you are on. If you are lucky enough to get 1 of 500 cars, be wise with how you use it...")
                dataSQL.push(`${HOST}/cars/images/${tokenId}.png`)
                dataSQL.push(JSON.stringify(jsonAttributes))

                // Construct SQL
                let sqlPlaceholders = dataSQL.map((item) => '\'' + item + '\'' ).join(',')
                let sqlQuery = 'INSERT INTO bacon2 (token_id, name, description, image, attributes) VALUES (' + sqlPlaceholders + ')'

                // Insert into database
                sqlite.db.run(sqlQuery, function(err) {
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

    console.log(data)
    res.send(data)

})
// Route for Items
app.get('/nft/items/:token_id', async function(req, res) {
    
})
// Expose /items/images folder
app.use('/items/images', express.static('./storage/items/images'));

app.listen(app.get('port'), function() {
  console.log('GTBS2 API is running on port: ', app.get('port'));
})

