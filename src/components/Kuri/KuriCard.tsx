import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import AppText from '../common/AppText';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import { formatCurrency } from '../../utils/helpers';
import Ionicons from '@expo/vector-icons/Ionicons';

export type KuriStatus = 'Missed' | 'Pending' | 'Due Soon' | 'Paid';

interface KuriCardProps {
    title: string;
    totalValue: number;
    nextInstallmentDate: string;
    installmentAmount: number;
    status: KuriStatus;
    onPress?: () => void;
}

export default function KuriCard({
    title,
    totalValue,
    nextInstallmentDate,
    installmentAmount,
    status,
    onPress
}: KuriCardProps) {
    const { theme } = useTheme();

    const getStatusColor = (status: KuriStatus) => {
        switch (status) {
            case 'Missed': return theme.colors.danger;
            case 'Due Soon': return '#F472B6'; // Pinkish
            case 'Pending': return theme.colors.textMuted;
            case 'Paid': return theme.colors.success;
            default: return theme.colors.textMuted;
        }
    };

    const getStatusBg = (status: KuriStatus) => {
        switch (status) {
            case 'Missed': return theme.colors.danger;
            case 'Due Soon': return '#F472B6';
            case 'Pending': return '#E5E7EB'; // Light gray
            case 'Paid': return theme.colors.success;
            default: return '#E5E7EB';
        }
    };

    const statusColor = getStatusColor(status);
    const statusBg = getStatusBg(status);
    const isFilledBadge = status === 'Missed' || status === 'Due Soon';

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <View style={{ flex: 1 }}>
                    <AppText style={[styles.title, { color: theme.colors.text }]}>{title}</AppText>
                </View>
                <View style={styles.totalValueContainer}>
                    <AppText style={[styles.totalLabel, { color: theme.colors.textMuted }]}>Total Value:</AppText>
                    <AppText style={[styles.totalValue, { color: theme.colors.text }]}>{formatCurrency(totalValue)}</AppText>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsRow}>
                <View style={styles.dateContainer}>
                    <Ionicons name="calendar-outline" size={20} color={theme.colors.textMuted} style={{ marginRight: 8 }} />
                    <View>
                        <AppText style={[styles.label, { color: theme.colors.textMuted }]}>Next Installment</AppText>
                        <AppText style={[styles.value, { color: theme.colors.text }]}>{nextInstallmentDate}</AppText>
                    </View>
                </View>

                <View style={styles.amountContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                        <Ionicons name="cash-outline" size={16} color={theme.colors.textMuted} style={{ marginRight: 4 }} />
                        <AppText style={[styles.label, { color: theme.colors.textMuted }]}>Amount</AppText>
                    </View>
                    <AppText style={[styles.amountValue, { color: theme.colors.text }]}>{formatCurrency(installmentAmount)}</AppText>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={[
                    styles.badge,
                    {
                        backgroundColor: isFilledBadge ? statusBg : statusBg,
                        // For filled badges, we might want white text, for pending we want dark text
                    }
                ]}>
                    <AppText style={[
                        styles.badgeText,
                        { color: isFilledBadge ? '#FFFFFF' : theme.colors.textMuted }
                    ]}>
                        {status}
                    </AppText>
                </View>
            </View>
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
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: spacing.sm,
        flexWrap: 'wrap',
    },
    totalValueContainer: {
        alignItems: 'flex-end',
    },
    totalLabel: {
        fontSize: 12,
    },
    totalValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginBottom: spacing.md,
        marginTop: spacing.xs,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    amountContainer: {
        alignItems: 'flex-end',
    },
    label: {
        fontSize: 12,
    },
    value: {
        fontSize: 14,
        fontWeight: '500',
    },
    amountValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        alignItems: 'flex-end',
    },
    badge: {
        paddingHorizontal: spacing.md,
        paddingVertical: 4,
        borderRadius: spacing.xl,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
});
