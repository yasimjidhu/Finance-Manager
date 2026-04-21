import { supabase } from '../lib/supabase';
import { ExpenseService } from './expense.service';

export interface BudgetCategory {
    id: string;
    name: string;
    allocated: number;
    icon: string;
    iconType: 'Ionicons' | 'MaterialCommunityIcons';
    color: string;
}

const TOTAL_BUDGET_CATEGORY_NAME = 'TOTAL_MONTHLY_LIMIT';

export const BudgetService = {
    getBudgetSettings: async (): Promise<BudgetCategory[]> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

            const { data, error } = await supabase
                .from('budgets')
                .select('*')
                .eq('user_id', user.id)
                .eq('month', currentMonth)
                .neq('category', TOTAL_BUDGET_CATEGORY_NAME);

            if (error) throw error;

            // Map Supabase data to App interface
            return data.map((item: any) => ({
                id: item.id,
                name: item.category,
                allocated: item.amount_allocated,
                icon: item.icon || 'pricetag-outline', // Fallback icon
                iconType: item.icon_type || 'Ionicons',
                color: item.color || '#3B82F6'
            }));
        } catch (error) {
            console.error('Error fetching budget settings:', error);
            return [];
        }
    },

    addBudgetCategory: async (category: Omit<BudgetCategory, 'id'>): Promise<BudgetCategory | null> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const currentMonth = new Date().toISOString().slice(0, 7);
            const currentYear = new Date().getFullYear();

            const { data, error } = await supabase
                .from('budgets')
                .insert([{
                    user_id: user.id,
                    category: category.name,
                    amount_allocated: category.allocated,
                    month: currentMonth,
                    year: currentYear,
                    // Store extra UI fields if you added columns, otherwise they might be lost
                    // For now, let's assume standard columns. If you want to save icon/color, 
                    // you need to add those columns to the 'budgets' table.
                    icon: category.icon,
                    icon_type: category.iconType,
                    color: category.color
                }])
                .select()
                .single();

            if (error) throw error;

            return {
                id: data.id,
                name: data.category,
                allocated: data.amount_allocated,
                icon: category.icon,
                iconType: category.iconType,
                color: category.color
            };
        } catch (error) {
            console.error('Error adding budget category:', error);
            throw error;
        }
    },

    getTotalBudget: async (): Promise<number> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return 50000;

            const currentMonth = new Date().toISOString().slice(0, 7);

            const { data, error } = await supabase
                .from('budgets')
                .select('amount_allocated')
                .eq('user_id', user.id)
                .eq('month', currentMonth)
                .eq('category', TOTAL_BUDGET_CATEGORY_NAME)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // Ignore "Row not found"

            return data ? data.amount_allocated : 50000; // Default 50k
        } catch (error) {
            console.error('Error getting total budget:', error);
            return 50000;
        }
    },

    setTotalBudget: async (amount: number) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const currentMonth = new Date().toISOString().slice(0, 7);
            const currentYear = new Date().getFullYear();

            // Check if exists first
            const { data: existing } = await supabase
                .from('budgets')
                .select('id')
                .eq('user_id', user.id)
                .eq('month', currentMonth)
                .eq('category', TOTAL_BUDGET_CATEGORY_NAME)
                .single();

            if (existing) {
                await supabase
                    .from('budgets')
                    .update({ amount_allocated: amount })
                    .eq('id', existing.id);
            } else {
                await supabase
                    .from('budgets')
                    .insert([{
                        user_id: user.id,
                        category: TOTAL_BUDGET_CATEGORY_NAME,
                        amount_allocated: amount,
                        month: currentMonth,
                        year: currentYear
                    }]);
            }
        } catch (error) {
            console.error('Error setting total budget:', error);
            throw error;
        }
    },

    getBudgetStatus: async () => {
        const categories = await BudgetService.getBudgetSettings();
        const transactions = await ExpenseService.getAllTransactions();
        const totalBudget = await BudgetService.getTotalBudget();

        // Calculate spent per category
        const categoriesWithStatus = categories.map(cat => {
            const spent = transactions
                .filter(t => t.type === 'expense' && (
                    (t.category && t.category.toLowerCase() === cat.name.toLowerCase()) ||
                    (t.title && t.title.toLowerCase().includes(cat.name.toLowerCase()))
                ))
                .reduce((sum, t) => sum + t.amount, 0);

            let status = null;
            if (spent > cat.allocated) status = 'Overspent!';
            else if (spent > cat.allocated * 0.8) status = 'Approaching Limit';

            return {
                ...cat,
                spent,
                status
            };
        });

        const totalSpent = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            totalBudget,
            totalSpent,
            remaining: totalBudget - totalSpent,
            categories: categoriesWithStatus
        };
    }
    ,

    updateBudgetCategory: async (id: string, updates: Partial<BudgetCategory>): Promise<void> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { error } = await supabase
                .from('budgets')
                .update({
                    category: updates.name,
                    amount_allocated: updates.allocated,
                    icon: updates.icon,
                    icon_type: updates.iconType,
                    color: updates.color
                })
                .eq('id', id)
                .eq('user_id', user.id);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating budget category:', error);
            throw error;
        }
    },

    deleteBudgetCategory: async (id: string): Promise<void> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { error } = await supabase
                .from('budgets')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting budget category:', error);
            throw error;
        }
    },

    getForecast: async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return { projected: 0, status: 'Unknown', dailyAverage: 0 };

            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
            const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            const currentDay = today.getDate();

            // Get current month's expenses
            const { data: transactions } = await supabase
                .from('transactions')
                .select('amount')
                .eq('user_id', user.id)
                .eq('type', 'expense')
                .gte('date', startOfMonth);

            const totalSpentSoFar = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

            // Simple linear projection
            // If day 1, projection is tricky, assume 0 or average.
            // Avoid division by zero.
            const projected = currentDay > 0
                ? (totalSpentSoFar / currentDay) * daysInMonth
                : totalSpentSoFar;

            const totalBudget = await BudgetService.getTotalBudget();

            let status = 'On Track';
            if (projected > totalBudget) status = 'Over Budget';
            else if (projected > totalBudget * 0.9) status = 'At Risk';

            return {
                spent: totalSpentSoFar,
                projected: Math.round(projected),
                status,
                dailyAverage: currentDay > 0 ? Math.round(totalSpentSoFar / currentDay) : 0
            };
        } catch (error) {
            console.error('Error calculating forecast:', error);
            return { projected: 0, status: 'Error', dailyAverage: 0 };
        }
    }
};
