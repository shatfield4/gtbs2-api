const sqlite3 = require('sqlite3')

let db = new sqlite3.Database('./gtbs2.db')

// Check if car is stored in DB taking in tokenId as param
async function checkCarDB(tokenId){
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

// Check if bacon2 is stored in DB taking in tokenId as param
async function checkBaconDB(tokenId){
    return new Promise((resolve, reject) => {
        let sqlCheckExists = `SELECT token_id, name, description, image, attributes FROM bacon2 WHERE token_id=${tokenId}`

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

// Check if item is stored in DB taking in tokenId as param
async function checkItemDB(tokenId){
    return new Promise((resolve, reject) => {
        let sqlCheckExists = `SELECT token_id, name, description, image, attributes FROM items WHERE token_id=${tokenId}`

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

// Clear all DBs used for testing
async function clearDBs(){

    sqlQuery = "DELETE FROM items"
    db.run(sqlQuery, function(err) {
        if (err) {
            console.log(err)
            reject(err)
        }
    })

    sqlQuery = "DELETE FROM cars"
    db.run(sqlQuery, function(err) {
        if (err) {
            console.log(err)
            reject(err)
        }
    })

    sqlQuery = "DELETE FROM bacon2"
    db.run(sqlQuery, function(err) {
        if (err) {
            console.log(err)
            reject(err)
        }
    })
}




exports.db = db
exports.checkCarDB = checkCarDB
exports.checkBaconDB = checkBaconDB
exports.checkItemDB = checkItemDB
exports.clearDBs = clearDBs