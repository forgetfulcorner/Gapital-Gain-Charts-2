// CAPITAL GAINS CHART //
// Capital Gains variable names within this document will be referred to as 'cg'

const testPath = "../data/test.csv";

// CAPITAL GAINS SECTOR Variables
const cgSectorPath = "../data/cgSector.csv";
// CAPITAL GAINS INDUSTRY Variables
const cgIndustryPath = "../data/cgIndustry.csv";
// CAPITAL GAINS GROSS NET Variables

// SP 500 Variables
const sp500Path = "../data/test.csv";
// NASDAQ 100 Variables
const nasdaq100Path = "../data/test.csv";

// set the dimensions and margins of the graph
const margin = { top: 50, bottom: 50, right: 100, left: 100 };
const width = window.innerWidth - margin.left - margin.right;
const topChartsHeight = 400;
const height = 200;
const bottomChartsHeight = 200;

const date = "2023-02-15"

const numberFormatter = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

////////////////////////////////////////////////////////////////////////
////////////////// Create Bar Chart ////////////////////////////////////
////////////////////////////////////////////////////////////////////////


// append the svg object to the body of the page
const svg = d3
    .select("#capGainSector-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);


// console.log(formatNum(numEx, "M"))

// Parse the Data
d3.csv(cgSectorPath).then(function (data) {

    // Return data for only the date specified

    var newData = data.filter(filterCriteria);

    function filterCriteria(d) {
        return d.Date === date;
    }

    // Format the values into legible strings
    const newDataValues = d3.map(newData, function (d) { return formatNum(+d.CapGain, "M"); })
    
    // Get the max and min values of the data
    var min = d3.min(data, function (d) {return +d.CapGain;});
    var max = d3.max(data, function (d) {return -d.CapGain;});

    // Round the values and create equal +/- bounds
    var bounds = Math.abs(min) < max ? max : min
    bounds = Math.abs(bounds)

    // X axis
    const x = d3
        .scaleBand()
        .range([0, width])
        .domain(newData.map((d) => d.Sector))
        .padding(0.2);
    
    // Generates CapGain values to be plotted
    const xCapGainText = d3
        .scaleBand()
        .range([0, width])
        .domain(newDataValues.map((d) => (d)))
        .padding(0.2);
    
    svg
        .append("g")
        .attr("transform", `translate(0, -${height}-20)`)
        .call(d3.axisTop(x).tickSize(0))
        .selectAll("path").remove()
        .selectAll("text")
        .attr("transform", "translate(0,0)")
        .style("text-anchor", "middle")
        
    // Add Y axis
    const y = d3
        .scaleLinear()
        .domain([-bounds, bounds])
        .range([height, 0]);
    
    svg
        .append("g")
        .call(d3.axisRight(y).ticks(10).tickSize(width))
        .selectAll("path").remove()
    
    //Positive Values
    svg
        .append("g")
        .selectAll("mybar")
        .data(newData)
        .join("rect")
        .attr("x", (d) => x(d.Sector))
        .attr("y", (d) => y(+d.CapGain))
        .attr("width", x.bandwidth())
        .attr("height", (d) => (+d.CapGain > 0 ? y(max - +d.CapGain) : 0))
        .attr("id", "cgSectorBarPos")
        .attr("rx", "2px")

    // Negative Values
    svg
        .selectAll("mybar")
        .data(newData)
        .join("rect")
        .attr("x", (d) => x(d.Sector))
        .attr("y", (d) => height / 2)
        .attr("width", x.bandwidth())
        .attr("height", (d) => (+d.CapGain < 0 ? y(max - Math.abs(+d.CapGain)) : 0))
        .attr("id", "cgSectorBarNeg")
        .attr("rx", "2px")
    
    //////// Display Positive Labels
    svg
        .append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xCapGainText).tickSize(0))
        .selectAll("text")
        .data(newData)
        .attr("y", (d) => -Math.floor(+d.CapGain > 0 ? y(max - +d.CapGain) : 1000000) - 14 - height / 2)
        .style("text-anchor", "middle")
        .attr("id", "posLabels")
    
    //////// Display Negative Labels
    svg
        .append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xCapGainText).tickSize(0))
        .selectAll("text")
        .data(newData)
        .attr("y", (d) => -Math.floor(+d.CapGain < 0 ? y(max - +d.CapGain) : 1000000) + 8 - height / 2)
        .style("text-anchor", "middle")
        .attr("id", "negLabels")
      
});





function formatNum(value, format) {
    
    if (format === "B") {
        // Nine Zeroes for Billions
        var formattedNum = (Math.abs(Number(value)) / 1.0e+9).toFixed(0)
        formattedNum = numberFormatter.format(formattedNum)
        return "$" + formattedNum + "B"
        
    } else if (format === "M") {
        // Six Zeroes for Millions
        var formattedNum = (Math.abs(Number(value)) / 1.0e+6).toFixed(0)
        formattedNum = numberFormatter.format(formattedNum)
        return "$" + formattedNum + "M"
    }

}



