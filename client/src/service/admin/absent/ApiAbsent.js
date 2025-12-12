import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiAbsent = createApi({
  reducerPath: "ApiAbsent",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/absent" }),
  tagTypes: ["Absent"],
  endpoints: (builder) => ({
    // GET All
    getAbsents: builder.query({
      query: ({ page, limit, search, startDate, endDate }) => ({
        url: `/get-all`,
        params: { page, limit, search, startDate, endDate },
      }),
      providesTags: ["Absent"],
    }),

    // POST Save Manual
    saveAbsent: builder.mutation({
      query: (body) => ({
        url: `/save`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Absent"],
    }),

    // PUT Update
    updateAbsent: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/update/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Absent"],
    }),

    // DELETE Remove
    deleteAbsent: builder.mutation({
      query: (id) => ({
        url: `/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Absent"],
    }),

    // POST Import Excel
    importAbsent: builder.mutation({
      query: (formData) => ({
        url: `/import`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Absent"],
    }),

    // Helper untuk Download Template (biasanya via action handler, tapi bisa definisikan path disini untuk ref)
    getTemplateUrl: builder.query({
      query: () => "/template",
      // Kita tidak butuh auto-fetch untuk file download, ini hanya referensi jika butuh
    }),
  }),
});

export const {
  useGetAbsentsQuery,
  useSaveAbsentMutation,
  useUpdateAbsentMutation,
  useDeleteAbsentMutation,
  useImportAbsentMutation,
} = ApiAbsent;
