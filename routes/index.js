var express = require('express'); // require Express
var router = express.Router(); // setup usage of the Express router engine

/* PostgreSQL and PostGIS module and connection setup */
const { Client, Query } = require('pg')

// Setup connection
var username = "postgres"; // sandbox username
var password = "postgres" ;// read only privileges on our table
var host = "localhost:5432";
var database = "AM"; // database name
var conString = "postgres://"+username+":"+password+"@"+host+"/"+database; // Your Database Connection

// Set up your database query to display GeoJSON
var geom_query = 
    `SELECT row_to_json(fc)
    FROM (
            SELECT 'FeatureCollection' As type,
            array_to_json(array_agg(f)) As features
            FROM (
                SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry,
                json_build_object('id', id, 'heading', heading, 'callsign', callsign) As properties
                FROM airplane_data As lg
            ) As f
        ) As fc`;
    
/* GET the map page */
router.get('/', function(req, res) {
   
    res.render('map', {
        title: "Unipi Aircraft Monitoring", // Give a title to our page
        jsonData: {} // Pass data to the View
    });
});

/* GET Postgres JSON data */
router.get('/data', function (req, res) {
    getPGData(geom_query)
    .then((data) => {
        res.send(data);
    })
    .catch(res.send)
});

router.get('/track', function (req, res) {

    let track_query = 
`SELECT row_to_json(fc)
    FROM (
        SELECT 'MultiPoint' As type,
        array_to_json(array_agg(f)) As coordinates
        FROM (
            SELECT ST_AsGeoJSON(lg.geom)::json As coorddinates
            FROM airplane_data_history As lg
            WHERE callsign = ${req.query.callsign}
        ) As f
    ) As fc` 

    getPGData(track_query)
    .then((data) => {
        res.send(data);
    })
    .catch(res.send)
});




const getPGData = (queryString) => {
    return new Promise((resolve, reject)=>{

        try {
            var client = new Client(conString); // Setup our Postgres Client
            client.connect(); // connect to the client
            var query = client.query(new Query(queryString)); // Run our Query
            query.on("row", function (row, result) {
                result.addRow(row);
            });

            query.on("end", function (result) {
                var data = result.rows[0].row_to_json // Save the JSON as variable data
                resolve(data)
            });
        }
        catch(e) {
            reject(e)
        }
    });
}

module.exports = router;
