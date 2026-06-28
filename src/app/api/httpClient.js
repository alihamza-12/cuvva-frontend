import axios from "axios";

import { logOut } from "../../features/authSlice";
import { store } from "../store";

export const httpClient = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL || "http://localhost:3000",
  withCredentials: true,
});

function clearAuthAndRedirectToLogin() {
  try {
    store.dispatch(logOut());
  } catch (_) {
    // If store isn't available for some reason, fall back to localStorage cleanup
  }

  try {
    localStorage.removeItem("cuvva_user");
  } catch (_) {
    // ignore
  }

  // Hard redirect to ensure React router state is reset
  window.location.assign("/login");
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error || {};

    // Only handle Axios responses with 401
    if (!response || response.status !== 401) {
      return Promise.reject(error);
    }

    // Prevent infinite retry loops
    if (config && config.__isRetryRequest) {
      clearAuthAndRedirectToLogin();
      return Promise.reject(error);
    }

    try {
      // Attempt refresh using cookie-based refresh token
      const refreshResponse = await httpClient.post(
        "/api/auth/refresh-token",
        {},
        { withCredentials: true },
      );

      if (!refreshResponse || refreshResponse.status !== 200) {
        clearAuthAndRedirectToLogin();
        return Promise.reject(error);
      }

      // Retry original request once
      if (config) {
        config.__isRetryRequest = true;
        return httpClient(config);
      }

      clearAuthAndRedirectToLogin();
      return Promise.reject(error);
    } catch (refreshErr) {
      clearAuthAndRedirectToLogin();
      return Promise.reject(refreshErr);
    }
  },
);
