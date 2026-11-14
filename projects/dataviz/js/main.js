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
/* Les scripts sont chargés dans <head> : quand les données arrivent (d3.json est asynchrone),
   le <body> peut ne pas encore être analysé — le conteneur .navigation n'existait alors pas et
   l'interface plantait (TypeError: appendChild of undefined). On démarre donc APRÈS le DOM. */
function startDashboard() {
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
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startDashboard);
else startDashboard();
