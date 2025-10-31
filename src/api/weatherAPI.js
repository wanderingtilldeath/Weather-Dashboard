
const API_KEY = 'fffc5836278dde8ca3d4e2914b51913f';

// 🧠 In-memory cache (resets when page reloads)
const cache = new Map();
const CACHE_DURATION = 60000; // 60 seconds

export async function getWeatherByCity(cityName, unit = 'metric') {
  const key = `${cityName}_${unit}`;

  // ✅ 1. Check cache first
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`🟢 Using cached data for ${cityName}`);
    return cached.data;
  }

  console.log(`🔄 Fetching new data for ${cityName}...`);

  // --- 2. Fetch current weather ---
  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=${unit}`;
  const currentRes = await fetch(currentUrl);
  if (!currentRes.ok) throw new Error('City not found or API error');
  const currentData = await currentRes.json();

  // --- 3. Fetch 5-day forecast (free API) ---
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=${unit}`;
  const forecastRes = await fetch(forecastUrl);
  if (!forecastRes.ok) throw new Error('Forecast unavailable');
  const forecastData = await forecastRes.json();

  // --- 4. Process data ---
  const dailyMap = {};
  forecastData.list.forEach((item) => {
    const date = new Date(item.dt * 1000).toLocaleDateString();
    if (!dailyMap[date]) dailyMap[date] = { temps: [], wind: [] };
    dailyMap[date].temps.push(item.main.temp);
    dailyMap[date].wind.push(item.wind.speed);
  });

  const dailyForecast = Object.entries(dailyMap).map(([date, obj]) => {
    const min = Math.min(...obj.temps);
    const max = Math.max(...obj.temps);
    const avgWind = obj.wind.reduce((a, b) => a + b, 0) / obj.wind.length;
    return { date, min: Math.round(min), max: Math.round(max), wind: Math.round(avgWind) };
  });

  const result = {
    name: currentData.name,
    temperature: Math.round(currentData.main.temp),
    condition: currentData.weather?.[0]?.main ?? 'N/A',
    humidity: currentData.main.humidity,
    windSpeed: currentData.wind.speed,
    forecast: dailyForecast.slice(0, 5)
  };

  // ✅ 5. Save to cache
  cache.set(key, { timestamp: Date.now(), data: result });

  return result;
}
