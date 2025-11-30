import React, { useState } from 'react';
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
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [500, 1200, 800, 400, 2000, 1500, 3000],
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        strokeWidth: 3
      }
    ]
  };

  const recentTransactions = [
    { id: 1, title: 'Netflix Subscription', amount: '-₹799', date: 'Today', icon: 'movie-open', color: '#E50914' },
    { id: 2, title: 'Salary Credited', amount: '+₹85,000', date: 'Yesterday', icon: 'cash-multiple', color: '#10B981' },
    { id: 3, title: 'Grocery Shopping', amount: '-₹2,450', date: '23 Nov', icon: 'cart', color: '#F59E0B' },
    { id: 4, title: 'Uber Ride', amount: '-₹450', date: '22 Nov', icon: 'car', color: '#3B82F6' },
  ];

  const QuickAction = ({ icon, label, onPress, color }: any) => (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.actionLabel, { color: theme.colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
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
          <TouchableOpacity style={[styles.profileBtn, { borderColor: theme.colors.border }]}>
            <Image
              source={{ uri: 'https://ui-avatars.com/api/?name=Dirsh&background=random' }}
              style={styles.profileImg}
            />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Main Balance Card */}
        <LinearGradient
          colors={['#6366F1', '#8B5CF6', '#EC4899']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <MaterialCommunityIcons name="wallet-outline" size={24} color="#fff" />
          </View>
          <Text style={styles.balanceAmount}>₹1,24,500</Text>
          <View style={styles.incomeExpenseContainer}>
            <View style={styles.ieRow}>
              <View style={[styles.ieIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Ionicons name="arrow-down" size={16} color="#4ADE80" />
              </View>
              <View>
                <Text style={styles.ieLabel}>Income</Text>
                <Text style={styles.ieValue}>₹85,000</Text>
              </View>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.ieRow}>
              <View style={[styles.ieIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Ionicons name="arrow-up" size={16} color="#F87171" />
              </View>
              <View>
                <Text style={styles.ieLabel}>Expense</Text>
                <Text style={styles.ieValue}>₹32,450</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <QuickAction icon="send" label="Send" color="#6366F1" onPress={() => { }} />
          <QuickAction icon="qrcode-scan" label="Scan" color="#EC4899" onPress={() => navigation.navigate('UpiSpend')} />
          <QuickAction icon="chart-pie" label="Budget" color="#F59E0B" onPress={() => navigation.navigate('Budget')} />
          <QuickAction icon="robot" label="AI Advisor" color="#10B981" onPress={() => navigation.navigate('AIAdvisor')} />
        </View>

        {/* Spending Insight Chart */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Spending Overview</Text>
          <TouchableOpacity>
            <Text style={[styles.seeAll, { color: theme.colors.primary }]}>This Week</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.chartContainer, { backgroundColor: theme.colors.card }]}>
          <LineChart
            data={chartData}
            width={width - 48}
            height={180}
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
              }
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
          />
        </View>

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Transactions</Text>
          <TouchableOpacity>
            <Text style={[styles.seeAll, { color: theme.colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsList}>
          {recentTransactions.map((item) => (
            <TouchableOpacity key={item.id} style={[styles.transactionItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <View style={[styles.transactionIcon, { backgroundColor: item.color + '15' }]}>
                <MaterialCommunityIcons name={item.icon as any} size={24} color={item.color} />
              </View>
              <View style={styles.transactionDetails}>
                <Text style={[styles.transactionTitle, { color: theme.colors.text }]}>{item.title}</Text>
                <Text style={[styles.transactionDate, { color: theme.colors.textMuted }]}>{item.date}</Text>
              </View>
              <Text style={[styles.transactionAmount, { color: item.amount.includes('+') ? '#10B981' : theme.colors.text }]}>
                {item.amount}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
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
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 24,
  },
  incomeExpenseContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 12,
    justifyContent: 'space-between',
  },
  ieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    justifyContent: 'center',
  },
  verticalDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
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
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
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
    width: 56,
    height: 56,
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
  },
  transactionsList: {
    paddingHorizontal: spacing.lg,
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
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
