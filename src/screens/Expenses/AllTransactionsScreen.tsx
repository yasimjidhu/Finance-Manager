import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, SectionList, TextInput, ScrollView, Dimensions, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import AppText from '../../components/common/AppText';
import { ExpenseService, Transaction } from '../../services/expense.service';
import { formatCurrency } from '../../utils/helpers';
import Animated, { FadeInDown } from 'react-native-reanimated';
import CustomModal from '../../components/common/CustomModal';
import { Calendar } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import LoadingOverlay from '../../components/common/LoadingOverlay';

const { width } = Dimensions.get('window');

// Define categories for the dropdown/selection
const CATEGORIES = [
    { id: 'food', name: 'Food', icon: 'food', color: '#F59E0B' },
    { id: 'transport', name: 'Transport', icon: 'bus', color: '#3B82F6' },
    { id: 'shopping', name: 'Shopping', icon: 'shopping', color: '#EC4899' },
    { id: 'bills', name: 'Bills', icon: 'file-document', color: '#EF4444' },
    { id: 'entertainment', name: 'Entertainment', icon: 'gamepad-variant', color: '#8B5CF6' },
    { id: 'health', name: 'Health', icon: 'medical-bag', color: '#10B981' },
    { id: 'education', name: 'Education', icon: 'school', color: '#6366F1' },
    { id: 'salary', name: 'Salary', icon: 'cash', color: '#22C55E' },
    { id: 'other', name: 'Other', icon: 'dots-horizontal', color: '#64748B' },
];

