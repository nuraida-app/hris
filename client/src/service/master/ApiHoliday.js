import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiHoliday = createApi({
  reducerPath: "ApiHoliday",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/holiday" }),
  tagTypes: ["Holiday"],
  endpoints: (builder) => ({
    // 1. Get All Holidays
    // Route: GET /api/holiday/get-all
    getHolidays: builder.query({
      query: ({ page, limit, search }) => ({
        url: `/get-all`,
        params: { page, limit, search },
        method: "GET",
      }),
      providesTags: ["Holiday"],
    }),

    // 2. Get Holiday By Id
    // Route: GET /api/holiday/:id
    getHolidayById: builder.query({
      query: (id) => `/${id}`,
      providesTags: ["Holiday"],
    }),

    // 3. Create or Update Holiday
    // Route: POST /api/holiday/add
    addHoliday: builder.mutation({
      query: (body) => ({
        url: "/add",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Holiday"],
    }),

    // 4. Delete Holiday
    // Route: DELETE /api/holiday/:id
    deleteHoliday: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Holiday"],
    }),
  }),
});

// Export hooks auto-generated untuk digunakan di component
export const {
  useGetHolidaysQuery,
  useGetHolidayByIdQuery,
  useAddHolidayMutation,
  useDeleteHolidayMutation,
} = ApiHoliday;
