import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  id: string; // Dynamic identifier key compiled via format: `${productId}-${variantId}`
  productId: string;
  variantId: string | null;
  name: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  image: string;
  gstPercentage: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  gstTotal: number;
}

const initialState: CartState = {
  items: [],
  total: 0,
  gstTotal: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const target = state.items.find(i => i.id === action.payload.id);
      if (target) {
        target.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(i => i.id !== action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const target = state.items.find(i => i.id === action.payload.id);
      if (target && action.payload.quantity > 0) {
        target.quantity = action.payload.quantity;
      }
    },
    calculateTotals: (state) => {
      let aggregatedGross = 0;
      let aggregatedTax = 0;

      state.items.forEach(item => {
        const itemAggregateCost = item.discountedPrice * item.quantity;
        const taxComponent = itemAggregateCost - (itemAggregateCost / (1 + (item.gstPercentage || 18) / 100));
        aggregatedGross += itemAggregateCost;
        aggregatedTax += taxComponent;
      });

      state.total = aggregatedGross;
      state.gstTotal = aggregatedTax;
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.gstTotal = 0;
    }
  }
});

export const { setCartItems, addToCart, removeFromCart, updateQuantity, calculateTotals, clearCart } = cartSlice.actions;
export default cartSlice.reducer;