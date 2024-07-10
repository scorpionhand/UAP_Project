// Build the metadata panel
function buildMetadata(sample) {
  d3.json("https://static.bc-edx.com/data/dl-1-2/m14/lms/starter/samples.json").then((data) => {

    // Oveview of the data
    console.log(`json data: `)
    console.log(Object(data))

    // get the metadata field
    let buttonAllMeta = data.metadata;

    // Filter the metadata for the object with the desired sample number
    let buttonMeta = buttonAllMeta.filter(result => result.id == sample);

    // Use d3 to select the panel with id of `#sample-metadata`
    let metaSample = d3.select('#sample-metadata');
    
    // Use `.html("") to clear any existing metadata
    metaSample.html("")

    // Inside a loop, you will need to use d3 to append new
    // tags for each key-value in the filtered metadata.
    console.log(`Results for metadata ID Number ${sample} [key, value]: `)
    console.log(Object.entries(buttonMeta[0]))

    Object.entries(buttonMeta[0]).forEach(([key, value]) => {
      upperKey = key.toUpperCase()
      metaSample.append('tr').text(`${upperKey}: ${value}`)
    })
  });
};

// function to build both charts
function buildCharts(sample) {
  d3.json("https://static.bc-edx.com/data/dl-1-2/m14/lms/starter/samples.json").then((data) => {

    // Get the samples field
    let buttonAllSamples = data.samples;
    
    // Filter the samples for the object with the desired sample number
    let buttonSample = buttonAllSamples.filter(result => result.id == sample);
    console.log(`Results for samples with ID Number ${sample}: `)
    console.log(buttonSample[0])

    // Get the otu_ids, otu_labels, and sample_values
    let sample_otu_ids = buttonSample[0].otu_ids
    let sample_otu_labels = buttonSample[0].otu_labels
    let sample_values = buttonSample[0].sample_values

    // Build a Bubble Chart
    let bubbleTrace = {
      x: sample_otu_ids,
      y: sample_values,
      text: sample_otu_labels,
      mode: "markers",
      marker: {
          size: sample_values,
          color: sample_otu_ids,
      }
    };

    let bubbleLayout = {
        title: "Bacteria Cultures Per Sample",
        xaxis: {title: "OTU ID"},
        yaxis: {title: "Number of Bacteria"},
        height: 450,
        width: 1000
    };

    // Render the Bubble Chart
    Plotly.newPlot("bubble", [bubbleTrace], bubbleLayout)
    console.log(`Plotly bubble chart ${sample}: `)
    console.log(bubbleTrace)
    console.log(bubbleLayout)


    // For the Bar Chart, map the otu_ids to a list of strings for your yticks
    let sample_otu_ids_str = sample_otu_ids.map(id => `OTU ${id} `)

    // Build a Bar Chart
    // Don't forget to slice and reverse the input data appropriately
    let barTrace = [{
      x: sample_values.slice(0,10).reverse(),
      y: sample_otu_ids_str.slice(0,10).reverse(),
      text: sample_otu_labels.slice(0,10).reverse(),
      type: 'bar',
      orientation: 'h'
    }];

    let barLayout = {
      title: "Top 10 Bacteria Cultures Found",
      xaxis: {title: "Number of Bacteria"},
      height: 450,
      width: 700            
    }; 

    // Render the Bar Chart
    Plotly.newPlot('bar', barTrace, barLayout);
    console.log(`Plotly bar chart ${sample}: `)
    console.log(barTrace)
    console.log(barLayout)

  });
}

let dta = Object
let dtaShape = []
let names = Object
// Function to run on page load
function init() {
  d3.json("../UAP_Data/uap_data_output.geojson").then((data) => {

    dta = data.features
    // Get the names field
    names = data.names;

    // Use d3 to select the dropdown with id of `#selDataset`
    let dropdownMenu = d3.select("#selDataset");

    // Use the list of sample names to populate the select options
    // Hint: Inside a loop, you will need to use d3 to append a new
    // option for each sample name.
    dta.forEach(function(shape){
      d3.select("#selDataset").selectAll("option")
        .data(d3.map(data, function(d){return d.shape.properties.Shape;}).keys())
        .enter()
        .append("option")
        .text(function(d){return d;})
        .attr("value",function(d){return d;});
      //let thisShape = shape.properties.Shape
      //dropdownMenu.append("option").text(thisShape).property("value");
    });

    // Get the first sample from the list
    let firstValue = names[0]

    // Build charts and metadata panel with the first sample
    buildMetadata(firstValue)
    buildCharts(firstValue)
  });
}

// Function for event listener
function optionChanged(newSample) {
  // Clear the console output
  console.clear()
  // Build charts and metadata panel each time a new sample is selected
  buildMetadata(newSample)
  buildCharts(newSample)
}

// Initialize the dashboard
init();
