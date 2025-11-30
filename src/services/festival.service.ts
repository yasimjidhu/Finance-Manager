import { StorageService } from './storage.service';

export interface Festival {
    id: string;
    name: string;
    date: string;
    budget: number;
    spent: number;
    daysLeft: number;
    image: any; // In a real app, this would be a URI string
    color: string;
}

const FESTIVALS_KEY = 'festivals_data';

const DUMMY_FESTIVALS: Festival[] = [
    {
        id: '1',
        name: 'Diwali',
        date: 'Nov 12',
        budget: 15000,
        spent: 12500,
        daysLeft: 45,
        image: null, // We can't easily persist require() images, so we'll handle this in UI
        color: '#F59E0B'
    },
    {
        id: '2',
        name: 'Eid al-Fitr',
        date: 'Apr 10',
        budget: 10000,
        spent: 11000,
        daysLeft: 120,
        image: null,
        color: '#10B981'
    },
];

export const FestivalService = {
    getAllFestivals: async (): Promise<Festival[]> => {
        const data = await StorageService.getData(FESTIVALS_KEY);
        if (!data) {
            // Initialize with dummy data if empty
            await StorageService.storeData(FESTIVALS_KEY, DUMMY_FESTIVALS);
            return DUMMY_FESTIVALS;
        }
        return data;
    },

    addFestival: async (festival: Omit<Festival, 'id'>): Promise<Festival[]> => {
        const currentFestivals = await FestivalService.getAllFestivals();
        const newFestival = {
            ...festival,
            id: Date.now().toString(),
        };
        const updatedFestivals = [newFestival, ...currentFestivals];
        await StorageService.storeData(FESTIVALS_KEY, updatedFestivals);
        return updatedFestivals;
    },

    updateFestival: async (updatedFestival: Festival): Promise<Festival[]> => {
        const currentFestivals = await FestivalService.getAllFestivals();
        const updatedFestivals = currentFestivals.map(f =>
            f.id === updatedFestival.id ? updatedFestival : f
        );
        await StorageService.storeData(FESTIVALS_KEY, updatedFestivals);
        return updatedFestivals;
    },

    deleteFestival: async (id: string): Promise<Festival[]> => {
        const currentFestivals = await FestivalService.getAllFestivals();
        const updatedFestivals = currentFestivals.filter(f => f.id !== id);
        await StorageService.storeData(FESTIVALS_KEY, updatedFestivals);
        return updatedFestivals;
    }
};
