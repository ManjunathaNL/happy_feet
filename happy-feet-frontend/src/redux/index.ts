import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice'; 
import cartReducer from './cartSlice';
import wishlistReducer from './wishlistSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
  },
});

// Export crucial type states cleanly for global application hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;