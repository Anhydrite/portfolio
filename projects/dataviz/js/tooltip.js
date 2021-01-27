function initTooltip() {
    Tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("display", "none");
}

function mouseover(element) {
	Tooltip.style("display", "inline")
		.text(element.n)
}

function mousemove() {
	Tooltip.style("left", (d3.event.pageX - 34) + "px")
		.style("top", (d3.event.pageY - 12) + "px");
}

function mouseout() {
	Tooltip.style("display", "none");
}