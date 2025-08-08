import { configureStore } from '@reduxjs/toolkit';
import { api } from '../services/api';
import authSlice from './slices/authSlice';
import themeSlice from './slices/themeSlice';
import templatesSlice from './slices/templatesSlice';
import testsSlice from './slices/testsSlice';
import rbacSlice from './slices/rbacSlice';
import emailEditorSlice from './slices/emailEditorSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authSlice,
    theme: themeSlice,
    templates: templatesSlice,
    tests: testsSlice,
    rbac: rbacSlice,
    emailEditor: emailEditorSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;