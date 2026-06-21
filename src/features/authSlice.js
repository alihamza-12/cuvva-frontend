import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    // Corrected to JSON.parse to safely read your saved sub-admin/super-admin profiles
    user: localStorage.getItem("cuvva_user")
      ? JSON.parse(localStorage.getItem("cuvva_user"))
      : null,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user } = action.payload;
      state.user = user;
      localStorage.setItem("cuvva_user", JSON.stringify(user));
    },
    logOut: (state) => {
      state.user = null;
      localStorage.removeItem("cuvva_user");
    },
  },
});

export const { setCredentials, logOut } = authSlice.actions;
export default authSlice.reducer;

// 👇 THE MISSING LINK: Export the selector for your ProtectedRoutes and RoleRedirect components
export const selectCurrentUser = (state) => state.auth.user;
