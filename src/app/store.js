import { configureStore } from '@reduxjs/toolkit';
import weatherReducer from '../features/weather/weatherSlice.js';
import favoritesReducer from '../features/favorites/favoritesSlice.js';
import uiReducer from '../features/ui/uiSlice.js';
import themeReducer from '../features/theme/themeSlice.js';

export const store = configureStore({
  reducer: {
    weather: weatherReducer,
    favorites: favoritesReducer,
    ui: uiReducer,
    theme: themeReducer
  }
});
