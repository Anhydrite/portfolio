function updateLinechart(element) {
	if(element){
		selectedStation = element.target.value;
	}
	eraseLineChart()
	drawLineChart()
}

function drawLineChart() {
	if(selectedStation.startsWith("--")){
		return;
	}
	let margin = {
			top: 10,
			right: 30,
			bottom: 30,
			left: 60
		},
		width = parseInt(d3.select("#lineChart").style("width")) - margin.left - margin.right,
		height = parseInt(d3.select("#lineChart").style("height")) - margin.left - margin.right;

	d3.select("#lineChart").append("p").attr("id", "chartTempTitle").attr("class", "chartsTitles").text(selectedStation.charAt(0).toUpperCase() + selectedStation.slice(1).toLowerCase() + "'s weather station temperature for the last 28 days")	

		let svg = d3.select("#lineChart")
		.append("svg")
		.attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
		.append("g")
		.attr("transform",
			"translate(" + margin.left + "," + margin.top + ")");

	
	data = [];
	for (let i = 1; i < dataWeather.length; i++) {
		for (let station of dataWeather[i - 1].station) {
			if (station.n === selectedStation) {
				for (let hour of station.hours) {
					data.push({
						date: d3.timeParse("%d-%I")(i + "-" + hour.h),
						day: i,
						hour: hour.h,
						value: hour.t / 100,
						pluvio: hour.p
					})
				}
			}
		}
	}

	var x = d3.scaleTime()
		.domain(d3.extent(data, function (d) {
			return d.date;
		}))
		.range([0, width]);
	svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.attr("class", "axisWhite")
		.call(d3.axisBottom(x).tickFormat(d3.timeFormat("%d, %Ih")));

	let max = d3.max(data, function (d) {
		return d.value;
	})
	let min = d3.min(data, function (d) {
		return d.value;
	})

	var y = d3.scaleLinear()
		.domain([min, max])
		.range([height, 0]);
	svg.append("g")
		.attr("class", "axisWhite")
		.call(d3.axisLeft(y));

	svg.append("linearGradient")
		.attr("id", "line-gradient")
		.attr("gradientUnits", "userSpaceOnUse")
		.attr("x1", 0)
		.attr("y1", y(0))
		.attr("x2", 0)
		.attr("y2", y(max))
		.selectAll("stop")
		.data([{
				offset: "0%",
				color: "blue"
			},
			{
				offset: "100%",
				color: "red"
			}
		])
		.enter().append("stop")
		.attr("offset", function (d) {
			return d.offset;
		})
		.attr("stop-color", function (d) {
			return d.color;
		});

	svg.append("path")
		.datum(data)
		.attr("fill", "none")
		.attr("stroke", "url(#line-gradient)")
		.attr("stroke-width", 2)
		.attr("d", d3.line()
			.x(function (d) {
				return x(d.date)
			})
			.y(function (d) {
				return y(d.value)
			})
		)

	d3.select("#lineChart").append("p").attr("class", "chartsTitles").text(selectedStation.charAt(0).toUpperCase() + selectedStation.slice(1).toLowerCase() + "'s weather station pluvio for the last 28 days")	

	svg = d3.select("#lineChart")
		.append("svg")
		.attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
		.append("g")
		.attr("transform",
			"translate(" + margin.left + "," + margin.top + ")");

	svg.append("g")
	.attr("transform", "translate(0," + height + ")")
	.attr("class", "axisWhite")
	.call(d3.axisBottom(x).tickFormat(d3.timeFormat("%d, %Ih")));


	max = d3.max(data, function (d) {
		return d.pluvio;
	})
	min = d3.min(data, function (d) {
		return d.pluvio;
	})

	y = d3.scaleLinear()
		.domain([min, max])
		.range([height, 0]);
	svg.append("g")
		.attr("class", "axisWhite")
		.call(d3.axisLeft(y));

	svg.append("linearGradient")
		.attr("id", "line-gradient2")
		.attr("gradientUnits", "userSpaceOnUse")
		.attr("x1", 0)
		.attr("y1", y(0))
		.attr("x2", 0)
		.attr("y2", y(max))
		.selectAll("stop")
		.data([{
				offset: "0%",
				color: "white"
			},
			{
				offset: "100%",
				color: "blue"
			}
		])
		.enter().append("stop")
		.attr("offset", function (d) {
			return d.offset;
		})
		.attr("stop-color", function (d) {
			return d.color;
		});

	svg.append("path")
		.datum(data)
		.attr("fill", "none")
		.attr("stroke", "url(#line-gradient2)")
		.attr("stroke-width", 2)
		.attr("d", d3.line()
			.x(function (d) {
				return x(d.date)
			})
			.y(function (d) {
				return y(d.pluvio)
			})
		)

		document.getElementById('chartTempTitle').scrollIntoView({
			block: 'start',
			behavior: 'smooth'
		});

	// drawTable();

}

function eraseLineChart() {
	d3.selectAll("#lineChart svg").remove()
	d3.selectAll("#lineChart p").remove()
}