
function initSelect() {
    let selectList = document.createElement("select");
    let selectListHour = document.createElement("select")
    selectListHour.classList.add("selectHour")
    selectList.setAttribute("id", "mySelect")
    selectList.addEventListener("change", (element) => {
        day = element.target.value;
        erase();
        draw();
    })

    selectListHour.addEventListener("change", (element) => {
        hour = element.target.value;
        erase();
        draw();
    })
    let temp = document.getElementsByClassName('navigation')[0].appendChild(
        document.createElement("a"));
    temp = temp.appendChild(document.createElement("li"))
    temp = temp.appendChild(document.createElement("div"))
    temp.classList.add("menu")
    let label = temp.appendChild(document.createElement("label"))
    temp = temp.appendChild(document.createElement("div"))
    temp.classList.add("select")

    label.textContent = "Change the day :"
    temp.appendChild(selectList)

    for (let i = 0; i < dataWeather.length; i++) {
        let option = document.createElement("option");
        option.setAttribute("value", i);
        option.text = (i + 1).toString();
        selectList.appendChild(option);
    }

    temp = document.getElementsByClassName('navigation')[0].appendChild(
        document.createElement("a"));
    temp = temp.appendChild(document.createElement("li"))
    temp = temp.appendChild(document.createElement("div"))
    temp.classList.add("menu")
    label = temp.appendChild(document.createElement("label"))
    temp = temp.appendChild(document.createElement("div"))
    temp.classList.add("select")

    label.textContent = "Change the hour :"
    temp.appendChild(selectListHour)
    let option = document.createElement("option");
    option.setAttribute("value", "none");
    option.setAttribute("selected", "true")
    option.text = "--";
    selectListHour.appendChild(option);

    for (let i = 0; i <= 21; i += 3) {
        option = document.createElement("option");
        option.setAttribute("value", i);
        option.text = i.toString();
        selectListHour.appendChild(option);
    }

}