import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.ts'; // Explicitly reference your sibling slice file

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// Export crucial types so TypeScript can validate state structures across the application
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;