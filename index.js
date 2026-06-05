const APIKey = "af5d8c8b5444462f96e110134261905";
const searchbtn = document.getElementById("searchbtn");
const input = document.getElementById("Input");
const weatherDiv = document.getElementById("weatherInfo");
const suggestBox = document.getElementById("suggestion");
const skeletonLoader = document.getElementById("skeletonLoader");
const langSelect = document.getElementById("langSelect");

const translations = {
  en: {
    placeholder: "Search city...",
    searchBtn: "Search",
    humidity: "Humidity",
    wind: "Wind",
    tempF: "Temperature in F",
    time: "Current time / date",
    pressure: "Pressure",
    cloud: "Cloud",
    geoError: "Location access denied or unavailable.",
    geoUnsupported: "Geolocation is not supported by your browser.",
    "Sunny": "Sunny",
    "Clear": "Clear",
    "Partly cloudy": "Partly cloudy",
    "Cloudy": "Cloudy",
    "Overcast": "Overcast",
    "Mist": "Mist",
    "Haze": "Haze",
    "Patchy rain possible": "Patchy rain possible",
    "Light rain": "Light rain",
    "Moderate rain": "Moderate rain",
    "Heavy rain": "Heavy rain"
  },
  ur: {
    placeholder: "شہر کا نام تلاش کریں...",
    searchBtn: "تلاش کریں",
    humidity: "نمی",
    wind: "ہوا کی سرعت",
    tempF: "فارن ہائیٹ میں درجہ حرارت",
    time: "موجودہ وقت / تاریخ",
    pressure: "ہوا کا دباؤ",
    cloud: "بادل",
    geoError: "لوکیشن کی اجازت نہیں ملی یا دستیاب نہیں ہے۔",
    geoUnsupported: "آپ کا براؤزر خودکار لوکیشن کو سپورٹ نہیں کرتا۔",
    "Sunny": "دھوپ",
    "Clear": "صاف آسمان",
    "Partly cloudy": "جزوی طور پر ابر آلود",
    "Cloudy": "ابر آلود",
    "Overcast": "گہرا بادل",
    "Mist": "دھند",
    "Haze": "غبار / دھند",
    "Patchy rain possible": "بوند باندی کا امکان",
    "Light rain": "ہلکی بارش",
    "Moderate rain": "درمیانی بارش",
    "Heavy rain": "تیز بارش"
  }
};

if (weatherDiv) weatherDiv.style.display = "none";

window.addEventListener("DOMContentLoaded", () => {
  autoDetectLocation();
});

if (input) {
  input.addEventListener("input", () => {
    const q = input.value.trim();
    if (q.length < 2) {
      hideSuggestions();
      return;
    }
    fetchSuggestions(q);
  });

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      hideSuggestions();
      getWeather();
    }
  });
}

if (searchbtn) {
  searchbtn.addEventListener("click", () => getWeather());
}

document.addEventListener("click", e => {
  if (input && suggestBox) {
    if (!input.contains(e.target) && !suggestBox.contains(e.target)) {
      hideSuggestions();
    }
  }
});

if (langSelect) {
  langSelect.addEventListener("change", () => {
    const currentLang = langSelect.value;
    if (input) input.placeholder = translations[currentLang].placeholder;
    if (searchbtn) searchbtn.textContent = translations[currentLang].searchBtn;
    if (input && input.value.trim()) {
      getWeather();
    }
  });
}

function autoDetectLocation() {
  const currentLang = langSelect ? langSelect.value : "en";

  if (navigator.geolocation) {
    if (weatherDiv) weatherDiv.style.display = "none";
    if (skeletonLoader) skeletonLoader.style.display = "block";

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        getWeather(`${lat},${lon}`);
      },
      (error) => {
        console.error("Geolocation error details:", error);
        alert(translations[currentLang].geoError + " Please search manually.");
        if (skeletonLoader) skeletonLoader.style.display = "none";
        if (weatherDiv) weatherDiv.style.display = "block";
      },
      { enableHighAccuracy: true, timeout: 10000 } 
    );
  } else {
    alert(translations[currentLang].geoUnsupported);
  }
}

async function fetchSuggestions(q) {
  try {
    const res = await fetch(
      `https://api.weatherapi.com/v1/search.json?key=${APIKey}&q=${encodeURIComponent(q)}`
    );
    const list = await res.json();
    renderSuggestions(list);
  } catch (error) {
    console.error("Suggestion fetch error:", error);
    hideSuggestions();
  }
}

