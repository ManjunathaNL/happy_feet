import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface RouteAccess {
  path: string;
  name: string;
  permissions: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
}

export interface AuthUser {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  pointsWallet: number;
  profilePic?: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  routes: RouteAccess[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalType: "login" | "register";
  currentTheme: { bg: string; text: string };
}

const initialState: AuthState = {
  token: localStorage.getItem("hf_token"),
  user: JSON.parse(localStorage.getItem("hf_user") || "null"),
  routes: JSON.parse(localStorage.getItem("hf_routes") || "[]"),
  isAuthenticated: !!localStorage.getItem("hf_token"),
  isLoading: false,
  isAuthModalOpen: false,
  authModalType: "login",
  currentTheme: JSON.parse(
    localStorage.getItem("hf_theme") || '{"bg": "#7f1d1d", "text": "#ffffff"}',
  ),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthStart: (state) => {
      state.isLoading = true;
    },
    setAuthSuccess: (
      state,
      action: PayloadAction<{
        token: string;
        user: AuthUser;
        routes: RouteAccess[];
      }>,
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.routes = action.payload.routes;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.isAuthModalOpen = false;

      localStorage.setItem("hf_token", action.payload.token);
      localStorage.setItem("hf_user", JSON.stringify(action.payload.user));
      localStorage.setItem("hf_routes", JSON.stringify(action.payload.routes));
    },
    setAuthFailure: (state) => {
      state.isLoading = false;
    },
    openAuthModal: (state, action: PayloadAction<"login" | "register">) => {
      state.isAuthModalOpen = true;
      state.authModalType = action.payload;
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false;
    },
    updateThemeStyles: (
      state,
      action: PayloadAction<{ bg: string; text: string }>,
    ) => {
      state.currentTheme = action.payload;
      localStorage.setItem("hf_theme", JSON.stringify(action.payload));
      document.documentElement.style.setProperty(
        "--dynamic-accent-bg",
        action.payload.bg,
      );
      document.documentElement.style.setProperty(
        "--dynamic-accent-text",
        action.payload.text,
      );
    },
    // Inside your authSlice slice definition reducers, map this mutation:
    updateWalletPoints: (state, action: PayloadAction<{ points: number }>) => {
      if (state.user) {
        state.user.pointsWallet = action.payload.points;
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.routes = [];
      state.isAuthenticated = false;
      state.isLoading = false;
      state.isAuthModalOpen = false;
      localStorage.clear();
      document.documentElement.style.setProperty(
        "--dynamic-accent-bg",
        "#7f1d1d",
      );
      document.documentElement.style.setProperty(
        "--dynamic-accent-text",
        "#ffffff",
      );
    },
  },
});

export const {
  setAuthStart,
  setAuthSuccess,
  setAuthFailure,
  openAuthModal,
  closeAuthModal,
  updateThemeStyles,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