export default function AllTransactionsScreen({ navigation }: any) {
    const { theme } = useTheme();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
    const [groupedTransactions, setGroupedTransactions] = useState<any[]>([]);
    const [summary, setSummary] = useState({ income: 0, expense: 0, total: 0 });
    const [loading, setLoading] = useState(false);

    // Modal State
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isCalendarVisible, setIsCalendarVisible] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        loadTransactions();
    }, []);

    useEffect(() => {
        filterAndGroupTransactions();
    }, [searchQuery, transactions, filterType]);

    const loadTransactions = async () => {
        setLoading(true);
        try {
            const data = await ExpenseService.getAllTransactions();
            // Sort by date desc
            const sorted = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setTransactions(sorted);

            // Calculate Summary
            const income = data.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const expense = data.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            setSummary({ income, expense, total: income - expense });

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filterAndGroupTransactions = () => {
        let filtered = transactions;

        // 1. Filter by Search
        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            filtered = filtered.filter(t =>
                t.title.toLowerCase().includes(lower) ||
                t.category.toLowerCase().includes(lower)
            );
        }

        // 2. Filter by Type
        if (filterType !== 'all') {
            filtered = filtered.filter(t => t.type === filterType);
        }

        // 3. Group by Date
        const groups: { [key: string]: Transaction[] } = {};
        filtered.forEach(t => {
            const d = new Date(t.date);
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            let dateKey = d.toDateString();
            if (d.toDateString() === today.toDateString()) dateKey = 'Today';
            else if (d.toDateString() === yesterday.toDateString()) dateKey = 'Yesterday';
            else dateKey = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(t);
        });

        const sectionData = Object.keys(groups).map(key => ({
            title: key,
            data: groups[key]
        }));

        setGroupedTransactions(sectionData);
    };

    const handleSaveTransaction = async () => {
        if (!title || !amount) return;

        try {
            const transactionData = {
                title,
                amount: parseFloat(amount),
                type,
                category: category.name,
                icon: category.icon,
                color: category.color,
                date: new Date(date).toISOString(),
            };

            if (selectedTransaction) {
                await ExpenseService.updateTransaction(selectedTransaction.id, transactionData);
            } else {
                await ExpenseService.addTransaction(transactionData);
            }

            closeModal();
            loadTransactions();
        } catch (error) {
            console.error('Error saving transaction:', error);
            alert('Failed to save transaction');
        }
    };

    const handleDeleteTransaction = async () => {
        if (!selectedTransaction) return;
        try {
            await ExpenseService.deleteTransaction(selectedTransaction.id);
            closeModal();
            loadTransactions();
        } catch (error) {
            console.error('Error deleting transaction:', error);
            alert('Failed to delete transaction');
        }
    };

    const openModal = (transaction?: Transaction) => {
        if (transaction) {
            setSelectedTransaction(transaction);
            setTitle(transaction.title);
            setAmount(transaction.amount.toString());
            setType(transaction.type);
            setDate(transaction.date.split('T')[0]);

            // Find category object
            const cat = CATEGORIES.find(c => c.name === transaction.category) || CATEGORIES[0];
            setCategory(cat);
        } else {
            setSelectedTransaction(null);
            setTitle('');
            setAmount('');
            setType('expense');
            setCategory(CATEGORIES[0]);
            setDate(new Date().toISOString().split('T')[0]);
        }
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setSelectedTransaction(null);
    };

    const renderItem = ({ item, index }: { item: Transaction, index: number }) => (
        <Animated.View entering={FadeInDown.duration(400)}>
            <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.transactionItem, { backgroundColor: theme.colors.card, shadowColor: theme.colors.text }]}
                onPress={() => openModal(item)}
            >
                <View style={[styles.transactionIcon, { backgroundColor: (item.color || theme.colors.primary) + '15' }]}>
                    <MaterialCommunityIcons name={(item.icon || 'cash') as any} size={24} color={item.color || theme.colors.primary} />
                </View>
                <View style={styles.transactionDetails}>
                    <AppText style={[styles.transactionTitle, { color: theme.colors.text }]}>{item.title}</AppText>
                    <AppText style={[styles.transactionCategory, { color: theme.colors.textMuted }]}>{item.category}</AppText>
                </View>
                <AppText style={[styles.transactionAmount, { color: item.type === 'income' ? theme.colors.success : theme.colors.text }]}>
                    {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                </AppText>
            </TouchableOpacity>
        </Animated.View>
    );

    const renderSectionHeader = ({ section: { title } }: any) => (
        <View style={[styles.sectionHeader, { backgroundColor: theme.colors.background }]}>
            <AppText style={[styles.sectionHeaderText, { color: theme.colors.textMuted }]}>{title}</AppText>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <LoadingOverlay visible={loading} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <AppText style={[styles.headerTitle, { color: theme.colors.text }]}>Expenses</AppText>
                <TouchableOpacity onPress={() => navigation.navigate('ReceiptScanner')} style={styles.iconButton}>
                    <Ionicons name="scan-outline" size={24} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            {/* Summary Card */}
            <View style={styles.summaryContainer}>
                <LinearGradient
                    colors={[theme.colors.prussianBlue, '#0A1128']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.summaryCard}
                >
                    <View style={styles.summaryRow}>
                        <View>
                            <AppText style={styles.summaryLabel}>Total Balance</AppText>
                            <AppText style={styles.summaryAmount}>{formatCurrency(summary.total)}</AppText>
                        </View>
                        <View style={styles.summaryIcon}>
                            <Ionicons name="wallet" size={24} color={theme.colors.primary} />
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statsRow}>
                        <View>
                            <AppText style={styles.statLabel}>Income</AppText>
                            <AppText style={[styles.statValue, { color: '#4ADE80' }]}>+{formatCurrency(summary.income)}</AppText>
                        </View>
                        <View>
                            <AppText style={[styles.statLabel, { textAlign: 'right' }]}>Expense</AppText>
                            <AppText style={[styles.statValue, { color: '#F87171', textAlign: 'right' }]}>-{formatCurrency(summary.expense)}</AppText>
                        </View>
                    </View>
                </LinearGradient>
            </View>

            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: theme.colors.card }]}>
                    <Ionicons name="search" size={20} color={theme.colors.textMuted} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.colors.text }]}
                        placeholder="Search transactions..."
                        placeholderTextColor={theme.colors.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: spacing.lg }}>
                    {(['all', 'income', 'expense'] as const).map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[
                                styles.filterChip,
                                { backgroundColor: filterType === f ? theme.colors.primary : theme.colors.card }
                            ]}
                            onPress={() => setFilterType(f)}
                        >
                            <Text style={[
                                styles.filterText,
                                { color: filterType === f ? '#fff' : theme.colors.textMuted }
                            ]}>
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <SectionList
                sections={groupedTransactions}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                stickySectionHeadersEnabled={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <AppText style={{ color: theme.colors.textMuted }}>No transactions found</AppText>
                    </View>
                }
            />

            {/* FAB */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                onPress={() => openModal()}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>

            {/* Add/Edit Expense Modal */}
            <CustomModal
                visible={isModalVisible}
                onClose={closeModal}
                title={selectedTransaction ? "Edit Transaction" : "Add Transaction"}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    {/* Title Input */}
                    <AppText style={[styles.label, { color: theme.colors.textMuted }]}>Title</AppText>
                    <View style={[styles.inputContainer, { borderColor: theme.colors.border, borderWidth: 1 }]}>
                        <TextInput
                            style={[styles.input, { color: theme.colors.text }]}
                            placeholder="Ex: Coffee, Rent"
                            placeholderTextColor={theme.colors.textMuted}
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    {/* Amount Input */}
                    <AppText style={[styles.label, { color: theme.colors.textMuted }]}>Amount</AppText>
                    <View style={[styles.inputContainer, { borderColor: theme.colors.border, borderWidth: 1 }]}>
                        <TextInput
                            style={[styles.input, { color: theme.colors.text }]}
                            placeholder="Enter amount"
                            placeholderTextColor={theme.colors.textMuted}
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                        />
                    </View>

                    {/* Type Toggle */}
                    <View style={[
                        styles.typeContainer,
                        { backgroundColor: theme.colors.card }
                    ]}>
                        {['expense', 'income'].map((t) => (
                            <TouchableOpacity
                                key={t}
                                style={[
                                    styles.typeButton,
                                    type === t && { backgroundColor: t === 'income' ? theme.colors.success : theme.colors.danger }
                                ]}
                                onPress={() => setType(t as 'income' | 'expense')}
                            >
                                <AppText style={{
                                    color: type === t ? '#fff' : theme.colors.text,
                                    fontWeight: type === t ? '700' : '400'
                                }}>
                                    {t.toUpperCase()}
                                </AppText>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Category Selector */}
                    <AppText style={[styles.label, { color: theme.colors.textMuted }]}>Category</AppText>
                    <View style={styles.categoriesGrid}>
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.categoryItem,
                                    { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
                                    category.id === cat.id && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '10' }
                                ]}
                                onPress={() => setCategory(cat)}
                            >
                                <View style={[styles.categoryIcon, { backgroundColor: cat.color + '20' }]}>
                                    <MaterialCommunityIcons name={cat.icon as any} size={20} color={cat.color} />
                                </View>
                                <AppText style={[
                                    styles.categoryName,
                                    { color: category.id === cat.id ? theme.colors.primary : theme.colors.text }
                                ]}>{cat.name}</AppText>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Date Picker */}
                    <AppText style={[styles.label, { color: theme.colors.textMuted }]}>Date</AppText>
                    <TouchableOpacity
                        onPress={() => setIsCalendarVisible(!isCalendarVisible)}
                        style={[styles.inputContainer, { borderColor: theme.colors.border, borderWidth: 1 }]}
                    >
                        <MaterialCommunityIcons name="calendar" size={20} color={theme.colors.textMuted} />
                        <AppText style={{ marginLeft: 10, color: theme.colors.text }}>
                            {new Date(date).toDateString()}
                        </AppText>
                    </TouchableOpacity>

                    {isCalendarVisible && (
                        <View style={{ marginBottom: 16, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border }}>
                            <Calendar
                                onDayPress={(d: any) => { setDate(d.dateString); setIsCalendarVisible(false); }}
                                markedDates={{ [date]: { selected: true, selectedColor: theme.colors.primary } }}
                                theme={{
                                    backgroundColor: theme.colors.card,
                                    calendarBackground: theme.colors.card,
                                    textSectionTitleColor: theme.colors.textMuted,
                                    selectedDayBackgroundColor: theme.colors.primary,
                                    selectedDayTextColor: '#ffffff',
                                    todayTextColor: theme.colors.primary,
                                    dayTextColor: theme.colors.text,
                                    textDisabledColor: theme.colors.textMuted,
                                    monthTextColor: theme.colors.text,
                                    arrowColor: theme.colors.primary,
                                }}
                            />
                        </View>
                    )}

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
                        onPress={handleSaveTransaction}
                        activeOpacity={0.8}
                    >
                        <AppText style={styles.submitButtonText}>
                            {selectedTransaction ? "Update Transaction" : "Save Transaction"}
                        </AppText>
                    </TouchableOpacity>

                    {/* Delete Button */}
                    {selectedTransaction && (
                        <TouchableOpacity
                            style={[styles.submitButton, { backgroundColor: theme.colors.danger, marginTop: 12 }]}
                            onPress={handleDeleteTransaction}
                            activeOpacity={0.8}
                        >
                            <AppText style={styles.submitButtonText}>Delete Transaction</AppText>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </CustomModal>
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
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    iconButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    summaryContainer: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
    },
    summaryCard: {
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    summaryLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        marginBottom: 4,
    },
    summaryAmount: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '700',
    },
    summaryIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 16,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        marginBottom: 2,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    searchContainer: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.sm,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 48,
        borderRadius: 16,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
    },
    filterContainer: {
        marginBottom: spacing.md,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '500',
    },
    listContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: 100, // Space for FAB
        gap: 12,
    },
    sectionHeader: {
        paddingVertical: 8,
        marginBottom: 4,
    },
    sectionHeaderText: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 8,
    },
    transactionIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    transactionDetails: {
        flex: 1,
    },
    transactionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    transactionCategory: {
        fontSize: 12,
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '700',
    },
    emptyContainer: {
        padding: 24,
        alignItems: 'center',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    // Modal Styles
    typeContainer: {
        flexDirection: 'row',
        marginBottom: 24,
        padding: 4,
        borderRadius: 16,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '600',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 56,
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 1,
    },
    input: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 32,
    },
    categoryItem: {
        width: '30%',
        padding: 12,
        borderRadius: 16,
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
    },
    categoryIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryName: {
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '500',
    },
    submitButton: {
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
