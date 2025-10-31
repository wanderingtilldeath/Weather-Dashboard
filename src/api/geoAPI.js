const API_KEY = 'fffc5836278dde8ca3d4e2914b51913f'; // same key you use for weather


export async function getCitySuggestions(query) {
  if (!query) return [];
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
    query
  )}&limit=5&appid=${API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Error fetching city suggestions');
  const data = await res.json();

  // Simplify to an array of { name, country }
  return data.map((item) => ({
    name: item.name,
    country: item.country
  }));
}