function renderSuggestions(list) {
  if (!suggestBox) return;
  suggestBox.innerHTML = "";
  if (!list || list.length === 0) {
    hideSuggestions();
    return;
  }

  list.forEach(item => {
    const div = document.createElement("div");
    div.className = "suggestion-item";
    div.innerHTML = `
      <i class="fa-solid fa-location-dot text-warning"></i>
      <span class="city-name">${item.name}</span>
      <small class="region-name">${item.region ? item.region + ", " : ""}${item.country}</small>
    `;

    div.addEventListener("mousedown", (e) => {
      e.preventDefault();
      if (input) input.value = item.name;
      hideSuggestions();
      getWeather(item.name);
    });

    suggestBox.appendChild(div);
  });
  suggestBox.style.display = "block";
}

function hideSuggestions() {
  if (suggestBox) {
    suggestBox.innerHTML = "";
    suggestBox.style.display = "none";
  }
}

async function getWeather(cityOverride) {
  const city = cityOverride || (input ? input.value.trim() : "");

  if (!city) {
    alert("Please enter a city name.");
    if (skeletonLoader) skeletonLoader.style.display = "none";
    return;
  }

  const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${APIKey}&q=${encodeURIComponent(city)}&aqi=yes`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      alert("City not found. Please check the spelling.");
      if (skeletonLoader) skeletonLoader.style.display = "none";
      if (weatherDiv) weatherDiv.style.display = "block";
      return;
    }

    const data = await response.json();
    if (!data || !data.location || !data.current) {
      throw new Error("Incomplete API response structures");
    }

    const currentLang = langSelect ? langSelect.value : "en";
    const selectedLabels = translations[currentLang];

    // Safe DOM Element Extraction
    const elCity = document.getElementById("cityName");
    const elTemp = document.getElementById("temperature");
    const elHum = document.getElementById("humidity");
    const elWind = document.getElementById("wind");
    const elFah = document.getElementById("Fahrienheit");
    const elTime = document.getElementById("time");
    const elPres = document.getElementById("pressure");
    const elCloud = document.getElementById("cloud");
    const elIcon = document.getElementById("weatherIcon");
    const elCond = document.getElementById("condition");

    if (elCity) elCity.textContent = `${data.location.name}, ${data.location.country}`;
    if (elTemp) elTemp.textContent = `${data.current.temp_c}°C`;
    if (elHum) elHum.textContent = `${data.current.humidity}%`;
    if (elWind) elWind.textContent = `${data.current.wind_kph} km/h`;
    if (elFah) elFah.textContent = `${data.current.temp_f}°F`;
    if (elTime) elTime.textContent = data.location.localtime;
    if (elPres) elPres.textContent = `${data.current.pressure_in} in`;
    if (elCloud) elCloud.textContent = `${data.current.cloud}%`;
    if (elIcon) elIcon.src = "https:" + data.current.condition.icon;

    if (cityOverride && cityOverride.includes(",") && input) {
      input.value = data.location.name;
    }

    const apiCondition = data.current.condition.text;
    if (elCond) {
      if (selectedLabels && selectedLabels[apiCondition]) {
        elCond.textContent = selectedLabels[apiCondition];
      } else {
        elCond.textContent = apiCondition;
      }
    }

    if (input) input.placeholder = selectedLabels.placeholder;
    if (searchbtn) searchbtn.textContent = selectedLabels.searchBtn;

    if (document.getElementById("lblHumidity")) document.getElementById("lblHumidity").textContent = selectedLabels.humidity;
    if (document.getElementById("lblWind")) document.getElementById("lblWind").textContent = selectedLabels.wind;
    if (document.getElementById("lblTempF")) document.getElementById("lblTempF").textContent = selectedLabels.tempF;
    if (document.getElementById("lblTime")) document.getElementById("lblTime").textContent = selectedLabels.time;
    if (document.getElementById("lblPressure")) document.getElementById("lblPressure").textContent = selectedLabels.pressure;
    if (document.getElementById("lblCloud")) document.getElementById("lblCloud").textContent = selectedLabels.cloud;

    if (currentLang === "ur" && weatherDiv) {
      weatherDiv.style.direction = "rtl";
    } else if (weatherDiv) {
      weatherDiv.style.direction = "ltr";
    }

    if (skeletonLoader) skeletonLoader.style.display = "none";
    if (weatherDiv) weatherDiv.style.display = "block";

  } catch (error) {
    console.error("Fetch implementation failure:", error);
    if (skeletonLoader) skeletonLoader.style.display = "none";
    if (weatherDiv) weatherDiv.style.display = "block";
  }
}

function toggleTheme() {
  const body = document.getElementById("show");
  const btnIcon = document.getElementById("themeIcon");
  const btnText = document.getElementById("themeText");

  if (!body) return;
  body.classList.toggle("light-theme");

  if (body.classList.contains("light-theme")) {
    if (btnIcon) btnIcon.className = "fa-solid fa-moon";
    if (btnText) btnText.innerText = "Dark Mode";
  } else {
    if (btnIcon) btnIcon.className = "fa-solid fa-sun text-warning";
    if (btnText) btnText.innerText = "Light Mode";
  }
}