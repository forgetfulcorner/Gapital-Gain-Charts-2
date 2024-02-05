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
const bottomChartsHeight = 200;

const date = "2023-01-04"

function createBarGraph(divID, divHeight, csvPath, minVal, maxVal, xPadding) {
	// append the svg object to the body of the page
	const svg = d3
		.select(divID)
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", divHeight + margin.top + margin.bottom)
		.append("g")
		.attr("transform", `translate(${margin.left},${margin.top})`);

	// Parse the Data
    d3.csv(csvPath).then(function (data) {

        // Return data for only the date specified

        var newData = data.filter(filterCriteria);

        function filterCriteria(d) {
            return d.Date === date;
        }

        console.log(newData)
        
        // Get the max and min values of the data

		var min = d3.min(data, function (d) {return d.CapGain;});
        var max = d3.max(data, function (d) { return d.CapGain; });


        // Round the values and create equal +/- bounds
        var bounds = Math.abs(min) < max ? max : min
        bounds = Math.abs(bounds)

		// X axis
		const x = d3
			.scaleBand()
			.range([0, width])
			.domain(data.map((d) => d.Date))
			.padding(xPadding);

		svg
			.append("g")
			.attr("transform", `translate(0, ${divHeight})`)
			.call(d3.axisBottom(x))
			.selectAll("text")
			.attr("transform", "translate(-10,0)rotate(-45)")
			.style("text-anchor", "end");

		// Add Y axis
		const y = d3.scaleLinear().domain([-bounds, bounds]).range([divHeight, 0]);

		svg.append("g").call(d3.axisLeft(y));

		//Positive Values
		svg
			.append("g")
			.selectAll("mybar")
			.data(data)
			.join("rect")
			.attr("x", (d) => x(d.Date))
			.attr("y", (d) => y(d.CapGain))
			.attr("width", x.bandwidth())
			.attr("height", (d) => (d.CapGain > 0 ? y(max - d.CapGain) : 0))
			.attr("fill", "#7FF224");

		// Negative Values
		svg
			.selectAll("mybar")
			.data(data)
			.join("rect")
			.attr("x", (d) => x(d.Date))
			.attr("y", (d) => divHeight / 2)
			.attr("width", x.bandwidth())
			.attr("height", (d) => (d.CapGain < 0 ? y(max - Math.abs(d.CapGain)) : 0))
			.attr("fill", "#F0305E");
	});
}

createBarGraph("#capGainSector-container",topChartsHeight,cgSectorPath,-1000,1000,0.2);
// createBarGraph("#capGainIndustry-container", topChartsHeight, testPath, -1000, 1000, 0.5);

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
