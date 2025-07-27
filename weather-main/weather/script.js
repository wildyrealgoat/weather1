const form = document.getElementById('searchForm');
const cityInput = document.getElementById('city');
const forecastDiv = document.getElementById('forecast');
const selectedCity = document.getElementById('selectedCity');
const bgVideo = document.getElementById('bgVideo');

const API_KEY = 'c005619008994ba2b1f134411250706'; 

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        fetchWeather(city);
    }
});

window.addEventListener('load', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => {
                const coords = `${pos.coords.latitude},${pos.coords.longitude}`;
                fetchWeather(coords);
            },
            () => {
                forecastDiv.innerHTML = 'Не вдалося визначити геолокацію. Введіть місто вручну.';
            }
        );
    }
});

function fetchWeather(query) {
    forecastDiv.innerHTML = 'Завантаження...';
    fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(query)}&days=7&lang=uk&aqi=yes`)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                forecastDiv.innerHTML = `Помилка: ${data.error.message}`;
                selectedCity.textContent = '---';
                return;
            }

            selectedCity.textContent = data.location.name;
            renderWeather(data);
        })
        .catch(() => {
            forecastDiv.innerHTML = 'Помилка при отриманні даних.';
            selectedCity.textContent = '---';
        });
}

function renderWeather(data) {
    const c = data.current;
    const forecast = data.forecast.forecastday;
    const aqi = c.air_quality;

    const currentHtml = `
    <div class="current-weather">
        <div class="current-main">
            <img class="weather-icon" src="https:${c.condition.icon}" alt="${c.condition.text}">
            <div>
                <div class="current-temp">${c.temp_c}°C</div>
                <div>${c.condition.text}</div>
                <div>Відчувається як: ${c.feelslike_c}°C</div>
            </div>
        </div>
        <div class="current-details">
            <p><strong>Вологість:</strong> ${c.humidity}%</p>
            <p><strong>Вітер:</strong> ${c.wind_kph} км/год, ${c.wind_dir}</p>
            <p><strong>Тиск:</strong> ${c.pressure_mb} мбар</p>
            <p><strong>Видимість:</strong> ${c.vis_km} км</p>
        </div>
    </div>`;

    const forecastHtml = `
    <h3>Прогноз на 3 дні</h3>
    <table>
        <thead><tr><th>День</th><th>Температура</th><th>Стан</th></tr></thead>
        <tbody>
            ${forecast.map(day => {
                const dayName = new Date(day.date).toLocaleDateString('uk-UA', { weekday: 'long' });
                return `<tr>
                    <td>${dayName}</td>
                    <td>${day.day.avgtemp_c}°C</td>
                    <td><img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}" width="32"> ${day.day.condition.text}</td>
                </tr>`;
            }).join('')}
        </tbody>
    </table>`;

    const aqiHtml = `
    <div class="aqi">
        <h3>Якість повітря (AQI)</h3>
        <p>PM2.5: ${aqi.pm2_5.toFixed(1)}</p>
        <p>PM10: ${aqi.pm10.toFixed(1)}</p>
        <p>Озон (O₃): ${aqi.o3.toFixed(1)}</p>
        <p>Діоксид азоту (NO₂): ${aqi.no2.toFixed(1)}</p>
    </div>`;

    forecastDiv.innerHTML = currentHtml + forecastHtml + aqiHtml;


    updateBackgroundVideo(c.condition.text);
}

function updateBackgroundVideo(conditionText) {
    const text = conditionText.toLowerCase();
    let file = 'sun.mp4'; 

    if (text.includes('дощ') || text.includes('rain')) file = 'rain.mp4';
    else if (text.includes('гроза') || text.includes('thunder')) file = 'storm.mp4';
    else if (text.includes('сніг') || text.includes('snow')) file = 'snow.mp4';
    else if (text.includes('хмар') || text.includes('cloud')) file = 'cloud.mp4';
    else if (text.includes('сонячно') || text.includes('ясно') || text.includes('sun')) file = 'sun.mp4';


    const currentFile = bgVideo.getAttribute('src');
    if (!currentFile || !currentFile.includes(file)) {
        bgVideo.setAttribute('src', file);
        bgVideo.load();
        bgVideo.play();
    }
}
