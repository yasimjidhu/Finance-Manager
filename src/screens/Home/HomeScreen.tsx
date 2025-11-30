import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useNavigation, DrawerActions, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import { ExpenseService, Transaction } from '../../services/expense.service';
import { formatCurrency } from '../../utils/helpers';

import { useAlert } from '../../context/AlertContext';
import { handleError } from '../../utils/errorHandler';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { showAlert } = useAlert();
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState({ income: 0, expense: 0, total: 0 });

  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  const loadData = async () => {
    try {
      const allTransactions = await ExpenseService.getAllTransactions();
      // Sort by date desc
      const sorted = [...allTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(sorted.slice(0, 5)); // Top 5 recent

      const bal = await ExpenseService.getBalance();
      setBalance(bal);
    } catch (error) {
      const { title, message } = handleError(error);
      showAlert({ title, message, type: 'error' });
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [500, 1200, 800, 400, 2000, 1500, 3000], // Mocked for now
        color: (opacity = 1) => theme.colors.primary,
        strokeWidth: 3
      },
      {
        data: [600, 1100, 900, 500, 1800, 1600, 2800], // Mocked for now
        color: (opacity = 1) => `rgba(252, 163, 17, ${opacity * 0.3})`,
        strokeWidth: 2,
        withDots: false,
        strokeDashArray: [5, 5],
      }
    ]
  };

  const QuickAction = ({ icon, label, onPress, color }: any) => (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.actionIcon, { backgroundColor: color + '15' }]}>
        <MaterialCommunityIcons name={icon} size={28} color={color} />
      </View>
      <Text style={[styles.actionLabel, { color: theme.colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} style={styles.menuButton}>
            <Ionicons name="menu" size={28} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.greeting, { color: theme.colors.textMuted }]}>Good Morning,</Text>
            <Text style={[styles.username, { color: theme.colors.text }]}>Dirsh!</Text>
          </View>
          <TouchableOpacity
            style={[styles.profileBtn, { borderColor: theme.colors.border }]}
            onPress={() => navigation.navigate('Account')}
          >
            <Image
              source={{ uri: 'https://ui-avatars.com/api/?name=Dirsh&background=0A1128&color=fff' }}
              style={styles.profileImg}
            />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Premium Balance Card */}
        <Animated.View entering={FadeInDown.duration(600).springify()}>
          <LinearGradient
            colors={[theme.colors.prussianBlue, '#0A1128']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            <View style={styles.cardHeader}>
              <View style={styles.walletIconBox}>
                <Ionicons name="wallet" size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.balanceLabel}>Total Balance</Text>
              <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={toggleBalanceVisibility}>
                <Ionicons name={isBalanceVisible ? "eye-outline" : "eye-off-outline"} size={24} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            </View>
            <Text style={styles.balanceAmount}>
              {isBalanceVisible ? formatCurrency(balance.total) : '••••••'}
            </Text>
            <View style={styles.incomeExpenseContainer}>
              <View style={styles.ieRow}>
                <View style={[styles.ieIcon, { backgroundColor: 'rgba(74, 222, 128, 0.2)' }]}>
                  <Ionicons name="arrow-down" size={16} color="#4ADE80" />
                </View>
                <View>
                  <Text style={styles.ieLabel}>Income</Text>
                  <Text style={styles.ieValue}>
                    {isBalanceVisible ? formatCurrency(balance.income) : '••••'}
                  </Text>
                </View>
              </View>
              <View style={styles.verticalDivider} />
              <View style={styles.ieRow}>
                <View style={[styles.ieIcon, { backgroundColor: 'rgba(248, 113, 113, 0.2)' }]}>
                  <Ionicons name="arrow-up" size={16} color="#F87171" />
                </View>
                <View>
                  <Text style={styles.ieLabel}>Expense</Text>
                  <Text style={styles.ieValue}>
                    {isBalanceVisible ? formatCurrency(balance.expense) : '••••'}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(200).duration(600).springify()} style={styles.actionsContainer}>
          <QuickAction icon="send" label="Send" color="#6366F1" onPress={() => navigation.navigate('SendMoney')} />
          <QuickAction icon="camera-outline" label="Scan Receipt" color="#EC4899" onPress={() => navigation.navigate('ReceiptScanner')} />
          <QuickAction icon="chart-pie" label="Budget" color="#F59E0B" onPress={() => navigation.navigate('Budget')} />
          <QuickAction icon="robot" label="AI Advisor" color="#10B981" onPress={() => navigation.navigate('AIAdvisor')} />
        </Animated.View>

        {/* Spending Insight Chart */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Spending Overview</Text>
          <TouchableOpacity>
            <Text style={[styles.seeAll, { color: theme.colors.primary }]}>This Week</Text>
          </TouchableOpacity>
        </View>

        <Animated.View entering={FadeInDown.delay(400).duration(600).springify()} style={[styles.chartContainer, { backgroundColor: theme.colors.card, shadowColor: theme.colors.text }]}>
          <LineChart
            data={chartData}
            width={width - 48}
            height={180}
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
        </Animated.View>

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AllTransactions')}>
            <Text style={[styles.seeAll, { color: theme.colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsList}>
          {transactions.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInDown.delay(600 + (index * 100)).duration(500).springify()}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.transactionItem, { backgroundColor: theme.colors.card, shadowColor: theme.colors.text }]}
              >
                <View style={[styles.transactionIcon, { backgroundColor: (item.color || theme.colors.primary) + '15' }]}>
                  <MaterialCommunityIcons name={(item.icon || 'cash') as any} size={24} color={item.color || theme.colors.primary} />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={[styles.transactionTitle, { color: theme.colors.text }]}>{item.title}</Text>
                  <Text style={[styles.transactionDate, { color: theme.colors.textMuted }]}>{formatDate(item.date)}</Text>
                </View>
                <Text style={[styles.transactionAmount, { color: item.type === 'income' ? '#10B981' : theme.colors.text }]}>
                  {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  menuButton: {
    padding: 4,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
  },
  username: {
    fontSize: 20,
    fontWeight: '700',
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    padding: 2,
    position: 'relative',
  },
  profileImg: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#fff',
  },
  balanceCard: {
    marginHorizontal: spacing.lg,
    borderRadius: 24,
    padding: 24,
    marginTop: spacing.sm,
    shadowColor: '#14213D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  incomeExpenseContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  ieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    justifyContent: 'center',
  },
  verticalDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 10,
  },
  ieIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ieLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginBottom: 2,
  },
  ieValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartContainer: {
    marginHorizontal: spacing.lg,
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  transactionsList: {
    paddingHorizontal: spacing.lg,
    gap: 12,
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
  transactionDate: {
    fontSize: 12,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default HomeScreen;
