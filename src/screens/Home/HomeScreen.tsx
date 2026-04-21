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
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation, DrawerActions, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import { ExpenseService, Transaction } from '../../services/expense.service';
import { EMIService, EMI } from '../../services/emi.service';
import { KuriService } from '../../services/kuri.service';
import { GoalService } from '../../services/goal.service';
import { formatCurrency } from '../../utils/helpers';
import { useAlert } from '../../context/AlertContext';
import { handleError } from '../../utils/errorHandler';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const GlassCard = ({ children, style, intensity = 20 }: any) => {
  const { isDark } = useTheme();

  if (Platform.OS === 'android') {
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

const HomeScreen = ({ navigation }: any) => {
  const { theme, isDark } = useTheme();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState({ income: 0, expense: 0, total: 0 });
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  // Dashboard Insights State
  const [upcomingEMI, setUpcomingEMI] = useState<EMI | null>(null);
  const [kuriSummary, setKuriSummary] = useState<{ balance: number, nextDue: string | null }>({ balance: 0, nextDue: null });
  const [totalSavings, setTotalSavings] = useState(0);

  const [chartData, setChartData] = useState({
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0, 0],
        color: (opacity = 1) => theme.colors.primary,
        strokeWidth: 3
      },
      {
        data: [0, 0, 0, 0, 0, 0, 0],
        color: (opacity = 1) => `rgba(212, 175, 55, ${opacity})`, // Goldish
        strokeWidth: 2,
        withDots: false,
      }
    ]
  });

  const processChartData = (transactions: Transaction[]) => {
    const today = new Date();
    const currentDay = today.getDay();
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const incomeData = new Array(7).fill(0);
    const expenseData = new Array(7).fill(0);

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (tDate >= monday) {
        const dayIndex = tDate.getDay();
        const mapIndex = dayIndex === 0 ? 6 : dayIndex - 1;

        if (mapIndex >= 0 && mapIndex < 7) {
          // Simple accumulation
          if (t.type === 'income') {
            incomeData[mapIndex] += Number(t.amount);
          } else {
            expenseData[mapIndex] += Number(t.amount);
          }
        }
      }
    });

    setChartData({
      labels: ["M", "T", "W", "T", "F", "S", "S"],
      datasets: [
        {
          data: incomeData,
          color: (opacity = 1) => theme.colors.success,
          strokeWidth: 3
        },
        {
          data: expenseData,
          color: (opacity = 1) => theme.colors.danger,
          strokeWidth: 2,
          withDots: false,
        }
      ]
    });
  };

  const loadData = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);

      const allTransactions = await ExpenseService.getAllTransactions();
      const sorted = [...allTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(sorted);
      processChartData(allTransactions);

      const bal = await ExpenseService.getBalance();
      setBalance(bal);

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

      const kuris = await KuriService.getAllKuris();
      const activeKuris = kuris.filter(k => k.status === 'Active');
      const kuriBalance = activeKuris.reduce((sum, k) => sum + (k.monthsPaid * k.installmentAmount), 0);
      let nextKuriDue = null;
      if (activeKuris.length > 0) {
        activeKuris.sort((a, b) => new Date(a.nextInstallmentDate).getTime() - new Date(b.nextInstallmentDate).getTime());
        nextKuriDue = activeKuris[0].nextInstallmentDate;
      }
      setKuriSummary({ balance: kuriBalance, nextDue: nextKuriDue });

      const goals = await GoalService.getGoals();
      const saved = goals.reduce((sum, goal) => sum + goal.saved_amount, 0);
      setTotalSavings(saved);

    } catch (error) {
      const { title, message } = handleError(error);
      showAlert({ title, message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadData(true);
    setRefreshing(false);
  }, []);

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

  const QuickAction = ({ icon, label, onPress, color, bg }: any) => (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.7}>
      <View
        style={[styles.actionIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff', borderColor: theme.colors.border, borderWidth: 1 }]}
      >
        <MaterialCommunityIcons name={icon} size={24} color={color || theme.colors.primary} />
      </View>
      <Text style={[styles.actionLabel, { color: theme.colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );

  const InsightCard = ({ title, value, subtitle, icon, color, onPress }: any) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={styles.insightCard}
    >
      <GlassCard style={styles.insightCardContent} intensity={15}>
        <View style={[styles.insightIconBox, { backgroundColor: color + '15' }]}>
          <MaterialCommunityIcons name={icon} size={22} color={color} />
        </View>
        <View style={styles.insightContent}>
          <Text style={[styles.insightTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
          <Text style={[styles.insightValue, { color: theme.colors.text }]}>{value}</Text>
          {subtitle && <Text style={[styles.insightSubtitle, { color: theme.colors.textMuted }]}>{subtitle}</Text>}
        </View>
      </GlassCard>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      <LinearGradient
        colors={isDark ? [theme.colors.background, '#0F172A'] : [theme.colors.background, '#E2E8F0']}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <LoadingOverlay visible={loading} />

        {/* Header Section */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            style={[styles.menuButton, { borderColor: theme.colors.border }]}
          >
            <Ionicons name="menu" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.welcomeContainer}>
            <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>Welcome back,</Text>
            <Text style={[styles.username, { color: theme.colors.text }]}>Dirsh</Text>
          </View>

          <TouchableOpacity
            style={[styles.profileBtn, { borderColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('Account')}
          >
            <Ionicons name="person" size={18} color={theme.colors.primary} />
          </TouchableOpacity>
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
          contentContainerStyle={styles.scrollContent}
        >

          {/* Premium Balance Card */}
          <Animated.View entering={ZoomIn.delay(100).duration(600).springify()} style={styles.balanceCardContainer}>
            <LinearGradient
              colors={isDark ? ['#1e1b4b', '#312e81', '#4338ca'] : ['#0F172A', '#1E293B', '#334155']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.balanceCard}
            >
              <View style={styles.cardPattern} />
              <View style={styles.cardHeader}>
                <View style={styles.walletTag}>
                  <Ionicons name="card-outline" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.walletTagText}>Main Wallet</Text>
                </View>
                <TouchableOpacity onPress={toggleBalanceVisibility} style={styles.eyeButton}>
                  <Ionicons
                    name={isBalanceVisible ? "eye-outline" : "eye-off-outline"}
                    size={22}
                    color="rgba(255,255,255,0.6)"
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.balanceAmount}>
                {isBalanceVisible ? formatCurrency(balance.total) : '••••••'}
              </Text>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: 'rgba(74, 222, 128, 0.2)' }]}>
                    <Ionicons name="arrow-down" size={12} color="#4ADE80" />
                  </View>
                  <View>
                    <Text style={styles.statLabel}>Income</Text>
                    <Text style={styles.statValue}>
                      {isBalanceVisible ? formatCurrency(balance.income) : '•••'}
                    </Text>
                  </View>
                </View>

                <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />

                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: 'rgba(248, 113, 113, 0.2)' }]}>
                    <Ionicons name="arrow-up" size={12} color="#F87171" />
                  </View>
                  <View>
                    <Text style={styles.statLabel}>Expense</Text>
                    <Text style={styles.statValue}>
                      {isBalanceVisible ? formatCurrency(balance.expense) : '•••'}
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Quick Actions Grid */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Actions</Text>
            {/* <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>See All</Text>
            </TouchableOpacity> */}
          </View>

          <Animated.View entering={FadeInDown.delay(200).duration(600).springify()} style={styles.actionsGrid}>
            <QuickAction
              icon="bank-transfer"
              label="Send"
              bg="#6366F1"
              onPress={() => navigation.navigate('SendMoney')}
            />
            <QuickAction
              icon="line-scan"
              label="Scan"
              bg="#EC4899"
              onPress={() => navigation.navigate('ReceiptScanner')}
            />
            <QuickAction
              icon="chart-pie"
              label="Budget"
              bg="#F59E0B"
              onPress={() => navigation.navigate('Budget')}
            />
            <QuickAction
              icon="robot"
              label="Advisor"
              bg="#10B981"
              onPress={() => navigation.navigate('AIAdvisor')}
            />
          </Animated.View>

          {/* Dashboard Insights */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Overview</Text>
          </View>

          <Animated.View entering={FadeInDown.delay(300).duration(600).springify()} style={styles.insightsGrid}>
            <View style={styles.insightGridItem}>
              <InsightCard
                title="Upcoming EMI"
                value={upcomingEMI ? formatCurrency(upcomingEMI.monthly_amount) : '-'}
                subtitle={upcomingEMI ? `Due: ${upcomingEMI.due_date}th` : 'No Dues'}
                icon="calendar-clock"
                color="#3B82F6"
                onPress={() => navigation.navigate('EMI')}
              />
            </View>

            <View style={styles.insightGridItem}>
              <InsightCard
                title="Kuri"
                value={formatCurrency(kuriSummary.balance)}
                subtitle={kuriSummary.nextDue ? `Next: ${new Date(kuriSummary.nextDue).getDate()}th` : 'Active'}
                icon="piggy-bank-outline"
                color="#8B5CF6"
                onPress={() => navigation.navigate('Kuri')}
              />
            </View>

            <View style={styles.insightGridItem}>
              <InsightCard
                title="Savings"
                value={formatCurrency(totalSavings)}
                subtitle={'Total Goals'}
                icon="trending-up"
                color="#10B981"
                onPress={() => navigation.navigate('Goals')}
              />
            </View>
          </Animated.View>

          {/* Analytics Chart */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Analytics</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>This week</Text>
            </View>
          </View>

          <Animated.View entering={FadeInUp.delay(400).duration(600).springify()} style={[styles.chartWrapper, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFF', borderColor: theme.colors.border }]}>
            <LineChart
              data={chartData}
              width={width - 56}
              height={200}
              yAxisLabel="₹"
              yAxisInterval={1}
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: isDark ? '#0B1221' : '#FFFFFF',
                backgroundGradientFromOpacity: 0,
                backgroundGradientTo: isDark ? '#0B1221' : '#FFFFFF',
                backgroundGradientToOpacity: 0,
                decimalPlaces: 0,
                color: (opacity = 1) => theme.colors.primary,
                labelColor: (opacity = 1) => theme.colors.textSecondary,
                style: { borderRadius: 16 },
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                  stroke: theme.colors.background
                },
                propsForBackgroundLines: {
                  strokeDasharray: '4', // solid background lines with no dash
                  stroke: theme.colors.border,
                  strokeWidth: 1,
                  strokeOpacity: 0.3
                }
              }}
              bezier
              formatYLabel={(value) => {
                const num = parseInt(value);
                if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
                return value;
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16,
                paddingRight: 16,
              }}
            />
          </Animated.View>

          {/* Recent Transactions Preview */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Expenses')}>
              <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>

          <Animated.View entering={FadeInUp.delay(500).duration(600).springify()} style={styles.transactionsPreview}>
            {transactions.slice(0, 4).map((transaction, index) => (
              <TouchableOpacity
                key={transaction.id || index}
                style={[styles.transactionItem, { borderBottomColor: theme.colors.border }]}
                onPress={() => navigation.navigate('TransactionDetail', { id: transaction.id })}
              >
                <View style={[styles.transactionIcon, { backgroundColor: transaction.type === 'income' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)' }]}>
                  <Ionicons
                    name={transaction.type === 'income' ? 'arrow-down' : 'arrow-up'}
                    size={20}
                    color={transaction.type === 'income' ? '#4ADE80' : '#F87171'}
                  />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={[styles.transactionCategory, { color: theme.colors.text }]}>{transaction.category}</Text>
                  <Text style={[styles.transactionDate, { color: theme.colors.textSecondary }]}>
                    {new Date(transaction.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </Text>
                </View>
                <Text style={[styles.transactionAmount, { color: transaction.type === 'income' ? '#4ADE80' : '#F87171' }]}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </Text>
              </TouchableOpacity>
            ))}
            {transactions.length === 0 && (
              <Text style={{ color: theme.colors.textMuted, textAlign: 'center', marginVertical: 20 }}>No recent transactions</Text>
            )}
          </Animated.View>
        </ScrollView>

        {/* Floating Action Button */}
        {/* <Animated.View entering={ZoomIn.delay(600).springify()} style={styles.fabContainer}>
            <TouchableOpacity
            style={[styles.fab, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('AddExpense')}
            activeOpacity={0.8}
            >
            <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
        </Animated.View> */}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)'
  },
  welcomeContainer: {
    flex: 1,
    marginLeft: 16,
  },
  greeting: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
  },
  username: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    padding: 2,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)'
  },
  profileImg: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  balanceCardContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  balanceCard: {
    borderRadius: 24,
    padding: 24,
    shadowOffset: { width: 0, height: 10 },
    shadowColor: "#4338ca",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
    position: 'relative'
  },
  cardPattern: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255,255,255,0.04)',
    zIndex: 0
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    zIndex: 1
  },
  walletTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletTagText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
  },
  eyeButton: {
    padding: 4,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 34,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 24,
    letterSpacing: -0.5,
    zIndex: 1
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    zIndex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statDivider: {
    width: 1,
    height: 30,
    marginHorizontal: 8,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    marginBottom: 2,
  },
  statValue: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Poppins_700Bold',
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
    fontFamily: 'Poppins_700Bold',
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginTop: 2,
    fontFamily: 'Poppins_400Regular'
  },
  seeAllText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 8,
    width: (width - 64) / 4,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  actionLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    textAlign: 'center',
    opacity: 0.8
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: 12,
  },
  insightGridItem: {
    width: (width - 48 - 12) / 2, // 2 columns with gap
    marginBottom: 12
  },
  insightCard: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  insightCardContent: {
    padding: 16,
    borderRadius: 20,
    minHeight: 120,
    justifyContent: 'space-between'
  },
  glassCard: {
    borderRadius: 20,
  },
  glassCardAndroid: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  glassDark: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
  },
  glassLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  insightIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 11,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.7
  },
  insightValue: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 4,
  },
  insightSubtitle: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    opacity: 0.8
  },
  chartWrapper: {
    marginHorizontal: spacing.lg,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
  },
  transactionsPreview: {
    marginHorizontal: spacing.lg,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  transactionIcon: {
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
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    opacity: 0.7
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 100,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
});

export default HomeScreen;