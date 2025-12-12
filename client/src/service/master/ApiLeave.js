import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiLeave = createApi({
  reducerPath: "ApiLeave",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/leave" }),
  tagTypes: ["LeaveType"],
  endpoints: (builder) => ({
    // 1. Get All Leave Types
    getLeaveTypes: builder.query({
      query: () => "/types",
      providesTags: ["LeaveType"],
    }),

    // 2. Create Leave Type
    createLeaveType: builder.mutation({
      query: (body) => ({
        url: "/types",
        method: "POST",
        body,
      }),
      invalidatesTags: ["LeaveType"],
    }),

    // 3. Update Leave Type
    updateLeaveType: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/types/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["LeaveType"],
    }),

    // 4. Delete Leave Type
    deleteLeaveType: builder.mutation({
      query: (id) => ({
        url: `/types/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["LeaveType"],
    }),
  }),
});

// Export hooks otomatis dari RTK Query
export const {
  useGetLeaveTypesQuery,
  useCreateLeaveTypeMutation,
  useUpdateLeaveTypeMutation,
  useDeleteLeaveTypeMutation,
} = ApiLeave;
