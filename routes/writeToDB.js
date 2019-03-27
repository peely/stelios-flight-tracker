var express = require('express');
var fs = require('fs');
var router = express.Router();

const { Client, Query } = require('pg')
var username = "postgres"; // sandbox username
var password = "postgres" ;// read only privileges on our table
var host = "localhost:5432";
var database = "AM"; // database name
var conString = "postgres://"+username+":"+password+"@"+host+"/"+database; // Your Database Connection

let dbRows = []

/* GET users listing. */
router.get('/', function(req, res, next) {

    //Read in all files, loop adding them to the DB
    const baseDir = "./DB/Airplaines";
    const fileNames = getfileNames(baseDir)
    
    dbRows = []
    fileNames.forEach(function(fileName) {
        const file = fs.readFileSync(`${baseDir}/${fileName}`, 'utf-8')
        processFile(file, dbRows)
    });
    
  res.json(dbRows.length);
});

router.get('/insertIntoDB', async function(req, res, next) {
    var client = new Client(conString); // Setup our Postgres Client
    client.connect(); // connect to the client

    const text = `INSERT INTO public.airplane_data(
        id, t, lon, lat, alt, annotation, speed, heading, on_groud, hexid, callsign, adep, ades)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);`

    let startIndex = req.query.start || 0;
    let endIndex = req.query.end || dbRows.length;

    for (let index = startIndex; index < endIndex; index++) {
        const element = dbRows[index];
        let result = await client.query(text, element)
    }
   res.json('done')
});

router.get('/cleanDB', async function(req, res, next) {
    var client = new Client(conString); // Setup our Postgres Client
    client.connect(); // connect to the client

    const text = `DELETE FROM public.airplane_data;
    DELETE FROM public.airplane_data_history;`
    
    let result = await client.query(text)
    
   res.json(result)
});



function getfileNames(baseDir) {
    return fs.readdirSync(baseDir);
}

function processFile(file, dbRows){
    //Loop each line of the file
    if(file.length > 0){
        const lines = file.split('\r\n');
        lines.forEach((line) => {
            if(line.length > 0) {
                dbRows.push(lineToObject(line));
            }
        })
    }
}

function lineToObject(line){
    return line.split(',');
    const items = line.split(',');
    return {
        id: items[0],
        t: items[1],
        lon: items[2],
        lat: items[3],
        alt: items[4],
        annotation: items[5],
        speed: items[6],
        heading: items[7],
        on_groud: items[8],
        hexid: items[9],
        callsign: items[10],
        adep: items[11],
        ades: items[12]
    }
}

module.exports = router;
