const APIKey = "af5d8c8b5444462f96e110134261905";
const searchbtn = document.getElementById("searchbtn");
const input = document.getElementById("Input");
const weatherDiv = document.getElementById("weatherInfo");
const suggestBox = document.getElementById("suggestion");

weatherDiv.style.display = "none";

let debounceTimer;
let selectedCity = "";

input.addEventListener("input", () => {
          selectedCity = "";
          clearTimeout(debounceTimer);
          const q = input.value.trim();
          if (q.length < 2) { hideSuggestions(); return; }
          debounceTimer = setTimeout(() => fetchSuggestions(q), 300);
});

async function fetchSuggestions(q) {
          try {
                    const res = await fetch(
                              `https://api.weatherapi.com/v1/search.json?key=${APIKey}&q=${encodeURIComponent(q)}`
                    );
                    const list = await res.json();
                    renderSuggestions(list);
          } catch {
                    hideSuggestions();
          }
}

function renderSuggestions(list) {
          suggestBox.innerHTML = "";
          if (!list || list.length === 0) { hideSuggestions(); return; }

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
                              selectedCity = item.name;
                              input.value = item.name;
                              hideSuggestions();
                              getWeather(item.name);
                    });

                    suggestBox.appendChild(div);
          });

          suggestBox.style.display = "block";
}

function hideSuggestions() {
          suggestBox.innerHTML = "";
          suggestBox.style.display = "none";
}

document.addEventListener("click", e => {
          if (!input.contains(e.target) && !suggestBox.contains(e.target)) {
                    hideSuggestions();
          }
});

input.addEventListener("keydown", e => {
          if (e.key === "Enter") {
                    hideSuggestions();
                    getWeather();
          }
});

async function getWeather(cityOverride) {
          const city = cityOverride || input.value.trim();

          if (!city) {
                    alert("Please enter a city name.");
                    return;
          }

          const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${APIKey}&q=${encodeURIComponent(city)}&aqi=yes`;

          try {
                    const response = await fetch(apiUrl);

                    if (!response.ok) {
                              alert("City not found. Please check the spelling.");
                              weatherDiv.style.display = "none";
                              return;
                    }

                    const data = await response.json();
                    weatherDiv.style.display = "block";

                    document.getElementById("cityName").textContent = `${data.location.name}, ${data.location.country}`;
                    document.getElementById("temperature").textContent = `${data.current.temp_c}°C`;
                    document.getElementById("condition").textContent = data.current.condition.text;
                    document.getElementById("humidity").textContent = `${data.current.humidity}%`;
                    document.getElementById("wind").textContent = `${data.current.wind_kph} km/h`;
                    document.getElementById("Fahrienheit").textContent = `${data.current.temp_f}°F`;
                    document.getElementById("time").textContent = data.location.localtime;
                    document.getElementById("pressure").textContent = `${data.current.pressure_in} in`;
                    document.getElementById("cloud").textContent = `${data.current.cloud}%`;
                    document.getElementById("weatherIcon").src = "https:" + data.current.condition.icon;

          } catch (error) {
                    console.error("Fetch error:", error);
                    alert("Network error. Please check your connection.");
          }
}

searchbtn.addEventListener("click", () => getWeather());
