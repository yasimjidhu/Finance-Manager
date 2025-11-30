import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_RESET_KEY = 'last_budget_reset_month';

export interface MonthlySummary {
    saved: number;
    spent: number;
    income: number;
    nextGoal: number;
    month: string;
}

export type RolloverAction = 'savings' | 'emergency' | 'budget' | 'none';

export const BudgetResetService = {
    /**
     * Checks if a budget reset flow should be initiated.
     * Does NOT commit the reset yet.
     */
    shouldCheckReset: async (salaryDay: number = 1): Promise<MonthlySummary | null> => {
        try {
            const today = new Date();
            const currentDay = today.getDate();
            const currentMonthKey = `${today.getFullYear()}-${today.getMonth()}`;

            const lastResetMonth = await AsyncStorage.getItem(LAST_RESET_KEY);

            if (lastResetMonth === currentMonthKey) {
                return null;
            }

            if (currentDay >= salaryDay) {
                return await calculatePreviousMonthStats();
            }

            return null;
        } catch (error) {
            console.error('Error checking budget reset:', error);
            return null;
        }
    },

    /**
     * Commits the reset after user confirmation.
     */
    commitReset: async (action: RolloverAction, amount: number) => {
        const today = new Date();
        const currentMonthKey = `${today.getFullYear()}-${today.getMonth()}`;

        // In a real app, perform the actual fund transfers here based on 'action'
        console.log(`Processing rollover: ${action} for amount ${amount}`);

        await AsyncStorage.setItem(LAST_RESET_KEY, currentMonthKey);
    },

    /**
     * Force reset for testing purposes
     */
    forceReset: async (): Promise<MonthlySummary> => {
        return await calculatePreviousMonthStats();
    }
};

// Mock function to simulate calculating stats
const calculatePreviousMonthStats = async (): Promise<MonthlySummary> => {
    // In a real app, query the database for last month's transactions
    return new Promise((resolve) => {
        setTimeout(() => {
            const date = new Date();
            date.setMonth(date.getMonth() - 1);
            const monthName = date.toLocaleString('default', { month: 'long' });

            resolve({
                saved: 3200,
                spent: 45000,
                income: 48200,
                nextGoal: 4000,
                month: monthName
            });
        }, 500);
    });
};
