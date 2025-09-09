// 1b4672577306549a5df466a7b16e5398


const date = document.getElementById('date');
const city = document.getElementById('city');
const temp = document.getElementById('temp');
const tempImg = document.getElementById('tempImg');
const description = document.getElementById('description');
const  tempMax = document.getElementById('tempMax');
const tempMin = document.getElementById('tempMin');
const suggestionsDiv = document.getElementById("suggestions");
const toggle = document.getElementById("toggleDark");
const body = document.body;

toggle.addEventListener('click', function() {
  this.classList.toggle('bi-moon'); 

  if (this.classList.contains('bi-moon')) {
    body.style.background = 'black';
    body.style.color = 'white';
    body.style.transition = '0.7s'
  } else {
    body.style.background = 'white';
    body.style.color = 'black';
  }
});


const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

let dateObj = new Date()
let month = months[dateObj.getUTCMonth()]
let day = dateObj.getUTCDate()
let year = dateObj.getUTCFullYear()

date.innerHTML = `${month} ${day}, ${year}`

const app = document.getElementById('app')


async function getCitySuggestions() {
    const query = document.getElementById("searchBarInput").value;

  if (query.length < 2) {
    suggestionsDiv.innerHTML = "";
    return;
  }

  try{
    const res = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=1b4672577306549a5df466a7b16e5398`)

    const cities = await res.json()
    if (cities.length === 0) {
      suggestionsDiv.innerHTML = "<p>No matches</p>";
      return;
    }

    suggestionsDiv.innerHTML = cities
  .map(
    (c) => `
      <div class="suggestion" 
           onclick="getWeather('${c.name}', ${c.lat}, ${c.lon}, '${c.country}')">
        ${c.name}, ${c.country}
      </div>`
  )
  .join("");

  }

  catch (err) {
    console.error("Error fetching city suggestions:", err);
  }

}


const getWeather = async (name, lat, lon, country) => {
    try{
        document.getElementById("searchBarInput").value = `${name ? name : ""}${country ? ", " + country : ""}`;
        suggestionsDiv.innerHTML = "";
        const weatherDataFetch = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=1b4672577306549a5df466a7b16e5398&units=metric`,{
            headers: {
                Accept: "application/json"
            }
        })

        


        const weatherData = await weatherDataFetch.json()
        console.log(weatherData)

        if (weatherData.cod !== 200) {
      city.innerHTML = "City not found!";
      description.innerHTML = "";
      tempImg.innerHTML = "";
      tempMax.innerHTML = "";
      tempMin.innerHTML = "";
      return; // stop here
    }

        city.innerHTML = weatherData.name;
    description.innerHTML = weatherData.weather[0].main;
    tempImg.innerHTML = `<img src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png" />`;
    temp.innerHTML = `${Math.round(weatherData.main.temp)}°C`
    tempMax.innerHTML = `${weatherData.main.temp_max}°C`;
    tempMin.innerHTML = `${weatherData.main.temp_min}°C`;
    }
    catch(error){
        console.log(error)
    }
    getForecast(name)
}

const getForecast = async (cityName) => {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=1b4672577306549a5df466a7b16e5398&units=metric`
  );
  const data = await response.json();

  const daily = data.list.filter((item, index) => index % 8 === 0).slice(0, 5);
  displayForecast(daily);
};

function displayForecast(daily) {
  const forecastDiv = document.getElementById("forecast");
  forecastDiv.innerHTML = daily
    .map(item => {
      const date = new Date(item.dt_txt);
      const options = { weekday: "short" };
      const dayName = date.toLocaleDateString("en-US", options);

      return `
        <div class="forecast-day">
          <p>${dayName}</p>
          <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" />
          <p>${Math.round(item.main.temp)}°C</p>
        </div>
      `;
    })
    .join("");
}




getWeather()



