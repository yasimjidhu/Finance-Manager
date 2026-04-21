import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, RefreshControl, Dimensions, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AppText from '../../components/common/AppText';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import { formatCurrency } from '../../utils/helpers';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, { FadeInDown, ZoomIn, FadeInRight, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { EMIService, EMI } from '../../services/emi.service';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import CustomAlert from '../../components/common/CustomAlert';
import ActionSheet from '../../components/common/ActionSheet';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function EMITrackerScreen({ navigation }: any) {
    const { theme, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const [emis, setEmis] = useState<EMI[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Modal States
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [payModalVisible, setPayModalVisible] = useState(false);
    const [selectedEMI, setSelectedEMI] = useState<EMI | null>(null);

    // Form States
    const [newEMI, setNewEMI] = useState({
        name: '',
        total_amount: '',
        monthly_amount: '',
        due_date: ''
    });
    const [paymentAmount, setPaymentAmount] = useState('');

    // Alert State
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

    const loadEMIs = async () => {
        try {
            const data = await EMIService.getEMIs();
            setEmis(data || []);
        } catch (error) {
            console.error(error);
            showAlert('Error', 'Failed to load EMIs', 'error');
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadEMIs();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadEMIs();
        setRefreshing(false);
    };

    const handleAddEMI = async () => {
        if (!newEMI.name || !newEMI.total_amount || !newEMI.monthly_amount || !newEMI.due_date) {
            showAlert('Error', 'Please fill in all fields', 'error');
            return;
        }

        const dueDate = parseInt(newEMI.due_date);
        if (isNaN(dueDate) || dueDate < 1 || dueDate > 31) {
            showAlert('Error', 'Due date must be between 1 and 31', 'error');
            return;
        }

        setLoading(true);
        try {
            await EMIService.addEMI({
                name: newEMI.name,
                total_amount: parseFloat(newEMI.total_amount),
                monthly_amount: parseFloat(newEMI.monthly_amount),
                due_date: dueDate,
            });
            await loadEMIs();
            setAddModalVisible(false);
            setNewEMI({ name: '', total_amount: '', monthly_amount: '', due_date: '' });
            showAlert('Success', 'EMI added successfully', 'success');
        } catch (error) {
            showAlert('Error', 'Failed to add EMI', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePayEMI = async () => {
        if (!selectedEMI || !paymentAmount) {
            showAlert('Error', 'Please enter payment amount', 'error');
            return;
        }

        setLoading(true);
        try {
            await EMIService.payEMI(selectedEMI.id, parseFloat(paymentAmount), selectedEMI.name);
            await loadEMIs();
            setPayModalVisible(false);
            setPaymentAmount('');
            setSelectedEMI(null);
            showAlert('Success', 'Payment recorded successfully', 'success');
        } catch (error) {
            showAlert('Error', 'Failed to record payment', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEMI = (emi: EMI) => {
        showAlert(
            'Delete EMI',
            `Are you sure you want to delete "${emi.name}"?`,
            'warning',
            true,
            async () => {
                setLoading(true);
                try {
                    await EMIService.deleteEMI(emi.id);
                    await loadEMIs();
                    showAlert('Deleted', 'EMI deleted successfully', 'success');
                } catch (error) {
                    showAlert('Error', 'Failed to delete EMI', 'error');
                } finally {
                    setLoading(false);
                }
            }
        );
    };

    const openPayModal = (emi: EMI) => {
        setSelectedEMI(emi);
        setPaymentAmount(emi.monthly_amount.toString());
        setPayModalVisible(true);
    };

    // Calculate summary safely
    const totalOriginal = emis.reduce((acc, item) => acc + (Number(item.total_amount) || 0), 0);
    const totalRemaining = emis.reduce((acc, item) => acc + (Number(item.remaining_amount) || 0), 0);
    const totalPaid = totalOriginal - totalRemaining;
    const progress = totalOriginal > 0 ? totalPaid / totalOriginal : 0;
    const percentage = Math.round(progress * 100);
    const totalMonthly = emis.reduce((acc, item) => acc + (Number(item.monthly_amount) || 0), 0);

    // Calculate Upcoming EMIs safely
    const today = new Date();
    const currentDay = today.getDate();
    const upcomingEMIs = [...emis]
        .map(emi => {
            const dueDay = Number(emi.due_date) || 1;
            let diff = dueDay - currentDay;
            if (diff < 0) diff += 30;
            return { ...emi, daysRemaining: diff };
        })
        .sort((a, b) => a.daysRemaining - b.daysRemaining)
        .slice(0, 3);

    const getNextDueDate = (day: number) => {
        const today = new Date();
        let nextDate = new Date(today.getFullYear(), today.getMonth(), day);
        if (nextDate < today) {
            nextDate = new Date(today.getFullYear(), today.getMonth() + 1, day);
        }
        return nextDate;
    };

    const formatDueDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    };

    // New helper function for status color
    const getStatusColor = (daysRemaining: number) => {
        if (daysRemaining === 0) return theme.colors.danger;
        if (daysRemaining <= 3) return theme.colors.warning;
        return theme.colors.success;
    };

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
                        onPress={() => navigation.openDrawer()}
                        style={[styles.iconBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
                    >
                        <Ionicons name="menu" size={24} color={theme.colors.text} />
                    </TouchableOpacity>

                    <View style={styles.headerTextContainer}>
                        <AppText style={[styles.headerTitle, { color: theme.colors.text }]}>
                            EMI Tracker
                        </AppText>
                        <AppText style={[styles.headerSub, { color: theme.colors.textSecondary }]}>
                            {emis.length} active loans
                        </AppText>
                    </View>

                    <TouchableOpacity
                        onPress={() => setAddModalVisible(true)}
                        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>
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
                onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
                onConfirm={alertConfig.onConfirm}
            />

            <ScrollView
                style={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingTop: insets.top + 80,
                    paddingBottom: 100,
                    paddingHorizontal: spacing.lg
                }}
            >
                {/* Hero Summary Card with Gradient */}
                <Animated.View entering={ZoomIn.duration(600).springify()}>
                    <LinearGradient
                        colors={isDark ? ['#0F172A', '#1E293B'] : ['#FFFFFF', '#F8FAFC']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.heroCard, { borderColor: theme.colors.border }]}
                    >
                        {/* Decorative Elements */}
                        <View style={[styles.decorCircle, styles.decorCircle1, { backgroundColor: theme.colors.primary + '10' }]} />
                        <View style={[styles.decorCircle, styles.decorCircle2, { backgroundColor: theme.colors.primary + '05' }]} />

                        <View style={styles.heroContent}>
                            <View style={styles.heroHeader}>
                                <View>
                                    <AppText style={[styles.heroLabel, { color: theme.colors.textSecondary }]}>
                                        TOTAL OUTSTANDING
                                    </AppText>
                                    <AppText style={[styles.heroAmount, { color: theme.colors.text }]}>
                                        {formatCurrency(totalRemaining)}
                                    </AppText>
                                </View>
                                <View style={[styles.heroIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                                    <Ionicons name="wallet-outline" size={28} color={theme.colors.primary} />
                                </View>
                            </View>

                            {/* Progress Section */}
                            <View style={styles.progressSection}>
                                <View style={styles.progressHeader}>
                                    <AppText style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
                                        Completion Progress
                                    </AppText>
                                    <AppText style={[styles.progressPercentage, { color: theme.colors.primary }]}>
                                        {percentage}%
                                    </AppText>
                                </View>
                                <View style={[styles.progressBarBg, { backgroundColor: theme.colors.border }]}>
                                    <Animated.View
                                        entering={FadeInDown.duration(800).springify()}
                                        style={[
                                            styles.progressBarFill,
                                            {
                                                width: `${percentage}%`,
                                                backgroundColor: theme.colors.primary,
                                            }
                                        ]}
                                    />
                                </View>
                            </View>

                            {/* Stats Grid */}
                            <View style={styles.statsGrid}>
                                <View style={styles.statCard}>
                                    <AppText style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                        Paid So Far
                                    </AppText>
                                    <AppText style={[styles.statValue, { color: theme.colors.success }]}>
                                        {formatCurrency(totalPaid)}
                                    </AppText>
                                </View>
                                <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
                                <View style={styles.statCard}>
                                    <AppText style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                        Monthly EMI
                                    </AppText>
                                    <AppText style={[styles.statValue, { color: theme.colors.text }]}>
                                        {formatCurrency(totalMonthly)}
                                    </AppText>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* UPCOMING PAYMENTS */}
                {upcomingEMIs.length > 0 && (
                    <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleContainer}>
                                <Ionicons name="calendar" size={20} color={theme.colors.primary} />
                                <AppText style={[styles.sectionTitle, { color: theme.colors.text }]}>
                                    Upcoming Payments
                                </AppText>
                            </View>
                        </View>

                        <View style={styles.upcomingContainer}>
                            {upcomingEMIs.map((emi, index) => {
                                const dueDate = getNextDueDate(emi.due_date);
                                const daysRemaining = emi.daysRemaining;
                                const statusColor = getStatusColor(daysRemaining);

                                return (
                                    <Animated.View
                                        key={emi.id}
                                        entering={FadeInRight.delay(300 + index * 100).duration(600)}
                                    >
                                        <TouchableOpacity
                                            onPress={() => openPayModal(emi)}
                                            activeOpacity={0.9}
                                            style={[styles.upcomingCard, {
                                                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFF',
                                                borderColor: theme.colors.border,
                                                borderLeftColor: statusColor,
                                            }]}
                                        >
                                            {/* Top Row */}
                                            <View style={styles.upcomingCardHeader}>
                                                <View style={styles.upcomingCardTitleContainer}>
                                                    <View style={[styles.emiIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                                                        <Ionicons
                                                            name={emi.name.toLowerCase().includes('car') ? 'car' :
                                                                emi.name.toLowerCase().includes('home') ? 'home' :
                                                                    emi.name.toLowerCase().includes('edu') ? 'school' : 'wallet'}
                                                            size={18}
                                                            color={theme.colors.primary}
                                                        />
                                                    </View>
                                                    <View>
                                                        <AppText style={[styles.emiName, { color: theme.colors.text }]} numberOfLines={1}>
                                                            {emi.name}
                                                        </AppText>
                                                        <View style={styles.dateContainer}>
                                                            <Ionicons name="time-outline" size={12} color={theme.colors.textMuted} />
                                                            <AppText style={[styles.dueDate, { color: theme.colors.textMuted }]}>
                                                                Due {formatDueDate(dueDate)}
                                                            </AppText>
                                                        </View>
                                                    </View>
                                                </View>

                                                <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
                                                    <AppText style={[styles.statusText, { color: statusColor }]}>
                                                        {daysRemaining === 0 ? 'Today' :
                                                            daysRemaining === 1 ? 'Tomorrow' :
                                                                `${daysRemaining} days`}
                                                    </AppText>
                                                </View>
                                            </View>

                                            {/* Divider */}
                                            <View style={[styles.cardDivider, { backgroundColor: theme.colors.border }]} />

                                            {/* Bottom Row */}
                                            <View style={styles.upcomingCardFooter}>
                                                <View>
                                                    <AppText style={[styles.amountLabel, { color: theme.colors.textMuted }]}>
                                                        Payment Due
                                                    </AppText>
                                                    <AppText style={[styles.amountValue, { color: theme.colors.text }]}>
                                                        {formatCurrency(Number(emi.monthly_amount))}
                                                    </AppText>
                                                </View>

                                                <TouchableOpacity
                                                    style={[styles.payNowButton, { backgroundColor: theme.colors.primary }]}
                                                    onPress={() => openPayModal(emi)}
                                                >
                                                    <AppText style={[styles.payNowText, { color: '#FFF' }]}>
                                                        Pay Now
                                                    </AppText>
                                                    <Ionicons name="arrow-forward" size={16} color="#FFF" />
                                                </TouchableOpacity>
                                            </View>
                                        </TouchableOpacity>
                                    </Animated.View>
                                );
                            })}
                        </View>
                    </Animated.View>
                )}

                {/* ALL LOANS SECTION */}
                <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleContainer}>
                            <Ionicons name="list" size={20} color={theme.colors.primary} />
                            <AppText style={[styles.sectionTitle, { color: theme.colors.text }]}>
                                All Loans
                            </AppText>
                        </View>
                    </View>

                    {emis.length === 0 ? (
                        <View style={[styles.emptyState, {
                            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFF',
                            borderColor: theme.colors.border
                        }]}>
                            <View style={[styles.emptyIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                                <Ionicons name="add-circle-outline" size={48} color={theme.colors.primary} />
                            </View>
                            <AppText style={[styles.emptyText, { color: theme.colors.text }]}>
                                No loans added yet
                            </AppText>
                            <AppText style={[styles.emptySubtext, { color: theme.colors.textMuted }]}>
                                Add your first loan to start tracking
                            </AppText>
                            <TouchableOpacity
                                style={[styles.addFirstButton, { backgroundColor: theme.colors.primary }]}
                                onPress={() => setAddModalVisible(true)}
                            >
                                <AppText style={[styles.addFirstButtonText, { color: '#FFF' }]}>
                                    Add First Loan
                                </AppText>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.loansList}>
                            {emis.map((emi, index) => {
                                const progress = (emi.total_amount - emi.remaining_amount) / emi.total_amount;
                                const percent = Math.round(progress * 100);

                                return (
                                    <Animated.View
                                        key={emi.id}
                                        entering={FadeInDown.delay(500 + index * 100).duration(600)}
                                    >
                                        <TouchableOpacity
                                            activeOpacity={0.9}
                                            style={[styles.loanCard, {
                                                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFF',
                                                borderColor: theme.colors.border
                                            }]}
                                        >
                                            <View style={styles.loanHeader}>
                                                <View style={styles.loanTitleRow}>
                                                    <View
                                                        style={[styles.loanIcon, { backgroundColor: theme.colors.primary + '15' }]}
                                                    >
                                                        <Ionicons
                                                            name={emi.name.toLowerCase().includes('car') ? 'car' :
                                                                emi.name.toLowerCase().includes('home') ? 'home' :
                                                                    emi.name.toLowerCase().includes('edu') ? 'school' : 'wallet'}
                                                            size={20}
                                                            color={theme.colors.primary}
                                                        />
                                                    </View>
                                                    <View style={styles.loanTitleInfo}>
                                                        <AppText style={[styles.loanName, { color: theme.colors.text }]}>
                                                            {emi.name}
                                                        </AppText>
                                                        <AppText style={[styles.loanStatus, { color: theme.colors.success }]}>
                                                            Active • Due day {emi.due_date}
                                                        </AppText>
                                                    </View>
                                                </View>
                                                <TouchableOpacity
                                                    onPress={() => handleDeleteEMI(emi)}
                                                    style={[styles.deleteButton, { backgroundColor: theme.colors.danger + '10' }]}
                                                >
                                                    <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
                                                </TouchableOpacity>
                                            </View>

                                            <View style={styles.loanStats}>
                                                <View>
                                                    <AppText style={[styles.loanStatLabel, { color: theme.colors.textMuted }]}>
                                                        Remaining
                                                    </AppText>
                                                    <AppText style={[styles.loanStatValue, { color: theme.colors.text }]}>
                                                        {formatCurrency(emi.remaining_amount)}
                                                    </AppText>
                                                </View>
                                                <View style={[styles.loanStatDivider, { backgroundColor: theme.colors.border }]} />
                                                <View>
                                                    <AppText style={[styles.loanStatLabel, { color: theme.colors.textMuted }]}>
                                                        Monthly
                                                    </AppText>
                                                    <AppText style={[styles.loanStatValue, { color: theme.colors.text }]}>
                                                        {formatCurrency(emi.monthly_amount)}
                                                    </AppText>
                                                </View>
                                                <View style={[styles.loanStatDivider, { backgroundColor: theme.colors.border }]} />
                                                <View>
                                                    <AppText style={[styles.loanStatLabel, { color: theme.colors.textMuted }]}>
                                                        Progress
                                                    </AppText>
                                                    <AppText style={[styles.loanStatValue, { color: theme.colors.primary }]}>
                                                        {percent}%
                                                    </AppText>
                                                </View>
                                            </View>

                                            <View style={[styles.loanProgressBg, { backgroundColor: theme.colors.border }]}>
                                                <Animated.View
                                                    style={[styles.loanProgressFill, {
                                                        width: `${percent}%`,
                                                        backgroundColor: theme.colors.primary
                                                    }]}
                                                />
                                            </View>

                                            <View style={styles.loanActions}>
                                                <TouchableOpacity
                                                    style={[styles.actionButton, { backgroundColor: theme.colors.primary + '15' }]}
                                                    onPress={() => openPayModal(emi)}
                                                >
                                                    <AppText style={[styles.actionButtonText, { color: theme.colors.primary }]}>
                                                        Pay EMI
                                                    </AppText>
                                                </TouchableOpacity>
                                            </View>
                                        </TouchableOpacity>
                                    </Animated.View>
                                );
                            })}
                        </View>
                    )}
                </Animated.View>
            </ScrollView>

            {/* Add EMI Modal */}
            <ActionSheet
                visible={addModalVisible}
                onClose={() => setAddModalVisible(false)}
                title="Add New Loan"
                actionLabel={loading ? 'Adding...' : 'Add Loan'}
                onAction={handleAddEMI}
            >
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <AppText style={[styles.label, { color: theme.colors.text }]}>Loan Name</AppText>
                        <TextInput
                            style={[styles.input, {
                                backgroundColor: theme.colors.surface,
                                color: theme.colors.text,
                                borderColor: theme.colors.border
                            }]}
                            placeholder="e.g. Home Loan, Car Loan"
                            placeholderTextColor={theme.colors.textMuted}
                            value={newEMI.name}
                            onChangeText={(text) => setNewEMI({ ...newEMI, name: text })}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
                            <AppText style={[styles.label, { color: theme.colors.text }]}>Total Amount</AppText>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: theme.colors.surface,
                                    color: theme.colors.text,
                                    borderColor: theme.colors.border
                                }]}
                                placeholder="0.00"
                                placeholderTextColor={theme.colors.textMuted}
                                keyboardType="numeric"
                                value={newEMI.total_amount}
                                onChangeText={(text) => setNewEMI({ ...newEMI, total_amount: text })}
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing.sm }]}>
                            <AppText style={[styles.label, { color: theme.colors.text }]}>Monthly EMI</AppText>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: theme.colors.surface,
                                    color: theme.colors.text,
                                    borderColor: theme.colors.border
                                }]}
                                placeholder="0.00"
                                placeholderTextColor={theme.colors.textMuted}
                                keyboardType="numeric"
                                value={newEMI.monthly_amount}
                                onChangeText={(text) => setNewEMI({ ...newEMI, monthly_amount: text })}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <AppText style={[styles.label, { color: theme.colors.text }]}>Due Day (1-31)</AppText>
                        <TextInput
                            style={[styles.input, {
                                backgroundColor: theme.colors.surface,
                                color: theme.colors.text,
                                borderColor: theme.colors.border
                            }]}
                            placeholder="e.g. 5"
                            placeholderTextColor={theme.colors.textMuted}
                            keyboardType="numeric"
                            maxLength={2}
                            value={newEMI.due_date}
                            onChangeText={(text) => setNewEMI({ ...newEMI, due_date: text })}
                        />
                    </View>
                </View>
            </ActionSheet>

            {/* Pay EMI Modal */}
            <ActionSheet
                visible={payModalVisible}
                onClose={() => setPayModalVisible(false)}
                title={`Pay ${selectedEMI?.name || 'EMI'}`}
                actionLabel={loading ? 'Processing...' : 'Confirm Payment'}
                onAction={handlePayEMI}
            >
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <AppText style={[styles.label, { color: theme.colors.text }]}>Payment Amount</AppText>
                        <TextInput
                            style={[styles.input, {
                                backgroundColor: theme.colors.surface,
                                color: theme.colors.text,
                                borderColor: theme.colors.border
                            }]}
                            placeholder="0.00"
                            placeholderTextColor={theme.colors.textMuted}
                            keyboardType="numeric"
                            value={paymentAmount}
                            onChangeText={setPaymentAmount}
                        />
                    </View>
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
    scrollContent: {
        flex: 1,
    },
    heroCard: {
        borderRadius: 24,
        padding: spacing.lg,
        position: 'relative',
        overflow: 'hidden',
        borderWidth: 1,
        marginBottom: spacing.xl,
    },
    decorCircle: {
        position: 'absolute',
        borderRadius: 999,
    },
    decorCircle1: {
        width: 200,
        height: 200,
        top: -50,
        right: -50,
    },
    decorCircle2: {
        width: 150,
        height: 150,
        bottom: -30,
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
        marginBottom: spacing.xl,
    },
    heroLabel: {
        fontSize: 12,
        fontFamily: 'Poppins_600SemiBold',
        letterSpacing: 1,
        marginBottom: spacing.xs,
        opacity: 0.8,
    },
    heroAmount: {
        fontSize: 32,
        fontFamily: 'Poppins_700Bold',
        letterSpacing: -0.5,
    },
    heroIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressSection: {
        marginBottom: spacing.xl,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    progressLabel: {
        fontSize: 13,
        fontFamily: 'Poppins_500Medium',
    },
    progressPercentage: {
        fontSize: 14,
        fontFamily: 'Poppins_700Bold',
    },
    progressBarBg: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    statsGrid: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statCard: {
        flex: 1,
    },
    statDivider: {
        width: 1,
        height: 30,
        marginHorizontal: spacing.lg,
    },
    statLabel: {
        fontSize: 12,
        fontFamily: 'Poppins_500Medium',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontFamily: 'Poppins_700Bold',
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
        fontSize: 13,
        fontFamily: 'Poppins_400Regular',
    },
    upcomingContainer: {
        gap: spacing.md,
    },
    upcomingCard: {
        borderRadius: 16,
        padding: spacing.md,
        borderLeftWidth: 4,
        borderWidth: 1,
    },
    upcomingCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    upcomingCardTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        flex: 1,
    },
    emiIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emiName: {
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
        marginBottom: 2,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dueDate: {
        fontSize: 12,
        fontFamily: 'Poppins_400Regular',
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusText: {
        fontSize: 12,
        fontFamily: 'Poppins_600SemiBold',
    },
    cardDivider: {
        height: 1,
        width: '100%',
        marginVertical: spacing.md,
    },
    upcomingCardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    amountLabel: {
        fontSize: 12,
        fontFamily: 'Poppins_500Medium',
        marginBottom: 2,
    },
    amountValue: {
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
    },
    payNowButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        paddingVertical: 8,
        borderRadius: 20,
    },
    payNowText: {
        fontSize: 13,
        fontFamily: 'Poppins_600SemiBold',
    },
    emptyState: {
        alignItems: 'center',
        padding: spacing.xl,
        borderRadius: 20,
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    emptyIconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    emptyText: {
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
        marginBottom: spacing.xs,
    },
    emptySubtext: {
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    addFirstButton: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: 30,
    },
    addFirstButtonText: {
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
    },
    loansList: {
        gap: spacing.md,
    },
    loanCard: {
        borderRadius: 16,
        padding: spacing.md,
        borderWidth: 1,
    },
    loanHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    loanTitleRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    loanIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loanTitleInfo: {
        justifyContent: 'space-between',
    },
    loanName: {
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
    },
    loanStatus: {
        fontSize: 12,
        fontFamily: 'Poppins_500Medium',
    },
    deleteButton: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loanStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.sm,
    },
    loanStatDivider: {
        width: 1,
        height: '100%',
        marginHorizontal: spacing.sm,
    },
    loanStatLabel: {
        fontSize: 11,
        fontFamily: 'Poppins_500Medium',
        marginBottom: 2,
    },
    loanStatValue: {
        fontSize: 14,
        fontFamily: 'Poppins_700Bold',
    },
    loanProgressBg: {
        height: 6,
        borderRadius: 3,
        marginTop: spacing.md,
        overflow: 'hidden',
    },
    loanProgressFill: {
        height: '100%',
        borderRadius: 3,
    },
    loanActions: {
        marginTop: spacing.md,
        alignItems: 'flex-end',
    },
    actionButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: 8,
    },
    actionButtonText: {
        fontSize: 13,
        fontFamily: 'Poppins_600SemiBold',
    },
    form: {
        gap: spacing.lg,
    },
    inputGroup: {
        gap: spacing.xs,
    },
    label: {
        fontSize: 14,
        fontFamily: 'Poppins_600SemiBold',
        marginLeft: 4,
    },
    input: {
        height: 52,
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: spacing.md,
        fontSize: 16,
        fontFamily: 'Poppins_400Regular',
    },
    row: {
        flexDirection: 'row',
    },
    submitButton: {
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    submitButtonText: {
        fontSize: 16,
        fontFamily: 'Poppins_600SemiBold',
    },
});