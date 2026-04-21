import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Reminder {
    id: number;
    title: string;
    amount: number;
    date: string; // ISO string
    status: 'Upcoming' | 'Overdue' | 'Paid';
    notifications: boolean;
    icon: string;
    color: string;
    user_id?: string;
}

const NOTIFICATIONS_PREF_KEY = 'reminder_notifications_pref';

export const ReminderService = {
    getAllReminders: async (): Promise<Reminder[]> => {
        try {
            const { data, error } = await supabase
                .from('reminders')
                .select('*')
                .order('due_date', { ascending: true });

            if (error) throw error;

            // Load local notification preferences
            const json = await AsyncStorage.getItem(NOTIFICATIONS_PREF_KEY);
            const prefs = json ? JSON.parse(json) : {};

            return data.map((item: any) => ({
                id: item.id,
                title: item.title,
                amount: item.amount,
                date: item.due_date,
                status: item.is_paid ? 'Paid' : (new Date(item.due_date) < new Date() ? 'Overdue' : 'Upcoming'),
                notifications: prefs[item.id] !== undefined ? prefs[item.id] : true, // Default to true if not set
                icon: 'notifications',
                color: '#6366F1'
            }));
        } catch (error) {
            console.error('Error fetching reminders:', error);
            return [];
        }
    },

    saveNotificationPref: async (id: number, enabled: boolean) => {
        try {
            const json = await AsyncStorage.getItem(NOTIFICATIONS_PREF_KEY);
            const prefs = json ? JSON.parse(json) : {};
            prefs[id] = enabled;
            await AsyncStorage.setItem(NOTIFICATIONS_PREF_KEY, JSON.stringify(prefs));
        } catch (error) {
            console.error('Error saving notification pref:', error);
        }
    },

    addReminder: async (reminder: Omit<Reminder, 'id'>): Promise<Reminder | null> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('reminders')
                .insert([{
                    user_id: user.id,
                    title: reminder.title,
                    amount: reminder.amount,
                    due_date: reminder.date,
                    is_paid: reminder.status === 'Paid'
                }])
                .select()
                .single();

            if (error) throw error;

            // Save default notification pref
            await ReminderService.saveNotificationPref(data.id, reminder.notifications);

            return {
                id: data.id,
                title: data.title,
                amount: data.amount,
                date: data.due_date,
                status: data.is_paid ? 'Paid' : 'Upcoming',
                notifications: reminder.notifications,
                icon: reminder.icon,
                color: reminder.color
            };
        } catch (error) {
            console.error('Error adding reminder:', error);
            throw error;
        }
    },

    updateReminder: async (updatedReminder: Reminder): Promise<void> => {
        try {
            const { error } = await supabase
                .from('reminders')
                .update({
                    title: updatedReminder.title,
                    amount: updatedReminder.amount,
                    due_date: updatedReminder.date,
                    is_paid: updatedReminder.status === 'Paid'
                })
                .eq('id', updatedReminder.id);

            if (error) throw error;

            // Save notification pref
            await ReminderService.saveNotificationPref(updatedReminder.id, updatedReminder.notifications);

        } catch (error) {
            console.error('Error updating reminder:', error);
            throw error;
        }
    },

    deleteReminder: async (id: number | string): Promise<void> => {
        try {
            const { error } = await supabase
                .from('reminders')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting reminder:', error);
            throw error;
        }
    }
};
