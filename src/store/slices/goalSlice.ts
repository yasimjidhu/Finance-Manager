import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Goal {
    id: string;
    name: string;
    targetAmount: number;
    savedAmount: number;
    deadline: string;
}

interface State {
    list: Goal[];
}

const initialState: State = {
    list: [],
};

const goalSlice = createSlice({
    name: "goals",
    initialState,
    reducers: {
        addGoal: (state, action: PayloadAction<Goal>) => {
            state.list.push(action.payload);
        },
        updateSavedAmount: (state, action: PayloadAction<{ id: string; amount: number }>) => {
            const goal = state.list.find((g) => g.id === action.payload.id);
            if (goal) {
                goal.savedAmount = action.payload.amount;
            }
        },
    },
});

export const { addGoal, updateSavedAmount } = goalSlice.actions;
export default goalSlice.reducer;
