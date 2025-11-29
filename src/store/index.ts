import { configureStore } from "@reduxjs/toolkit";
import expenseSlice from "./slices/expenseSlice";
import emiSlice from "./slices/emiSlice";
import goalSlice from "./slices/goalSlice";

export const store = configureStore({
  reducer: {
    expenses: expenseSlice,
    emi: emiSlice,
    goals: goalSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
