// ApiPos.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiPos = createApi({
  reducerPath: "ApiPos",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/position" }),
  tagTypes: ["Position"],
  endpoints: (builder) => ({
    // GET: Ambil semua posisi
    getPositions: builder.query({
      query: ({ page, limit, search }) => ({
        url: `/get-all`,
        params: { page, limit, search },
      }),
      providesTags: ["Position"],
    }),

    // GET: Ambil satu posisi berdasarkan ID
    getPositionById: builder.query({
      query: (id) => `/${id}`,
      providesTags: ["Position"],
    }),

    // PUT: Create (jika id=0) atau Update (jika id > 0) posisi
    savePosition: builder.mutation({
      query: (body) => ({
        url: `/add`, // Router akan menentukan apakah ini Create atau Update berdasarkan ID
        method: "PUT",
        body,
      }),
      // Menginvalidasi tag 'Position' agar data posisi yang ditampilkan otomatis ter-refresh
      invalidatesTags: ["Position"],
    }),

    // DELETE: Hapus posisi berdasarkan ID
    deletePosition: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      // Menginvalidasi tag 'Position' agar daftar posisi ter-update
      invalidatesTags: ["Position"],
    }),
  }),
});

// Export hooks untuk digunakan di komponen React
export const {
  useGetPositionsQuery,
  useGetPositionByIdQuery,
  useSavePositionMutation,
  useDeletePositionMutation,
} = ApiPos;
