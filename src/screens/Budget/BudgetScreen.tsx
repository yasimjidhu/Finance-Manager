import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Dimensions,
    Alert,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeProvider';
import ActionSheet from '../../components/common/ActionSheet';
import { spacing } from '../../theme/spacing';
import { BudgetService, BudgetCategory } from '../../services/budget.service';
import { formatCurrency } from '../../utils/helpers';

import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import LoadingOverlay from '../../components/common/LoadingOverlay';

import { useAlert } from '../../context/AlertContext';

const { width } = Dimensions.get('window');

const BudgetScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const { showAlert } = useAlert();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [budgetData, setBudgetData] = useState({
        totalBudget: 0,
        totalSpent: 0,
        remaining: 0,
        categories: [] as (BudgetCategory & { spent: number; status: string | null })[]
    });

    const [isModalVisible, setModalVisible] = useState(false);
    const [isEditBudgetVisible, setEditBudgetVisible] = useState(false);
    const [newCategory, setNewCategory] = useState({
        name: '',
        allocated: '',
        icon: 'pricetag-outline',
        color: '#FCA311'
    });
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [newTotalBudget, setNewTotalBudget] = useState('');
    const [forecast, setForecast] = useState({ projected: 0, status: 'On Track', dailyAverage: 0 });

    const AVAILABLE_ICONS = ['pricetag-outline', 'cart-outline', 'restaurant-outline', 'car-outline', 'home-outline', 'medical-outline', 'school-outline', 'airplane-outline', 'game-controller-outline', 'gift-outline', 'fitness-outline', 'paw-outline'];
    const AVAILABLE_COLORS = ['#FCA311', '#8B5CF6', '#EC4899', '#10B981', '#3B82F6', '#EF4444', '#6366F1', '#F472B6', '#14B8A6'];

    const [chartData, setChartData] = useState({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                data: [0, 0, 0, 0, 0, 0],
                color: (opacity = 1) => theme.colors.primary,
                strokeWidth: 3,
            },
            {
                data: [0, 0, 0, 0, 0, 0],
                color: (opacity = 1) => `rgba(252, 163, 17, ${opacity * 0.5})`,
                strokeWidth: 2,
                withDots: false,
                strokeDashArray: [5, 5],
            },
        ],
        legend: ['Actual', 'Budget Limit'],
    });

    const processChartData = (transactions: any[], totalBudget: number) => {
        const months = [];
        const spendingData = [];
        const budgetData = [];

        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = d.toLocaleString('default', { month: 'short' });
            months.push(monthName);

            // Filter transactions for this month
            const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
            const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0);

            const monthlySpent = transactions
                .filter(t => {
                    const tDate = new Date(t.date);
                    return t.type === 'expense' && tDate >= startOfMonth && tDate <= endOfMonth;
                })
                .reduce((sum, t) => sum + t.amount, 0);

            spendingData.push(monthlySpent);
            budgetData.push(totalBudget);
        }

        setChartData({
            labels: months,
            datasets: [
                {
                    data: spendingData,
                    color: (opacity = 1) => theme.colors.primary,
                    strokeWidth: 3,
                },
                {
                    data: budgetData,
                    color: (opacity = 1) => `rgba(252, 163, 17, ${opacity * 0.5})`,
                    strokeWidth: 2,
                    withDots: false,
                    strokeDashArray: [5, 5],
                },
            ],
            legend: ['Actual', 'Budget Limit'],
        });
    };

    const loadData = async () => {
        const data = await BudgetService.getBudgetStatus();
        setBudgetData(data);
        setNewTotalBudget(data.totalBudget.toString());

        // Process chart data
        const allTransactions = await import('../../services/expense.service').then(m => m.ExpenseService.getAllTransactions());
        processChartData(allTransactions, data.totalBudget);

        const forecastData = await BudgetService.getForecast();
        setForecast(forecastData);

        setLoading(false);
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

    const handleSaveCategory = async () => {
        if (!newCategory.name || !newCategory.allocated) {
            showAlert({
                title: 'Error',
                message: 'Please fill all fields',
                type: 'error'
            });
            return;
        }

        if (editingCategory) {
            await BudgetService.updateBudgetCategory(editingCategory.id, {
                name: newCategory.name,
                allocated: parseInt(newCategory.allocated),
                icon: newCategory.icon,
                iconType: 'Ionicons',
                color: newCategory.color
            });
        } else {
            await BudgetService.addBudgetCategory({
                name: newCategory.name,
                allocated: parseInt(newCategory.allocated),
                icon: newCategory.icon,
                iconType: 'Ionicons',
                color: newCategory.color
            });
        }

        setModalVisible(false);
        setEditingCategory(null);
        setNewCategory({ name: '', allocated: '', icon: 'pricetag-outline', color: '#FCA311' });
        loadData();
    };

    const handleEditPress = (category: any) => {
        setEditingCategory(category);
        setNewCategory({
            name: category.name,
            allocated: category.allocated.toString(),
            icon: category.icon || 'pricetag-outline',
            color: category.color || '#FCA311'
        });
        setModalVisible(true);
    };

    const handleDeleteCategory = async () => {
        if (!editingCategory) return;

        Alert.alert(
            'Delete Category',
            `Are you sure you want to delete ${editingCategory.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await BudgetService.deleteBudgetCategory(editingCategory.id);
                        setModalVisible(false);
                        setEditingCategory(null);
                        setNewCategory({ name: '', allocated: '', icon: 'pricetag-outline', color: '#FCA311' });
                        loadData();
                    }
                }
            ]
        );
    };

    const handleUpdateTotalBudget = async () => {
        if (!newTotalBudget) return;
        await BudgetService.setTotalBudget(parseInt(newTotalBudget));
        setEditBudgetVisible(false);
        loadData();
    };

    const renderCategoryItem = (item: any, index: number) => {
        const percentage = item.allocated > 0 ? Math.min((item.spent / item.allocated) * 100, 100) : 0;
        const isOverspent = item.spent > item.allocated;

        return (
            <Animated.View key={item.id} entering={FadeInDown.delay(400 + (index * 50)).duration(600).springify()}>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleEditPress(item)}
                    style={[styles.categoryCard, { backgroundColor: theme.colors.card, shadowColor: theme.colors.text }]}
                >
                    <View style={styles.categoryHeader}>
                        <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
                            {item.iconType === 'MaterialCommunityIcons' ? (
                                <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
                            ) : (
                                <Ionicons name={item.icon} size={24} color={item.color} />
                            )}
                        </View>
                        <View style={styles.categoryInfo}>
                            <Text style={[styles.categoryName, { color: theme.colors.text }]}>{item.name}</Text>
                            <Text style={[styles.allocatedText, { color: theme.colors.textMuted }]}>
                                Allocated: {formatCurrency(item.allocated)}
                            </Text>
                        </View>
                        <View style={styles.amountInfo}>
                            <Text style={[styles.spentAmount, { color: theme.colors.text }, isOverspent && styles.textRed]}>
                                {formatCurrency(item.spent)}
                            </Text>
                            <Text style={[styles.percentageText, { color: theme.colors.textMuted }]}>{Math.round(percentage)}%</Text>
                        </View>
                    </View>

                    <View style={[styles.progressBarContainer, { backgroundColor: theme.colors.surface }]}>
                        <LinearGradient
                            colors={isOverspent ? ['#EF4444', '#B91C1C'] : [item.color, item.color]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.progressBarFill, { width: `${percentage}%` }]}
                        />
                    </View>

                    {item.status && (
                        <View style={[styles.statusTag, { backgroundColor: item.status === 'Overspent!' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)' }]}>
                            <Text style={[styles.statusText, { color: item.status === 'Overspent!' ? '#EF4444' : '#F59E0B' }]}>
                                {item.status}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <LoadingOverlay visible={loading} />
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Budget & Forecast</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                        setEditingCategory(null);
                        setNewCategory({ name: '', allocated: '', icon: 'pricetag-outline', color: '#FCA311' });
                        setModalVisible(true);
                    }}
                >
                    <Ionicons name="add" size={24} color={theme.colors.white} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
            >
                {/* Premium Main Budget Card */}
                <Animated.View entering={ZoomIn.duration(600).springify()}>
                    <LinearGradient
                        colors={[theme.colors.prussianBlue, '#0A1128']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.mainCard}
                    >
                        <View style={styles.mainCardHeader}>
                            <View style={styles.mainCardIconBox}>
                                <Ionicons name="wallet" size={20} color={theme.colors.primary} />
                            </View>
                            <Text style={styles.mainCardLabel}>Total Monthly Budget</Text>
                            <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={() => setEditBudgetVisible(true)}>
                                <Ionicons name="create-outline" size={20} color="rgba(255,255,255,0.6)" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.mainCardAmount}>{formatCurrency(budgetData.totalBudget)}</Text>
                        <View style={styles.mainCardFooter}>
                            <View>
                                <Text style={styles.footerLabel}>Spent</Text>
                                <Text style={styles.footerValue}>{formatCurrency(budgetData.totalSpent)}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View>
                                <Text style={styles.footerLabel}>Remaining</Text>
                                <Text style={[styles.footerValue, { color: theme.colors.primary }]}>{formatCurrency(budgetData.remaining)}</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Forecast Summary Card */}
                <Animated.View entering={FadeInDown.delay(100).duration(600).springify()}>
                    <LinearGradient
                        colors={[theme.colors.card, theme.colors.card]}
                        style={[styles.forecastCard, { shadowColor: theme.colors.text }]}
                    >
                        <View style={styles.forecastHeader}>
                            <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)', width: 40, height: 40 }]}>
                                <Ionicons name="analytics" size={20} color="#10B981" />
                            </View>
                            <View>
                                <Text style={[styles.forecastTitle, { color: theme.colors.text }]}>End of Month Projection</Text>
                                <Text style={[styles.forecastSubtitle, { color: theme.colors.textMuted }]}>Based on daily spending of {formatCurrency(forecast.dailyAverage)}</Text>
                            </View>
                        </View>
                        <View style={styles.forecastBody}>
                            <Text style={[styles.forecastAmount, { color: theme.colors.text }]}>
                                {formatCurrency(forecast.projected)}
                            </Text>
                            <View style={[styles.statusBadge, {
                                backgroundColor: forecast.status === 'Over Budget' ? 'rgba(239, 68, 68, 0.1)' :
                                    forecast.status === 'At Risk' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)'
                            }]}>
                                <Text style={[styles.statusText, {
                                    color: forecast.status === 'Over Budget' ? '#EF4444' :
                                        forecast.status === 'At Risk' ? '#F59E0B' : '#10B981'
                                }]}>
                                    {forecast.status}
                                </Text>
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Forecast Chart */}
                <Animated.View entering={FadeInDown.delay(200).duration(600).springify()}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Spending Forecast</Text>
                    </View>
                    <View style={[styles.chartContainer, { backgroundColor: theme.colors.card, shadowColor: theme.colors.text }]}>
                        <LineChart
                            data={chartData}
                            width={width - 48}
                            height={200}
                            yAxisLabel="₹"
                            yAxisInterval={1}
                            chartConfig={{
                                backgroundColor: theme.colors.card,
                                backgroundGradientFrom: theme.colors.card,
                                backgroundGradientTo: theme.colors.card,
                                decimalPlaces: 0,
                                color: (opacity = 1) => theme.colors.textMuted,
                                labelColor: (opacity = 1) => theme.colors.textMuted,
                                style: {
                                    borderRadius: 16
                                },
                                propsForDots: {
                                    r: "4",
                                    strokeWidth: "2",
                                    stroke: theme.colors.primary
                                },
                                propsForBackgroundLines: {
                                    strokeDasharray: '', // solid lines
                                    stroke: 'rgba(0,0,0,0.05)'
                                }
                            }}
                            bezier
                            style={{
                                marginVertical: 8,
                                borderRadius: 16
                            }}
                        />
                    </View>
                </Animated.View>

                {/* Categories List */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Categories</Text>
                </View>
                <View style={styles.list}>
                    {budgetData.categories.map((item, index) => renderCategoryItem(item, index))}
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>

            {/* Add Category Modal */}
            <ActionSheet
                visible={isModalVisible}
                onClose={() => setModalVisible(false)}
                title={editingCategory ? "Edit Category" : "Add Budget Category"}
                actionLabel={editingCategory ? "Save Changes" : "Add Category"}
                onAction={handleSaveCategory}
                secondaryActionLabel={editingCategory ? "Delete Category" : undefined}
                onSecondaryAction={editingCategory ? handleDeleteCategory : undefined}
                secondaryActionDestructive
            >
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>Category Name</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                        placeholder="e.g. Entertainment"
                        placeholderTextColor={theme.colors.textMuted}
                        value={newCategory.name}
                        onChangeText={(text) => setNewCategory({ ...newCategory, name: text })}
                    />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>Allocated Amount (₹)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                        placeholder="e.g. 5000"
                        placeholderTextColor={theme.colors.textMuted}
                        keyboardType="numeric"
                        value={newCategory.allocated}
                        onChangeText={(text) => setNewCategory({ ...newCategory, allocated: text })}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>Icon</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.iconSelector}>
                        {AVAILABLE_ICONS.map(icon => (
                            <TouchableOpacity
                                key={icon}
                                style={[
                                    styles.iconOption,
                                    newCategory.icon === icon && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                                ]}
                                onPress={() => setNewCategory({ ...newCategory, icon })}
                            >
                                <Ionicons name={icon as any} size={24} color={newCategory.icon === icon ? '#FFF' : theme.colors.textMuted} />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>Color</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorSelector}>
                        {AVAILABLE_COLORS.map(color => (
                            <TouchableOpacity
                                key={color}
                                style={[
                                    styles.colorOption,
                                    { backgroundColor: color },
                                    newCategory.color === color && styles.selectedColorOption
                                ]}
                                onPress={() => setNewCategory({ ...newCategory, color })}
                            >
                                {newCategory.color === color && <Ionicons name="checkmark" size={16} color="#FFF" />}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </ActionSheet>

            {/* Edit Total Budget Modal */}
            <ActionSheet
                visible={isEditBudgetVisible}
                onClose={() => setEditBudgetVisible(false)}
                title="Set Monthly Budget"
                actionLabel="Update Budget"
                onAction={handleUpdateTotalBudget}
            >
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>Total Budget Amount (₹)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                        placeholder="e.g. 50000"
                        placeholderTextColor={theme.colors.textMuted}
                        keyboardType="numeric"
                        value={newTotalBudget}
                        onChangeText={setNewTotalBudget}
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
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FCA311', // Orange
        justifyContent: 'center',
        alignItems: 'center',
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
        shadowColor: '#14213D',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    mainCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    mainCardIconBox: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    mainCardLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '500',
    },
    mainCardAmount: {
        color: '#fff',
        fontSize: 36,
        fontWeight: '700',
        marginBottom: 24,
        letterSpacing: 0.5,
    },
    mainCardFooter: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    footerLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        marginBottom: 4,
    },
    footerValue: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    divider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
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
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    list: {
        paddingHorizontal: spacing.lg,
        gap: 12,
    },
    categoryCard: {
        borderRadius: 16,
        padding: 16,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    categoryInfo: {
        flex: 1,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    allocatedText: {
        fontSize: 12,
    },
    amountInfo: {
        alignItems: 'flex-end',
    },
    spentAmount: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    textRed: {
        color: '#EF4444',
    },
    percentageText: {
        fontSize: 12,
    },
    progressBarContainer: {
        height: 6,
        borderRadius: 3,
        marginBottom: 12,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    statusTag: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
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
    forecastCard: {
        marginHorizontal: spacing.lg,
        borderRadius: 20,
        padding: 20,
        marginBottom: spacing.xl,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    forecastHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    forecastTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    forecastSubtitle: {
        fontSize: 12,
    },
    forecastBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    forecastAmount: {
        fontSize: 24,
        fontWeight: '700',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    iconSelector: {
        gap: 12,
        paddingVertical: 4,
    },
    iconOption: {
        width: 48,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorSelector: {
        gap: 12,
        paddingVertical: 4,
    },
    colorOption: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedColorOption: {
        borderWidth: 3,
        borderColor: '#FFF',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});

export default BudgetScreen;
