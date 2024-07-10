// URL for the GeoJSON UAP data
let url = "../UAP_Data/uap_data_output.geojson";

// Globals 
let dataset = d3.json(url)
let geoLayer
let shape_filter = 'All'
let markerRadius = .1
let shapeColor = '#00FFFF'
let markersOnMap = 10000
let sightingsCount = 0
let sightingSummary = []
let sightingCity = ''
let sightingState = ''
let sightingOccurred = ''
let showStarbucks = 'No'
let arMostReportedLon = []
let arMostReportedLat = []
let mostReportedLon = 0
let mostReportedLat = 0
let lightSwitch = 'Off'

// Initiate the Leaflet map
let uap_map = L.map("map", {
    // Centered on Kansas City
    center: [39.09, -94.58],
    zoom: 4
});

// Add the tile layer to the map
var Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
});
Stadia_AlidadeSmoothDark.addTo(uap_map);

// Tile layer for the city lights
let VIIRS_CityLights_2012 = L.tileLayer('https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}', {
    attribution: 'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System (<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
    bounds: [[-85.0511287776, -179.999999975], [85.0511287776, 179.999999975]],
    minZoom: 1,
    maxZoom: 8,
    format: 'jpg',
    time: '',
    tilematrixset: 'GoogleMapsCompatible_Level'
});

// Shape list
let shapes = [
    "Changing",
    "Chevron",
    "Cigar",
    "Circle",
    "Cone",
    "Cross",
    "Cube",
    "Cylinder",
    "Diamond",
    "Disk",
    "Egg",
    "Fireball",
    "Flash",
    "Formation",
    "Light",
    "Orb",
    "Other",
    "Oval",
    "Rectangle",
    "Sphere",
    "Star",
    "Teardrop",
    "Triangle"
    ]

// Get Median Values
// Credit https://jsfiddle.net/zgtne5s6/
function median(values){

    if (values.length === 0) {
        return 0
        // throw new Error('Input array is empty');
    }
    
    // Sorting values, preventing original array
    // from being mutated.
    values = [...values].sort((a, b) => a - b);
    
    const half = Math.floor(values.length / 2);
    
    rslt = (values.length % 2
        ? values[half]
        : (values[half - 1] + values[half]) / 2);
    rslt = (Math.round(rslt*10000))/10000

    return rslt
    
}

// Leaflet Marker Color: 
function shape_color(shape) {
    // Not doing anything here
    // reserved for future use
    return shapeColor
}

// Using circle marker
function setMarkers(feature, latlng) {
    return L.circleMarker(latlng, marker_options(feature));
}

// Leaflet Marker Properties
function marker_options(feature) {
    if(markersOnMap < 500){
        markerRadius = 3
    }
    if (feature.properties.Shape == 'Starbucks'){
        markerRadius = .1
    }

    return {
        radius: markerRadius,
        fillColor: shape_color(feature.properties.Shape),
        color: shapeColor,
        weight: .5,
        opacity: .5,
        fillOpacity: .5
    }; 
}

// Leaflet onEachFeature: properties 
function each_feature(feature, layer) {
    let sight_date = new Date(feature.properties.Occurred);
    sight_date = (sight_date.getMonth()+1) + '/' + sight_date.getDate() + '/' + sight_date.getFullYear(); 
    
    // update globals here
    if (feature.properties.Shape != 'Starbucks'){
        sightingsCount += 1 
    }

    // add lat lon for median analysis
    arMostReportedLon.push(feature.geometry.coordinates[0])
    arMostReportedLat.push(feature.geometry.coordinates[1])

    // needs fixed
    // save the latest date entry info to display
    info = {Date: sight_date,
        Summary: feature.properties.Summary,
        City: feature.properties.City,
        State: feature.properties.State,
        Occurred: sight_date
}
        sightingSummary.push(info)

    // cannabis legal year or 'not yet'
    let cann = feature.properties.Legal_Cannabis
    if(cann === '1/1/2050'){
        cann = 'Not Yet'
    }

    
    // add popup (separate starbucks entry)
    let UAPShape = feature.properties.Shape
    if (UAPShape === 'Starbucks'){
        if (showStarbucks == 'Yes'){
            layer.bindPopup(
                "<h3>Starbucks</h3>" +
                "<b>Lon:</b> " + feature.geometry.coordinates[0] +
                "<br /><b>Lat: </b> " + feature.geometry.coordinates[1] +
                "<br /><b>City: </b> " + feature.properties.City +
                "<br /><b>State: </b> " + feature.properties.State +
                "<br /><b>Summary: </b> " + feature.properties.Summary +
                "<br /><b>Legalized Cannabis: </b> " + cann
            );
        }
    } else {
        layer.bindPopup(
            "<h3>Date: " + sight_date + "</h3>" +
            "<h4> UAP Shape: " + feature.properties.Shape + "</h4>" +
            "<b>Lon:</b> " + feature.geometry.coordinates[0] +
            "<br /><b>Lat: </b> " + feature.geometry.coordinates[1] +
            "<br /><b>City: </b> " + feature.properties.City +
            "<br /><b>State: </b> " + feature.properties.State +
            "<br /><b>Summary: </b> " + feature.properties.Summary +
            "<br /><b>Legalized Cannabis: </b> " + cann
        );
    }

}

