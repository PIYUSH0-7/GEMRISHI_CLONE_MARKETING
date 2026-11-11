import { createSlice } from "@reduxjs/toolkit";

// Hardcoded guest/VIP user credentials for development & seamless browsing
export const HARDCODED_USER = {
  _id: "6a30d6a9ec4bf737459fc489",
  fullName: "GemRishi VIP Guest",
  email: "guest_6a30d6a9ec4bf737459fc489@temp.com",
  mobileNo: "9817975978",
  role: "user",
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMzBkNmE5ZWM0YmY3Mzc0NTlmYzQ4OSIsImlhdCI6MTc5MjgyNDIwNSwiZXhwIjoxODc5MjI0MjA1fQ.ihu7lDzAN46iMZVAl4d_c2ETKoo7D3Aua1s0UVeuU3c",
};

// Ensure localStorage always has valid user session while hardcoded mode is active
const getInitialUserInfo = () => {
  try {
    const raw = localStorage.getItem("userInfo");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.token || parsed?.user?.token) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Error reading stored user:", err);
  }

  // Fallback to hardcoded user
  const defaultAuthData = {
    user: HARDCODED_USER,
    token: HARDCODED_USER.token,
    expiry: Date.now() + 365 * 24 * 60 * 60 * 1000,
  };
  try {
    localStorage.setItem("userInfo", JSON.stringify(defaultAuthData));
    localStorage.setItem("token", HARDCODED_USER.token);
  } catch {}
  return defaultAuthData;
};

const initialState = {
  userInfo: getInitialUserInfo(),
  redirectPath: null,
  authModal: null, // "login", "signup", etc.
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const expiresIn = 365 * 24 * 60 * 60 * 1000;
      const expiryTime = Date.now() + expiresIn;
      const data = {
        user: action.payload?.user || action.payload || HARDCODED_USER,
        token: action.payload?.token || HARDCODED_USER.token,
        expiry: expiryTime,
      };
      state.userInfo = data;
      state.authModal = null;
      localStorage.setItem("userInfo", JSON.stringify(data));
      localStorage.setItem("token", data.token);
    },
    logout: (state) => {
      // In hardcoded mode, re-initialize back to the hardcoded VIP session
      const fallbackData = {
        user: HARDCODED_USER,
        token: HARDCODED_USER.token,
        expiry: Date.now() + 365 * 24 * 60 * 60 * 1000,
      };
      state.userInfo = fallbackData;
      localStorage.setItem("userInfo", JSON.stringify(fallbackData));
      localStorage.setItem("token", HARDCODED_USER.token);
    },
    setRedirectPath: (state, action) => {
      state.redirectPath = action.payload;
    },
    clearRedirectPath: (state) => {
      state.redirectPath = null;
    },
    openLoginModal: (state, action) => {
      // Hardcoded login mode: suppress login modal
      state.authModal = null;
      if (action.payload) {
        state.redirectPath = action.payload;
      }
    },
    openSignupModal: (state) => {
      // Hardcoded signup mode: suppress signup modal
      state.authModal = null;
    },
    closeAuthModal: (state) => {
      state.authModal = null;
    },
  },
});

export const {
  setCredentials,
  logout,
  setRedirectPath,
  clearRedirectPath,
  openLoginModal,
  openSignupModal,
  closeAuthModal,
} = authSlice.actions;
export default authSlice.reducer;
