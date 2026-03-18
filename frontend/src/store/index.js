import { configureStore } from "@reduxjs/toolkit";
import dashboardReducer from "./dashboardSlice";
import orderReducer from "./orderSlice";

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    orders: orderReducer,
  },
});
