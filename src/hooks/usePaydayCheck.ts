import { useEffect } from 'react';
import { StorageService } from '../services/storage.service';
import { useAlert } from '../context/AlertContext';
import { useNavigation } from '@react-navigation/native';

export const usePaydayCheck = () => {
    const { showAlert } = useAlert();
    const navigation = useNavigation<any>();

    useEffect(() => {
        checkPayday();
    }, []);

    const checkPayday = async () => {
        try {
            const salaryDay = await StorageService.getData('SALARY_DAY');
            if (!salaryDay) return;

            const today = new Date();
            const currentDay = today.getDate();
            const currentMonthYear = `${today.getFullYear()}-${today.getMonth() + 1}`; // YYYY-M

            // Check if today is salary day
            if (currentDay === parseInt(salaryDay)) {
                const lastAlert = await StorageService.getData('LAST_PAYDAY_ALERT');

                // If alert not shown for this month
                if (lastAlert !== currentMonthYear) {
                    showAlert({
                        title: "🎉 It's Payday!",
                        message: "Cha-ching! Your salary should be in. Don't forget to allocate your budget!",
                        type: "success",
                        confirmText: "Let's Budget",
                        onConfirm: () => {
                            // Navigate to the nested screen
                            // 'Main' is the DrawerNavigator in AppNavigator
                            // 'CashEnvelope' is the screen inside DrawerNavigator
                            navigation.navigate('Main', {
                                screen: 'CashEnvelope',
                                params: { isPayday: true }
                            });
                        }
                    });

                    // Mark as shown for this month
                    await StorageService.storeData('LAST_PAYDAY_ALERT', currentMonthYear);
                }
            }
        } catch (error) {
            console.error('Error checking payday:', error);
        }
    };
};

