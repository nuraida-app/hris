import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiAdmin = createApi({
  reducerPath: "ApiAdmin",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/admin" }),
  tagTypes: ["Admin"],
  endpoints: (builder) => ({
    getAdmins: builder.query({
      query: ({ page, limit, search }) => ({
        url: `/get-all`,
        params: { page, limit, search },
      }),
      providesTags: ["Admin"],
    }),
    addAdmin: builder.mutation({
      query: (body) => ({
        url: `/add`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Admin"],
    }),
    getAdminById: builder.query({
      query: (id) => `/${id}`,
      providesTags: ["Admin"],
    }),
    deleteAdmin: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Admin"],
    }),
  }),
});

export const {
  useGetAdminsQuery,
  useAddAdminMutation,
  useGetAdminByIdQuery,
  useDeleteAdminMutation,
} = ApiAdmin;
