import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ApiDash = createApi({
  reducerPath: "ApiDash",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/dashboard" }),
  tagTypes: ["Dashboard"],
  endpoints: (builder) => ({
    getDashboardSummary: builder.query({
      query: () => "/summary",
      providesTags: ["Dashboard"],
    }),
    getAttendanceToday: builder.query({
      query: () => "/attendance-today",
      providesTags: ["Dashboard"],
    }),
    getEmployeeDemographics: builder.query({
      query: () => "/employee-demographics",
      providesTags: ["Dashboard"],
    }),
    getPendingLeaves: builder.query({
      query: () => "/pending-leaves",
      providesTags: ["Dashboard"],
    }),
    getNewHires: builder.query({
      query: () => "/new-hires",
      providesTags: ["Dashboard"],
    }),
    getEmployeeSummary: builder.query({
      query: () => "/employee-summary",
      providesTags: ["EmployeeDash"],
    }),
  }),
});

export const {
  useGetAttendanceTodayQuery,
  useGetDashboardSummaryQuery,
  useGetEmployeeDemographicsQuery,
  useGetNewHiresQuery,
  useGetPendingLeavesQuery,
  useGetEmployeeSummaryQuery,
} = ApiDash;
