import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// RTK Query API for customer profile
export const profileApi = createApi({
  reducerPath: "profileApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env?.VITE_API_BASE_URL || "http://localhost:3000"}/api`,
    credentials: "include",
    prepareHeaders: (headers) => headers,
  }),
  endpoints: (builder) => ({
    getMyProfile: builder.query({
      query: () => ({
        url: "/customers/me",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetMyProfileQuery } = profileApi;
