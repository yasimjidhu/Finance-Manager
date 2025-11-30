import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeProvider';
import ActionSheet from '../../components/common/ActionSheet';
import { spacing } from '../../theme/spacing';

const { width } = Dimensions.get('window');

const UpiSpendScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const [isModalVisible, setModalVisible] = useState(false);
    const [newTransaction, setNewTransaction] = useState({ category: '', description: '', amount: '' });

    const [transactionsList, setTransactionsList] = useState([
        {
            id: 1,
            category: 'Food & Dining',
            description: 'Dinner at The Spice Route',
            amount: 1250,
            date: '22 May',
            icon: 'silverware-fork-knife',
            iconType: 'MaterialCommunityIcons',
            color: '#F59E0B',
        },
        {
            id: 2,
            category: 'Travel',
            description: 'Ola Ride to Airport',
            amount: 450,
            date: '21 May',
            icon: 'car',
            iconType: 'Ionicons',
            color: '#EF4444',
        },
        {
            id: 3,
            category: 'Shopping',
            description: 'Amazon: New Headphones',
            amount: 3200,
            date: '20 May',
            icon: 'shopping-bag',
            iconType: 'MaterialCommunityIcons',
            color: '#8B5CF6',
        },
        {
            id: 4,
            category: 'Utilities',
            description: 'Electricity Bill Payment',
            amount: 1800,
            date: '19 May',
            icon: 'bank',
            iconType: 'MaterialCommunityIcons',
            color: '#3B82F6',
        },
        {
            id: 5,
            category: 'Entertainment',
            description: 'Netflix Subscription',
            amount: 799,
            date: '18 May',
            icon: 'coffee',
            iconType: 'MaterialCommunityIcons',
            color: '#10B981',
        },
        {
            id: 6,
            category: 'Food & Dining',
            description: 'Lunch at Cafe Bistro',
            amount: 600,
            date: '17 May',
            icon: 'silverware-fork-knife',
            iconType: 'MaterialCommunityIcons',
            color: '#F59E0B',
        },
    ]);

    const pieData = [
        {
            name: 'Food',
            population: 25,
            color: '#F59E0B',
            legendFontColor: theme.colors.textMuted,
            legendFontSize: 12,
        },
        {
            name: 'Travel',
            population: 15,
            color: '#EF4444',
            legendFontColor: theme.colors.textMuted,
            legendFontSize: 12,
        },
        {
            name: 'Shop',
            population: 20,
            color: '#8B5CF6',
            legendFontColor: theme.colors.textMuted,
            legendFontSize: 12,
        },
        {
            name: 'Bills',
            population: 10,
            color: '#3B82F6',
            legendFontColor: theme.colors.textMuted,
            legendFontSize: 12,
        },
        {
            name: 'Fun',
            population: 20,
            color: '#10B981',
            legendFontColor: theme.colors.textMuted,
            legendFontSize: 12,
        },
        {
            name: 'Health',
            population: 10,
            color: '#6366F1',
            legendFontColor: theme.colors.textMuted,
            legendFontSize: 12,
        },
    ];

    const barData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [
            {
                data: [24000, 20000, 28000, 26000, 30000],
            },
        ],
    };

    const handleAddTransaction = () => {
        if (!newTransaction.category || !newTransaction.description || !newTransaction.amount) return;

        const newItem = {
            id: Date.now(),
            category: newTransaction.category,
            description: newTransaction.description,
            amount: parseInt(newTransaction.amount),
            date: 'Today',
            icon: 'cash-outline',
            iconType: 'Ionicons',
            color: '#6366F1',
        };

        setTransactionsList([newItem, ...transactionsList]);
        setModalVisible(false);
        setNewTransaction({ category: '', description: '', amount: '' });
    };

    const renderTransactionItem = (item: any) => (
        <View key={item.id} style={[styles.transactionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={[styles.iconContainer, { backgroundColor: (item.color || theme.colors.primary) + '20' }]}>
                {item.iconType === 'MaterialCommunityIcons' ? (
                    <MaterialCommunityIcons name={item.icon} size={24} color={item.color || theme.colors.primary} />
                ) : (
                    <Ionicons name={item.icon} size={24} color={item.color || theme.colors.primary} />
                )}
            </View>
            <View style={styles.transactionInfo}>
                <Text style={[styles.transactionCategory, { color: theme.colors.text }]}>{item.category}</Text>
                <Text style={[styles.transactionDesc, { color: theme.colors.textMuted }]}>{item.description}</Text>
            </View>
            <View style={styles.transactionAmountInfo}>
                <Text style={[styles.transactionAmount, { color: theme.colors.text }]}>₹{item.amount}</Text>
                <Text style={[styles.transactionDate, { color: theme.colors.textMuted }]}>{item.date}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>UPI Spend Summary</Text>
                <TouchableOpacity style={styles.iconButton} onPress={() => setModalVisible(true)}>
                    <Ionicons name="add" size={24} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Total UPI Spend Card */}
                <LinearGradient
                    colors={['#EC4899', '#8B5CF6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.mainCard}
                >
                    <Text style={styles.mainCardLabel}>Total UPI Spend</Text>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalAmount}>₹26,350.00</Text>
                        <TouchableOpacity style={styles.viewDetailsBtn}>
                            <Text style={styles.viewDetailsText}>View Details</Text>
                            <Ionicons name="chevron-forward" size={14} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.sinceText}>Since 1 May</Text>
                </LinearGradient>

                {/* Spending Categories Chart */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Spending Categories</Text>
                </View>
                <View style={[styles.chartContainer, { backgroundColor: theme.colors.card }]}>
                    <PieChart
                        data={pieData}
                        width={width - 48}
                        height={200}
                        chartConfig={{
                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        }}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        center={[0, 0]}
                        absolute={false}
                    />
                </View>

                {/* Monthly Spend Trends Chart */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Monthly Spend Trends</Text>
                </View>
                <View style={[styles.chartContainer, { backgroundColor: theme.colors.card }]}>
                    <BarChart
                        data={barData}
                        width={width - 48}
                        height={220}
                        yAxisLabel="₹"
                        yAxisSuffix="k"
                        chartConfig={{
                            backgroundColor: theme.colors.card,
                            backgroundGradientFrom: theme.colors.card,
                            backgroundGradientTo: theme.colors.card,
                            decimalPlaces: 0,
                            color: (opacity = 1) => theme.colors.primary,
                            labelColor: (opacity = 1) => theme.colors.textMuted,
                            barPercentage: 0.7,
                            propsForBackgroundLines: {
                                strokeDasharray: '',
                                stroke: theme.colors.border,
                            }
                        }}
                        style={{
                            marginVertical: 8,
                            borderRadius: 16,
                        }}
                        fromZero
                    />
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Transactions</Text>
                </View>
                <View style={styles.list}>
                    {transactionsList.map(renderTransactionItem)}
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>

            <ActionSheet
                visible={isModalVisible}
                onClose={() => setModalVisible(false)}
                title="Add Transaction"
                actionLabel="Add Transaction"
                onAction={handleAddTransaction}
            >
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>Category</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                        placeholder="e.g. Food"
                        placeholderTextColor={theme.colors.textMuted}
                        value={newTransaction.category}
                        onChangeText={(text) => setNewTransaction({ ...newTransaction, category: text })}
                    />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>Description</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                        placeholder="e.g. Lunch"
                        placeholderTextColor={theme.colors.textMuted}
                        value={newTransaction.description}
                        onChangeText={(text) => setNewTransaction({ ...newTransaction, description: text })}
                    />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>Amount (₹)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                        placeholder="e.g. 500"
                        placeholderTextColor={theme.colors.textMuted}
                        keyboardType="numeric"
                        value={newTransaction.amount}
                        onChangeText={(text) => setNewTransaction({ ...newTransaction, amount: text })}
                    />
                </View>
            </ActionSheet>
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
    iconButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    scrollContent: {
        paddingBottom: spacing.xl,
    },
    mainCard: {
        marginHorizontal: spacing.lg,
        borderRadius: 24,
        padding: 24,
        marginBottom: spacing.xl,
        shadowColor: '#EC4899',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    mainCardLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    totalAmount: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '700',
    },
    viewDetailsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    viewDetailsText: {
        fontSize: 12,
        color: '#fff',
        marginRight: 4,
        fontWeight: '600',
    },
    sinceText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
    },
    sectionHeader: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    chartContainer: {
        marginHorizontal: spacing.lg,
        borderRadius: 24,
        padding: 16,
        marginBottom: spacing.xl,
        alignItems: 'center',
    },
    list: {
        paddingHorizontal: spacing.lg,
        gap: 12,
    },
    transactionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    transactionInfo: {
        flex: 1,
    },
    transactionCategory: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    transactionDesc: {
        fontSize: 12,
    },
    transactionAmountInfo: {
        alignItems: 'flex-end',
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    transactionDate: {
        fontSize: 12,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
    },
});

export default UpiSpendScreen;
