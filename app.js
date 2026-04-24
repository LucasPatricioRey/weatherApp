const apiKey = "6b1ba0b075c152090f76a0e66c0ee774";

const cityInput = document.getElementById("cityInput");
const countrySelect = document.getElementById("countrySelect");

const searchBtn = document.getElementById("searchBtn");

const weatherCard = document.getElementById("weatherCard");
const cityName = document.getElementById("cityName");

const temp = document.getElementById("temp");
const description = document.getElementById("description");

const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const pressure = document.getElementById("pressure");
const wind = document.getElementById("wind");

const errorText = document.getElementById("error");

// eventos
searchBtn.addEventListener("click", getWeather);

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") getWeather();
});

async function getWeather() {

  const city = cityInput.value.trim();
  const country = countrySelect.value;

  if (!city) {
    showError("Escribí una ciudad");
    return;
  }

  try {

    let response;
    let data;

    // 🔹 1. intento con ciudad + país
    if (country) {
      response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&units=metric&lang=es&appid=${apiKey}`
      );

      data = await response.json();

      // 🔹 fallback: solo ciudad si falla
      if (!response.ok) {
        response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=es&appid=${apiKey}`
        );

        data = await response.json();
      }

    } else {
      // sin país
      response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=es&appid=${apiKey}`
      );

      data = await response.json();
    }

    // 🔴 error final
    if (!response.ok) {
      showError(data.message || "No se encontró la ciudad");
      return;
    }

    // 🔴 VALIDACIÓN REAL DE PAÍS (CLAVE)
    if (country && data.sys.country !== country) {
      showError(`"${city}" no pertenece al país seleccionado`);
      weatherCard.classList.add("hidden");
      return;
    }

    // limpiar error
    errorText.classList.add("hidden");

    // mostrar datos
    cityName.textContent = `${data.name}, ${data.sys.country}`;

    temp.textContent = `🌡️ Temperatura: ${data.main.temp}°C`;
    description.textContent = `🌤️ ${data.weather[0].description}`;

    feelsLike.textContent = `🤔 Sensación térmica: ${data.main.feels_like}°C`;
    humidity.textContent = `💧 Humedad: ${data.main.humidity}%`;
    pressure.textContent = `🌪️ Presión: ${data.main.pressure} hPa`;
    wind.textContent = `💨 Viento: ${data.wind.speed} m/s`;

    weatherCard.classList.remove("hidden");

  } catch (error) {
    console.log(error);
    showError("Error al obtener datos");
  }
}

function showError(message) {
  errorText.textContent = message;
  errorText.classList.remove("hidden");
  weatherCard.classList.add("hidden");
}