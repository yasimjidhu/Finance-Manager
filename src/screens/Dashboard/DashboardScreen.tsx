import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Text, Dimensions, StatusBar, Platform } from 'react-native';
import { useNavigation, DrawerActions, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import { formatCurrency } from '../../utils/helpers';

import PreSalaryAlert from '../../components/Dashboard/PreSalaryAlert';
import MonthlyResetModal from '../../components/Dashboard/MonthlyResetModal';
import { BudgetResetService, MonthlySummary } from '../../services/budgetReset.service';
import { ExpenseService } from '../../services/expense.service';
import { EMIService, EMI } from '../../services/emi.service';
import { KuriService } from '../../services/kuri.service';
import { GoalService } from '../../services/goal.service';

const { width } = Dimensions.get('window');

const GlassCard = ({ children, style, intensity = 20 }: any) => {
    const { isDark } = useTheme();

    if (Platform.OS === 'android') {
        // Android doesn't support BlurView well in some versions/Expo Go
        return (
            <View style={[styles.glassCardAndroid, isDark ? styles.glassDark : styles.glassLight, style]}>
                {children}
            </View>
        );
    }

    return (
        <BlurView intensity={intensity} tint={isDark ? 'dark' : 'light'} style={[styles.glassCard, style]}>
            {children}
        </BlurView>
    );
};

export default function DashboardScreen() {
    const { theme, isDark } = useTheme();
    const navigation = useNavigation<any>();
    const [resetModalVisible, setResetModalVisible] = useState(false);
    const [resetSummary, setResetSummary] = useState<MonthlySummary | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Dashboard Data State
    const [financials, setFinancials] = useState({
        income: 0,
        expense: 0,
        savings: 0
    });
    const [upcomingEMI, setUpcomingEMI] = useState<EMI | null>(null);
    const [kuriSummary, setKuriSummary] = useState<{ balance: number, nextDue: string | null }>({ balance: 0, nextDue: null });

    const toggleDrawer = () => {
        navigation.dispatch(DrawerActions.toggleDrawer());
    };

    const loadData = async () => {
        try {
            // 1. Get Balance (Income vs Expense)
            const balance = await ExpenseService.getBalance();

            // 2. Get Savings (Total saved in Goals)
            const goals = await GoalService.getGoals();
            const totalSaved = goals.reduce((sum, goal) => sum + goal.saved_amount, 0);

            setFinancials({
                income: balance.income,
                expense: balance.expense,
                savings: totalSaved
            });

            // 3. Get Upcoming EMI
            const emis = await EMIService.getEMIs();
            const activeEmis = emis.filter(e => e.status === 'active');
            const today = new Date().getDate();
            activeEmis.sort((a, b) => {
                const diffA = a.due_date - today;
                const diffB = b.due_date - today;
                const weightA = diffA < 0 ? diffA + 30 : diffA;
                const weightB = diffB < 0 ? diffB + 30 : diffB;
                return weightA - weightB;
            });
            setUpcomingEMI(activeEmis.length > 0 ? activeEmis[0] : null);

            // 4. Get Kuri Summary
            const kuris = await KuriService.getAllKuris();
            const activeKuris = kuris.filter(k => k.status === 'Active');
            const kuriBalance = activeKuris.reduce((sum, k) => sum + (k.monthsPaid * k.installmentAmount), 0);

            let nextDue = null;
            if (activeKuris.length > 0) {
                activeKuris.sort((a, b) => new Date(a.nextInstallmentDate).getTime() - new Date(b.nextInstallmentDate).getTime());
                nextDue = activeKuris[0].nextInstallmentDate;
            }

            setKuriSummary({
                balance: kuriBalance,
                nextDue: nextDue
            });

            // Check for budget reset
            const summary = await BudgetResetService.shouldCheckReset(1); // Check if it's 1st of month
            if (summary) {
                setResetSummary(summary);
                setResetModalVisible(true);
            }

        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleResetComplete = async (action: any) => {
        setResetModalVisible(false);
        if (action !== 'none' && resetSummary) {
            await BudgetResetService.commitReset(action, resetSummary.saved);
        } else if (resetSummary) {
            await BudgetResetService.commitReset('none', 0);
        }
    };

    const getMonthName = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    };

    const StatCard = ({ label, value, icon, color, onPress, delay }: any) => (
        <Animated.View entering={FadeInDown.delay(delay).duration(600).springify()} style={styles.halfCard}>
            <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
                <View
                    style={[
                        styles.statCard,
                        {
                            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.4)' : '#FFFFFF',
                            borderColor: theme.colors.border,
                            borderWidth: 1,
                        }
                    ]}
                >
                    <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                        <Ionicons name={icon} size={22} color={color} />
                    </View>
                    <View>
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
                        <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={styles.mainContainer}>
            <LinearGradient
                colors={isDark ? [theme.colors.background, '#0F172A'] : [theme.colors.background, '#E2E8F0']}
                style={StyleSheet.absoluteFillObject}
            />
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={toggleDrawer} style={[styles.menuButton, { borderColor: theme.colors.border }]}>
                            <Ionicons name="grid-outline" size={20} color={theme.colors.text} />
                        </TouchableOpacity>
                        <View>
                            <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>Welcome Back</Text>
                            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Portfolio</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[styles.profileButton, { borderColor: theme.colors.primary }]}
                        onPress={() => navigation.navigate('Account')}
                    >
                        <Ionicons name="person" size={18} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
                >
                    {/* Pre-Salary Alert */}
                    <Animated.View entering={FadeInDown.duration(600).springify()}>
                        <PreSalaryAlert currentBalance={financials.income - financials.expense} salaryDate={1} />
                    </Animated.View>

                    {/* Total Savings - Premium Card (Hero) */}
                    <Animated.View entering={ZoomIn.delay(300).duration(600).springify()}>
                        <TouchableOpacity activeOpacity={0.95} onPress={() => navigation.navigate('Goals')}>
                            <LinearGradient
                                colors={isDark ? ['#1e1b4b', '#312e81', '#4338ca'] : ['#0F172A', '#1E293B', '#334155']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.heroCard}
                            >
                                <View style={styles.cardPattern} />
                                <View style={styles.heroContent}>
                                    <View style={styles.heroHeader}>
                                        <View>
                                            <Text style={styles.cardLabel}>Total Savings</Text>
                                            <Text style={styles.cardAmount}>{formatCurrency(financials.savings)}</Text>
                                        </View>
                                        <Ionicons name="wallet-outline" size={28} color="#FFD700" />
                                    </View>

                                    <View style={styles.heroFooter}>
                                        <View style={styles.chip} />
                                        <Text style={styles.cardNumber}>**** **** **** 4242</Text>
                                    </View>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Main Stats Row */}
                    <View style={styles.statsRow}>
                        <StatCard
                            label="Income"
                            value={formatCurrency(financials.income)}
                            icon="arrow-down-circle"
                            color={theme.colors.success}
                            onPress={() => navigation.navigate('AllTransactions')}
                            delay={100}
                        />
                        <StatCard
                            label="Expenses"
                            value={formatCurrency(financials.expense)}
                            icon="arrow-up-circle"
                            color={theme.colors.danger}
                            onPress={() => navigation.navigate('AllTransactions')} // Or Expense specific
                            delay={200}
                        />
                    </View>

                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Actions</Text>
                    </View>

                    {/* Action Grid */}
                    <View style={styles.actionGrid}>
                        <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.card }]} onPress={() => navigation.navigate('AddExpense')}>
                            <View style={[styles.actionIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                                <Ionicons name="add" size={24} color={theme.colors.primary} />
                            </View>
                            <Text style={[styles.actionLabel, { color: theme.colors.text }]}>Add New</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.card }]} onPress={() => navigation.navigate('LimitSettings')}>
                            <View style={[styles.actionIcon, { backgroundColor: theme.colors.info + '20' }]}>
                                <Ionicons name="options" size={24} color={theme.colors.info} />
                            </View>
                            <Text style={[styles.actionLabel, { color: theme.colors.text }]}>Limits</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.card }]} onPress={() => navigation.navigate('FestivalPlanner')}>
                            <View style={[styles.actionIcon, { backgroundColor: '#8B5CF620' }]}>
                                <Ionicons name="sparkles" size={24} color={'#8B5CF6'} />
                            </View>
                            <Text style={[styles.actionLabel, { color: theme.colors.text }]}>Festivals</Text>
                        </TouchableOpacity>
                    </View>


                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Insights</Text>
                    </View>

                    {/* Upcoming EMI */}
                    <Animated.View entering={FadeInDown.delay(400).duration(600).springify()}>
                        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('DueReminders')}>
                            <GlassCard style={styles.insightCard} intensity={10}>
                                <View style={[styles.insightIconContainer, { backgroundColor: '#0EA5E915' }]}>
                                    <MaterialCommunityIcons name="calendar-clock" size={24} color="#0EA5E9" />
                                </View>
                                <View style={styles.insightContent}>
                                    <Text style={[styles.insightTitle, { color: theme.colors.text }]}>
                                        {upcomingEMI ? 'Upcoming EMI' : 'No Dues'}
                                    </Text>
                                    <Text style={[styles.insightSubtext, { color: theme.colors.textSecondary }]}>
                                        {upcomingEMI ? `Pay ${upcomingEMI.name} by ${upcomingEMI.due_date}th` : 'You are all clear!'}
                                    </Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={[styles.insightAmount, { color: theme.colors.text }]}>
                                        {upcomingEMI ? formatCurrency(upcomingEMI.monthly_amount) : '-'}
                                    </Text>
                                    <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} style={{ marginTop: 4 }} />
                                </View>
                            </GlassCard>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Kuri Balance */}
                    <Animated.View entering={FadeInDown.delay(500).duration(600).springify()}>
                        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Kuri')}>
                            <GlassCard style={styles.insightCard} intensity={10}>
                                <View style={[styles.insightIconContainer, { backgroundColor: '#A855F715' }]}>
                                    <MaterialCommunityIcons name="piggy-bank-outline" size={24} color="#A855F7" />
                                </View>
                                <View style={styles.insightContent}>
                                    <Text style={[styles.insightTitle, { color: theme.colors.text }]}>Kuri Balance</Text>
                                    <Text style={[styles.insightSubtext, { color: theme.colors.textSecondary }]}>
                                        {kuriSummary.nextDue ? `Next: ${getMonthName(kuriSummary.nextDue)}` : 'Active'}
                                    </Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={[styles.insightAmount, { color: theme.colors.text }]}>{formatCurrency(kuriSummary.balance)}</Text>
                                    <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} style={{ marginTop: 4 }} />
                                </View>
                            </GlassCard>
                        </TouchableOpacity>
                    </Animated.View>

                    <View style={{ height: 100 }} />
                </ScrollView>

                <MonthlyResetModal
                    visible={resetModalVisible}
                    onClose={handleResetComplete}
                    summary={resetSummary}
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    menuButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    profileButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    greeting: {
        fontSize: 12,
        fontFamily: 'Poppins_500Medium',
        opacity: 0.7,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Poppins_700Bold',
        marginTop: -2,
    },
    scrollContent: {
        padding: spacing.lg,
    },
    heroCard: {
        borderRadius: 24,
        padding: 24,
        minHeight: 180,
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
        shadowColor: "#4338ca",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        overflow: 'hidden',
    },
    cardPattern: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    heroContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    heroHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,
        marginBottom: 4,
    },
    cardAmount: {
        color: '#FFF',
        fontFamily: 'Poppins_700Bold',
        fontSize: 32,
        letterSpacing: -1,
    },
    heroFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
    },
    chip: {
        width: 40,
        height: 28,
        borderRadius: 6,
        backgroundColor: 'rgba(255, 215, 0, 0.3)', // Goldish
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.5)',
    },
    cardNumber: {
        color: 'rgba(255,255,255,0.6)',
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,
        letterSpacing: 2,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    halfCard: {
        flex: 1,
    },
    statCard: {
        padding: spacing.md,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        fontFamily: 'Poppins_500Medium',
    },
    statValue: {
        fontSize: 16,
        fontFamily: 'Poppins_700Bold',
    },
    sectionHeader: {
        marginBottom: spacing.md,
        marginTop: spacing.sm,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
    },
    actionGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
    },
    actionButton: {
        width: (width - 48 - 24) / 3, // (Screen - Padding - Gaps) / 3
        padding: spacing.md,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionLabel: {
        fontSize: 12,
        fontFamily: 'Poppins_500Medium',
    },
    insightCard: {
        flexDirection: 'row',
        padding: 18,
        borderRadius: 24,
        marginBottom: spacing.md,
        alignItems: 'center',
        overflow: 'hidden',
    },
    glassCard: {
        borderRadius: 24,
        overflow: 'hidden',
    },
    glassCardAndroid: {
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    glassDark: {
        backgroundColor: 'rgba(30, 41, 59, 0.6)',
    },
    glassLight: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    insightIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    insightContent: {
        flex: 1,
    },
    insightTitle: {
        fontSize: 16,
        fontFamily: 'Poppins_700Bold',
        marginBottom: 2,
    },
    insightSubtext: {
        fontSize: 13,
        fontFamily: 'Poppins_400Regular',
    },
    insightAmount: {
        fontSize: 16,
        fontFamily: 'Poppins_700Bold',
    },
});
