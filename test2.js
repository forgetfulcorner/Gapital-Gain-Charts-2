// Set up margin, width, and height for the chart
const margin = { top: 50, right: 100, bottom: 50, left: 100 };
const width = window.innerWidth - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Parse the date and CapGain
const parseDate = d3.timeParse("%Y-%m-%d");

// Formats numbers to be more legible

const numberFormatter = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
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

// Create SVG and append it to the body
const svg = d3
	.select("#cgSectorChart")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", `translate(${margin.left},${margin.top})`);

// Load the CSV data
d3.csv("../Data/cgSector.csv").then((data) => {
	// Process data
	data.forEach((d) => {
		d.Date = parseDate(d.Date);
		d.CapGain = +d.CapGain; // Convert CapGain to a number
	});

	// Extract unique dates for slider steps
	const uniqueDates = [...new Set(data.map((d) => d.Date))];

	// Set x and y scales
	const xScale = d3
		.scaleBand()
		.domain(data.map((d) => d.Sector))
		.range([0, width])
		.padding(0.2);

	// Get the max and min values of the data
	var min = d3.min(data, function (d) {
		return +d.CapGain;
	});
	var max = d3.max(data, function (d) {
		return -d.CapGain;
	});

	// Round the values and create equal +/- bounds
	var bounds = Math.abs(min) < max ? max : min;
	bounds = Math.abs(bounds);

	const yScale = d3.scaleLinear().domain([-bounds, bounds]).range([height, 0]);

	// Draw grid lines for Y axis
	svg
		.append("g")
		.attr("class", "grid")
		.call(d3.axisLeft(yScale).tickSize(-width).tickFormat(""));

	// Draw initial bars
	const bars = svg
		.selectAll(".bar")
		.data(data.filter((d) => d.Date.getTime() === uniqueDates[0].getTime()))
		.enter()
		.append("rect")
		.attr("class", "bar")
		.attr("x", (d) => xScale(d.Sector)) // Center bars along X axis
		.attr("width", xScale.bandwidth())
		.attr("y", (d) => (d.CapGain >= 0 ? yScale(d.CapGain) : height / 2))
		.attr("height", (d) => Math.abs(yScale(0) - yScale(d.CapGain)))
		.attr("fill", (d) => (d.CapGain >= 0 ? "#7FF224" : "#F0305E"));

	// Add CapGain labels above bars
	const capGainLabels = svg
		.selectAll(".cap-gain-label")
		.data(data.filter((d) => d.Date.getTime() === uniqueDates[0].getTime()))
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
	svg
		.append("g")
		.selectAll("text")
		.data(data.filter((d) => d.Date.getTime() === uniqueDates[0].getTime()))
		.enter()
		.append("text")
		.attr("class", "label")
		.attr("x", (d) => xScale(d.Sector) + xScale.bandwidth() / 2)
		.attr("y", 0)
		.attr("dy", "-0.5em")
		.attr("text-anchor", "middle")
		.text((d) => d.Sector);

	// Add y-axis on the right side
	svg
		.append("g")
		.attr("class", "y-axis")
		.attr("transform", `translate(${width}, 0)`)
		.call(d3.axisRight(yScale).ticks(5));

	// Add a slider to control the date
    const slider = d3
        .select("#dateSlider")
        .attr("min", 0)
        .attr("max", uniqueDates.length - 1)
        .attr("value", 0)
        .attr("step", 1)
        .attr("transform", `translate(200, 20)`)
        .attr("style", `width: ${width}px`) // Set the width of the slider to the full width of the chart
        

	const selectedDate = d3.select("#selectedDate");

	slider.on("input", function () {
		const selectedValue = this.value;
		const selectedData = data.filter(
			(d) => d.Date.getTime() === uniqueDates[selectedValue].getTime()
		);

		// Update bars
		bars
			.data(selectedData)
			.transition()
			.duration(50)
			.attr("y", (d) => (d.CapGain >= 0 ? yScale(d.CapGain) : height / 2))
			.attr("height", (d) => Math.abs(yScale(0) - yScale(d.CapGain)))
			.attr("fill", (d) => (d.CapGain >= 0 ? "#7FF224" : "#F0305E"));

		// Update CapGain labels
		capGainLabels
			.data(selectedData)
			.text((d) => formatNum(d.CapGain, "M"))
			.attr("y", (d) =>
				d.CapGain >= 0 ? yScale(d.CapGain) - 5 : yScale(d.CapGain) + 20
			)
            .style("fill", (d) => (d.CapGain >= 0 ? "#7FF224" : "#F0305E"))

		// Update sector labels
		svg
			.selectAll(".label")
			.data(selectedData)
			.text((d) => d.Sector);

		// Update selected date display
		selectedDate.text(`Selected Date: ${selectedData[0].Date.toDateString()}`);
	});

});


