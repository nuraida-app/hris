import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiDep = createApi({
  reducerPath: "ApiDep",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/department" }),
  tagTypes: ["Department"],
  endpoints: (builder) => ({
    // 1. Get All Departments
    // Route: GET /api/department/get-all
    getDepartments: builder.query({
      query: () => "/get-all",
      providesTags: ["Department"],
    }),

    // 2. Get Department By Id
    // Route: GET /api/department/:id
    getDepartmentById: builder.query({
      query: (id) => `/${id}`,
      providesTags: ["Department"],
    }),

    // 3. Create or Update Department
    // Route: POST /api/department/add
    // Backend logic: Jika ada ID di body = Update, jika tidak = Create
    addDepartment: builder.mutation({
      query: (body) => ({
        url: "/add",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Department"],
    }),

    // 4. Delete Department
    // Route: DELETE /api/department/:id
    deleteDepartment: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Department"],
    }),
    depFilter: builder.query({
      query: () => "/dep-filter",
      providesTags: ["Department"],
    }),
  }),
});

// Export hooks auto-generated untuk digunakan di component
export const {
  useGetDepartmentsQuery,
  useGetDepartmentByIdQuery,
  useAddDepartmentMutation,
  useDeleteDepartmentMutation,
  useDepFilterQuery,
} = ApiDep;
