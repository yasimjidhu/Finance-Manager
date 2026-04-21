import { supabase } from '../lib/supabase';

export type KuriStatus = 'Active' | 'Won' | 'Closed' | 'Missed' | 'Pending' | 'Due Soon';

export interface Kuri {
    id: string;
    title: string;
    totalValue: number;
    installmentAmount: number;
    totalMonths: number;
    monthsPaid: number;
    startDate: string; // ISO string
    nextInstallmentDate: string; // ISO string
    status: KuriStatus;
    color: string;
    user_id?: string;
}

export const KuriService = {
    getAllKuris: async (): Promise<Kuri[]> => {
        try {
            const { data, error } = await supabase
                .from('kuris')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map DB columns to frontend interface if names differ
            // Assuming DB columns: name, total_amount, amount_per_month, total_months, start_date, status
            return data.map((item: any) => ({
                id: item.id,
                title: item.name,
                totalValue: item.total_amount || (item.total_months * item.amount_per_month),
                installmentAmount: item.amount_per_month,
                totalMonths: item.total_months,
                monthsPaid: item.months_paid || 0, // You might need to add this column to DB or calculate it
                startDate: item.start_date,
                nextInstallmentDate: item.start_date, // Logic needed to calc next date
                status: item.status as KuriStatus,
                color: item.color || '#6366F1'
            }));
        } catch (error) {
            console.error('Error fetching Kuris:', error);
            return [];
        }
    },

    addKuri: async (kuri: Omit<Kuri, 'id'>): Promise<Kuri | null> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('kuris')
                .insert([{
                    user_id: user.id,
                    name: kuri.title,
                    total_months: kuri.totalMonths,
                    amount_per_month: kuri.installmentAmount,
                    start_date: kuri.startDate,
                    status: 'Active',
                    months_paid: 0
                    // Add extra columns if you created them in DB: color
                }])
                .select()
                .single();

            if (error) throw error;

            return {
                id: data.id,
                title: data.name,
                totalValue: data.total_amount,
                installmentAmount: data.amount_per_month,
                totalMonths: data.total_months,
                monthsPaid: 0,
                startDate: data.start_date,
                nextInstallmentDate: data.start_date,
                status: 'Active',
                color: kuri.color
            };
        } catch (error) {
            console.error('Error adding Kuri:', error);
            throw error;
        }
    },

    updateKuri: async (updatedKuri: Kuri): Promise<void> => {
        try {
            const { error } = await supabase
                .from('kuris')
                .update({
                    name: updatedKuri.title,
                    amount_per_month: updatedKuri.installmentAmount,
                    status: updatedKuri.status,
                    months_paid: updatedKuri.monthsPaid
                })
                .eq('id', updatedKuri.id);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating Kuri:', error);
            throw error;
        }
    },

    deleteKuri: async (id: string): Promise<void> => {
        try {
            const { error } = await supabase
                .from('kuris')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting Kuri:', error);
            throw error;
        }
    }
};
