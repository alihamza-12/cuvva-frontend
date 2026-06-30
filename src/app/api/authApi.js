import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env?.VITE_API_BASE_URL || "http://localhost:3000"}/api`,
    // 👇 CRITICAL: Enforces the browser to attach secure cookies automatically
    credentials: "include",

    prepareHeaders: (headers) => {
      // Note: You no longer need to pull tokens from Redux state to set Authorization headers!
      // The browser automatically slips your httpOnly cookies into the request headers.
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    logoutUser: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
    // ... your remaining dashboard endpoints stay exactly the same!
  }),
});

export const {
  useLoginMutation,
  useLogoutUserMutation,
  useGetSADashboardQuery,
  useGetSubAdminDashboardQuery,
} = authApi;
