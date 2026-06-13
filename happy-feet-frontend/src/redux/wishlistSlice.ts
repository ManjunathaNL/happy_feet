import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface WishlistItem {
  _id: string;
  name: string;
  mrp: number;
  sellingPrice: number;
  images: string[];
  shortDescription?: string;
  gstPercentage?: number;
}

interface WishlistState {
  items: WishlistItem[];
}

const initialState: WishlistState = {
  items: [],
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    setWishlistItems: (state, action: PayloadAction<WishlistItem[]>) => {
      state.items = action.payload;
    },
    toggleWishlist: (state, action: PayloadAction<WishlistItem>) => {
      const idx = state.items.findIndex(i => i._id === action.payload._id);
      if (idx > -1) {
        state.items.splice(idx, 1);
      } else {
        state.items.push(action.payload);
      }
    }
  }
});

export const { setWishlistItems, toggleWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;