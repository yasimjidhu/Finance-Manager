import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Calendar, DateData } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import { formatCurrency } from '../../utils/helpers';
import { ExpenseService, Transaction } from '../../services/expense.service';
import { ReminderService, Reminder } from '../../services/reminder.service';
import { useFocusEffect } from '@react-navigation/native';

import Animated, { FadeInDown, ZoomIn, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface DaySummary {
    spent: number;
    income: number;
    transactions: number;
    categories: string[];
    items: (Transaction | Reminder)[];
}

const FinancialCalendarScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [markedDates, setMarkedDates] = useState<any>({});
    const [daySummaries, setDaySummaries] = useState<Record<string, DaySummary>>({});

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            const [txData, reminderData] = await Promise.all([
                ExpenseService.getAllTransactions(),
                ReminderService.getAllReminders()
            ]);
            setTransactions(txData);
            setReminders(reminderData);
            processCalendarData(txData, reminderData);
        } catch (error) {
            console.error("Failed to load calendar data", error);
        }
    };

    const processCalendarData = (txs: Transaction[], rems: Reminder[]) => {
        const marked: any = {};
        const summaries: Record<string, DaySummary> = {};

        // Process Transactions
        txs.forEach(tx => {
            const date = tx.date.split('T')[0];

            if (!marked[date]) marked[date] = { dots: [] };
            if (!summaries[date]) summaries[date] = { spent: 0, income: 0, transactions: 0, categories: [], items: [] };

            const dotColor = tx.type === 'expense' ? '#EF4444' : '#10B981';
            const dotKey = tx.type;

            // Add dot if not exists
            if (!marked[date].dots.find((d: any) => d.key === dotKey)) {
                marked[date].dots.push({ key: dotKey, color: dotColor });
            }

            // Update Summary
            if (tx.type === 'expense') summaries[date].spent += tx.amount;
            else summaries[date].income += tx.amount;

            summaries[date].transactions += 1;
            if (!summaries[date].categories.includes(tx.category)) {
                summaries[date].categories.push(tx.category);
            }
            summaries[date].items.push(tx);
        });

        // Process Reminders
        rems.forEach(rem => {
            const date = rem.date.split('T')[0]; // Assuming date is YYYY-MM-DD or ISO

            if (!marked[date]) marked[date] = { dots: [] };
            if (!summaries[date]) summaries[date] = { spent: 0, income: 0, transactions: 0, categories: [], items: [] };

            // Add dot for reminder (Bill)
            if (!marked[date].dots.find((d: any) => d.key === 'reminder')) {
                marked[date].dots.push({ key: 'reminder', color: '#F59E0B' });
            }

            // Reminders are technically future expenses, but we can list them
            // We won't add to 'spent' unless it's paid, but usually calendar shows due dates
            // Let's just list them as items
            summaries[date].items.push(rem);
            if (!summaries[date].categories.includes('bill')) {
                summaries[date].categories.push('bill');
            }
        });

        setMarkedDates(marked);
        setDaySummaries(summaries);
    };

    const onDayPress = (day: DateData) => {
        setSelectedDate(day.dateString);
    };

    const getMarkedDates = () => {
        const marked = { ...markedDates };
        // Highlight selected date
        marked[selectedDate] = {
            ...(marked[selectedDate] || {}),
            selected: true,
            selectedColor: theme.colors.primary,
            selectedTextColor: '#ffffff',
        };
        return marked;
    };

    const selectedSummary = daySummaries[selectedDate];

    // Helper to check if item is Transaction or Reminder
    const isTransaction = (item: any): item is Transaction => {
        return (item as Transaction).type !== undefined;
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Financial Calendar</Text>
                        <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} style={{ marginLeft: 8 }} />
                    </View>
                </View>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="options-outline" size={24} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Calendar View */}
                <Animated.View entering={FadeInDown.duration(600).springify()} style={[styles.calendarContainer, { backgroundColor: theme.colors.card, shadowColor: theme.colors.text }]}>
                    <Calendar
                        current={selectedDate}
                        onDayPress={onDayPress}
                        markedDates={getMarkedDates()}
                        markingType={'multi-dot'}
                        theme={{
                            backgroundColor: theme.colors.card,
                            calendarBackground: theme.colors.card,
                            textSectionTitleColor: theme.colors.textMuted,
                            selectedDayBackgroundColor: theme.colors.primary,
                            selectedDayTextColor: '#ffffff',
                            todayTextColor: theme.colors.primary,
                            dayTextColor: theme.colors.text,
                            textDisabledColor: theme.colors.textMuted + '50',
                            dotColor: theme.colors.primary,
                            selectedDotColor: '#ffffff',
                            arrowColor: theme.colors.primary,
                            monthTextColor: theme.colors.text,
                            indicatorColor: theme.colors.primary,
                            textDayFontFamily: 'System',
                            textMonthFontFamily: 'System',
                            textDayHeaderFontFamily: 'System',
                            textDayFontWeight: '500',
                            textMonthFontWeight: 'bold',
                            textDayHeaderFontWeight: '500',
                            textDayFontSize: 14,
                            textMonthFontSize: 18,
                            textDayHeaderFontSize: 12
                        }}
                    />
                </Animated.View>

                {/* Day Summary Card */}
                {selectedSummary ? (
                    <Animated.View entering={ZoomIn.duration(500).springify()} key={selectedDate}>
                        <LinearGradient
                            colors={[theme.colors.prussianBlue, '#0A1128']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.summaryCard}
                        >
                            <View style={styles.summaryHeader}>
                                <Text style={styles.summaryDate}>
                                    {new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </Text>
                                <View style={styles.summaryBadge}>
                                    <Text style={styles.summaryBadgeText}>{selectedSummary.items.length} Events</Text>
                                </View>
                            </View>

                            <View style={styles.summaryContent}>
                                <View>
                                    <Text style={styles.summaryLabel}>Total Spent</Text>
                                    <Text style={styles.summaryAmount}>{formatCurrency(selectedSummary.spent)}</Text>
                                </View>
                                {selectedSummary.income > 0 && (
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={styles.summaryLabel}>Income</Text>
                                        <Text style={[styles.summaryAmount, { color: '#10B981' }]}>{formatCurrency(selectedSummary.income)}</Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.categoryIcons}>
                                {selectedSummary.categories.slice(0, 5).map((cat: string, index: number) => (
                                    <View key={index} style={styles.miniIcon}>
                                        <Ionicons
                                            name={cat === 'bill' ? 'receipt' : 'cart'} // Simplified icon logic, can be expanded
                                            size={14}
                                            color="#fff"
                                        />
                                    </View>
                                ))}
                            </View>

                            {/* Transaction/Reminder Items */}
                            <View style={styles.transactionsList}>
                                {selectedSummary.items.map((item: any, index: number) => {
                                    const isTx = isTransaction(item);
                                    const isIncome = isTx && item.type === 'income';
                                    const isReminder = !isTx;

                                    return (
                                        <View key={item.id || index} style={styles.transactionItem}>
                                            <View style={[styles.itemIcon, { backgroundColor: (item.color || theme.colors.primary) + '20' }]}>
                                                <Ionicons
                                                    name={item.icon || (isReminder ? 'notifications' : 'card')}
                                                    size={16}
                                                    color={item.color || theme.colors.primary}
                                                />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.itemTitle}>{item.title}</Text>
                                                {isReminder && (
                                                    <Text style={[styles.itemSubtitle, { color: theme.colors.textMuted }]}>
                                                        {item.status === 'Paid' ? 'Paid Bill' : 'Due Bill'}
                                                    </Text>
                                                )}
                                            </View>
                                            <Text style={[
                                                styles.itemAmount,
                                                { color: isIncome ? '#10B981' : (isReminder && item.status !== 'Paid' ? '#F59E0B' : '#fff') }
                                            ]}>
                                                {isIncome ? '+' : '-'}{formatCurrency(item.amount)}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </LinearGradient>
                    </Animated.View>
                ) : (
                    <Animated.View entering={FadeInUp.duration(500)} style={[styles.emptyState, { backgroundColor: theme.colors.card }]}>
                        <Ionicons name="calendar-clear-outline" size={48} color={theme.colors.textMuted} />
                        <Text style={[styles.emptyStateText, { color: theme.colors.textMuted }]}>No activity on this day</Text>
                    </Animated.View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
                <TouchableOpacity style={[styles.footerButton, { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.footerButtonText}>View Full Insights</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
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
    },
    backButton: {
        marginRight: spacing.md,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    iconButton: {
        padding: 4,
    },
    scrollContent: {
        paddingBottom: spacing.xl,
    },
    calendarContainer: {
        margin: spacing.lg,
        borderRadius: 24,
        padding: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        overflow: 'hidden',
    },
    summaryCard: {
        marginHorizontal: spacing.lg,
        borderRadius: 24,
        padding: 24,
        marginBottom: spacing.xl,
        shadowColor: '#14213D',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    summaryDate: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    summaryBadge: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    summaryBadgeText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
        fontWeight: '500',
    },
    summaryContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    summaryLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        marginBottom: 4,
    },
    summaryAmount: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '700',
    },
    categoryIcons: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20,
    },
    miniIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    transactionsList: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        gap: 12,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    itemTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    itemSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    itemAmount: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyState: {
        marginHorizontal: spacing.lg,
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        borderStyle: 'dashed',
    },
    emptyStateText: {
        marginTop: 12,
        fontSize: 14,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
    },
    footerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
    },
    footerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default FinancialCalendarScreen;
