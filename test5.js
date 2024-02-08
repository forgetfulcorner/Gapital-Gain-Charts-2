// Set up margin, width, and height for the chart
const margin = { top: 50, right: 100, bottom: 50, left: 100 };
const width = window.innerWidth - margin.left - margin.right;
const height = 300 - margin.top - margin.bottom;
const heightIndustryChart = 500 - margin.top - margin.bottom;

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
	.attr("height", heightIndustryChart + margin.top + margin.bottom)
	.append("g")
	.attr("transform", `translate(${margin.left},${margin.top})`);
    
// Load the CSV data
d3.csv("../Data/cgIndustryCompiled.csv").then((data) => {

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
        .padding(0.1);

	// Round the values and create equal +/- bounds
    var bounds = Math.abs(minSector) < maxSector ? Math.abs(maxSector) : Math.abs(minSector);
    var boundsIndustry = Math.abs(minIndustry) < maxIndustry ? Math.abs(maxIndustry) : Math.abs(minIndustry);
    var boundsIndustryScale = 0.1
    boundsIndustry *= boundsIndustryScale
    
    const yScale = d3.scaleLinear().domain([-bounds, bounds]).range([height, 0]);
    const yScaleIndustry = d3.scaleLinear().domain([-boundsIndustry, boundsIndustry]).range([heightIndustryChart, 0]);

	// Draw grid lines for Y axis
	svg1
		.append("g")
		.attr("class", "grid")
        .call(d3.axisRight(yScale).tickSize(width).tickFormat((d) => formatNum(d, "M")).ticks(5));
    
    svg2
		.append("g")
		.attr("class", "grid")
		.call(d3.axisRight(yScaleIndustry).tickSize(width).tickFormat((d) => formatNum(d, "M")).ticks(8));

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
		.attr("y", (d) => (d.CapGain >= 0 ? yScaleIndustry(d.CapGain) : heightIndustryChart / 2))
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
        .attr("transform", `translate(200, 20)`)
        .attr("style", `width: ${width}px`) // Set the width of the slider to the full width of the chart

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
			.attr("y", (d) => (d.CapGain >= 0 ? yScaleIndustry(d.CapGain) : heightIndustryChart / 2))
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


