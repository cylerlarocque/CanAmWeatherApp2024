// on page load...
$(document).ready(()=>{
    // when the GET FORCAST button is clicked, hide undesired divs and get zone list for state
    $("#get_forecast").click(()=>{
        $("#weather_today").hide();
        $("#forecast_div").hide();
        $("#zone_list").show();

        let data = {};
        data.area = $("#state_input").val().toUpperCase();
        CallAjax('https://api.weather.gov/zones/land', data, "GET", "json", GetZonesScc, Error, LogToConsole);
    });
});

// Zone list successfully retrieved...
function GetZonesScc(data, returnStatus){
    // Format the data into html elements
    str = '<h2>Select a zone to get forecast</h2>'
    $(data.features).each((index, data)=>{
        str += `<button type='button' class='zone_button' id='${data.properties.id}'>${data.properties.name}</button>`;
    });
    $("#zone_list").html(str);

    // when a zone is selected, get current temperature and forecast
    $(".zone_button").click(function(){
        $("#zone_list").hide();
        id = $(this).attr('id');

        $("#location").html($(this).html());

        CallAjax(`https://api.weather.gov/zones/land/${id}/forecast`, {}, "GET", "json", GetForecastScc, Error, LogToConsole);

        let data = {};
        data.limit = 1;
        CallAjax(`https://api.weather.gov/zones/forecast/${id}/observations`, data, "GET", "json", GetCurrentTempScc, Error, LogToConsole);
    });
}
// Forecast successfully retrieved...
function GetForecastScc(data, returnStatus){
    // Format the data into html elements
    table = '';
    $(data.properties.periods).each((index, data)=>{
        table += `<tr><td>${data.name}</td><td>${data.detailedForecast}</td></tr>`;
    });
    // Put into table
    $("#forecast_table").html(table);
    $("#forecast_div").show();
}
// Current temp successfully retrieved...
function GetCurrentTempScc(data, returnStatus){
    // Initialize variables
    tempDegC = 0;
    tempDegF = 0;
    humidity = 0;
    windSpeedKmh = 0;
    // Had to put in a try catch due to a known issue in the API where
    // it will sometimes return all null values
    try{
        // Package up the desired data
        tempDegC = Math.round(data.features[0].properties.temperature.value);
        tempDegF = Math.round(data.features[0].properties.temperature.value * 1.8 + 32);
        humidity = Math.round(data.features[0].properties.relativeHumidity.value);
        windSpeedKmh = data.features[0].properties.windSpeed.value.toFixed(2);
    }
    // null found in the data, display the error
    catch{
        alert("API bug encountered. Quote from weather.gov: 'The observations endpoints may show null values for weather properties (temperature, wind, precipitation, etc.) at some stations when the MADIS source has data.'");
    }
    
    // Display to html page
    $("#temp").html(`${tempDegC}°C/${tempDegF}°F`);
    $("#humidity").html(`${humidity}% Humidity`);
    $("#windspeed").html(`${windSpeedKmh} km/h Wind Speed`);

    $("#weather_today").show();
}
// Error in the ajax call
function Error(ajaxReq, ajaxStatus, errorThrown) {
    console.log(ajaxReq + " : " + ajaxStatus + " : " + errorThrown);
    alert("Error in API call, check inputs");
}
// A console log for every ajax call
function LogToConsole() {
    console.log("AJAX returned.");
}
function CallAjax(url, reqData, type, dataType, fxnSuccess, fxnError, fxnalways) {
    let ajaxOptions = {};

    ajaxOptions['url'] = url;
    ajaxOptions['data'] = reqData;
    ajaxOptions['type'] = type;
    ajaxOptions['dataType'] = dataType;

    let con = $.ajax(ajaxOptions);

    con.done(fxnSuccess);
    con.fail(fxnError);
    con.always(fxnalways);
}