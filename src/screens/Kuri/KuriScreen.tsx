import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, StatusBar, Platform } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AppText from '../../components/common/AppText';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import Ionicons from '@expo/vector-icons/Ionicons';
import ActionSheet from '../../components/common/ActionSheet';
import { KuriService, Kuri } from '../../services/kuri.service';
import { formatCurrency } from '../../utils/helpers';
import Animated, { FadeInDown, ZoomIn, FadeInRight } from 'react-native-reanimated';
import CustomAlert from '../../components/common/CustomAlert';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function KuriScreen({ navigation }: any) {
    const { theme, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const [isModalVisible, setModalVisible] = useState(false);
    const [kuris, setKuris] = useState<Kuri[]>([]);
    const [newKuri, setNewKuri] = useState({
        title: '',
        totalValue: '',
        installmentAmount: '',
        totalMonths: '',
        startDate: new Date().toISOString().split('T')[0]
    });
    const [showCalendar, setShowCalendar] = useState(false);
    const [loading, setLoading] = useState(false);

    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info' as 'info' | 'success' | 'error' | 'warning',
        showCancel: false,
        onConfirm: () => { },
    });

    const showAlert = (title: string, message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info', showCancel = false, onConfirm?: () => void) => {
        setAlertConfig({
            visible: true,
            title,
            message,
            type,
            showCancel,
            onConfirm: onConfirm || (() => { }),
        });
    };

    useEffect(() => {
        loadKuris();
    }, []);

    const loadKuris = async () => {
        setLoading(true);
        try {
            const data = await KuriService.getAllKuris();
            setKuris(data || []);
        } catch (error) {
            showAlert('Error', 'Failed to load Kuris', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddKuri = async () => {
        if (!newKuri.title || !newKuri.totalValue || !newKuri.installmentAmount || !newKuri.totalMonths) {
            showAlert('Error', 'Please fill all fields', 'error');
            return;
        }

        setLoading(true);
        try {
            const newItem = {
                title: newKuri.title,
                totalValue: parseInt(newKuri.totalValue),
                installmentAmount: parseInt(newKuri.installmentAmount),
                totalMonths: parseInt(newKuri.totalMonths),
                monthsPaid: 0,
                startDate: new Date(newKuri.startDate).toISOString(),
                nextInstallmentDate: new Date(newKuri.startDate).toISOString(),
                status: 'Pending' as const,
                color: theme.colors.primary
            };

            await KuriService.addKuri(newItem);
            await loadKuris();
            setModalVisible(false);
            setNewKuri({ title: '', totalValue: '', installmentAmount: '', totalMonths: '', startDate: new Date().toISOString().split('T')[0] });
            showAlert('Success', 'Kuri added successfully!', 'success');
        } catch (error) {
            showAlert('Error', 'Failed to add Kuri', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePayInstallment = async (id: string) => {
        const kuri = kuris.find(k => k.id === id);
        if (!kuri) return;

        if (kuri.monthsPaid >= kuri.totalMonths) {
            showAlert('Completed', 'This Kuri is already fully paid!', 'info');
            return;
        }

        showAlert(
            'Confirm Payment',
            `Are you sure you want to pay the installment of ${formatCurrency(kuri.installmentAmount)} for ${kuri.title}?`,
            'info',
            true,
            async () => {
                setLoading(true);
                try {
                    const updatedKuri = {
                        ...kuri,
                        monthsPaid: kuri.monthsPaid + 1,
                        status: (kuri.monthsPaid + 1 >= kuri.totalMonths ? 'Closed' : 'Pending') as 'Closed' | 'Pending',
                    };

                    await KuriService.updateKuri(updatedKuri);
                    await loadKuris();
                    showAlert('Success', 'Installment paid successfully!', 'success');
                } catch (error) {
                    showAlert('Error', 'Failed to update Kuri', 'error');
                } finally {
                    setLoading(false);
                }
            }
        );
    };

    const handleDeleteKuri = async (id: string) => {
        showAlert(
            'Delete Kuri',
            'Are you sure you want to delete this Kuri?',
            'warning',
            true,
            async () => {
                setLoading(true);
                try {
                    await KuriService.deleteKuri(id);
                    await loadKuris();
                    showAlert('Deleted', 'Kuri deleted successfully', 'success');
                } catch (error) {
                    showAlert('Error', 'Failed to delete Kuri', 'error');
                } finally {
                    setLoading(false);
                }
            }
        );
    };

    // Find the most urgent Kuri
    const urgentKuri = kuris.find(k => k.status === 'Missed') ||
        kuris.find(k => k.status === 'Due Soon') ||
        kuris.find(k => k.status === 'Pending');

    // Calculate summary stats
    const totalKuris = kuris.length;
    const totalInvested = kuris.reduce((sum, k) => sum + (k.monthsPaid * k.installmentAmount), 0);
    const totalMonthly = kuris.reduce((sum, k) => sum + (k.status !== 'Closed' ? k.installmentAmount : 0), 0);
    const completedKuris = kuris.filter(k => k.status === 'Closed').length;

    // Animated Header Component
    const AnimatedHeader = () => {
        return (
            <Animated.View
                entering={FadeInDown.duration(600).springify()}
                style={[styles.header, {
                    paddingTop: insets.top + (Platform.OS === 'android' ? 10 : 0),
                    backgroundColor: isDark ? 'rgba(11, 15, 25, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                    borderBottomColor: theme.colors.border
                }]}
            >
                <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={[styles.iconBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
                    >
                        <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
                    </TouchableOpacity>

                    <View style={styles.headerTextContainer}>
                        <AppText style={[styles.headerTitle, { color: theme.colors.text }]}>
                            Kuri Tracker
                        </AppText>
                        <AppText style={[styles.headerSub, { color: theme.colors.textSecondary }]}>
                            {kuris.length} active funds
                        </AppText>
                    </View>

                    <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        );
    };

    const renderKuriCard = (item: Kuri, index: number) => {
        const progress = item.monthsPaid / item.totalMonths;
        const isCompleted = item.monthsPaid >= item.totalMonths;
        const statusColor = item.status === 'Missed' ? theme.colors.danger :
            item.status === 'Due Soon' ? theme.colors.warning :
                item.status === 'Closed' ? theme.colors.success :
                    theme.colors.primary;

        // Calculate next due date dynamically
        const startDate = new Date(item.startDate);
        const nextDueDate = new Date(startDate);
        nextDueDate.setMonth(startDate.getMonth() + item.monthsPaid);

        return (
            <Animated.View
                key={item.id}
                entering={FadeInRight.delay(400 + (index * 100)).duration(600)}
                style={styles.kuriCardWrapper}
            >
                <TouchableOpacity
                    style={[styles.kuriCard, {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFF',
                        borderColor: theme.colors.border,
                        borderLeftColor: statusColor,
                    }]}
                    activeOpacity={0.9}
                    onLongPress={() => handleDeleteKuri(item.id)}
                >
                    {/* Card Header */}
                    <View style={styles.kuriCardHeader}>
                        <View style={styles.kuriCardTitleContainer}>
                            <View style={[styles.kuriIconContainer, { backgroundColor: statusColor + '15' }]}>
                                <Ionicons name="people" size={18} color={statusColor} />
                            </View>
                            <View>
                                <AppText style={[styles.kuriCardTitle, { color: theme.colors.text }]}>
                                    {item.title}
                                </AppText>
                                <View style={styles.kuriCardSubtitle}>
                                    <Ionicons name="time-outline" size={12} color={theme.colors.textMuted} />
                                    <AppText style={[styles.kuriCardStatus, { color: theme.colors.textMuted }]}>
                                        {item.monthsPaid}/{item.totalMonths} installments • {item.status}
                                    </AppText>
                                </View>
                            </View>
                        </View>

                        <View style={[styles.kuriProgressBadge, { backgroundColor: `${statusColor}20` }]}>
                            <AppText style={[styles.kuriProgressText, { color: statusColor }]}>
                                {Math.round(progress * 100)}%
                            </AppText>
                        </View>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.kuriProgressContainer}>
                        <View style={[styles.kuriProgressBar, { backgroundColor: theme.colors.border }]}>
                            <Animated.View
                                style={[styles.kuriProgressFill, {
                                    width: `${progress * 100}%`,
                                    backgroundColor: statusColor
                                }]}
                            />
                        </View>
                    </View>

                    {/* Stats Row */}
                    <View style={styles.kuriStatsRow}>
                        <View style={styles.kuriStat}>
                            <AppText style={[styles.kuriStatLabel, { color: theme.colors.textMuted }]}>
                                Paid
                            </AppText>
                            <AppText style={[styles.kuriStatValue, { color: theme.colors.text }]}>
                                {formatCurrency(item.monthsPaid * item.installmentAmount)}
                            </AppText>
                        </View>

                        <View style={styles.kuriStat}>
                            <AppText style={[styles.kuriStatLabel, { color: theme.colors.textMuted }]}>
                                Total
                            </AppText>
                            <AppText style={[styles.kuriStatValue, { color: theme.colors.text }]}>
                                {formatCurrency(item.totalValue)}
                            </AppText>
                        </View>

                        <View style={styles.kuriStat}>
                            <AppText style={[styles.kuriStatLabel, { color: theme.colors.textMuted }]}>
                                Monthly
                            </AppText>
                            <AppText style={[styles.kuriStatValue, { color: theme.colors.primary }]}>
                                {formatCurrency(item.installmentAmount)}
                            </AppText>
                        </View>
                    </View>

                    {/* Divider */}
                    <View style={[styles.cardDivider, { backgroundColor: theme.colors.border }]} />

                    {/* Footer with Action */}
                    <View style={styles.kuriCardFooter}>
                        <View style={styles.nextDueContainer}>
                            <Ionicons name="calendar-outline" size={14} color={theme.colors.textMuted} />
                            <AppText style={[styles.nextDueText, { color: theme.colors.text }]}>
                                Next: {nextDueDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                            </AppText>
                        </View>

                        {!isCompleted && (
                            <TouchableOpacity
                                style={[styles.payNowButton, { backgroundColor: theme.colors.primary }]}
                                onPress={() => handlePayInstallment(item.id)}
                            >
                                <Ionicons name="checkmark-circle" size={16} color="#FFF" />
                                <AppText style={[styles.payNowText, { color: '#FFF' }]}>
                                    Pay Now
                                </AppText>
                            </TouchableOpacity>
                        )}
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <LinearGradient
                colors={isDark ? ['#040911', '#0B1221'] : ['#F8FAFC', '#F1F5F9']}
                style={StyleSheet.absoluteFillObject}
            />
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

            <AnimatedHeader />

            <LoadingOverlay visible={loading} />
            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                showCancel={alertConfig.showCancel}
                onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
                onConfirm={() => {
                    setAlertConfig(prev => ({ ...prev, visible: false }));
                    alertConfig.onConfirm();
                }}
            />

            <ScrollView
                contentContainerStyle={{
                    paddingTop: insets.top + 80,
                    paddingBottom: 100,
                    paddingHorizontal: spacing.lg
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Card */}
                <Animated.View entering={ZoomIn.duration(600).springify()}>
                    <LinearGradient
                        colors={isDark ? ['#0F172A', '#1E293B'] : ['#FFFFFF', '#F8FAFC']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.heroCard, { borderColor: theme.colors.border }]}
                    >
                        {/* Decorative Circles */}
                        <View style={[styles.decorCircle, styles.decorCircle1, { backgroundColor: theme.colors.primary + '10' }]} />
                        <View style={[styles.decorCircle, styles.decorCircle2, { backgroundColor: theme.colors.primary + '05' }]} />

                        <View style={styles.heroContent}>
                            <View style={styles.heroHeader}>
                                <View>
                                    <AppText style={[styles.heroLabel, { color: theme.colors.textSecondary }]}>
                                        MONTHLY KURI TOTAL
                                    </AppText>
                                    <AppText style={[styles.heroAmount, { color: theme.colors.text }]}>
                                        {formatCurrency(totalMonthly)}
                                    </AppText>
                                </View>
                                <View style={[styles.heroIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                                    <Ionicons name="wallet-outline" size={28} color={theme.colors.primary} />
                                </View>
                            </View>

                            <View style={styles.heroStatsGrid}>
                                <View style={styles.heroStat}>
                                    <AppText style={[styles.heroStatLabel, { color: theme.colors.textSecondary }]}>
                                        Active
                                    </AppText>
                                    <AppText style={[styles.heroStatValue, { color: theme.colors.text }]}>
                                        {totalKuris}
                                    </AppText>
                                </View>
                                <View style={[styles.heroStatDivider, { backgroundColor: theme.colors.border }]} />
                                <View style={styles.heroStat}>
                                    <AppText style={[styles.heroStatLabel, { color: theme.colors.textSecondary }]}>
                                        Completed
                                    </AppText>
                                    <AppText style={[styles.heroStatValue, { color: theme.colors.success }]}>
                                        {completedKuris}
                                    </AppText>
                                </View>
                                <View style={[styles.heroStatDivider, { backgroundColor: theme.colors.border }]} />
                                <View style={styles.heroStat}>
                                    <AppText style={[styles.heroStatLabel, { color: theme.colors.textSecondary }]}>
                                        Invested
                                    </AppText>
                                    <AppText style={[styles.heroStatValue, { color: theme.colors.text }]}>
                                        {formatCurrency(totalInvested)}
                                    </AppText>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Urgent Payment Alert */}
                {urgentKuri && urgentKuri.status !== 'Closed' && (
                    <Animated.View entering={FadeInDown.delay(200).duration(600)}>
                        <LinearGradient
                            colors={urgentKuri.status === 'Missed' ?
                                ['#EF4444', '#DC2626'] :
                                urgentKuri.status === 'Due Soon' ?
                                    ['#F59E0B', '#D97706'] :
                                    [theme.colors.primary, theme.colors.primaryDark]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[styles.urgentAlert, {
                                shadowColor: urgentKuri.status === 'Missed' ? '#EF4444' : theme.colors.primary
                            }]}
                        >
                            <View style={styles.urgentAlertHeader}>
                                <View style={[styles.urgentIconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                    <Ionicons
                                        name={urgentKuri.status === 'Missed' ? "alert-circle" : "notifications"}
                                        size={20}
                                        color="#FFF"
                                    />
                                </View>
                                <View style={styles.urgentAlertText}>
                                    <AppText style={[styles.urgentTitle, { color: '#FFF' }]}>
                                        {urgentKuri.status === 'Missed' ? 'Missed Payment' :
                                            urgentKuri.status === 'Due Soon' ? 'Payment Due Soon' :
                                                'Upcoming Payment'}
                                    </AppText>
                                    <AppText style={[styles.urgentSubtitle, { color: 'rgba(255,255,255,0.9)' }]}>
                                        {urgentKuri.title} • {formatCurrency(urgentKuri.installmentAmount)}
                                    </AppText>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.urgentPayButton}
                                onPress={() => handlePayInstallment(urgentKuri.id)}
                            >
                                <AppText style={[styles.urgentPayText, { color: theme.colors.text }]}>
                                    Pay Now
                                </AppText>
                                <Ionicons name="arrow-forward" size={16} color={theme.colors.text} />
                            </TouchableOpacity>
                        </LinearGradient>
                    </Animated.View>
                )}

                {/* Calendar Section */}
                <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleContainer}>
                            <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
                            <AppText style={[styles.sectionTitle, { color: theme.colors.text }]}>
                                Payment Schedule
                            </AppText>
                        </View>
                    </View>

                    <View style={[styles.calendarContainer, {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFF',
                        borderColor: theme.colors.border,
                        borderWidth: 1
                    }]}>
                        <Calendar
                            theme={{
                                backgroundColor: 'transparent',
                                calendarBackground: 'transparent',
                                textSectionTitleColor: theme.colors.textMuted,
                                selectedDayBackgroundColor: theme.colors.primary,
                                selectedDayTextColor: '#ffffff',
                                todayTextColor: theme.colors.primary,
                                dayTextColor: theme.colors.text,
                                textDisabledColor: theme.colors.textMuted,
                                dotColor: theme.colors.primary,
                                selectedDotColor: '#ffffff',
                                arrowColor: theme.colors.primary,
                                monthTextColor: theme.colors.text,
                                indicatorColor: theme.colors.primary,
                                textDayFontFamily: 'Poppins_600SemiBold',
                                textMonthFontFamily: 'Poppins_700Bold',
                                textDayHeaderFontFamily: 'Poppins_500Medium',
                                textDayFontSize: 14,
                                textMonthFontSize: 16,
                                textDayHeaderFontSize: 12
                            }}
                            markedDates={kuris.reduce((acc: any, kuri) => {
                                if (kuri.status === 'Closed') return acc;
                                const date = kuri.nextInstallmentDate.split('T')[0];
                                let color = theme.colors.primary;
                                if (kuri.status === 'Missed') color = theme.colors.danger;
                                else if (kuri.status === 'Due Soon') color = theme.colors.warning;

                                acc[date] = {
                                    marked: true,
                                    dotColor: color,
                                    selected: true,
                                    selectedColor: color
                                };
                                return acc;
                            }, {
                                [new Date().toISOString().split('T')[0]]: {
                                    selected: true,
                                    selectedColor: theme.colors.primary + '50',
                                    selectedTextColor: theme.colors.text
                                }
                            })}
                        />

                        <View style={[styles.legendContainer, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: theme.colors.danger }]} />
                                <AppText style={[styles.legendText, { color: theme.colors.textMuted }]}>Missed</AppText>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: theme.colors.warning }]} />
                                <AppText style={[styles.legendText, { color: theme.colors.textMuted }]}>Due Soon</AppText>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
                                <AppText style={[styles.legendText, { color: theme.colors.textMuted }]}>Upcoming</AppText>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                {/* All Kuris Section */}
                <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleContainer}>
                            <Ionicons name="list" size={20} color={theme.colors.primary} />
                            <AppText style={[styles.sectionTitle, { color: theme.colors.text }]}>
                                All Kuris
                            </AppText>
                        </View>

                        <View style={[styles.kurisCountBadge, { backgroundColor: theme.colors.primary + '15' }]}>
                            <AppText style={[styles.kurisCountText, { color: theme.colors.primary }]}>
                                {kuris.length}
                            </AppText>
                        </View>
                    </View>

                    <View style={styles.kurisList}>
                        {kuris.map((item, index) => renderKuriCard(item, index))}

                        {kuris.length === 0 && (
                            <Animated.View entering={FadeInDown.delay(500).duration(600)} style={[styles.emptyState, {
                                borderColor: theme.colors.border
                            }]}>
                                <LinearGradient
                                    colors={isDark ?
                                        ['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.01)'] :
                                        ['#FFFFFF', '#F8FAFC']}
                                    style={styles.emptyContainer}
                                >
                                    <View style={[styles.emptyIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                                        <Ionicons name="people-outline" size={48} color={theme.colors.primary} />
                                    </View>
                                    <AppText style={[styles.emptyTitle, { color: theme.colors.text }]}>
                                        No Kuris Yet
                                    </AppText>
                                    <AppText style={[styles.emptySubtitle, { color: theme.colors.textMuted }]}>
                                        Start by joining your first Kuri group
                                    </AppText>
                                </LinearGradient>
                            </Animated.View>
                        )}
                    </View>
                </Animated.View>

                <View style={{ height: 30 }} />
            </ScrollView>

            {/* Add Kuri Modal */}
            <ActionSheet
                visible={isModalVisible}
                onClose={() => setModalVisible(false)}
                title="Join New Kuri"
                actionLabel={loading ? "Joining..." : "Join Kuri"}
                onAction={handleAddKuri}
            >
                <View style={styles.inputGroup}>
                    <AppText style={[styles.label, { color: theme.colors.text }]}>Kuri Name</AppText>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
                        placeholder="e.g. Office Savings"
                        placeholderTextColor={theme.colors.textMuted}
                        value={newKuri.title}
                        onChangeText={(text) => setNewKuri({ ...newKuri, title: text })}
                    />
                </View>
                <View style={styles.inputGroup}>
                    <AppText style={[styles.label, { color: theme.colors.text }]}>Total Value (₹)</AppText>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
                        placeholder="e.g. 100000"
                        placeholderTextColor={theme.colors.textMuted}
                        keyboardType="numeric"
                        value={newKuri.totalValue}
                        onChangeText={(text) => setNewKuri({ ...newKuri, totalValue: text })}
                    />
                </View>
                <View style={styles.inputGroup}>
                    <AppText style={[styles.label, { color: theme.colors.text }]}>Monthly Installment (₹)</AppText>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
                        placeholder="e.g. 5000"
                        placeholderTextColor={theme.colors.textMuted}
                        keyboardType="numeric"
                        value={newKuri.installmentAmount}
                        onChangeText={(text) => setNewKuri({ ...newKuri, installmentAmount: text })}
                    />
                </View>
                <View style={styles.inputGroup}>
                    <AppText style={[styles.label, { color: theme.colors.text }]}>Total Months</AppText>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
                        placeholder="e.g. 20"
                        placeholderTextColor={theme.colors.textMuted}
                        keyboardType="numeric"
                        value={newKuri.totalMonths}
                        onChangeText={(text) => setNewKuri({ ...newKuri, totalMonths: text })}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <AppText style={[styles.label, { color: theme.colors.text }]}>Start Date</AppText>
                    <TouchableOpacity
                        style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, justifyContent: 'center' }]}
                        onPress={() => setShowCalendar(!showCalendar)}
                    >
                        <AppText style={{ color: theme.colors.text, fontFamily: 'Poppins_400Regular' }}>
                            {new Date(newKuri.startDate).toLocaleDateString()}
                        </AppText>
                    </TouchableOpacity>
                    {showCalendar && (
                        <View style={{ marginTop: 10, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border }}>
                            <Calendar
                                current={newKuri.startDate}
                                onDayPress={(day: any) => {
                                    setNewKuri({ ...newKuri, startDate: day.dateString });
                                    setShowCalendar(false);
                                }}
                                theme={{
                                    backgroundColor: theme.colors.surface,
                                    calendarBackground: theme.colors.surface,
                                    textSectionTitleColor: theme.colors.textMuted,
                                    selectedDayBackgroundColor: theme.colors.primary,
                                    selectedDayTextColor: '#ffffff',
                                    todayTextColor: theme.colors.primary,
                                    dayTextColor: theme.colors.text,
                                    textDisabledColor: theme.colors.textMuted,
                                    arrowColor: theme.colors.primary,
                                    monthTextColor: theme.colors.text,
                                    textDayFontFamily: 'Poppins_400Regular',
                                    textDayHeaderFontFamily: 'Poppins_600SemiBold',
                                    textMonthFontFamily: 'Poppins_700Bold',
                                }}
                                markedDates={{
                                    [newKuri.startDate]: { selected: true, selectedColor: theme.colors.primary }
                                }}
                            />
                        </View>
                    )}
                </View>
            </ActionSheet>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderBottomWidth: StyleSheet.hairlineWidth,
        paddingBottom: spacing.md,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTextContainer: {
        flex: 1,
        marginLeft: spacing.md,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Poppins_700Bold',
        letterSpacing: -0.5,
    },
    headerSub: {
        fontSize: 13,
        fontFamily: 'Poppins_400Regular',
        marginTop: 2,
    },
    fab: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    heroCard: {
        borderRadius: 28,
        padding: spacing.lg,
        marginBottom: spacing.xl,
        borderWidth: 1,
        overflow: 'hidden',
        position: 'relative',
    },
    decorCircle: {
        position: 'absolute',
        borderRadius: 999,
    },
    decorCircle1: {
        width: 200,
        height: 200,
        top: -100,
        right: -50,
    },
    decorCircle2: {
        width: 150,
        height: 150,
        bottom: -75,
        left: -30,
    },
    heroContent: {
        position: 'relative',
        zIndex: 1,
    },
    heroHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.lg,
    },
    heroLabel: {
        fontSize: 11,
        fontFamily: 'Poppins_700Bold',
        letterSpacing: 1.5,
        marginBottom: 8,
        opacity: 0.9,
    },
    heroAmount: {
        fontSize: 42,
        fontFamily: 'Poppins_900Black',
        letterSpacing: -1,
    },
    heroIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroStatsGrid: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    heroStat: {
        flex: 1,
        alignItems: 'center',
    },
    heroStatDivider: {
        width: 1,
        height: 40,
        marginHorizontal: spacing.md,
    },
    heroStatLabel: {
        fontSize: 12,
        fontFamily: 'Poppins_600SemiBold',
        marginBottom: 6,
        textAlign: 'center',
    },
    heroStatValue: {
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
        textAlign: 'center',
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
        letterSpacing: -0.5,
    },
    sectionSubtitle: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
    },
    urgentAlert: {
        borderRadius: 20,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
        elevation: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    urgentAlertHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        flex: 1,
    },
    urgentIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    urgentAlertText: {
        flex: 1,
    },
    urgentTitle: {
        fontSize: 16,
        fontFamily: 'Poppins_700Bold',
        marginBottom: 2,
    },
    urgentSubtitle: {
        fontSize: 12,
        fontFamily: 'Poppins_500Medium',
    },
    urgentPayButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: spacing.md,
        paddingVertical: 8,
        backgroundColor: '#FFF',
        borderRadius: 20,
    },
    urgentPayText: {
        fontSize: 12,
        fontFamily: 'Poppins_700Bold',
    },
    calendarContainer: {
        borderRadius: 24,
        padding: spacing.md,
        overflow: 'hidden',
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: spacing.md,
        borderTopWidth: 1,
        marginTop: spacing.sm,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 12,
        fontFamily: 'Poppins_500Medium',
    },
    kurisCountBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 12,
    },
    kurisCountText: {
        fontSize: 12,
        fontFamily: 'Poppins_700Bold',
    },
    kurisList: {
        gap: spacing.md,
    },
    kuriCardWrapper: {
        marginBottom: spacing.xs,
    },
    kuriCard: {
        borderRadius: 20,
        padding: spacing.md,
        borderWidth: 1,
        borderLeftWidth: 4,
    },
    kuriCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    kuriCardTitleContainer: {
        flexDirection: 'row',
        gap: spacing.md,
        flex: 1,
    },
    kuriIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    kuriCardTitle: {
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
        marginBottom: 2,
    },
    kuriCardSubtitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    kuriCardStatus: {
        fontSize: 12,
        fontFamily: 'Poppins_500Medium',
    },
    kuriProgressBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 12,
    },
    kuriProgressText: {
        fontSize: 12,
        fontFamily: 'Poppins_700Bold',
    },
    kuriProgressContainer: {
        marginBottom: spacing.md,
    },
    kuriProgressBar: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    kuriProgressFill: {
        height: '100%',
        borderRadius: 3,
    },
    kuriStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    kuriStat: {
        flex: 1,
        alignItems: 'center',
    },
    kuriStatLabel: {
        fontSize: 11,
        fontFamily: 'Poppins_500Medium',
        marginBottom: 2,
    },
    kuriStatValue: {
        fontSize: 14,
        fontFamily: 'Poppins_700Bold',
    },
    cardDivider: {
        height: 1,
        width: '100%',
        marginVertical: spacing.md,
    },
    kuriCardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    nextDueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    nextDueText: {
        fontSize: 12,
        fontFamily: 'Poppins_500Medium',
    },
    payNowButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: spacing.md,
        paddingVertical: 8,
        borderRadius: 20,
    },
    payNowText: {
        fontSize: 12,
        fontFamily: 'Poppins_700Bold',
    },
    emptyState: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    emptyContainer: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    emptyTitle: {
        fontSize: 20,
        fontFamily: 'Poppins_700Bold',
        marginBottom: spacing.sm,
    },
    emptySubtitle: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: 14,
        fontFamily: 'Poppins_600SemiBold',
        marginBottom: spacing.xs,
        marginLeft: 4,
    },
    input: {
        height: 52,
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: spacing.md,
        fontSize: 16,
        fontFamily: 'Poppins_500Medium',
    },
});