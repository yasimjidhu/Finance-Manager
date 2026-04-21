import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from '../common/AppText';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import { formatCurrency } from '../../utils/helpers';

interface PreSalaryAlertProps {
    currentBalance: number;
    salaryDate?: number; // Day of the month (e.g., 1 for 1st)
}

const PreSalaryAlert = ({ currentBalance, salaryDate = 1 }: PreSalaryAlertProps) => {
    const { theme } = useTheme();

    // Calculate days until next salary
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let nextSalaryDate = new Date(currentYear, currentMonth, salaryDate);
    if (today.getDate() >= salaryDate) {
        // If today is past the salary date, next salary is next month
        nextSalaryDate = new Date(currentYear, currentMonth + 1, salaryDate);
    }

    const diffTime = Math.abs(nextSalaryDate.getTime() - today.getTime());
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const dailyBudget = daysLeft > 0 ? currentBalance / daysLeft : currentBalance;

    // Alert Logic
    // Thresholds could be dynamic, but for now:
    // Danger: Daily budget < 500
    // Warning: Daily budget < 1000
    // Safe: Daily budget >= 1000

    let alertType: 'danger' | 'warning' | 'safe' = 'safe';
    if (dailyBudget < 500) alertType = 'danger';
    else if (dailyBudget < 1000) alertType = 'warning';

    const getAlertConfig = () => {
        switch (alertType) {
            case 'danger':
                return {
                    icon: 'warning',
                    color: theme.colors.danger,
                    bgColor: 'rgba(239, 68, 68, 0.1)',
                    title: 'Slow down!',
                    message: `You need to manage ${formatCurrency(dailyBudget)}/day until salary.`
                };
            case 'warning':
                return {
                    icon: 'alert-circle',
                    color: '#F59E0B',
                    bgColor: 'rgba(245, 158, 11, 0.1)',
                    title: 'Be Careful',
                    message: `You have ${formatCurrency(dailyBudget)}/day left.`
                };
            case 'safe':
                return {
                    icon: 'checkmark-circle',
                    color: theme.colors.success,
                    bgColor: 'rgba(34, 197, 94, 0.1)',
                    title: 'On Track',
                    message: `You have a healthy ${formatCurrency(dailyBudget)}/day budget.`
                };
        }
    };

    const config = getAlertConfig();

    return (
        <View style={[styles.container, { backgroundColor: config.bgColor, borderColor: config.color + '30' }]}>
            <View style={styles.iconContainer}>
                <Ionicons name={config.icon as any} size={24} color={config.color} />
            </View>
            <View style={styles.content}>
                <AppText style={[styles.title, { color: config.color }]}>{config.title}</AppText>
                <AppText style={[styles.message, { color: theme.colors.text }]}>
                    {config.message}
                </AppText>
                <AppText style={[styles.subtext, { color: theme.colors.textMuted }]}>
                    {daysLeft} days until payday
                </AppText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: spacing.md,
        borderRadius: spacing.lg,
        marginBottom: spacing.lg,
        borderWidth: 1,
        alignItems: 'center',
    },
    iconContainer: {
        marginRight: spacing.md,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    message: {
        fontSize: 14,
        marginBottom: 4,
        lineHeight: 20,
    },
    subtext: {
        fontSize: 12,
    },
});

export default PreSalaryAlert;
