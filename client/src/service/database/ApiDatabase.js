import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiDatabase = createApi({
  reducerPath: "ApiDatabase",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/database" }), // Pastikan path sesuai router express
  tagTypes: ["Database", "Tables"],
  endpoints: (builder) => ({
    // Mengambil list tabel
    getTables: builder.query({
      query: () => "/tables",
      providesTags: ["Tables"],
    }),
    // Restore Database (Upload)
    restoreDb: builder.mutation({
      query: (formData) => ({
        url: "/restore",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Database", "Tables"],
    }),
    // Hapus Data Tabel
    cleanTables: builder.mutation({
      query: (body) => ({
        url: "/clean-tables",
        method: "POST",
        body: body, // { tables: [] }
      }),
      invalidatesTags: ["Tables"],
    }),
  }),
});

export const {
  useGetTablesQuery,
  useRestoreDbMutation,
  useCleanTablesMutation,
} = ApiDatabase;
