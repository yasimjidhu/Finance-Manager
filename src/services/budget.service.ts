import { StorageService } from './storage.service';
import { ExpenseService } from './expense.service';

export interface BudgetCategory {
    id: string;
    name: string;
    allocated: number;
    icon: string;
    iconType: 'Ionicons' | 'MaterialCommunityIcons';
    color: string;
}

const BUDGET_KEY = 'budget_categories';
const TOTAL_BUDGET_KEY = 'total_monthly_budget';

const DEFAULT_CATEGORIES: BudgetCategory[] = [
    { id: '1', name: 'Food & Dining', allocated: 12000, icon: 'silverware-fork-knife', iconType: 'MaterialCommunityIcons', color: '#F59E0B' },
    { id: '2', name: 'Transportation', allocated: 8000, icon: 'car', iconType: 'Ionicons', color: '#EF4444' },
    { id: '3', name: 'Shopping', allocated: 7000, icon: 'shopping', iconType: 'MaterialCommunityIcons', color: '#8B5CF6' },
    { id: '4', name: 'Health', allocated: 5000, icon: 'heart-outline', iconType: 'Ionicons', color: '#10B981' },
    { id: '5', name: 'Utilities', allocated: 6000, icon: 'bank', iconType: 'MaterialCommunityIcons', color: '#3B82F6' },
];

export const BudgetService = {
    getBudgetSettings: async (): Promise<BudgetCategory[]> => {
        const data = await StorageService.getData(BUDGET_KEY);
        if (!data) {
            await StorageService.storeData(BUDGET_KEY, DEFAULT_CATEGORIES);
            return DEFAULT_CATEGORIES;
        }
        return data;
    },

    addBudgetCategory: async (category: Omit<BudgetCategory, 'id'>): Promise<BudgetCategory[]> => {
        const current = await BudgetService.getBudgetSettings();
        const newItem = { ...category, id: Date.now().toString() };
        const updated = [...current, newItem];
        await StorageService.storeData(BUDGET_KEY, updated);
        return updated;
    },

    getTotalBudget: async (): Promise<number> => {
        const data = await StorageService.getData(TOTAL_BUDGET_KEY);
        return data ? parseInt(data) : 50000;
    },

    setTotalBudget: async (amount: number) => {
        await StorageService.storeData(TOTAL_BUDGET_KEY, amount.toString());
    },

    getBudgetStatus: async () => {
        const categories = await BudgetService.getBudgetSettings();
        const transactions = await ExpenseService.getAllTransactions();
        const totalBudget = await BudgetService.getTotalBudget();

        // Calculate spent per category
        const categoriesWithStatus = categories.map(cat => {
            const spent = transactions
                .filter(t => t.type === 'expense' && (t.category === cat.name || t.title.includes(cat.name))) // Simple matching
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
};
