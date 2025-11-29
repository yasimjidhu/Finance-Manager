import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface EMI {
    id: string;
    name: string;
    amount: number;
    dueDate: string;
    totalMonths: number;
    paidMonths: number;
}

interface State {
    list: EMI[];
}

const initialState: State = {
    list: [],
};

const emiSlice = createSlice({
    name: "emi",
    initialState,
    reducers: {
        addEMI: (state, action: PayloadAction<EMI>) => {
            state.list.push(action.payload);
        },
    },
});

export const { addEMI } = emiSlice.actions;
export default emiSlice.reducer;
