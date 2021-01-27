function init(geoJson) {
    svg = d3.select("#contentMap")
        .append("div")
        .attr("id", "content")
        .append("svg")
        .attr("viewBox", "0 0 " + widthMap + " " + heigthMap)
        .attr("preserveAspectRatio", "xMinYMin")
        .append("g")
        .attr('class', "map")

    g = svg.attr("widthMap", widthMap)
        .attr("heigthMap", heigthMap)
        .attr("viewBox", "0 0 " + widthMap + " " + heigthMap)
        .attr("preserveAspectRatio", "xMinYMin")
        .append('g')
        .attr("class", "map");

    g.selectAll('path')
        .data(geoJson.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('class', 'country')
}

function erase() {
	g.selectAll('text').remove();
}

function draw() {
	g.selectAll(".pin")
		.data(dataWeather[day].station)
		.enter().append("circle", ".pin")
		.attr("r", 7)
		.attr("class", "point")
		.attr("transform", function (d) {
			return "translate(" + projection([
				d.lng,
				d.lat
			]) + ")";
		})
		.on('mousemove', mousemove)
		.on('mouseover', (element) => mouseover(element))
		.on('mouseout', mouseout)
		.on('click', (element) => {
			let selectStation = document.getElementById("selectStation")
			for (let option of selectStation.options) {
				if (option.value === element.n) {
					option.selected = 'selected';
					selectStation.dispatchEvent(new Event('change'))
				}
			}
		});
	
	g.selectAll(".pin")
		.data(dataWeather[day].station)
		.enter().append("text")
		.attr('class', "temperature")
		.attr("style", function (d) {
			let temp = ((Math.round(d.t) / 100) + 10) * 1.75
			return "fill: " + getBlueToRed(temp) + ""
		})
		.attr("text-anchor", "middle")
		.attr("transform", function (d) {
			return "translate(" + projection([
				d.lng,
				d.lat + 0.20
			]) + ")";
		})
		.text(function (d) {
			for(let hours of d.hours){
				if(hours.h == hour){
					return Math.round(hours.t/100)
				}
			}

			if(hour == "none"){
				return Math.round(d.t / 100);
			}	

		});;
}
