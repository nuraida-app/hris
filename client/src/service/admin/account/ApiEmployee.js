import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiEmployee = createApi({
  reducerPath: "ApiEmployee",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/employee" }),
  tagTypes: ["Employee", "EmployeeDetail"], // Tambah tag EmployeeDetail
  endpoints: (builder) => ({
    // 1. Save Global (Create & Update Data Inti)
    saveEmployee: builder.mutation({
      query: (body) => ({
        url: `/save`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Employee", "EmployeeDetail"],
    }),

    // 2. Get All List
    getEmployees: builder.query({
      query: ({ page, limit, search }) => ({
        url: `/get-all`,
        params: { page, limit, search },
      }),
      providesTags: ["Employee"],
    }),

    // 3. Get Detail (Full Profile)
    getEmployeeDetail: builder.query({
      query: (id) => `/detail/${id}`,
      providesTags: (result, error, id) => [{ type: "EmployeeDetail", id }],
    }),

    // 4. Delete Employee
    deleteEmployee: builder.mutation({
      query: (id) => ({
        url: `/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Employee"],
    }),

    // --- SUB-FEATURE: FAMILY ---
    saveFamily: builder.mutation({
      query: (body) => ({
        url: `/family/save`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["EmployeeDetail"], // Refresh detail setelah save
    }),
    deleteFamily: builder.mutation({
      query: (id) => ({
        url: `/family/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["EmployeeDetail"],
    }),

    // --- SUB-FEATURE: DOCUMENTS ---
    saveDocument: builder.mutation({
      query: (body) => ({
        url: `/document/save`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["EmployeeDetail"],
    }),
    deleteDocument: builder.mutation({
      query: (id) => ({
        url: `/document/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["EmployeeDetail"],
    }),

    saveEdu: builder.mutation({
      query: (body) => ({
        url: `/education/save`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["EmployeeDetail"],
    }),
    deleteEdu: builder.mutation({
      query: (id) => ({
        url: `/education/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["EmployeeDetail"],
    }),

    saveTraining: builder.mutation({
      query: (body) => ({
        url: `/training/save`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["EmployeeDetail"],
    }),
    deleteTraining: builder.mutation({
      query: (id) => ({
        url: `/training/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["EmployeeDetail"],
    }),
  }),
});

export const {
  useSaveEmployeeMutation,
  useGetEmployeesQuery,
  useGetEmployeeDetailQuery,
  useDeleteEmployeeMutation,
  useSaveFamilyMutation,
  useDeleteFamilyMutation,
  useSaveDocumentMutation,
  useDeleteDocumentMutation,
  useSaveEduMutation,
  useDeleteEduMutation,
  useSaveTrainingMutation,
  useDeleteTrainingMutation,
} = ApiEmployee;
