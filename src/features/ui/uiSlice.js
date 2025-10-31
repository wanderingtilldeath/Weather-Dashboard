import { createSlice } from '@reduxjs/toolkit';

const savedUnit = localStorage.getItem('unit') || 'metric'; // metric = °C, imperial = °F

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    unit: savedUnit
  },
  reducers: {
    setUnit: (state, action) => {
      state.unit = action.payload;
      localStorage.setItem('unit', action.payload);
    }
  }
});

export const { setUnit } = uiSlice.actions;
export default uiSlice.reducer;
