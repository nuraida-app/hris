import { createSlice } from "@reduxjs/toolkit";
import { ApiAuth } from "./ApiAuth";
import { isAuthenticated, setSignIn, setSignOut } from "../../utils/auth";

const UserSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isBootstrapping: isAuthenticated(),
  },
  reducers: {
    finishBootstrap: (state) => {
      state.isBootstrapping = false;
    },
    clearUser: (state) => {
      state.user = null;
      state.isBootstrapping = false;
      setSignOut();
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(ApiAuth.endpoints.login.matchPending, (state) => {
        state.isBootstrapping = true;
      })
      .addMatcher(
        ApiAuth.endpoints.login.matchFulfilled,
        (state, action) => {
          state.user = action.payload;
          state.isBootstrapping = false;
          setSignIn();
        }
      )
      .addMatcher(ApiAuth.endpoints.login.matchRejected, (state) => {
        state.isBootstrapping = false;
      })
      .addMatcher(ApiAuth.endpoints.loadUser.matchPending, (state) => {
        if (isAuthenticated()) {
          state.isBootstrapping = true;
        }
      })
      .addMatcher(
        ApiAuth.endpoints.loadUser.matchFulfilled,
        (state, action) => {
          state.user = action.payload;
          state.isBootstrapping = false;
          setSignIn();
        }
      )
      .addMatcher(ApiAuth.endpoints.loadUser.matchRejected, (state) => {
        state.user = null;
        state.isBootstrapping = false;
        setSignOut();
      })
      .addMatcher(ApiAuth.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
        state.isBootstrapping = false;
        setSignOut();
      });
  },
});

export const { finishBootstrap, clearUser } = UserSlice.actions;
export default UserSlice.reducer;
