// CAPITAL GAINS CHART //
// Capital Gains variable names within this document will be referred to as 'cg'

const testPath = "../data/test.csv";

// CAPITAL GAINS SECTOR Variables
const cgSectorPath = "../data/cgSector.csv";
// CAPITAL GAINS INDUSTRY Variables
const cgIndustryPath = "../data/test.csv";
// CAPITAL GAINS GROSS NET Variables

// SP 500 Variables
const sp500Path = "../data/test.csv";
// NASDAQ 100 Variables
const nasdaq100Path = "../data/test.csv";

// set the dimensions and margins of the graph
const margin = { top: 50, bottom: 50, right: 100, left: 100 };
const width = window.innerWidth - margin.left - margin.right;
const topChartsHeight = 400;
const height = 300;
const bottomChartsHeight = 200;

const date = "2023-01-17"

////////////////// Create Bar Chart ////////////////////////////////////


// append the svg object to the body of the page
const svg = d3
    .select("#capGainSector-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Parse the Data
d3.csv(cgSectorPath).then(function (data) {

    // Return data for only the date specified

    var newData = data.filter(filterCriteria);

    function filterCriteria(d) {
        return d.Date === date;
    }

    console.log(newData)
    
    // Get the max and min values of the data

    var min = d3.min(data, function (d) {return +d.CapGain;});
    var max = d3.max(data, function (d) {return -d.CapGain;});

    console.log(min)
    console.log(max)

    // Round the values and create equal +/- bounds
    var bounds = Math.abs(min) < max ? max : min
    bounds = Math.abs(bounds)

    // X axis
    const x = d3
        .scaleBand()
        .range([0, width])
        .domain(newData.map((d) => d.Sector))
        .padding(0.2);

    svg
        .append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Add Y axis
    const y = d3
        .scaleLinear()
        .domain([-bounds, bounds])
        .range([height, 0]);
    


    svg
        .append("g")
        .call(d3.axisLeft(y));

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

    
    // Positive Values Text
    const xVal = d3
        .scaleBand()
        .range([0, width])
        .domain(newData.map((d) => d.CapGain))
        .padding(0.2);
    
    svg
        .append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xVal))
        .selectAll("text")
        .attr("y", -100)
        // .attr("transform", "translate(-10,-200)rotate(0)")
        // .style("text-anchor", "end");



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
    
    
});


function roundnum(num, roundBy){
    return Math.round(num / roundBy)*roundBy;
}













// Uses D3 Simple Slider
// https://github.com/johnwalley/d3-simple-slider


// var slider = d3
// 	.sliderHorizontal()
// 	.min(0)
// 	.max(10)
// 	.step(1)
// 	.width(width)
// 	.displayValue(false)
// 	.on("onchange", (val) => {
// 		d3.select("#value").text(val);
// 		sliderVal = val;
// 	});

// d3.select("#slider")
// 	.append("svg")
// 	.attr("width", width + 100)
// 	.attr("height", 100)
// 	.append("g")
// 	.attr("transform", "translate(30,30)")
// 	.call(slider);
