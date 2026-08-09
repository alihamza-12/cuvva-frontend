import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {

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

export const selectCurrentUser = (state) => state.auth.user;
