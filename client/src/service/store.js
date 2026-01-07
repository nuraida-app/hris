import { configureStore } from "@reduxjs/toolkit";
import Slice from "./auth/Slice";
import { ApiAuth } from "./auth/ApiAuth";
import { ApiDep } from "./master/ApiDep";
import { ApiPos } from "./master/ApiPos";
import { ApiHoliday } from "./master/ApiHoliday";
import { ApiAdmin } from "./account/ApiAdmin";
import { ApiEmployee } from "./account/ApiEmployee";
import { ApiAbsent } from "./absent/ApiAbsent";
import { ApiDash } from "./dashboard/ApiDash";
import { ApiLeave } from "./master/ApiLeave";
import { ApiDatabase } from "./database/ApiDatabase";

const isDevelopment = import.meta.env.VITE_MODE === "development";

const store = configureStore({
  reducer: {
    user: Slice,
    [ApiAuth.reducerPath]: ApiAuth.reducer,
    [ApiDep.reducerPath]: ApiDep.reducer,
    [ApiPos.reducerPath]: ApiPos.reducer,
    [ApiHoliday.reducerPath]: ApiHoliday.reducer,
    [ApiAdmin.reducerPath]: ApiAdmin.reducer,
    [ApiEmployee.reducerPath]: ApiEmployee.reducer,
    [ApiAbsent.reducerPath]: ApiAbsent.reducer,
    [ApiDash.reducerPath]: ApiDash.reducer,
    [ApiLeave.reducerPath]: ApiLeave.reducer,
    [ApiDatabase.reducerPath]: ApiDatabase.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      ApiAuth.middleware,
      ApiDep.middleware,
      ApiPos.middleware,
      ApiHoliday.middleware,
      ApiAdmin.middleware,
      ApiEmployee.middleware,
      ApiAbsent.middleware,
      ApiDash.middleware,
      ApiLeave.middleware,
      ApiDatabase.middleware,
    ]),

  devTools: isDevelopment,
});

export default store;
