import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeProvider';
import ActionSheet from '../../components/common/ActionSheet';
import { spacing } from '../../theme/spacing';

const { width } = Dimensions.get('window');

const BudgetScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const [monthlyBudget, setMonthlyBudget] = useState('50000');
    const [isModalVisible, setModalVisible] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: '', allocated: '' });

    const [categoriesList, setCategoriesList] = useState([
        {
            id: 1,
            name: 'Food & Dining',
            allocated: 12000,
            spent: 10500,
            icon: 'silverware-fork-knife',
            iconType: 'MaterialCommunityIcons',
            color: '#F59E0B',
            status: 'Approaching Limit',
        },
        {
            id: 2,
            name: 'Transportation',
            allocated: 8000,
            spent: 9200,
            icon: 'car',
            iconType: 'Ionicons',
            color: '#EF4444',
            status: 'Overspent!',
        },
        {
            id: 3,
            name: 'Shopping',
            allocated: 7000,
            spent: 6800,
            icon: 'shopping',
            iconType: 'MaterialCommunityIcons',
            color: '#8B5CF6',
            status: 'Approaching Limit',
        },
        {
            id: 4,
            name: 'Health',
            allocated: 5000,
            spent: 2500,
            icon: 'heart-outline',
            iconType: 'Ionicons',
            color: '#10B981',
            status: null,
        },
        {
            id: 5,
            name: 'Utilities',
            allocated: 6000,
            spent: 5800,
            icon: 'bank',
            iconType: 'MaterialCommunityIcons',
            color: '#3B82F6',
            status: 'Approaching Limit',
        },
    ]);

    const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [
            {
                data: [30000, 35000, 40000, 42000, 45000],
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // White line
                strokeWidth: 3,
            },
            {
                data: [32000, 34000, 38000, 43000, 46000],
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.5})`, // Faded white line
                strokeWidth: 2,
                withDots: false,
                strokeDashArray: [5, 5],
            },
        ],
        legend: ['Actual', 'Forecast'],
    };

    const handleAddCategory = () => {
        if (!newCategory.name || !newCategory.allocated) return;

        const newItem = {
            id: Date.now(),
            name: newCategory.name,
            allocated: parseInt(newCategory.allocated),
            spent: 0,
            icon: 'pricetag-outline',
            iconType: 'Ionicons',
            color: '#6366F1',
            status: null,
        };

        setCategoriesList([...categoriesList, newItem]);
        setModalVisible(false);
        setNewCategory({ name: '', allocated: '' });
    };

    const renderCategoryItem = (item: any) => {
        const percentage = item.allocated > 0 ? Math.min((item.spent / item.allocated) * 100, 100) : 0;
        const isOverspent = item.spent > item.allocated;

        return (
            <View key={item.id} style={[styles.categoryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <View style={styles.categoryHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                        {item.iconType === 'MaterialCommunityIcons' ? (
                            <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
                        ) : (
                            <Ionicons name={item.icon} size={24} color={item.color} />
                        )}
                    </View>
                    <View style={styles.categoryInfo}>
                        <Text style={[styles.categoryName, { color: theme.colors.text }]}>{item.name}</Text>
                        <Text style={[styles.allocatedText, { color: theme.colors.textMuted }]}>
                            Allocated: ₹{item.allocated.toLocaleString()}
                        </Text>
                    </View>
                    <View style={styles.amountInfo}>
                        <Text style={[styles.spentAmount, { color: theme.colors.text }, isOverspent && styles.textRed]}>
                            ₹{item.spent.toLocaleString()}
                        </Text>
                        <Text style={[styles.percentageText, { color: theme.colors.textMuted }]}>{Math.round(percentage)}%</Text>
                    </View>
                </View>

                <View style={[styles.progressBarContainer, { backgroundColor: theme.colors.border }]}>
                    <LinearGradient
                        colors={isOverspent ? ['#EF4444', '#B91C1C'] : [item.color, item.color]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressBarFill, { width: `${percentage}%` }]}
                    />
                </View>

                {item.status && (
                    <View style={[styles.statusTag, { backgroundColor: item.status === 'Overspent!' ? '#FEE2E2' : '#FEF3C7' }]}>
                        <Text style={[styles.statusText, { color: item.status === 'Overspent!' ? '#EF4444' : '#D97706' }]}>
                            {item.status}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Budget & Forecast</Text>
                <TouchableOpacity style={styles.iconButton} onPress={() => setModalVisible(true)}>
                    <Ionicons name="add" size={24} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Main Budget Card */}
                <LinearGradient
                    colors={['#4F46E5', '#7C3AED']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.mainCard}
                >
                    <View style={styles.mainCardHeader}>
                        <Text style={styles.mainCardLabel}>Total Monthly Budget</Text>
                        <TouchableOpacity>
                            <Ionicons name="create-outline" size={20} color="rgba(255,255,255,0.8)" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.mainCardAmount}>₹{parseInt(monthlyBudget).toLocaleString()}</Text>
                    <View style={styles.mainCardFooter}>
                        <View>
                            <Text style={styles.footerLabel}>Spent</Text>
                            <Text style={styles.footerValue}>₹34,800</Text>
                        </View>
                        <View style={styles.divider} />
                        <View>
                            <Text style={styles.footerLabel}>Remaining</Text>
                            <Text style={styles.footerValue}>₹15,200</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Forecast Chart */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Spending Forecast</Text>
                </View>
                <View style={[styles.chartContainer, { backgroundColor: theme.colors.card }]}>
                    <LineChart
                        data={chartData}
                        width={width - 48}
                        height={200}
                        yAxisLabel="₹"
                        yAxisInterval={1}
                        chartConfig={{
                            backgroundColor: theme.colors.card,
                            backgroundGradientFrom: theme.colors.primary,
                            backgroundGradientTo: '#8B5CF6',
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                            style: {
                                borderRadius: 16
                            },
                            propsForDots: {
                                r: "4",
                                strokeWidth: "2",
                                stroke: "#ffa726"
                            },
                            propsForBackgroundLines: {
                                strokeDasharray: '', // solid lines
                                stroke: 'rgba(255,255,255,0.2)'
                            }
                        }}
                        bezier
                        style={{
                            marginVertical: 8,
                            borderRadius: 16
                        }}
                    />
                </View>

                {/* Categories List */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Categories</Text>
                </View>
                <View style={styles.list}>
                    {categoriesList.map(renderCategoryItem)}
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>

            <ActionSheet
                visible={isModalVisible}
                onClose={() => setModalVisible(false)}
                title="Add Budget Category"
                actionLabel="Add Category"
                onAction={handleAddCategory}
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
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    mainCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    mainCardLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '500',
    },
    mainCardAmount: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 24,
    },
    mainCardFooter: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        padding: 12,
        justifyContent: 'space-between',
    },
    footerLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        marginBottom: 2,
    },
    footerValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
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
    categoryCard: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
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
        height: 8,
        borderRadius: 4,
        marginBottom: 12,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    statusTag: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
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
});

export default BudgetScreen;
