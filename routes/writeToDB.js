var express = require('express');
var fs = require('fs');
var router = express.Router();

const { Client, Query } = require('pg')
var username = "postgres"; // sandbox username
var password = "postgres"; // read only privileges on our table
var host = "localhost:5432";
var database = "AM"; // database name
var conString = "postgres://" + username + ":" + password + "@" + host + "/" + database; // Your Database Connection

let dbRows = []

/* GET users listing. */
router.get('/', async function (req, res, next) {
    res.status(200);
    await loadFiles(res);
    res.end();
});

router.get('/insertIntoDB', async function (req, res, next) {
    res.status(200);
    await insertIntoDB(res, req)
    res.end();
});

router.get('/cleanDB', async function (req, res, next) {
    res.status(200);
    await cleanDB(res)
    res.end();
});

router.get('/resetDB', async function (req, res, next) {
    res.status(200);
    await cleanDB(res)
    await loadFiles(res);
    await insertIntoDB(res, req)
    res.end();
});


const loadFiles = async (res) => {

    const log = _browserLog(res);
    log('Loading files');

    //Read in all files, loop adding them to the DB
    const baseDir = "./DB/Airplaines";
    const fileNames = _getfileNames(baseDir)
    log(`${fileNames.length} files loaded`);

    log('Processing files')
    dbRows = []
    try {

        for (const [index, fileName] of fileNames.entries()) {
            (index % 100 == 0) && log(index) // Write to the client every 100 files

            const file = fs.readFileSync(`${baseDir}/${fileName}`, 'utf-8')
            _processFile(file, dbRows)
        }
    }
    catch (e) {
        log(`Something went wrong when reading the files: ${e.message}`);
    }

    log(`Processed ${fileNames.length} files, and loaded ${dbRows.length} data items`)
}

const insertIntoDB = async (res, req) => {

    const log = _browserLog(res);

    log('Will connect to DB')

    var client = null;
    try {
        client = new Client(conString); // Setup our Postgres Client
        client.connect(); // connect to the client
    } catch (e) {
        log(`Something went wrong when connecting to the DB: ${e.message}`);
    }

    if (client) {
        const text = `INSERT INTO public.airplane_data(
            id, t, lon, lat, alt, annotation, speed, heading, on_groud, hexid, callsign, adep, ades)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);`

        let startIndex = req.query.start || 0;
        let endIndex = req.query.end || dbRows.length;
        let insertedItems = 0;
        for (let index = startIndex; index < endIndex; index++) {
            (index % 100 == 0) && log(`at row ${index}, will wait 1 second`)// && await _sleep(1000) // Write to the client every 100 rows


            const element = dbRows[index];
            try {
                await client.query(text, element)
            } catch (e) {
                log(`Something went wrong when inserting into the DB: ${e.message}`);
            }
            insertedItems++;
        }

        log(`inserted ${insertedItems} items into the DB`)
    }


}

const cleanDB = async (res) => {
    const log = _browserLog(res);

    log('Will connect to DB')

    var client = null;
    try {
        client = new Client(conString); // Setup our Postgres Client
        client.connect(); // connect to the client
    } catch (e) {
        log(`Something went wrong when connecting to the DB: ${e.message}`);
    }

    let result;
    if (client) {
        const text = `DELETE FROM public.airplane_data; DELETE FROM public.airplane_data_history;`
        try {
            result = await client.query(text)
        } catch (e) {
            log(`Something went wrong when deleting from the DB: ${e.message}`);
        }
    }

    res.write(JSON.stringify(result, null, 2))
}

const _browserLog = (res) => {
    return (msg) => {
        msg = `${(new Date()).toISOString()}: ${msg}`;
        console.log(msg);

        res.write(`${msg}\r\n`);

        return true;
    }
}

const _sleep = waitMS => new Promise((resolve) => setTimeout(resolve, waitMS))

function _getfileNames(baseDir) {
    return fs.readdirSync(baseDir);
}

function _processFile(file, dbRows) {
    //Loop each line of the file
    if (file.length > 0) {
        const lines = file.split('\r\n');
        lines.forEach((line) => {
            if (line.length > 0) {
                dbRows.push(_lineToObject(line));
            }
        })
    }
}

function _lineToObject(line) {
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
