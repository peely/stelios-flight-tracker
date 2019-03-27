window.ourLeafletJSMap = {
    map: {},
    track : {},
    sideBarMgr: {}
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
    let sideBarMgr = createSideBar()
    
    map.addControl(sideBarMgr.getSidebar());

    window.ourLeafletJSMap.map = map;
    window.ourLeafletJSMap.sideBarMgr = sideBarMgr;
}

function addPlanesToMap() {
    getPlaneData()
    .then((myData) => {
        let map = window.ourLeafletJSMap.map;
        let sideBarMgr = window.ourLeafletJSMap.sideBarMgr;

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

            sideBarMgr.updateSidebar(layer.feature.properties);
            let sidebar = sideBarMgr.getSidebar();
            sidebar.show()

            return popupHTML;
        }).addTo(map);
    
        function iris (feature, layer){
            layer.setIcon(planeIcon);
        };
    })
}

function createSideBar(){

    let currentPlane = '';
    let currentPlanesWaypoints = [];
    var sidebar = L.control.sidebar('sidebar', {
        position: 'left'
    });

    const sideBarManager = {
        getSidebar: () => {
            return sidebar;
        },
        updateSidebar: (planeProps) => {
            currentPlane = planeProps;
            let popupHTML = featurePropertiesToPopUpContent(currentPlane)
            let sideBarHTML = sidebarHTML(popupHTML)
            sidebar.setContent(sideBarHTML)

            //AJAX the track
            let tableRows = ''
            getTrackData(currentPlane.id)
            .then((data) => {
                currentPlanesWaypoints = data.coorddinates;

                currentPlanesWaypoints.forEach((waypoint) => {
                    tableRows += '<tr><td>' + waypoint.lat + '</td><td>' + waypoint.lon + '</td></tr>'
                })

                let tracksTable = `
                <table>
                    <thead>
                        <tr>
                            <th>Lat</th>
                            <th>Long</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
                `
                sideBarHTML += tracksTable
                //sidebar.setContent(sideBarHTML)
            })
        },
        showPlaneTrack: () => {
            if(currentPlanesWaypoints.length > 0){
                let latLongs = [];
                currentPlanesWaypoints.forEach((point) => {
                    latLongs.push([point.lat, point.lon])
                })
        
                addPolyLineToMap(latLongs)
            }
        }
    }

    return sideBarManager;
}

function featurePropertiesToPopUpContent(data) {

    let dialogHTML = ''
    Object.keys(data).forEach((property) => {
        dialogHTML += '<span>' + property + ': ' + data[property] + '</span><br>'
    })

    let uniqueKey = 'id'
    if(getDataSource()) { 
        uniqueKey = 'icao24'
    }

    dialogHTML += '<div id="trackBtnCont"><button onclick="window.ourLeafletJSMap.sideBarMgr.showPlaneTrack(\'' + data[uniqueKey] + '\')">Show track for ' + data[uniqueKey] + '</button></div>'
    return dialogHTML;
}

function sidebarHTML(content){
    return `
    <h1>Airplane Data</h1>
    ${content}`
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
    let URL = '/data'
    if(getDataSource()) { 
        URL = '/api/states/all'
    }

    return fetch(URL).then((resp) => resp.json()) // Transform the data into json
}

function getTrackData(id) {
    let URL = '/track?id='
    if(getDataSource()) { 
        URL = '/api/tracks?icao24='
    }

    return fetch(URL + id).then((resp) => resp.json())
}

function getDataSource() {
    return window.location.search.indexOf('open') > -1
}