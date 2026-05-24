const APIKey = "af5d8c8b5444462f96e110134261905";
const searchbtn = document.getElementById("searchbtn");
const input = document.getElementById("input");
let weather = document.getElementById("weatherInfo");
weather.style.display = "none";

async function getweather() {
          const city = document.getElementById("Input").value;

          if (!city) {
                    alert("Enter city name first");
                    return;
                    weather.style.display = "none";
          }

          const apiurl = `https://api.weatherapi.com/v1/current.json?key=${APIKey}&q=${city}&aqi=yes`;

          try {
                    const response = await fetch(apiurl);
                    weather.style.display = "block";

                    if (!response.ok) {
                              alert("Write with correct spelling!");
                              return;
                    }

                    let data = await response.json();
                    console.log(data);

                    document.getElementById("cityName").innerHTML =
                              data.location.name + ", " + data.location.country;

                    document.getElementById("temperature").innerHTML =
                              data.current.temp_c + "°C";

                    document.getElementById("condition").innerText =
                              data.current.condition.text;

                    document.getElementById("humidity").innerHTML =
                              data.current.humidity + "%";

                    document.getElementById("wind").innerHTML =
                              data.current.wind_kph + " km/h";

                    document.getElementById("weatherIcon").src =
                              "https:" + data.current.condition.icon;
                    document.getElementById("Fahrienheit").innerHTML = data.current.temp_f + "F";
                    document.getElementById("time").innerHTML = data.location.localtime;
                    document.getElementById("pressure").innerHTML = data.current.pressure_in;
                    document.getElementById("cloud").innerHTML = data.current.cloud;

          } catch (error) {
                    console.error("Here is some problem:", error);
                    alert("Check your network!");
          }
}



searchbtn.addEventListener("click", () => {
          getweather();
});