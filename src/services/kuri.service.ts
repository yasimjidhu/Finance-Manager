import { StorageService } from './storage.service';

export type KuriStatus = 'Active' | 'Won' | 'Closed' | 'Missed' | 'Pending' | 'Due Soon';

export interface Kuri {
    id: string;
    title: string;
    totalValue: number;
    installmentAmount: number;
    totalMonths: number;
    monthsPaid: number;
    startDate: string; // ISO string
    nextInstallmentDate: string; // ISO string or formatted string
    status: KuriStatus;
    color: string;
}

const KURI_KEY = 'kuri_data';

const DUMMY_KURIS: Kuri[] = [
    {
        id: '1',
        title: 'Friends Kuri - Goa Trip',
        totalValue: 150000,
        installmentAmount: 5000,
        totalMonths: 30,
        monthsPaid: 12,
        startDate: new Date(Date.now() - 31536000000).toISOString(),
        nextInstallmentDate: '28 Oct 2023',
        status: 'Missed',
        color: '#EF4444'
    },
    {
        id: '2',
        title: 'Family Kuri Group',
        totalValue: 500000,
        installmentAmount: 10000,
        totalMonths: 50,
        monthsPaid: 5,
        startDate: new Date(Date.now() - 15000000000).toISOString(),
        nextInstallmentDate: '10 Nov 2023',
        status: 'Pending',
        color: '#F59E0B'
    },
    {
        id: '3',
        title: 'Investment Kuri - Group A',
        totalValue: 1000000,
        installmentAmount: 25000,
        totalMonths: 40,
        monthsPaid: 20,
        startDate: new Date(Date.now() - 50000000000).toISOString(),
        nextInstallmentDate: '15 Nov 2023',
        status: 'Due Soon',
        color: '#6366F1'
    }
];

export const KuriService = {
    getAllKuris: async (): Promise<Kuri[]> => {
        const data = await StorageService.getData(KURI_KEY);
        if (!data) {
            await StorageService.storeData(KURI_KEY, DUMMY_KURIS);
            return DUMMY_KURIS;
        }
        return data;
    },

    addKuri: async (kuri: Omit<Kuri, 'id'>): Promise<Kuri[]> => {
        const currentData = await KuriService.getAllKuris();
        const newKuri = {
            ...kuri,
            id: Date.now().toString(),
        };
        const updatedData = [newKuri, ...currentData];
        await StorageService.storeData(KURI_KEY, updatedData);
        return updatedData;
    },

    updateKuri: async (updatedKuri: Kuri): Promise<Kuri[]> => {
        const currentData = await KuriService.getAllKuris();
        const updatedData = currentData.map(k =>
            k.id === updatedKuri.id ? updatedKuri : k
        );
        await StorageService.storeData(KURI_KEY, updatedData);
        return updatedData;
    },

    deleteKuri: async (id: string): Promise<Kuri[]> => {
        const currentData = await KuriService.getAllKuris();
        const updatedData = currentData.filter(k => k.id !== id);
        await StorageService.storeData(KURI_KEY, updatedData);
        return updatedData;
    }
};
