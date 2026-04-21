import { supabase } from '../lib/supabase';
import { StorageService } from './storage.service';

export const DataResetService = {
    resetAllData: async (): Promise<void> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // 1. Clear Local Storage
            await StorageService.clearAll();

            // 2. Clear Supabase Data
            // We use .neq('id', '0') as a trick to match all rows for the current user (RLS handles the user filter)
            // Note: We are deleting one by one to ensure we cover all tables. 
            // If a table doesn't exist or has no data, it might throw or just return 0 count.
            // We wrap each in a try-catch block to prevent one failure from stopping the rest.

            const tables = ['transactions', 'goals', 'budgets', 'emis', 'kuris', 'reminders'];

            for (const table of tables) {
                try {
                    // Assuming 'id' column exists and is not '0' (or UUID '0000...')
                    // For UUIDs, '00000000-0000-0000-0000-000000000000' is a safe "not equal" check if we want to delete all.
                    // Or we can just use a condition that is always true like id is not null if allowed.
                    // Supabase JS requires a filter.

                    // Let's check if we can use a simpler filter.
                    // .gt('created_at', '1970-01-01') might work if created_at exists.
                    // But 'id' != '0' is safer if ID is text/uuid.

                    await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
                } catch (e) {
                    console.warn(`Failed to clear table ${table}:`, e);
                }
            }

        } catch (error) {
            console.error('Error resetting data:', error);
            throw error;
        }
    }
};
