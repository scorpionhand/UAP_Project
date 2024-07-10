// API endpoint
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

//let queryUrl = "../UAP_Data/uap_data_output.geojson";

//let jsonFilePath = "C:/Users/dsfac/KUProjects/Project3Practice/DF_Leaflet/static/js/uap_data_output.geojson";
//Get request to the URL
d3.json(queryUrl).then(function(data){

    let featureList = data.features
    let myMap = createMap(featureList)
});

//create the markers
function createMarkers(feature) {
    let long = feature.geometry.coordinates[0];
    let lat = feature.geometry.coordinates[1];

    let popUpText = `UAP`;

    let markerLocation = [lat, long];

    let marker = L.circle(markerLocation, {
        fillOpacity: 0.75,
        color: "darkgreen",
        fillColor: "green",
        radius: 100
    }).bindPopup(popUpText);

    return marker;
}

function createMap(data) {
    let features = data;

    let featureMarkers = [];

    features.forEach(element => {
        let marker = createMarkers(element);

        featureMarkers.push(marker)
    });

    let markerLayerGroup = L.layerGroup(featureMarkers);

    let NASAGIBS_ViirsEarthAtNight2012 = L.tileLayer('https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}', {
        attribution: 'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System (<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
        bounds: [[-85.0511287776, -179.999999975], [85.0511287776, 179.999999975]],
        minZoom: 1,
        maxZoom: 8,
        format: 'jpg',
        time: '',
        tilematrixset: 'GoogleMapsCompatible_Level'
    });

    let baseMaps = {
        "Night Map": NASAGIBS_ViirsEarthAtNight2012
    };

    let overlayMaps = {
        "UAP Locations": markerLayerGroup
    };
    
    let myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [NASAGIBS_ViirsEarthAtNight2012]
    });

    L.control.layers(baseMaps, overlayMaps, {collapsed:false}).addTo(myMap);

    return myMap;
}


