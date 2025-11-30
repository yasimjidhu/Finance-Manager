import { StorageService } from './storage.service';

export interface Reminder {
    id: number;
    title: string;
    amount: number;
    date: string; // e.g., "2024-05-01" or "1st May 2024"
    status: 'Upcoming' | 'Overdue' | 'Paid';
    notifications: boolean;
    icon: string;
    color: string;
}

const REMINDERS_KEY = 'reminders_data';

const DUMMY_REMINDERS: Reminder[] = [
    {
        id: 1,
        title: 'House Rent',
        amount: 15000,
        date: '1st May 2024',
        status: 'Upcoming',
        notifications: true,
        icon: 'home',
        color: '#6366F1'
    },
    {
        id: 2,
        title: 'Netflix Subscription',
        amount: 649,
        date: '20th April 2024',
        status: 'Overdue',
        notifications: false,
        icon: 'tv',
        color: '#EF4444'
    },
    {
        id: 3,
        title: 'Mobile Recharge',
        amount: 299,
        date: '25th April 2024',
        status: 'Upcoming',
        notifications: true,
        icon: 'phone-portrait',
        color: '#10B981'
    },
];

export const ReminderService = {
    getAllReminders: async (): Promise<Reminder[]> => {
        const data = await StorageService.getData(REMINDERS_KEY);
        if (!data) {
            await StorageService.storeData(REMINDERS_KEY, DUMMY_REMINDERS);
            return DUMMY_REMINDERS;
        }
        return data;
    },

    addReminder: async (reminder: Omit<Reminder, 'id'>): Promise<Reminder[]> => {
        const currentReminders = await ReminderService.getAllReminders();
        const newReminder = {
            ...reminder,
            id: Date.now(),
        };
        const updatedReminders = [newReminder, ...currentReminders];
        await StorageService.storeData(REMINDERS_KEY, updatedReminders);
        return updatedReminders;
    },

    updateReminder: async (updatedReminder: Reminder): Promise<Reminder[]> => {
        const currentReminders = await ReminderService.getAllReminders();
        const updatedReminders = currentReminders.map(r =>
            r.id === updatedReminder.id ? updatedReminder : r
        );
        await StorageService.storeData(REMINDERS_KEY, updatedReminders);
        return updatedReminders;
    },

    deleteReminder: async (id: number): Promise<Reminder[]> => {
        const currentReminders = await ReminderService.getAllReminders();
        const updatedReminders = currentReminders.filter(r => r.id !== id);
        await StorageService.storeData(REMINDERS_KEY, updatedReminders);
        return updatedReminders;
    }
};
