import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { addCityWeather } from './features/weather/weatherSlice';
import { addFavorite, removeFavorite } from './features/favorites/favoritesSlice';
import { setUnit } from './features/ui/uiSlice';
import { getWeatherByCity } from './api/weatherAPI';
import { useAutoRefresh } from './hooks/useAutoRefresh';
import ForecastChart from './components/ForecastChart';
import { toggleTheme } from './features/theme/themeSlice';
import { getCitySuggestions } from './api/geoAPI';
import { auth, signInWithGoogle, logoutUser } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';

import './styles.css';


function App() {
  const dispatch = useDispatch();

  // Redux state
  const cityData = useSelector((s) => s.weather.cities);
  const favorites = useSelector((s) => s.favorites.list);
  const unit = useSelector((s) => s.ui.unit);
  const theme = useSelector((s) => s.theme.mode);
  const [user, setUser] = useState(null);


  // Local state
  const [cityInput, setCityInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);

  // Apply theme
  document.body.className = theme;
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch weather
  const handleSearch = async () => {
    if (!cityInput.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await getWeatherByCity(cityInput, unit);
      dispatch(addCityWeather(data));
      setCityInput('');
      setShowSuggestions(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add / remove favorites
  const handleFavoriteToggle = (city) => {
    const isFav = favorites.find((f) => f.name === city.name);
    if (isFav) {
      dispatch(removeFavorite(city.name));
    } else {
      dispatch(addFavorite(city));
    }
  };

  // Reload favorite weather
  const handleFavoriteClick = async (fav) => {
    try {
      const data = await getWeatherByCity(fav.name, unit);
      dispatch(addCityWeather(data));
    } catch (err) {
      console.error(err);
    }
  };

  // Switch units
  const handleUnitChange = (u) => {
    if (u !== unit) dispatch(setUnit(u));
  };
  useAutoRefresh(() => {
  if (favorites.length > 0) {
    favorites.forEach(async (fav) => {
      try {
        const data = await getWeatherByCity(fav.name, unit);
        dispatch(addFavorite(data)); // update favorite with fresh data
      } catch (err) {
        console.error('Fav auto-refresh error:', err.message);
      }
    });
  }
}, 60000);


  // Auto-refresh every 60s
  useAutoRefresh(() => {
    if (cityData.length > 0) {
      const city = cityData[0];
      getWeatherByCity(city.name, unit)
        .then((data) => dispatch(addCityWeather(data)))
        .catch((err) => console.error('Auto-refresh error:', err.message));
    }
  }, 60000);

  return (
    <div className="container">
      <h1>🌤️ Weather Analytics Dashboard</h1>
      {/* Authentication Section */}
<div style={{ marginBottom: '15px' }}>
  {user ? (
    <div>
      <img
        src={user.photoURL}
        alt="User"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          marginRight: '10px',
          verticalAlign: 'middle'
        }}
      />
      <span style={{ marginRight: '10px' }}>Welcome, {user.displayName}</span>
      <button
        onClick={logoutUser}
        style={{
          backgroundColor: '#f44336',
          color: 'white',
          border: 'none',
          padding: '6px 12px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
    </div>
  ) : (
    <button
      onClick={signInWithGoogle}
      style={{
        backgroundColor: '#4285F4',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Sign in with Google
    </button>
  )}
</div>


      {/* Theme toggle */}
      <div style={{ marginBottom: '15px' }}>
        <button
          onClick={() => dispatch(toggleTheme())}
          style={{
            backgroundColor: theme === 'light' ? '#222' : '#ddd',
            color: theme === 'light' ? '#fff' : '#000',
            border: 'none',
            padding: '12px 40px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
      </div>

      {/* Unit toggle */}
      <div style={{ marginBottom: '15px' }}>
        <button
          onClick={() => handleUnitChange('metric')}
          disabled={unit === 'metric'}
          style={{
            backgroundColor: unit === 'metric' ? '#4caf50' : '#ddd',
            color: unit === 'metric' ? '#fff' : '#000',
            marginRight: '8px',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px'
          }}
        >
          °C
        </button>
        <button
          onClick={() => handleUnitChange('imperial')}
          disabled={unit === 'imperial'}
          style={{
            backgroundColor: unit === 'imperial' ? '#4caf50' : '#ddd',
            color: unit === 'imperial' ? '#fff' : '#000',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px'
          }}
        >
          °F
        </button>
      </div>

      {/* Search bar + autocomplete */}
      <div
        style={{
          position: 'relative',
          marginBottom: '25px',
          display: 'inline-block'
        }}
      >
        <input
          type="text"
          placeholder="Enter city name..."
          value={cityInput}
          onChange={async (e) => {
            const value = e.target.value;
            setCityInput(value);
            if (value.length > 2) {
              try {
                const results = await getCitySuggestions(value);
                setSuggestions(results);
                setShowSuggestions(true);
              } catch (err) {
                console.error(err);
              }
            } else {
              setShowSuggestions(false);
            }
          }}
          style={{
            padding: '10px',
            width: '240px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            marginRight: '10px'
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: '10px 16px',
            border: 'none',
            backgroundColor: '#2196f3',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Search
        </button>

        {/* Autocomplete dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '45px',
              left: 0,
              width: '240px',
              backgroundColor: theme === 'dark' ? '#222' : '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              zIndex: 1000,
              color: theme === 'dark' ? '#fff' : '#000'
            }}
          >
            {suggestions.map((s, i) => (
              <div
                key={i}
                style={{
                  padding: '8px 10px',
                  cursor: 'pointer',
                  borderBottom:
                    i !== suggestions.length - 1 ? '1px solid #eee' : 'none'
                }}
                onClick={async () => {
                  setCityInput(`${s.name}, ${s.country}`);
                  setShowSuggestions(false);
                  try {
                    const data = await getWeatherByCity(s.name, unit);
                    dispatch(addCityWeather(data));
                  } catch (err) {
                    console.error(err);
                  }
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor =
                    theme === 'dark' ? '#333' : '#f0f0f0')
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor =
                    theme === 'dark' ? '#222' : '#fff')
                }
              >
                {s.name}, {s.country}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading/Error */}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Favorites */}
      {/* Favorites Section */}
<div style={{ marginBottom: '25px' }}>
  <h2>⭐ Pinned Favorites</h2>
  {favorites.length === 0 ? (
    <p>No favorites yet.</p>
  ) : (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '15px'
      }}
    >
      {favorites.map((fav, i) => (
        <div
          key={i}
          onClick={() => handleFavoriteClick(fav)}
          style={{
            backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
            color: theme === 'dark' ? '#fff' : '#000',
            padding: '12px',
            width: '200px',
            borderRadius: '10px',
            boxShadow:
              theme === 'dark'
                ? '0 2px 6px rgba(255,255,255,0.1)'
                : '0 2px 6px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <h4>{fav.name}</h4>
          {fav.temperature ? (
            <>
              <p>
                Temp: {fav.temperature}°
                {unit === 'metric' ? 'C' : 'F'}
              </p>
              <p>{fav.condition}</p>
            </>
          ) : (
            <p style={{ fontStyle: 'italic', fontSize: '13px' }}>
              Click to load weather
            </p>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation(); // prevent triggering card click
              dispatch(removeFavorite(fav.name));
            }}
            style={{
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  )}
</div>


      {/* Weather card */}
      {cityData.length > 0 && (
        <div className="city-card">
          <h3>{cityData[0].name}</h3>
          <p>
            Temperature: {cityData[0].temperature}°
            {unit === 'metric' ? 'C' : 'F'}
          </p>
          <p>Condition: {cityData[0].condition}</p>
          <p>Humidity: {cityData[0].humidity}%</p>
          <p>
            Wind: {cityData[0].windSpeed} {unit === 'metric' ? 'm/s' : 'mph'}
          </p>

          <button
            onClick={() => handleFavoriteToggle(cityData[0])}
            style={{
              backgroundColor: favorites.some(
                (f) => f.name === cityData[0].name
              )
                ? '#ff9800'
                : '#ddd',
              color: favorites.some((f) => f.name === cityData[0].name)
                ? 'white'
                : 'black',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            {favorites.some((f) => f.name === cityData[0].name)
              ? '★ Remove Favorite'
              : '☆ Add Favorite'}
          </button>

          <button
            onClick={() => setSelectedCity(cityData[0])}
            style={{
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            View Details
          </button>
        </div>
      )}

      {/* Forecast Modal */}
      {selectedCity && (
        <div
          style={{
            background: theme === 'dark' ? '#1e1e1e' : '#eee',
            padding: '20px',
            marginTop: '20px',
            borderRadius: '10px',
            width: '650px',
            margin: '20px auto',
            boxShadow: '0 0 10px rgba(0,0,0,0.2)',
            color: theme === 'dark' ? '#fff' : '#000'
          }}
        >
          <h2>{selectedCity.name} – 5-Day Forecast</h2>
          <ForecastChart data={selectedCity.forecast} />
          <button
            onClick={() => setSelectedCity(null)}
            style={{
              marginTop: '15px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
