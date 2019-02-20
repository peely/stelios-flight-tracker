const parseOpenSkyData = (theData) => {

    //Transform data to geoJSON
    var parsedData = []
    theData.states.forEach(element => {
        let parsed = {
            "icao24": element[0],
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

        let geoJSONObj = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [parsed.longitude, parsed.latitude]
            },
            "properties": {
                "icao24" : parsed.icao24,
                "callsign": parsed.callsign,
                "origin_country": parsed.origin_country,
                "time_position": parsed.time_position,
                "last_contact": parsed.last_contact,
                "longitude": parsed.longitude,
                "latitude": parsed.latitude,
                "baro_altitude": parsed.baro_altitude,
                "on_ground": parsed.on_ground,
                "velocity": parsed.velocity,
                "true_track": parsed.true_track,
                "vertical_rate": parsed.vertical_rate,
                "sensors": parsed.sensors,
                "geo_altitude": parsed.geo_altitude,
                "squawk": parsed.squawk,
                "spi": parsed.spi,
                "position_source": parsed.position_source
            }
        }

        parsedData.push(geoJSONObj)
    });

    return parsedData;
}

exports.parseOpenSkyData = parseOpenSkyData