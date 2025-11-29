import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
}

interface State {
  list: Expense[];
}

const initialState: State = {
  list: [],
};

const expenseSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    addExpense: (state, action: PayloadAction<Expense>) => {
      state.list.push(action.payload);
    },
  },
});

export const { addExpense } = expenseSlice.actions;
export default expenseSlice.reducer;
