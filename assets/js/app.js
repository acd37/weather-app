// variables
const APIKey = "a5f27cf2b3d42e9d2e924955814b0f57";
let initialLoad = true;

// functions
const fetchCityHistory = () => {
    let cities;

    $("#cities").empty();

    if (localStorage.cities) {
        cities = JSON.parse(localStorage.getItem('cities'));

        if (initialLoad) {
            getWeather(cities[0]);
        }

    } else {
        cities = [];
    }

    for (let i = 0; i < 5; i++) {

        const newCity = $("<div>").text(`${i + 1}. ${cities[i]}`).addClass("city-history-item");
        if (cities[i] !== undefined) {
            $("#cities").append(newCity);
        }

    }
}


const calculateFahrenheit = (kelvin) => {
    const fahrenheit = (((kelvin - 273.15) * 1.8) + 32).toFixed()
    return `${fahrenheit} °F`;
}


const saveCity = (city) => {
    let cities;

    if (localStorage.cities) {
        cities = JSON.parse(localStorage.getItem('cities'));
    } else {
        cities = [];
    }

    if (!cities.includes(city)) {
        cities.unshift(city);
    }


    localStorage.setItem('cities', JSON.stringify(cities));
    fetchCityHistory();

}

const getWeather = (city) => {
    // set initialLoad to false
    initialLoad = false;

    // clear input
    $("#weather").empty();

    // ajax call
    const queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKey}`;

    $.ajax({
        method: 'GET',
        url: queryURL,
        dataType: 'json'
    })
        .then(response => {
            // add city to history
            saveCity(response.name);

            // get 5 day forecast
            getFiveDayForecast(response.name);

            // handle response
            const newDiv = $('<div>').addClass("weather-box");
            const city = $('<h5>').text(response.name).addClass("weather-box-title");

            const weatherIconSpan = $('<span>');
            const weatherIconSrc = response.weather[0].icon;
            const weatherIcon = $("<img>").attr("src", `https://openweathermap.org/img/wn/${weatherIconSrc}@2x.png`)
            weatherIconSpan.append(weatherIcon);
            city.append(weatherIconSpan);

            const temp = $('<div>').text(`Temperature: ${calculateFahrenheit(response.main.temp)}`).addClass("weather-box-text");
            const humidity = $('<div>').text(`Humidity: ${response.main.humidity}%`).addClass("weather-box-text");
            const wind = $('<div>').text(`Wind: ${response.wind.speed} MPH`).addClass("weather-box-text");

            newDiv.append(city, temp, humidity, wind)

            // add response to page
            $("#weather").append(newDiv)
            $("#city-input").val("");


            // get new city history
            fetchCityHistory();

        }).catch(err => {
            if (err.responseJSON.cod === "404") {

                const newDiv = $("<div>").text("Location could not be found. Please try again.").addClass('alert alert-danger my-4').attr('role', 'alert');
                $("#error").html(newDiv)

                if (localStorage.cities) {
                    const cities = JSON.parse(localStorage.getItem('cities'));
                    getWeather(cities[0]);
                }
            }
        })
}

const getFiveDayForecast = (city) => {

    $("#five-day-forecast").empty();

    // ajax call
    const queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${APIKey}`;
    $.ajax({
        method: 'GET',
        url: queryURL,
        dataType: 'json'
    })
        .then(response => {
            const res = response.list

            for (let i = 0; i < res.length; i++) {
                if (res[i].dt_txt.indexOf("15:00:00") !== -1) {

                    const newCard = $("<div>").addClass("forecast-box-tile");

                    const date = $("<div>").text(moment.unix(res[i].dt).format("MM/DD/YYYY")).addClass("forecast-date");

                    const temp = $("<div>").text(`Temperature: ${calculateFahrenheit(res[i].main.temp)}`);
                    const humidity = $("<div>").text(`Humidity: ${res[i].main.humidity}%`);
                    const weatherIconDiv = $('<div>').addClass("forecast-icon");
                    const weatherIconSrc = res[i].weather[0].icon;
                    const weatherIcon = $("<img>").attr("src", `https://openweathermap.org/img/wn/${weatherIconSrc}@2x.png`)
                    weatherIconDiv.append(weatherIcon);
                    newCard.append(weatherIconDiv, date, temp, humidity);
                    $("#five-day-forecast").append(newCard);
                }
            }
        }).catch(err => {
            return err;
        })
}

//logic
$(document).ready(() => {

    // typedjs
    var options = {
        strings: ['Search your city.', 'Get weather.', 'Find your clouds.', 'Or your sun.'],
        typeSpeed: 100,
        backSpeed: 30,
        loop: true
    };

    var typed = new Typed('#typed', options);

    // get search history
    fetchCityHistory();

    // execute user search
    $('#city-search').on('click', (e) => {
        e.preventDefault();

        const cityInput = $('#city-input').val();

        // validate field is not empty
        if (cityInput !== "") {
            getWeather(cityInput)
        }

    })

})