import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { isAuthenticated, setSignOut } from "../../utils/auth";

const baseQuery = fetchBaseQuery({
  baseUrl: `/api/auth`,
  credentials: "include",
});

let apiAuth;

const baseQueryWithAuth = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401 && isAuthenticated()) {
    setSignOut();
    api.dispatch({ type: "auth/clearUser" });
    api.dispatch(apiAuth.util.resetApiState());
  }

  return result;
};

export const ApiAuth = createApi({
  reducerPath: "ApiAuth",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({
        url: "/login",
        method: "POST",
        body,
      }),
      transformResponse: (response) => response.user,
      invalidatesTags: ["User"],
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),
    loadUser: builder.query({
      query: () => "/load",
      providesTags: ["User"],
    }),
  }),
});

apiAuth = ApiAuth;

export const { useLoginMutation, useLogoutMutation, useLoadUserQuery } =
  ApiAuth;
