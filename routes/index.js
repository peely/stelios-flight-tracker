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
var geom_query = "SELECT row_to_json(fc) FROM (\n" +
    "\tSELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (\n" +
    "\t\tSELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry,\n" +
    "\t\trow_to_json((flight_nr, aircraft_nr, heading)) As properties FROM master_data As lg\n" +
    "\t) As f\n" +
    ") As fc";

    
/* GET the map page */
router.get('/', function(req, res) {
   
    res.render('map', {
        title: "Unipi Aircraft Monitoring", // Give a title to our page
        jsonData: {} // Pass data to the View
    });

    // getPGData()
    // .then((data) => {
    //     res.render('map', {
    //         title: "Unipi Aircraft Monitoring", // Give a title to our page
    //         jsonData: data // Pass data to the View
    //     });
    // })
    // .catch(res.send)
});

/* GET Postgres JSON data */
router.get('/data', function (req, res) {
    getPGData()
    .then((data) => {
        res.send(data);
    })
    .catch(res.send)
});


const getPGData = () => {
    return new Promise((resolve, reject)=>{

        try {
            var client = new Client(conString); // Setup our Postgres Client
            client.connect(); // connect to the client
            var query = client.query(new Query(geom_query)); // Run our Query
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
