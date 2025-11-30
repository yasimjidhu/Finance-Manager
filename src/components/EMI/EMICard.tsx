import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import AppText from '../common/AppText';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import { formatCurrency } from '../../utils/helpers';
import Ionicons from '@expo/vector-icons/Ionicons';

interface EMICardProps {
    title: string;
    originalAmount: number;
    remainingAmount: number;
    nextDueDate: string;
    onPress?: () => void;
}

export default function EMICard({
    title,
    originalAmount,
    remainingAmount,
    nextDueDate,
    onPress
}: EMICardProps) {
    const { theme } = useTheme();

    const paidAmount = originalAmount - remainingAmount;
    const progress = Math.min(paidAmount / originalAmount, 1);
    const percentage = Math.round(progress * 100);

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <AppText style={[styles.title, { color: theme.colors.text }]}>{title}</AppText>
                <Ionicons name="arrow-forward" size={20} color={theme.colors.textMuted} />
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
                <AppText style={[styles.label, { color: theme.colors.textMuted }]}>Original Amount</AppText>
                <AppText style={[styles.value, { color: theme.colors.text }]}>{formatCurrency(originalAmount)}</AppText>
            </View>

            <View style={styles.row}>
                <AppText style={[styles.label, { color: theme.colors.textMuted }]}>Remaining Amount</AppText>
                <AppText style={[styles.highlightValue, { color: '#636AE8' }]}>{formatCurrency(remainingAmount)}</AppText>
            </View>

            <View style={styles.row}>
                <AppText style={[styles.label, { color: theme.colors.textMuted }]}>Next Due Date</AppText>
                <AppText style={[styles.value, { color: theme.colors.text }]}>{nextDueDate}</AppText>
            </View>

            {/* Progress Bar */}
            <View style={[styles.progressBarBg, { backgroundColor: '#E0E7FF' }]}>
                <View
                    style={[
                        styles.progressBarFill,
                        {
                            width: `${percentage}%`,
                            backgroundColor: '#636AE8'
                        }
                    ]}
                />
            </View>

            <AppText style={[styles.progressText, { color: theme.colors.textMuted }]}>
                {percentage}% paid off
            </AppText>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        padding: spacing.md,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginBottom: spacing.md,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    label: {
        fontSize: 14,
    },
    value: {
        fontSize: 14,
        fontWeight: '500',
    },
    highlightValue: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    progressBarBg: {
        height: 6,
        borderRadius: 3,
        marginTop: spacing.sm,
        marginBottom: spacing.xs,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        textAlign: 'right',
    },
});
