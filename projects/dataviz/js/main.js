const projection = d3.geo.mercator()
	.center([2.8, 46.01])
	.scale([1800]);
const path = d3.geo.path().projection(projection);
const widthMap = 960,
	heigthMap = 450;

let g;
let tip;
let day = 1;
let dataWeather;
let xpos = ypos = 0;
let Tooltip;
let svg;
let selectedStation = "--";
let data = [];
let hour = "none"
d3.json('data/departments.json', function (error, geoJson) {
	init(geoJson)
	d3.json('data/meteo.json', (stations) => {
		dataWeather = stations;
		initSelect();
		initSelectStation();
		draw();
		initTooltip();
	})

});
