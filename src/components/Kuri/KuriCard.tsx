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
            case 'Missed': return '#EF4444';
            case 'Due Soon': return '#F59E0B'; // Orange/Warning
            case 'Pending': return theme.colors.textMuted;
            case 'Paid': return '#22C55E';
            default: return theme.colors.textMuted;
        }
    };

    const getStatusBg = (status: KuriStatus) => {
        switch (status) {
            case 'Missed': return 'rgba(239, 68, 68, 0.1)';
            case 'Due Soon': return 'rgba(245, 158, 11, 0.1)';
            case 'Pending': return 'rgba(0,0,0,0.05)';
            case 'Paid': return 'rgba(34, 197, 94, 0.1)';
            default: return 'rgba(0,0,0,0.05)';
        }
    };

    const statusColor = getStatusColor(status);
    const statusBg = getStatusBg(status);

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.card, shadowColor: theme.colors.text }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <View style={styles.iconBox}>
                    <Ionicons name="people-outline" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.headerText}>
                    <AppText style={[styles.title, { color: theme.colors.text }]}>{title}</AppText>
                    <AppText style={[styles.subtitle, { color: theme.colors.textMuted }]}>
                        Total: {formatCurrency(totalValue)}
                    </AppText>
                </View>
                <View style={[styles.badge, { backgroundColor: statusBg }]}>
                    <AppText style={[styles.badgeText, { color: statusColor }]}>
                        {status}
                    </AppText>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsRow}>
                <View style={styles.infoBlock}>
                    <AppText style={[styles.label, { color: theme.colors.textMuted }]}>Next Due</AppText>
                    <View style={styles.valueRow}>
                        <Ionicons name="calendar-outline" size={14} color={theme.colors.text} style={{ marginRight: 4 }} />
                        <AppText style={[styles.value, { color: theme.colors.text }]}>{nextInstallmentDate}</AppText>
                    </View>
                </View>

                <View style={[styles.infoBlock, { alignItems: 'flex-end' }]}>
                    <AppText style={[styles.label, { color: theme.colors.textMuted }]}>Installment</AppText>
                    <AppText style={[styles.amountValue, { color: theme.colors.primary }]}>
                        {formatCurrency(installmentAmount)}
                    </AppText>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: spacing.lg,
        padding: spacing.md,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: 'rgba(252, 163, 17, 0.1)', // Orange with opacity
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 12,
    },
    badge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: spacing.sm,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginBottom: spacing.md,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoBlock: {
        justifyContent: 'center',
    },
    label: {
        fontSize: 12,
        marginBottom: 4,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    value: {
        fontSize: 14,
        fontWeight: '600',
    },
    amountValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

