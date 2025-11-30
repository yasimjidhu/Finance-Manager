import { StorageService } from './storage.service';

export interface Transaction {
    id: string;
    title: string;
    amount: number;
    date: string; // ISO string
    type: 'income' | 'expense';
    category: string;
    icon?: string;
    color?: string;
}

const TRANSACTIONS_KEY = 'transactions_data';

const DUMMY_TRANSACTIONS: Transaction[] = [
    { id: '1', title: 'Salary Credited', amount: 85000, date: new Date().toISOString(), type: 'income', category: 'Salary', icon: 'cash-multiple', color: '#10B981' },
    { id: '2', title: 'Netflix Subscription', amount: 799, date: new Date().toISOString(), type: 'expense', category: 'Entertainment', icon: 'movie-open', color: '#E50914' },
    { id: '3', title: 'Grocery Shopping', amount: 2450, date: new Date(Date.now() - 86400000).toISOString(), type: 'expense', category: 'Food', icon: 'cart', color: '#F59E0B' },
];

export const ExpenseService = {
    getAllTransactions: async (): Promise<Transaction[]> => {
        const data = await StorageService.getData(TRANSACTIONS_KEY);
        if (!data) {
            await StorageService.storeData(TRANSACTIONS_KEY, DUMMY_TRANSACTIONS);
            return DUMMY_TRANSACTIONS;
        }
        return data;
    },

    addTransaction: async (transaction: Omit<Transaction, 'id'>): Promise<Transaction[]> => {
        const currentData = await ExpenseService.getAllTransactions();
        const newTransaction = {
            ...transaction,
            id: Date.now().toString(),
        };
        const updatedData = [newTransaction, ...currentData];
        await StorageService.storeData(TRANSACTIONS_KEY, updatedData);
        return updatedData;
    },

    getBalance: async (): Promise<{ income: number; expense: number; total: number }> => {
        const transactions = await ExpenseService.getAllTransactions();
        const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const expense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            income,
            expense,
            total: income - expense
        };
    }
};
