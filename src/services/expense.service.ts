import { supabase } from '../lib/supabase';
import { TransactionSchema } from '../utils/validation';

export interface Transaction {
    id: string;
    title: string;
    amount: number;
    date: string; // ISO string
    type: 'income' | 'expense';
    category: string;
    icon?: string;
    color?: string;
    user_id?: string;
}

export const ExpenseService = {
    getAllTransactions: async (): Promise<Transaction[]> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching transactions:', error);
            throw error;
        }
    },

    addTransaction: async (transaction: Omit<Transaction, 'id'>): Promise<Transaction | null> => {
        try {
            // Validate input
            const validationResult = TransactionSchema.safeParse(transaction);
            if (!validationResult.success) {
                console.error('Validation Error:', validationResult.error.issues);
                throw new Error(validationResult.error.issues[0].message);
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('transactions')
                .insert([{
                    ...transaction,
                    user_id: user.id,
                    date: transaction.date || new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error adding transaction:', error);
            throw error;
        }
    },

    getBalance: async (): Promise<{ income: number; expense: number; total: number }> => {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('amount, type');

            if (error) throw error;

            const income = data
                ?.filter((t: any) => t.type === 'income')
                .reduce((sum: number, t: any) => sum + Number(t.amount), 0) || 0;

            const expense = data
                ?.filter((t: any) => t.type === 'expense')
                .reduce((sum: number, t: any) => sum + Number(t.amount), 0) || 0;

            return {
                income,
                expense,
                total: income - expense
            };
        } catch (error) {
            console.error('Error calculating balance:', error);
            return { income: 0, expense: 0, total: 0 };
        }
    },

    updateTransaction: async (id: string, updates: Partial<Transaction>): Promise<void> => {
        try {
            const { error } = await supabase
                .from('transactions')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating transaction:', error);
            throw error;
        }
    },

    deleteTransaction: async (id: string): Promise<void> => {
        try {
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting transaction:', error);
            throw error;
        }
    }
};
