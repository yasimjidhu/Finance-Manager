import { supabase } from '../lib/supabase';
import { ExpenseService } from './expense.service';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';

export interface Goal {
    id: string;
    title: string;
    target_amount: number;
    saved_amount: number;
    deadline: string; // ISO Date
    image_url?: string;
    status: 'active' | 'completed';
}

export const GoalService = {
    getGoals: async (): Promise<Goal[]> => {
        try {
            const { data, error } = await supabase
                .from('goals')
                .select('*')
                .order('deadline', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching goals:', error);
            return [];
        }
    },

    addGoal: async (goal: Omit<Goal, 'id' | 'saved_amount' | 'status'>, imageUri?: string): Promise<Goal | null> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            let image_url = null;

            // 1. Upload Image if provided
            if (imageUri) {
                // Read file as Base64
                const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: 'base64' });

                const fileName = `${user.id}/${Date.now()}.jpg`;

                // Convert Base64 to ArrayBuffer
                const arrayBuffer = decode(base64);

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('goal-image')
                    .upload(fileName, arrayBuffer, {
                        contentType: 'image/jpeg'
                    });

                if (uploadError) throw uploadError;

                // Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('goal-image')
                    .getPublicUrl(fileName);

                image_url = publicUrl;
            }

            // 2. Insert Goal into DB
            const { data, error } = await supabase
                .from('goals')
                .insert([{
                    user_id: user.id,
                    title: goal.title,
                    target_amount: goal.target_amount,
                    deadline: goal.deadline,
                    image_url: image_url,
                    saved_amount: 0,
                    status: 'active'
                }])
                .select()
                .single();

            if (error) throw error;

            // Schedule a motivational reminder
            const { NotificationService } = require('./notification.service');
            const smartBody = NotificationService.getSmartMessage(data.title, data.target_amount, 'goal');
            // Schedule for tomorrow 9 AM
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(9, 0, 0, 0);

            await NotificationService.scheduleNotification(
                `Goal: ${data.title}`,
                smartBody,
                tomorrow,
                data.id
            );

            return data;

        } catch (error) {
            console.error('Error adding goal:', error);
            throw error;
        }
    },

    addSavings: async (goalId: string, amount: number, goalTitle: string): Promise<void> => {
        try {
            // 1. Get current goal
            const { data: goal, error: fetchError } = await supabase
                .from('goals')
                .select('saved_amount, target_amount')
                .eq('id', goalId)
                .single();

            if (fetchError) throw fetchError;

            const newSaved = goal.saved_amount + amount;
            const status = newSaved >= goal.target_amount ? 'completed' : 'active';

            // 2. Update Goal
            const { error: updateError } = await supabase
                .from('goals')
                .update({
                    saved_amount: newSaved,
                    status: status
                })
                .eq('id', goalId);

            if (updateError) throw updateError;

            // 3. Record as Expense (Investment/Savings)
            await ExpenseService.addTransaction({
                title: `Saved for Goal: ${goalTitle}`,
                amount: amount,
                type: 'expense', // Treated as expense from wallet, but it's savings
                category: 'Savings',
                date: new Date().toISOString(),
                icon: 'piggy-bank',
                color: '#10B981'
            });

        } catch (error) {
            console.error('Error adding savings to goal:', error);
            throw error;
        }
    },

    deleteGoal: async (goalId: string): Promise<void> => {
        try {
            const { error } = await supabase
                .from('goals')
                .delete()
                .eq('id', goalId);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting goal:', error);
            throw error;
        }
    },

    updateGoal: async (id: string, updates: Partial<Goal>, imageUri?: string): Promise<void> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            let image_url = updates.image_url;

            // Upload new image if provided
            if (imageUri) {
                const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: 'base64' });
                const fileName = `${user.id}/${Date.now()}.jpg`;
                const arrayBuffer = decode(base64);

                const { error: uploadError } = await supabase.storage
                    .from('goal-image')
                    .upload(fileName, arrayBuffer, { contentType: 'image/jpeg' });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('goal-image')
                    .getPublicUrl(fileName);

                image_url = publicUrl;
            }

            const { error } = await supabase
                .from('goals')
                .update({ ...updates, image_url })
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating goal:', error);
            throw error;
        }
    }
};
