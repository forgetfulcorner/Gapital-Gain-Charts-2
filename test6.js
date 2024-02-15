// Set up margin, width, and height for the chart
const margin = { top: 50, right: 100, bottom: 0, left: 100 };
const width = window.innerWidth - margin.left - margin.right;
const sliderWidth = window.innerWidth - margin.left - margin.right-8;
const height = 280 - margin.top - margin.bottom;
const height2 = 150 - margin.top - margin.bottom;

// Parse the date and CapGain
const parseDate = d3.timeParse("%Y-%m-%d");

// Formats numbers to be more legible
// For format argument, pass either "M" for millions and "B" for billions
function formatNum(value, format, neg) {
    const numberFormatter = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
    
    if (format === "B") {
        // Nine Zeroes for Billions
        var formattedNum = (Math.abs(Number(value)) / 1.0e+9).toFixed(0)
        formattedNum = numberFormatter.format(formattedNum)
        if (neg) {
            return "-$" + formattedNum + "B"
        } else {
            return "$" + formattedNum + "B"
        }
        
    } else if (format === "M") {
        // Six Zeroes for Millions
        var formattedNum = (Math.abs(Number(value)) / 1.0e+6).toFixed(0)
        formattedNum = numberFormatter.format(formattedNum)
        if (neg) {
            return "-$" + formattedNum + "M"
        } else {
            return "$" + formattedNum + "M"
        }
    }
}

// Create SVG and append it to the body
const svg1 = d3
	.select("#cgSectorChart")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)
    
const svg2 = d3
	.select("#cgIndustryChart")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
    
const svg3 = d3
	.select("#cgNetChart")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height2 + margin.top + margin.bottom)
	.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
    
const svg4 = d3
	.select("#sp500Chart")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height2 + margin.top + margin.bottom)
	.append("g")
	.attr("transform", `translate(${margin.left},${margin.top})`);
    
