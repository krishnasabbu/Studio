import { createSlice } from '@reduxjs/toolkit';

interface ThemeState {
  isDarkMode: boolean;
}

// Load theme from localStorage or default to false
const getInitialTheme = (): boolean => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  }
  return false;
};
const initialState: ThemeState = {
  isDarkMode: getInitialTheme(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', state.isDarkMode ? 'dark' : 'light');
      }
    },
    setTheme: (state, action) => {
      state.isDarkMode = action.payload;
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', action.payload ? 'dark' : 'light');
      }
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;