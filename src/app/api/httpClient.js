import axios from "axios";

export const httpClient = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL || "http://localhost:3000",
  withCredentials: true,
});

function clearAuthAndRedirectToLogin() {
  // eslint-disable-next-line no-console
  console.log("[auth] clearing local auth and redirecting to /login");

  try {
    localStorage.removeItem("cuvva_user");
  } catch (_) {
    // ignore
  }

  window.location.assign("/login");
}

// Token refresh / retry on 401
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error || {};

    if (!response || response.status !== 401) {
      return Promise.reject(error);
    }

    // Prevent infinite retry loops
    if (config && config.__isRetryRequest) {
      clearAuthAndRedirectToLogin();
      return Promise.reject(error);
    }

    try {
      // Attempt refresh using httpOnly refreshToken cookie
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
