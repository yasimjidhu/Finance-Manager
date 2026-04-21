import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AppText from '../common/AppText';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import { formatCurrency } from '../../utils/helpers';
import Ionicons from '@expo/vector-icons/Ionicons';
import { EMI } from '../../services/emi.service';

interface EMICardProps {
    emi: EMI;
    onPress?: () => void;
    onLongPress?: () => void;
}

export default function EMICard({
    emi,
    onPress,
    onLongPress
}: EMICardProps) {
    const { theme } = useTheme();

    const originalAmount = Number(emi.total_amount) || 0;
    const remainingAmount = Number(emi.remaining_amount) || 0;
    const paidAmount = originalAmount - remainingAmount;
    const progress = originalAmount > 0 ? Math.min(paidAmount / originalAmount, 1) : 0;
    const percentage = Math.round(progress * 100);

    // Helper to format next due date
    const getNextDueDate = (day: number) => {
        const today = new Date();
        let nextDate = new Date(today.getFullYear(), today.getMonth(), day);
        if (nextDate < today) {
            nextDate = new Date(today.getFullYear(), today.getMonth() + 1, day);
        }
        return nextDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    };

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            onLongPress={onLongPress}
        >
            <LinearGradient
                colors={[theme.colors.card, theme.colors.surface]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.card, { shadowColor: theme.colors.text }]}
            >
                <View style={styles.header}>
                    <LinearGradient
                        colors={['rgba(252, 163, 17, 0.2)', 'rgba(252, 163, 17, 0.05)']}
                        style={styles.iconBox}
                    >
                        <Ionicons name="wallet-outline" size={20} color={theme.colors.primary} />
                    </LinearGradient>
                    <View style={styles.headerText}>
                        <AppText style={[styles.title, { color: theme.colors.text }]}>{emi.name}</AppText>
                        <View style={styles.dueDateContainer}>
                            <Ionicons name="time-outline" size={12} color={theme.colors.textMuted} style={{ marginRight: 4 }} />
                            <AppText style={[styles.subtitle, { color: theme.colors.textMuted }]}>Due: {getNextDueDate(emi.due_date)}</AppText>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
                        <AppText style={[styles.statusText, { color: theme.colors.success }]}>Active</AppText>
                    </View>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                <View style={styles.statsRow}>
                    <View>
                        <AppText style={[styles.label, { color: theme.colors.textMuted }]}>Remaining</AppText>
                        <AppText style={[styles.highlightValue, { color: theme.colors.text }]}>
                            {formatCurrency(remainingAmount)}
                        </AppText>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <AppText style={[styles.label, { color: theme.colors.textMuted }]}>Total Loan</AppText>
                        <AppText style={[styles.value, { color: theme.colors.textMuted }]}>
                            {formatCurrency(originalAmount)}
                        </AppText>
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={[styles.progressBarBg, { backgroundColor: theme.colors.surface }]}>
                        <LinearGradient
                            colors={[theme.colors.primary, '#F59E0B']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.progressBarFill, { width: `${percentage}%` }]}
                        />
                    </View>
                    <View style={styles.progressLabels}>
                        <AppText style={[styles.progressText, { color: theme.colors.primary }]}>
                            {percentage}% Paid
                        </AppText>
                        <AppText style={[styles.progressText, { color: theme.colors.textMuted }]}>
                            {100 - percentage}% Left
                        </AppText>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: spacing.xl,
        padding: spacing.md,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    dueDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    divider: {
        height: 1,
        marginBottom: spacing.md,
        opacity: 0.5,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    label: {
        fontSize: 12,
        marginBottom: 4,
        fontWeight: '500',
    },
    value: {
        fontSize: 14,
        fontWeight: '600',
    },
    highlightValue: {
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    progressContainer: {
        marginTop: spacing.xs,
    },
    progressBarBg: {
        height: 8,
        borderRadius: 4,
        marginBottom: spacing.xs,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressText: {
        fontSize: 11,
        fontWeight: '600',
    },
});

