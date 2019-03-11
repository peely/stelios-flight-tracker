var express = require('express'); // require Express
var router = express.Router(); // setup usage of the Express router engine

const axios = require('axios');
const { getMockPlaneData, setMockPlaneData } = require('../utils/get-set-mockData')
const { parseAllStatesData, parseTracksData } = require('../utils/parse-open-sky-data')

let openSkyAPIBaseURL = 'https://opensky-network.org/api'

/* GET data from openSkyNetwork */
router.get('/states/all', function (req, res) {
    let useCachedData = false;

    if(useCachedData)
    {//Use a saved response, so as to not hammer their API
        console.log('serving cached data')

        let mockData = getMockPlaneData()
        let parsedData = parseAllStatesData(mockData)
        res.send(parsedData);
    } else {
        //Use the live API
        console.log('serving live data')
        
        axios.get(openSkyAPIBaseURL + '/states/all')
        .then(response => {
            let parsedData = parseAllStatesData(response.data)
            res.send(parsedData);
        })
        .catch(error => {
            console.log(error);
            res.send(error)
        });
    }
});

router.get('/tracks', function (req, res) {
    let icao24Param = req.query.icao24;
    
    let useCachedData = false;
    if(useCachedData)
    {//Use a saved response, so as to not hammer their API
        console.log('serving cached data')

        let parsedData = parseTracksData(mockData.states)
        res.send(parsedData);
    } else if (icao24Param) {
        //Use the live API
        console.log('serving live data')
        
        axios.get(openSkyAPIBaseURL + '/tracks/all?time=0&icao24=' + icao24Param)
        .then(response => {
            let parsedData = parseTracksData(response.data)
            res.send(parsedData);
        })
        .catch(error => {
            console.log(error);
            res.send(error)
        });
    } else {
        res.send(404)
    }

});

module.exports = router;