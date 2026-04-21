import { supabase } from '../lib/supabase';
import { ExpenseService } from './expense.service';

export interface EMI {
    id: string;
    name: string;
    total_amount: number;
    monthly_amount: number;
    remaining_amount: number;
    due_date: number; // Day of month (1-31)
    start_date?: string;
    end_date?: string;
    status: 'active' | 'completed';
}

export const EMIService = {
    getEMIs: async (): Promise<EMI[]> => {
        try {
            const { data, error } = await supabase
                .from('emis')
                .select('*')
                .order('due_date', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching EMIs:', error);
            return [];
        }
    },

    addEMI: async (emi: Omit<EMI, 'id' | 'status' | 'remaining_amount'>): Promise<EMI | null> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('emis')
                .insert([{
                    ...emi,
                    user_id: user.id,
                    remaining_amount: emi.total_amount,
                    status: 'active'
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error adding EMI:', error);
            throw error;
        }
    },

    payEMI: async (emiId: string, amount: number, emiName: string): Promise<void> => {
        try {
            // 1. Get current EMI details
            const { data: emi, error: fetchError } = await supabase
                .from('emis')
                .select('remaining_amount')
                .eq('id', emiId)
                .single();

            if (fetchError) throw fetchError;

            const newRemaining = Math.max(0, emi.remaining_amount - amount);
            const status = newRemaining === 0 ? 'completed' : 'active';

            // 2. Update EMI record
            const { error: updateError } = await supabase
                .from('emis')
                .update({
                    remaining_amount: newRemaining,
                    status: status
                })
                .eq('id', emiId);

            if (updateError) throw updateError;

            // 3. Record as an Expense Transaction
            await ExpenseService.addTransaction({
                title: `EMI Payment: ${emiName}`,
                amount: amount,
                type: 'expense',
                category: 'EMI',
                date: new Date().toISOString(),
                icon: 'bank-transfer',
                color: '#6366F1'
            });

        } catch (error) {
            console.error('Error paying EMI:', error);
            throw error;
        }
    },

    deleteEMI: async (id: string): Promise<void> => {
        try {
            const { error } = await supabase
                .from('emis')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting EMI:', error);
            throw error;
        }
    },

    updateEMI: async (id: string, updates: Partial<EMI>): Promise<void> => {
        try {
            const { error } = await supabase
                .from('emis')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating EMI:', error);
            throw error;
        }
    }
};
