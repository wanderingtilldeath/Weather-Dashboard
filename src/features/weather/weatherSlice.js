import { createSlice } from '@reduxjs/toolkit';

const weatherSlice = createSlice({
  name: 'weather',
  initialState: {
  cities: []
},
reducers: {
  addCityWeather: (state, action) => {
    // Replace any existing data with just this one city
    state.cities = [action.payload];
  }
}

});

export const { addCityWeather } = weatherSlice.actions;
export default weatherSlice.reducer;