// Retrieve and add the sighting data to the map
dataset.then(function (data) {
    geoLayer = L.geoJson(data, {
        pointToLayer: setMarkers,
        // Feature data popup
        onEachFeature: each_feature,
        // Shape and Date filters
        filter: filterMap
    }).addTo(uap_map);

    // Update sighting info
    mostReportedLon = median(arMostReportedLon)
    mostReportedLat = median(arMostReportedLat)
     sightingInfo()
     add_legend(uap_map)
 });

 // Filter to shape
 function setShape(shape){
    shape_filter = shape
    unFilterMap()
 }

  // Filter to shape
 function setStarbucks(option){
    showStarbucks = option
    unFilterMap()
 }

 function switchLights(option){
    lightSwitch = option
    unFilterMap()
 }

 // Filter to date
 function setDate(){
    unFilterMap()
 }

 // Display Sighting Info Card
 function sightingInfo(){
    let sightInfo = d3.select("#SightingHeader");
    sightInfo.html('Sighting Info: ' + shape_filter + '<br />')
    sightInfo = d3.select("#sample-metadata");
    sightInfo.html('<b>Number of sightings</b>: ' + sightingsCount + '<br />' +
        '<b>Reported Lon Median:</b> ' + mostReportedLon + '<br />' + 
        '<b>Reported Lat Median:</b> ' + mostReportedLat + '<br />' 
    )
 }

 // Run user filter
 function filterMap (feature, layer){
    fDate = new Date(feature.properties.Occurred)
    fYear = fDate.getFullYear()
    t = document.getElementById("yearValue").innerHTML.text
    slider = document.getElementById("slidecontainer");
    slider2 = document.getElementById("slidecontainer2");

    if (shape_filter == 'All' && fYear <= slider.value && fYear >= slider2.value || 
        feature.properties.Shape == 'Starbucks') {
        if (feature.properties.Shape == 'Starbucks'){
            if(showStarbucks == 'No'){
                return false
            }
            markerRadius = .1
            shapeColor = '#00FF00'
        } else {
            markerRadius = 1
            if(lightSwitch == 'Off'){
                shapeColor = '#FFFF00'
            }else{
                shapeColor = '#00FFFF'
            }
            markersOnMap += 1
        }
        return true

    }else if (feature.properties.Shape == shape_filter && fYear <= slider.value && fYear >= slider2.value || feature.properties.Shaper == 'Starbucks'){
        if (feature.properties.Shape == 'Starbucks'){
            if(showStarbucks == 'No'){
                return false
            }
            markerRadius = .1
            shapeColor = '#00FF00'
        } else {
            markerRadius = 3
            shapeColor = '#FF0000'
            markersOnMap += 1
        }       
        return true
    }else {
        return false
    }
 }

 // Reload map with filters
 function unFilterMap (feature, layer){
    geoLayer.remove()
    markersOnMap = 0
    sightingsCount = 0
    sightingOccurred = ''
    sightingCity = ''
    sightingState = ''
    sightingSummary = []
    arMostReportedLon = []
    arMostReportedLat = []
    mostReportedLon = 0
    mostReportedLat = 0
    dataset.then(function (data) {

       geoLayer = L.geoJson(data, {
            pointToLayer: setMarkers,
            // Feature data popup
            onEachFeature: each_feature,
            // Shape and Date filters
            filter: filterMap
        }).addTo(uap_map) 

        // Update sighting info
        mostReportedLon = median(arMostReportedLon)
        mostReportedLat = median(arMostReportedLat)
        sightingInfo()
        add_legend(uap_map, 1)
    });

    if(lightSwitch == 'Off'){
        VIIRS_CityLights_2012.remove();
        Stadia_AlidadeSmoothDark.addTo(uap_map);
    } else {        
        Stadia_AlidadeSmoothDark.remove();
        VIIRS_CityLights_2012.addTo(uap_map);
    }
 }


 // Summary output
 function make_legend(){
    let legend = L.DomUtil.create("div", "legend")

    htmlStr = '<b>Number of sightings:</b> ' + sightingsCount + '<br /><br />'
    maxShow = (sightingsCount < 100) ? sightingsCount : 100;
    for(i=0;i<maxShow;i++){
        rand = i
        if(maxShow > 100){rand = getRandomInt(0, sightingsCount)}
        htmlStr += '<b>' + sightingSummary[rand].Date + ': ' +
        sightingSummary[rand].City + ',' + 
        sightingSummary[rand].State + '</b><br />' +
        sightingSummary[rand].Summary + '<br /><br />'
    }

    legend.innerHTML = htmlStr

    return legend;
}

// return random integer
function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
  }


// Leaflet layer for the Summary output
let legend = L.control({position: "bottomright"});
function add_legend(map, reload){
    if(reload){
        legend.remove(map)
    }
    
    legend.onAdd = make_legend
    legend.addTo(map)
}

 // Populate the shape filter
 let dropdownMenu = d3.select("#selDataset");
 dropdownMenu.append("option").text("All").property("value");
 for (x in shapes){
    dropdownMenu.append("option").text(shapes[x]).property("value");
 } 