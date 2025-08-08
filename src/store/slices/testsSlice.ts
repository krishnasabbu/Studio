import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TestResult {
  id: string;
  messageType: string;
  messageName: string;
  run: boolean;
  runType: 'Functional' | 'UAT';
  status: 'Passed' | 'Failed' | 'InProgress';
  reportUrl?: string;
  initiatedBy: string;
  lastRunDate: string;
}

interface TestsState {
  tests: TestResult[];
  loading: boolean;
  error: string | null;
}

const initialState: TestsState = {
  tests: [],
  loading: false,
  error: null,
};

const testsSlice = createSlice({
  name: 'tests',
  initialState,
  reducers: {
    setTests: (state, action: PayloadAction<TestResult[]>) => {
      state.tests = action.payload;
    },
    addTest: (state, action: PayloadAction<TestResult>) => {
      state.tests.push(action.payload);
    },
    updateTest: (state, action: PayloadAction<TestResult>) => {
      const index = state.tests.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.tests[index] = action.payload;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setTests, addTest, updateTest, setLoading, setError } = testsSlice.actions;
export default testsSlice.reducer;