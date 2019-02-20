
function getTheData() {
    fetch('/apiProxy').then((resp) => resp.json()) // Transform the data into json
    .then((data) => {
        drawTheMap(data)
    })
}

function drawTheMap(myData) {

    // var myData = !{JSON.stringify(jsonData)};

    // Create variable to hold map element, give initial settings to map
    var map = L.map('map', {center: [43.64701, -79.39425], zoom: 3});

    // Add OpenStreetMap tile layer to map element
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
    }).addTo(map);


    // PlaneIcon
    var planeIcon = L.icon({
        iconUrl :'images/if_plane_173072.png',
    iconSize: [15, 15]

    });

    // Add JSON to map

    L.geoJson(myData, {

        onEachFeature: iris,

        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {icon: planeIcon, rotationAngle: feature.properties.f3})
        }

    }).bindPopup(function (layer) {
        return featurePropertiesToPopUpContent(layer.feature.properties);
    }).addTo(map);

    function iris (feature,layer){
        

        layer.setIcon(planeIcon);
    };

    //Search bar for location

    var osmGeocoder = new L.Control.OSMGeocoder({
        collapsed: false,
        position: 'topright',
        text: 'Locate'
    });
    map.addControl(osmGeocoder);

}

function featurePropertiesToPopUpContent(data) {
    return `
        <span>icao24 = ${data.icao24}</span>
        <br>
        <span>callsign = ${data.callsign}</span>
        <br>
        <span>origin_country = ${data.origin_country}</span>
        <br>
        <span>time_position = ${data.time_position}</span>
        <br>
        <span>last_contact = ${data.last_contact}</span>
        <br>
        <span>longitude = ${data.longitude}</span>
        <br>
        <span>latitude = ${data.latitude}</span>
        <br>
        <span>baro_altitude = ${data.baro_altitude}</span>
        <br>
        <span>on_ground = ${data.on_ground}</span>
        <br>
        <span>velocity = ${data.velocity}</span>
        <br>
        <span>true_track = ${data.true_track}</span>
        <br>
        <span>vertical_rate = ${data.vertical_rate}</span>
        <br>
        <span>sensors = ${data.sensors}</span>
        <br>
        <span>geo_altitude = ${data.geo_altitude}</span>
        <br>
        <span>squawk = ${data.squawk}</span>
        <br>
        <span>spi = ${data.spi}</span>
        <br>
        <span>position_source = ${data.position_source}</span>
        <br>
    `
}