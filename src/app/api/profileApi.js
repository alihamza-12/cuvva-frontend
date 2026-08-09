import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

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

    deleteMyAccount: builder.mutation({
      query: () => ({
        url: "/customers/me",
        method: "DELETE",
      }),
    }),

    updatePreferredName: builder.mutation({
      query: (preferredName) => ({
        url: "/customers/me",
        method: "PATCH",
        body: { preferredName },
      }),
      invalidatesTags: ["Profile"],
    }),

    addAdditionalEmail: builder.mutation({
      query: (additionalEmail) => ({
        url: "/customers/me",
        method: "PATCH",
        body: { additionalEmail },
      }),
      invalidatesTags: ["Profile"],
    }),

    updatePhoneNumber: builder.mutation({
      query: (phone) => ({
        url: "/customers/me",
        method: "PATCH",
        body: { phone },
      }),
      invalidatesTags: ["Profile"],
    }),

    updateProfilePhoto: builder.mutation({
      query: (profilePhotoUrl) => ({
        url: "/customers/me",
        method: "PATCH",
        body: { profilePhotoUrl },
      }),
      invalidatesTags: ["Profile"],
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useDeleteMyAccountMutation,
  useUpdatePreferredNameMutation,
  useAddAdditionalEmailMutation,
  useUpdatePhoneNumberMutation,
  useUpdateProfilePhotoMutation,
} = profileApi;
