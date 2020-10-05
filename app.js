const proxy = "https://cors-anywhere.herokuapp.com/";

var arr = [];
var stringArr = [];
var nearestCity = [];
var latlong;
var currCity;
Initializing();


async function Initializing() {
    renderDisplay();
    currCity = "Mumbai"
    url = "https://www.metaweather.com/api/location/12586539/";
    response = await axios(proxy + url);
    latlong = response.data.latt_long;
    response = response.data.consolidated_weather;
    loadDataInArray(response);
}


function renderDisplay() {
    arr = [];
    stringArr = [];
    nearestCity = [];
    document.querySelector(".bottom-list").innerHTML = "";
    document.querySelector(".cont-weather").innerHTML = 
        `<div class="loading text-center">
            <i class="fa fa-spinner fa-spin"></i>
        </div>`;
}


function loadDataInArray(response) {
    for (var i = 0; i < response.length ; i++) {
        var obj = {
            date: response[i].applicable_date,
            state: response[i].weather_state_name,
            min: Math.round(response[i].min_temp),
            max: Math.round(response[i].max_temp),
            humidity: response[i].humidity,
            url: `https://www.metaweather.com/static/img/weather/${response[i].weather_state_abbr}.svg`
        }
        arr.push(obj);
    }
    loadDataInString();
}


function loadDataInString() {
    for (var i = 0; i < arr.length; i++) {
        var currObj = arr[i];
        var s = 
                `<div class="col-md-4 mid-2 mb-4 ml-4 mr-4">
                    <div class="row single-row">
                        <div class="col-md-2 offset-md-1 align-self-center col-6">
                            <img height="100px" src="${currObj.url}" alt="img">
                        </div>
                        <div class="col-md-6 offset-md-3 col-6">
                            <div class="my-font">
                                ${currObj.date}
                            </div>
                            <div  class="my-font">
                                ${currObj.state}
                            </div>
                            <div  class="my-font">
                                Min Temp: ${currObj.min}C
                            </div>
                            <div  class="my-font">
                                Max Temp: ${currObj.max}C
                            </div>
                            <div  class="my-font">
                                Humidity: ${currObj.humidity}
                            </div>
                        </div>
                    </div>
                </div>`;              
        stringArr.push(s);
    }
    loadDataView();
}


function loadDataView() {
    var inserting = document.querySelector(".cont-weather");
    var i;
    document.querySelector(".cont-weather").innerHTML = "";
    for (i = 0; i < stringArr.length; i += 2) {
        var string = `      <div class="row justify-content-center cont-weather"> 
                        ${stringArr[i]}
                        ${stringArr[i+1]}
                       </div>`
        inserting.insertAdjacentHTML("beforeend", string);
    }
    nearestLocation();
}


async function nearestLocation() {
    var url = "https://www.metaweather.com/api/location/search/?lattlong=" + latlong;
    var response = await axios(proxy + url);
    response = response.data;
    for (var i = 0; i < response.length; i++) {
        var curr = response[i];
        if ((curr.title).toLocaleLowerCase() !== (currCity).toLocaleLowerCase()) {
            var obj = {
                title: curr.title,
                woeid: curr.woeid,
            }
                nearestCity.push(obj);
        }
    }
    loadNearestLocation();
}


function loadNearestLocation() {
    for (var i = 0; i < nearestCity.length; i++) {
        var obj = nearestCity[i];
        var string = obj.woeid+" " + obj.title;
        var template = `<a href="#" onclick="return false;" data-goto="${string}">${obj.title}</a>`;
        document.querySelector(".bottom-list").insertAdjacentHTML("beforeend", template);
    }
}


async function loadFromInput(inputText) {
    document.getElementById("inputField").value = "";
    document.querySelector(".city-name").innerHTML = `<h4>${inputText}</h4>`;
    var url = "https://www.metaweather.com/api/location/search/?query=" + inputText;
    var response = await axios(proxy + url);
    if (response.data.length > 0) {
        url = "https://www.metaweather.com/api/location/" + response.data[0].woeid;
        currCity = inputText;
        latlong = response.data[0].latt_long;
        response = await axios(proxy + url);
        response = response.data.consolidated_weather;
        loadDataInArray(response);
    }
    else {
        document.querySelector(".city-name").innerHTML = `<h4>Not Found Location <br> Loading Mumbai's Data</h4>`;
        Initializing();
    }
}


async function extractWoeid(woeid, name) {
    document.querySelector(".city-name").innerHTML = `<h4>${name}</h4>`;
    name = name.trimStart();
    name = name.trimEnd();
    currCity = name;
    renderDisplay();
    url = proxy + "https://www.metaweather.com/api/location/" + woeid;
    response = await axios(url);
    latlong = response.data.latt_long;
    response = response.data.consolidated_weather;
    loadDataInArray(response);
}


document.querySelector(".submit-button").addEventListener('click', () => {
    var inputText = document.getElementById("inputField").value;
    inputText = inputText.trimStart();
    inputText = inputText.trimEnd();
    if (inputText !== "") {
        renderDisplay();
        loadFromInput(inputText);
    }
});


document.querySelector(".bottom-list").addEventListener('click', (e) => {
    const span = e.target;
    if (span) {
        var info = span.dataset.goto;
        info = info.split(" ");
        var woied, name="";
        woeid = info[0];
        for (var i = 1; i < info.length; i++) {
            name = name +" "+ info[i];
        }
        extractWoeid(woeid,name);
    }
});