// Load the CSV data
d3.csv("./Data/cgIndustryCompiled.csv").then((data) => {

	// Process data. This mutates the data set.
    data.forEach((d) => {
        d.CapGain = +d.CapGain; // Convert CapGain to a number
    });

    var uniqueDates = [...new Set(data.map((d) => d.Date))];

    // Group data by Date and Sector
    const nestedData = d3.nest()
        .key(d => d.Date)
        .key(d => d.Sector)
        .rollup(v => d3.sum(v, d => d.CapGain))
        .entries(data);

    // Flatten the nested data structure
    var flattenedArray = nestedData.flatMap(date => {
        return date.values.map(sector => ({
            Date: parseDate(date.key),
            Sector: sector.key,
            CapGain: sector.value
        }));
    });

    // Rollup to get net cap gain per day
    const capGainOnlyData = flattenedArray.filter(d => d.Sector !== "SP500")

    const cgNet = d3.nest()
        .key(d => d.Date)
        .rollup(v => d3.sum(v, d => d.CapGain))
        .entries(capGainOnlyData);
    

    // The parsing of the date for the original dataset must come after the grouping and flattening
    data.forEach((d) => {
        d.Date = parseDate(d.Date);
    });

     // Filter arrays based on sector
    const cgSector = flattenedArray.filter(d => d.Sector !== "SP500");
    const sp500 = flattenedArray.filter(d => d.Sector === "SP500");

    // Process uniqueDates so that each string becomes a date object
    uniqueDates = uniqueDates.map(d => parseDate(d));

    // Find the minimum and maximum Sector CapGain values
    const minSector = d3.min(cgSector, d => d.CapGain);
    const maxSector = d3.max(cgSector, d => d.CapGain);

    // Find the minimum and maximum Industry CapGain values
    const minIndustry = d3.min(data, d => d.CapGain);
    const maxIndustry = d3.max(data, d => d.CapGain);

    // Find the minimum and maximum Net CapGain values
    const minNet = d3.min(cgNet, d => d.value);
    const maxNet = d3.max(cgNet, d => d.value);

    // Find the minimum and maximum Net CapGain values
    const minsp500 = d3.min(sp500, d => d.CapGain);
    const maxsp500 = d3.max(sp500, d => d.CapGain);


    // console.log("Minimum CapGain:", minSector);
    // console.log("Maximum CapGain:", maxSector);

    // console.log("Minimum CapGain:", minIndustry);
    // console.log("Maximum CapGain:", maxIndustry);

	// Set x and y scales
	const xScale = d3
		.scaleBand()
		.domain(cgSector.map((d) => d.Sector))
		.range([0, width])
        .padding(0.2);
    
    const xScaleIndustry = d3
		.scaleBand()
		.domain(data.map((d) => d.Industry))
		.range([0, width])
        .padding(0.2);
    
    const xScaleNet = d3
		.scaleBand()
		.domain(cgNet.map((d) => d.key))
		.range([0, width])
        .padding(0.5);
    
    const xScalesp500 = d3
		.scaleBand()
		.domain(sp500.map((d) => d.Date))
		.range([0, width])
        .padding(0.5);

	// Round the values and create equal +/- bounds
    var bounds = Math.abs(minSector) < maxSector ? Math.abs(maxSector) : Math.abs(minSector);
    var boundsIndustry = Math.abs(minIndustry) < maxIndustry ? Math.abs(maxIndustry) : Math.abs(minIndustry);
    var boundsIndustryScale = 0.1
    boundsIndustry *= boundsIndustryScale
    var boundsNet = Math.abs(minNet) < maxNet ? Math.abs(maxNet) : Math.abs(minNet);
    
    const yScale = d3.scaleLinear().domain([-bounds, bounds]).range([height, 0]);
    const yScaleIndustry = d3.scaleLinear().domain([-boundsIndustry, boundsIndustry]).range([height, 0]);
    const yScaleNet = d3.scaleLinear().domain([-boundsNet, boundsNet]).range([height2, 0]);
    const yScalesp500 = d3.scaleLinear().domain([minsp500, maxsp500]).range([height2, 0]);

	// Draw grid lines for Y axis
	svg1
		.append("g")
		.attr("class", "grid")
        .call(d3.axisRight(yScale).tickSize(width).tickFormat((d) => formatNum(d, "M")).ticks(5));
    
    svg2
		.append("g")
		.attr("class", "grid")
        .call(d3.axisRight(yScaleIndustry).tickSize(width).tickFormat((d) => formatNum(d, "M")).ticks(8));
    
    svg3
		.append("g")
		.attr("class", "grid")
        .call(d3.axisRight(yScaleNet).tickSize(width).tickFormat((d) => formatNum(d, "M")).ticks(4));
    
    svg4
		.append("g")
		.attr("class", "grid")
		.call(d3.axisRight(yScalesp500).tickSize(width).tickFormat((d) => d).ticks(6));

	// Draw initial bars
	const bars = svg1
		.selectAll(".bar")
		.data(cgSector.filter((d) => d.Date.getTime() === uniqueDates[0].getTime()))
		.enter()
		.append("rect")
		.attr("class", "bar")
		.attr("x", (d) => xScale(d.Sector))
		.attr("width", xScale.bandwidth())
		.attr("y", (d) => (d.CapGain >= 0 ? yScale(d.CapGain) : height / 2))
		.attr("height", (d) => Math.abs(yScale(0) - yScale(d.CapGain)))
        .attr("fill", (d) => (d.CapGain >= 0 ? "#7FF224" : "#F0305E"))
    
    const bars2 = svg2
		.selectAll(".bar")
		.data(data.filter((d) => d.Date.getTime() === uniqueDates[0].getTime()))
		.enter()
		.append("rect")
		.attr("class", "bar")
		.attr("x", (d) => xScaleIndustry(d.Industry))
		.attr("width", xScaleIndustry.bandwidth())
		.attr("y", (d) => (d.CapGain >= 0 ? yScaleIndustry(d.CapGain) : height / 2))
		.attr("height", (d) => Math.abs(yScaleIndustry(0) - yScaleIndustry(d.CapGain)))
        .attr("fill", (d) => (d.CapGain >= 0 ? "#7FF224" : "#F0305E"))
        .on("mouseover", function(d) {
            // Show tooltip
            tooltip.transition()
                .duration(100)
                .style("display", "inline")
                .style("opacity", .9);
            tooltip.html(`Sector: ${d.Sector}<br>Industry: ${d.Industry}<br><br><span id="colorIndicator">CapGain: ${formatNum(d.CapGain, "M")}</span>`)
                .style("left", (d3.event.pageX - 100) + "px")
                .style("top", (d3.event.pageY - 108) + "px")
                .style("position", "absolute")
                .style("padding", "10px")
                // .selectAll("#posGreen")
                // .style("color", "#7FF224")
        })
        .on("mouseout", function(d) {
            // Hide tooltip
            tooltip.transition()
                .duration(100)
                .style("display", "none")
                .style("opacity", 0)
        });
    
    const bars3 = svg3
		.selectAll(".bar")
		.data(cgNet)
		.enter()
		.append("rect")
		.attr("class", "bar")
		.attr("x", (d) => xScaleNet(d.key))
		.attr("width", xScaleNet.bandwidth())
		.attr("y", (d) => (d.value >= 0 ? yScaleNet(d.value) : height2 / 2))
		.attr("height", (d) => Math.abs(yScaleNet(0) - yScaleNet(d.value)))
        .attr("fill", (d) => (d.value >= 0 ? "#7FF224" : "#F0305E"))
    
    console.log(sp500)
    
    const bars4 = svg4
        .selectAll(".bar")
        .data(sp500)
		.enter()
		.append("rect")
		.attr("class", "bar")
		.attr("x", (d) => xScalesp500(d.Date))
		.attr("width", xScalesp500.bandwidth())
		.attr("y", (d) => yScalesp500(d.CapGain))
		.attr("height", (d) => Math.abs(3))
        .attr("fill", "#F5F5F5")
    

	// Add CapGain labels above bars
	const capGainLabels = svg1
		.selectAll(".cap-gain-label")
		.data(cgSector.filter((d) => d.Date.getTime() === uniqueDates[0].getTime()))
		.enter()
		.append("text")
		.attr("class", "cap-gain-label")
		.attr("x", (d) => xScale(d.Sector) + xScale.bandwidth() / 2)
		.attr("y", (d) =>
			d.CapGain >= 0 ? yScale(d.CapGain) - 5 : yScale(d.CapGain) + 20
		) // Position above the bar
		.attr("text-anchor", "middle")
		.text((d) => formatNum(d.CapGain, "M"))
        .style("fill", (d) => (d.CapGain >= 0 ? "#7FF224" : "#F0305E"))


	// Add sector labels at the top
	svg1
		.append("g")
		.selectAll("text")
		.data(cgSector.filter((d) => d.Date.getTime() === uniqueDates[0].getTime()))
		.enter()
		.append("text")
		.attr("class", "label")
		.attr("x", (d) => xScale(d.Sector) + xScale.bandwidth() / 2)
		.attr("y", 0)
		.attr("dy", "-0.5em")
		.attr("text-anchor", "middle")
        .text((d) => d.Sector);

	// Add a slider to control the date
    const slider = d3
        .select("#dateSlider")
        .attr("min", 0)
        .attr("max", uniqueDates.length - 1)
        .attr("value", 0)
        .attr("step", 1)
        .attr("style", `width: ${sliderWidth}px`) // Set the width of the slider to the full width of the chart

    // Create tooltip element
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
        
    // Code below updates charts when slider is activated
    const selectedDate = d3.select("#selectedDate");
    selectedDate.text(`${data[0].Date.toDateString()}`);
        
	slider.on("input", function () {
		const selectedValue = this.value;
		const selectedData = cgSector.filter(
			(d) => d.Date.getTime() === uniqueDates[selectedValue].getTime()
        );
        const selectedDataIndustry = data.filter(
			(d) => d.Date.getTime() === uniqueDates[selectedValue].getTime()
		);

		// Update bars
		bars
			.data(selectedData)
			.transition()
			.duration(100)
			.attr("y", (d) => (d.CapGain >= 0 ? yScale(d.CapGain) : height / 2))
			.attr("height", (d) => Math.abs(yScale(0) - yScale(d.CapGain)))
            .attr("fill", (d) => (d.CapGain >= 0 ? "#7FF224" : "#F0305E"));
        
        bars2
			.data(selectedDataIndustry)
			.transition()
			.duration(100)
			.attr("y", (d) => (d.CapGain >= 0 ? yScaleIndustry(d.CapGain) : height / 2))
			.attr("height", (d) => Math.abs(yScaleIndustry(0) - yScaleIndustry(d.CapGain)))
			.attr("fill", (d) => (d.CapGain >= 0 ? "#7FF224" : "#F0305E"));

		// Update CapGain labels
		capGainLabels
			.data(selectedData)
			.text((d) => formatNum(d.CapGain, "M"))
			.attr("y", (d) =>
				d.CapGain >= 0 ? yScale(d.CapGain) - 5 : yScale(d.CapGain) + 20
			)
            .style("fill", (d) => (d.CapGain >= 0 ? "#7FF224" : "#F0305E"))

		// Update selected date display
        selectedDate.text(`${selectedData[0].Date.toDateString()}`);

	});

});

