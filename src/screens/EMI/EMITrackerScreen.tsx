import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Screen from '../../components/common/Screen';
import AppText from '../../components/common/AppText';
import EMICard from '../../components/EMI/EMICard';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import { formatCurrency } from '../../utils/helpers';
import Ionicons from '@expo/vector-icons/Ionicons';

const DUMMY_EMIS = [
    {
        id: '1',
        title: 'Home Loan',
        originalAmount: 5000000,
        remainingAmount: 1250000,
        nextDueDate: '25th Aug 2024',
    },
    {
        id: '2',
        title: 'Car Loan (Model X)',
        originalAmount: 1200000,
        remainingAmount: 480000,
        nextDueDate: '10th Sep 2024',
    },
    {
        id: '3',
        title: 'Personal Loan',
        originalAmount: 300000,
        remainingAmount: 90000,
        nextDueDate: '1st Sep 2024',
    },
    {
        id: '4',
        title: 'Education Loan (Sibling)',
        originalAmount: 800000,
        remainingAmount: 320000,
        nextDueDate: '18th Aug 2024',
    },
];

export default function EMITrackerScreen() {
    const { theme } = useTheme();

    // Calculate summary
    const totalOriginal = DUMMY_EMIS.reduce((acc, item) => acc + item.originalAmount, 0);
    const totalRemaining = DUMMY_EMIS.reduce((acc, item) => acc + item.remainingAmount, 0);
    const totalPaid = totalOriginal - totalRemaining;
    const progress = totalOriginal > 0 ? totalPaid / totalOriginal : 0;
    const percentage = Math.round(progress * 100);

    return (
        <Screen
            headerTitle="EMI Tracker"
            showBackButton={true}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Predictive Payoff Summary Card */}
                <View style={[styles.summaryCard, { borderColor: theme.colors.border }]}>
                    <AppText style={[styles.summaryTitle, { color: theme.colors.text }]}>Predictive Payoff Summary</AppText>

                    <AppText style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>Total Outstanding EMI</AppText>
                    <AppText style={[styles.summaryAmount, { color: '#636AE8' }]}>{formatCurrency(totalRemaining)}</AppText>

                    <View style={styles.dateRow}>
                        <Ionicons name="calendar-outline" size={16} color={theme.colors.textMuted} style={{ marginRight: 6 }} />
                        <AppText style={[styles.dateText, { color: theme.colors.textMuted }]}>Estimated Payoff Date: March 2028</AppText>
                    </View>

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

                    <AppText style={[styles.summaryDescription, { color: theme.colors.textMuted }]}>
                        You've paid off {percentage}% of your total EMI liability across all loans.
                    </AppText>
                </View>

                <AppText style={[styles.sectionTitle, { color: theme.colors.text }]}>Active EMIs</AppText>

                <View style={styles.list}>
                    {DUMMY_EMIS.map((emi) => (
                        <EMICard
                            key={emi.id}
                            title={emi.title}
                            originalAmount={emi.originalAmount}
                            remainingAmount={emi.remainingAmount}
                            nextDueDate={emi.nextDueDate}
                            onPress={() => { }}
                        />
                    ))}
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: spacing.xl,
    },
    summaryCard: {
        padding: spacing.lg,
        borderRadius: spacing.lg,
        borderWidth: 1,
        marginBottom: spacing.xl,
        backgroundColor: '#FFFFFF', // Keeping white background for the card as per design, or could use theme.colors.card
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: spacing.md,
    },
    summaryLabel: {
        fontSize: 14,
        marginBottom: spacing.xs,
    },
    summaryAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: spacing.md,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    dateText: {
        fontSize: 14,
    },
    progressBarBg: {
        height: 8,
        borderRadius: 4,
        marginBottom: spacing.sm,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    summaryDescription: {
        fontSize: 13,
        lineHeight: 18,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: spacing.md,
    },
    list: {
        gap: spacing.xs,
    },
});
