// store/slices/uiSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  pageTitle: string;
  pageTagline: string; // Add the new field
}

const initialState: UiState = {
  pageTitle: 'Dashboard', // Set a default title
  pageTagline: 'Welcome to your dashboard', // Set a default tagline
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // A single action to update both title and tagline
    setPageInfo: (state, action: PayloadAction<{ title: string; tagline: string }>) => {
      state.pageTitle = action.payload.title;
      state.pageTagline = action.payload.tagline;
    },
    // Optional: a reducer to only update the title if needed
    setPageTitle: (state, action: PayloadAction<string>) => {
      state.pageTitle = action.payload;
    },
  },
});

// We can export both actions if needed, but setPageInfo is more comprehensive
export const { setPageInfo, setPageTitle } = uiSlice.actions;
export default uiSlice.reducer;