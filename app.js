const API_KEY = "6b1ba0b075c152090f76a0e66c0ee774";
const API_BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

const cityInput = document.getElementById("cityInput");
const countrySelect = document.getElementById("countrySelect");
const searchBtn = document.getElementById("searchBtn");

const weatherCard = document.getElementById("weatherCard");
const cityName = document.getElementById("cityName");
const weatherIcon = document.getElementById("weatherIcon");

const temp = document.getElementById("temp");
const description = document.getElementById("description");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const pressure = document.getElementById("pressure");
const wind = document.getElementById("wind");

const errorText = document.getElementById("error");
const loadingText = document.getElementById("loading");

function buildUrl(city, country = "") {
  const query = country ? `${city},${country}` : city;
  const params = new URLSearchParams({
    q: query,
    units: "metric",
    lang: "es",
    appid: API_KEY
  });

  return `${API_BASE_URL}?${params.toString()}`;
}

function capitalizeText(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function setLoadingState(isLoading) {
  searchBtn.disabled = isLoading;
  searchBtn.textContent = isLoading ? "Buscando..." : "Buscar clima";
  loadingText.classList.toggle("hidden", !isLoading);
}

function showError(message) {
  errorText.textContent = message;
  errorText.classList.remove("hidden");
  weatherCard.classList.add("hidden");
}

function clearError() {
  errorText.textContent = "";
  errorText.classList.add("hidden");
}

function hideWeatherCard() {
  weatherCard.classList.add("hidden");
  weatherIcon.classList.add("hidden");
  weatherIcon.removeAttribute("src");
}

function renderWeather(data) {
  clearError();

  cityName.textContent = `${data.name}, ${data.sys.country}`;
  temp.textContent = `${Math.round(data.main.temp)}°C`;
  description.textContent = capitalizeText(data.weather[0].description);

  feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
  humidity.textContent = `${data.main.humidity}%`;
  pressure.textContent = `${data.main.pressure} hPa`;
  wind.textContent = `${data.wind.speed} m/s`;

  if (data.weather[0]?.icon) {
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    weatherIcon.classList.remove("hidden");
  } else {
    weatherIcon.classList.add("hidden");
  }

  weatherCard.classList.remove("hidden");
}

async function requestWeather(city, country = "") {
  const response = await fetch(buildUrl(city, country));
  const data = await response.json();

  return { response, data };
}

async function getWeather() {
  const city = cityInput.value.trim();
  const country = countrySelect.value;

  if (!city) {
    showError("Ingresa una ciudad para realizar la busqueda.");
    return;
  }

  setLoadingState(true);
  clearError();

  try {
    let result = await requestWeather(city, country);

    if (country && !result.response.ok) {
      result = await requestWeather(city);
    }

    if (!result.response.ok) {
      hideWeatherCard();
      showError(capitalizeText(result.data.message) || "No se encontro la ciudad.");
      return;
    }

    if (country && result.data.sys.country !== country) {
      hideWeatherCard();
      showError(`"${city}" no pertenece al pais seleccionado.`);
      return;
    }

    renderWeather(result.data);
  } catch (error) {
    console.error("Error al obtener datos del clima:", error);
    hideWeatherCard();
    showError("Ocurrio un error al consultar el clima. Intenta nuevamente.");
  } finally {
    setLoadingState(false);
  }
}

searchBtn.addEventListener("click", getWeather);

cityInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    getWeather();
  }
});
