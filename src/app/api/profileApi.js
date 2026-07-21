import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// RTK Query API for customer profile
export const profileApi = createApi({
  reducerPath: "profileApi",
  tagTypes: ["Profile"],
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
      providesTags: ["Profile"],
    }),
    // Added for AccountDetailsPage.jsx's "Delete your account" row.
    // NOTE: there is currently no matching `DELETE /customers/me`
    // route in customers.js — per instruction, the frontend still
    // fires a real request (rather than a fake console.log) so it's
    // ready the moment that backend route is added. Until then this
    // will fail with a 404, which AccountDetailsPage.jsx surfaces to
    // the user instead of silently swallowing it.
    deleteMyAccount: builder.mutation({
      query: () => ({
        url: "/customers/me",
        method: "DELETE",
      }),
    }),
    // Self-service: Customer updates their own preferredName.
    // Invalidates the Profile cache so getMyProfile refetches
    // and AccountDetailsPage / ProfilePage show the new name.
    updatePreferredName: builder.mutation({
      query: (preferredName) => ({
        url: "/customers/me",
        method: "PATCH",
        body: { preferredName },
      }),
      invalidatesTags: ["Profile"],
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useDeleteMyAccountMutation,
  useUpdatePreferredNameMutation,
} = profileApi;
