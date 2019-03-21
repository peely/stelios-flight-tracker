window.ourLeafletJSMap = {
    map: {},
    track : {},
    sidebar: {}
}
function drawTheMap() {
    // Create variable to hold map element, give initial settings to map
    let map = L.map('map', {center: [43.64701, -79.39425], zoom: 3});

    // Add OpenStreetMap tile layer to map element
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
    }).addTo(map);

    //Search bar for location
    var osmGeocoder = new L.Control.OSMGeocoder({
        collapsed: false,
        position: 'topright',
        text: 'Locate'
    });
    map.addControl(osmGeocoder);

    // Sidebar
    var sidebar = L.control.sidebar('sidebar', {
        position: 'left'
    });
    
    map.addControl(sidebar);

    window.ourLeafletJSMap.map = map;
    window.ourLeafletJSMap.sidebar = sidebar;
}

function addPlanesToMap() {
    getPlaneData()
    .then((myData) => {
        let map = window.ourLeafletJSMap.map;
        let sidebar = window.ourLeafletJSMap.sidebar;

        // PlaneIcon
        let planeIcon = L.icon({
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
            let popupHTML = featurePropertiesToPopUpContent(layer.feature.properties);
            sidebar.setContent(sidebarHTML(popupHTML))
            sidebar.show()
            return popupHTML
        }).addTo(map);
    
        function iris (feature, layer){
            layer.setIcon(planeIcon);
        };
    })
}

function featurePropertiesToPopUpContent(data) {

    let dialogHTML = ''
    Object.keys(data).forEach((property) => {
        dialogHTML += '<span>' + property + ': ' + data[property] + '</span><br>'
    })

    dialogHTML += '<button onclick="showPlaneTrack(\'' + data.callsign + '\')">Show track for ' + data.callsign + '</button>'
    return dialogHTML;
}

function sidebarHTML(content){
    return `
    <div id="sidebarClose">
        <h1>Airplane Data</h1>
        <button id="sidebarCloseBtn" onclick="window.ourLeafletJSMap.sidebar.hide();">X</button>
    </div>
    ${content}`
}

function showPlaneTrack(icao24)
{
    console.log(icao24)
    getTrackData(icao24)
    .then((data) => {
        //Convert to lat-long array
        let latLongs = [];
        data.coordinates.forEach((point) => {
            latLongs.push([point.coorddinates.coordinates[0], point.coorddinates.coordinates[1]])
        })

        addPolyLineToMap(latLongs)
    })
}

function addPolyLineToMap(latlngs) {
    let map = window.ourLeafletJSMap.map;
    let previousPolyLine = window.ourLeafletJSMap.track;
    previousPolyLine.remove && previousPolyLine.remove()

    var polyline = L.polyline(latlngs, {color: 'red'}).addTo(map);
    map.fitBounds(polyline.getBounds());

    window.ourLeafletJSMap.track = polyline;
}

function getPlaneData() {
    return fetch('/data').then((resp) => resp.json()) // Transform the data into json
}

function getTrackData(callsign) {
    return fetch('/track?callsign=' + callsign).then((resp) => resp.json())
}