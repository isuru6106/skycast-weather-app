
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const statusText = document.getElementById("status");

const cityName = document.getElementById("cityName");
const conditionText = document.getElementById("condition");
const temperatureText = document.getElementById("temperature");
const windSpeedText = document.getElementById("windSpeed");

const forecastBody = document.getElementById("forecastBody");

// Convert weather codes into descriptions.
function getWeatherDescription(code) {
    if (code === 0) return "Clear sky";
    if (code === 1) return "Mainly clear";
    if (code === 2) return "Partly cloudy";
    if (code === 3) return "Overcast";
    if (code === 45 || code === 48) return "Fog";
    if (code >= 51 && code <= 57) return "Drizzle";
    if (code >= 61 && code <= 67) return "Rain";
    if (code >= 71 && code <= 77) return "Snow";
    if (code >= 80 && code <= 82) return "Rain showers";
    if (code === 85 || code === 86) return "Snow showers";
    if (code >= 95 && code <= 99) return "Thunderstorm";

    return "Unknown conditions";
}

// Fetch and display weather data.
async function searchWeather() {
    const city = cityInput.value.trim();

    if (city === "") {
        statusText.textContent = "Please enter a city name.";
        return;
    }

    searchBtn.disabled = true;
    statusText.textContent = "Loading weather...";
    forecastBody.innerHTML = "";

    try {
        // TASK 2: Find the city's coordinates.
        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoURL);

        if (!geoResponse.ok) {
            throw new Error("Could not search for this city.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Please try another city.");
        }

        const location = geoData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;

        console.log("City:", location.name);
        console.log("Latitude:", latitude);
        console.log("Longitude:", longitude);

        // TASK 3: Fetch current weather and five-day forecast.
        const forecastURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&forecast_days=5&timezone=auto`;

        const weatherResponse = await fetch(forecastURL);

        if (!weatherResponse.ok) {
            throw new Error("Could not retrieve weather data.");
        }

        const weatherData = await weatherResponse.json();

        if (!weatherData.current_weather || !weatherData.daily) {
            throw new Error("Weather data is unavailable.");
        }

        // Display current weather.
        const current = weatherData.current_weather;

        cityName.textContent = location.country
            ? `${location.name}, ${location.country}`
            : location.name;

        conditionText.textContent =
            getWeatherDescription(current.weathercode);

        temperatureText.textContent =
            `${current.temperature} °C`;

        windSpeedText.textContent =
            `${current.windspeed} km/h`;

        // TASK 4: Populate the forecast table.
        const daily = weatherData.daily;

        forecastBody.innerHTML = "";

        for (let i = 0; i < daily.time.length; i++) {
            const row = document.createElement("tr");

            const dateCell = document.createElement("td");
            const conditionCell = document.createElement("td");
            const maxCell = document.createElement("td");
            const minCell = document.createElement("td");
            const precipitationCell = document.createElement("td");

            dateCell.textContent = daily.time[i];

            conditionCell.textContent =
                getWeatherDescription(daily.weathercode[i]);

            maxCell.textContent =
                `${daily.temperature_2m_max[i]} °C`;

            minCell.textContent =
                `${daily.temperature_2m_min[i]} °C`;

            precipitationCell.textContent =
                `${daily.precipitation_sum[i]} mm`;

            // Highlight days with expected precipitation.
            if (daily.precipitation_sum[i] > 0) {
                row.classList.add("rainy");
            }

            row.append(
                dateCell,
                conditionCell,
                maxCell,
                minCell,
                precipitationCell
            );

            forecastBody.appendChild(row);
        }

        statusText.textContent =
            `Weather updated for ${location.name}.`;

    } catch (error) {
        console.error("Weather error:", error);
        statusText.textContent = error.message;

    } finally {
        searchBtn.disabled = false;
    }
}

// Run the search when the button is clicked.
searchBtn.addEventListener("click", searchWeather);

// Allow searching by pressing Enter.
cityInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        searchWeather();
    }
});
