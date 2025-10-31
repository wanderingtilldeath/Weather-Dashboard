import { createSlice } from '@reduxjs/toolkit';

// Load from localStorage (if available)
const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: {
    list: storedFavorites
  },
  reducers: {
    addFavorite: (state, action) => {
      const exists = state.list.find(
        (city) => city.name.toLowerCase() === action.payload.name.toLowerCase()
      );
      if (!exists) {
        state.list.push(action.payload);
        localStorage.setItem('favorites', JSON.stringify(state.list));
      }
    },
    removeFavorite: (state, action) => {
      state.list = state.list.filter(
        (city) => city.name.toLowerCase() !== action.payload.toLowerCase()
      );
      localStorage.setItem('favorites', JSON.stringify(state.list));
    }
  }
});

export const { addFavorite, removeFavorite } = favoritesSlice.actions;
export default favoritesSlice.reducer;
