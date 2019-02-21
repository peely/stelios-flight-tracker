const parseAllStatesData = (theData) => {

    //Transform data to geoJSON
    var parsedData = []
    theData.states.forEach(element => {

        let geoJSONObj = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [element[5],  element[6]]
            },
            "properties": {
                "icao24" : element[0],
                "callsign": element[1],
                "origin_country": element[2],
                "time_position": element[3],
                "last_contact": element[4],
                "longitude": element[5],
                "latitude": element[6],
                "baro_altitude": element[7],
                "on_ground": element[8],
                "velocity": element[9],
                "true_track": element[10],
                "vertical_rate": element[11],
                "sensors": element[12],
                "geo_altitude": element[13],
                "squawk": element[14],
                "spi": element[15],
                "position_source": element[16]
            }
        }

        parsedData.push(geoJSONObj)
    });

    return parsedData;
}

const parseTracksData = (theData) => {

    //Parse the path
    let parsedPathWaypoints = []
    theData.path.forEach((element) => {
        let waypoint = {
            "time":element[0],
            "latitude":element[1],
            "longitude":element[2],
            "baro_altitude":element[3],
            "true_track":element[4],
            "on_ground":element[5]
        }

        parsedPathWaypoints.push(waypoint);
    });

    theData.path = parsedPathWaypoints;

    return theData
}

exports.parseAllStatesData = parseAllStatesData;
exports.parseTracksData = parseTracksData;