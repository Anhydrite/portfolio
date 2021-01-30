function initSelectStation() {
    let selectStation = document.getElementById('selectStation')
    for (let station of dataWeather[0].station) {
        let option = document.createElement("option");
        option.setAttribute("value", station.n)
        option.text = station.n;
        selectStation.appendChild(option);
    }
    selectStation.addEventListener("change", updateLinechart);
    selectStation.addEventListener("load", updateLinechart());
}