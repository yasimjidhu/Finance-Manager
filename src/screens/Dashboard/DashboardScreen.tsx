import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../../components/common/AppText';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import { formatCurrency } from '../../utils/helpers';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function DashboardScreen() {
    const { theme } = useTheme();
    const navigation = useNavigation();

    const toggleDrawer = () => {
        navigation.dispatch(DrawerActions.toggleDrawer());
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
                    <Ionicons name="menu" size={28} color={theme.colors.text} />
                </TouchableOpacity>
                {/* <AppText style={[styles.headerTitle, { color: theme.colors.text }]}>Dashboard</AppText> */}
                <View style={{ width: 28 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                <AppText style={[styles.sectionTitle, { color: theme.colors.text }]}>Financial Overview</AppText>

                <View style={styles.overviewRow}>
                    {/* Total Income */}
                    <View style={[styles.card, styles.halfCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="wallet-outline" size={20} color={theme.colors.success} />
                            <AppText style={[styles.trendText, { color: theme.colors.success }]}>↑ 5%</AppText>
                        </View>
                        <AppText style={[styles.cardLabel, { color: theme.colors.textMuted }]}>Total Income</AppText>
                        <AppText style={[styles.cardAmount, { color: theme.colors.text }]}>{formatCurrency(75000)}</AppText>
                        <AppText style={[styles.cardSubtext, { color: theme.colors.textMuted }]}>Last 30 days</AppText>
                    </View>

                    {/* Total Expenses */}
                    <View style={[styles.card, styles.halfCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="card-outline" size={20} color={theme.colors.danger} />
                        </View>
                        <AppText style={[styles.cardLabel, { color: theme.colors.textMuted }]}>Total Expenses</AppText>
                        <AppText style={[styles.cardAmount, { color: theme.colors.text }]}>{formatCurrency(45000)}</AppText>
                        <AppText style={[styles.cardSubtext, { color: theme.colors.textMuted }]}>Last 30 days</AppText>
                        <View style={[styles.progressBar, { backgroundColor: theme.colors.primary }]} />
                    </View>
                </View>

                {/* Total Savings */}
                <View style={[styles.card, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="add-circle" size={20} color="#636AE8" />
                        <AppText style={[styles.trendText, { color: theme.colors.success }]}>↑ 10% more</AppText>
                    </View>
                    <AppText style={[styles.cardLabel, { color: theme.colors.textMuted }]}>Total Savings</AppText>
                    <AppText style={[styles.cardAmount, { color: theme.colors.text }]}>{formatCurrency(30000)}</AppText>
                    <AppText style={[styles.cardSubtext, { color: theme.colors.textMuted }]}>Last 30 days</AppText>
                    <View style={[styles.progressBar, { backgroundColor: '#636AE8', width: '100%' }]} />
                </View>

                <AppText style={[styles.sectionTitle, { color: theme.colors.text, marginTop: spacing.xl }]}>Quick Insights</AppText>

                {/* Upcoming EMI */}
                <View style={[styles.insightCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                    <View style={styles.insightIconContainer}>
                        <Ionicons name="layers-outline" size={24} color="#0EA5E9" />
                    </View>
                    <View style={styles.insightContent}>
                        <AppText style={[styles.insightTitle, { color: theme.colors.text }]}>Upcoming EMI</AppText>
                        <AppText style={[styles.insightAmount, { color: theme.colors.text }]}>{formatCurrency(12500)}</AppText>
                        <AppText style={[styles.insightSubtext, { color: theme.colors.textMuted }]}>Due on 25th Jan</AppText>
                    </View>
                </View>

                {/* Kuri Balance */}
                <View style={[styles.insightCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                    <View style={styles.insightIconContainer}>
                        <Ionicons name="time-outline" size={24} color="#A855F7" />
                    </View>
                    <View style={styles.insightContent}>
                        <AppText style={[styles.insightTitle, { color: theme.colors.text }]}>Kuri Balance</AppText>
                        <AppText style={[styles.insightAmount, { color: theme.colors.text }]}>{formatCurrency(8000)}</AppText>
                        <AppText style={[styles.insightSubtext, { color: theme.colors.textMuted }]}>Next contribution: 10th Feb</AppText>
                    </View>
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    menuButton: {
        padding: spacing.xs,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: spacing.md,
    },
    overviewRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    card: {
        padding: spacing.md,
        borderRadius: spacing.md,
        borderWidth: 1,
        marginBottom: spacing.md,
    },
    halfCard: {
        width: '48%',
        marginBottom: 0,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    trendText: {
        fontSize: 12,
        fontWeight: '600',
    },
    cardLabel: {
        fontSize: 14,
        marginBottom: spacing.xs,
    },
    cardAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: spacing.xs,
    },
    cardSubtext: {
        fontSize: 12,
    },
    progressBar: {
        height: 4,
        borderRadius: 2,
        marginTop: spacing.md,
        width: '60%',
    },
    insightCard: {
        flexDirection: 'row',
        padding: spacing.md,
        borderRadius: spacing.md,
        borderWidth: 1,
        marginBottom: spacing.md,
        alignItems: 'center',
    },
    insightIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    insightContent: {
        flex: 1,
    },
    insightTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    insightAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    insightSubtext: {
        fontSize: 12,
    },
});
