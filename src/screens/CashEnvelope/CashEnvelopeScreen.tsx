import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AppText from '../../components/common/AppText';
import EnvelopeCard from '../../components/CashEnvelope/EnvelopeCard';
import ActionSheet from '../../components/common/ActionSheet';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import { formatCurrency } from '../../utils/helpers';
import Animated, { FadeInUp, ZoomIn, FadeInRight } from 'react-native-reanimated';
import CustomAlert from '../../components/common/CustomAlert';
import { GoalService } from '../../services/goal.service';
import { BudgetResetService } from '../../services/budgetReset.service';

const { width } = Dimensions.get('window');

const INITIAL_ENVELOPES = [
    { id: '1', name: 'Food & Dining', allocated: 4000, spent: 1800, icon: 'restaurant', color: '#FCA311' },
    { id: '2', name: 'Shopping', allocated: 3000, spent: 2400, icon: 'cart', color: '#8B5CF6' },
    { id: '3', name: 'Entertainment', allocated: 2000, spent: 800, icon: 'game-controller', color: '#EC4899' },
    { id: '4', name: 'Transport', allocated: 1500, spent: 500, icon: 'car', color: '#10B981' },
    { id: '5', name: 'Utilities', allocated: 2500, spent: 2200, icon: 'flash', color: '#3B82F6' },
    { id: '6', name: 'Healthcare', allocated: 1200, spent: 300, icon: 'medical', color: '#EF4444' },
];

const CashEnvelopeScreen = ({ navigation, route }: any) => {
    const { theme } = useTheme();
    const [envelopes, setEnvelopes] = useState(INITIAL_ENVELOPES);
    const [selectedEnvelope, setSelectedEnvelope] = useState<any>(null);
    const [isSpendModalVisible, setSpendModalVisible] = useState(false);
    const [spendAmount, setSpendAmount] = useState('');

    // Edit/Add Modal State
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [editingEnvelope, setEditingEnvelope] = useState<any>(null);
    const [envelopeFormData, setEnvelopeFormData] = useState({
        name: '',
        allocated: '',
        icon: 'cash',
        color: '#FCA311'
    });

    // Smart Reset State
    const [isResetModalVisible, setResetModalVisible] = useState(false);
    const [availableGoals, setAvailableGoals] = useState<any[]>([]);
    const [resetStep, setResetStep] = useState<'initial' | 'goals'>('initial');

    const AVAILABLE_ICONS = ['restaurant', 'cart', 'game-controller', 'car', 'flash', 'medical', 'school', 'airplane', 'gift', 'fitness', 'cafe', 'paw', 'home', 'pizza', 'shirt', 'film', 'basketball', 'heart'];
    const AVAILABLE_COLORS = ['#FCA311', '#8B5CF6', '#EC4899', '#10B981', '#3B82F6', '#EF4444', '#6366F1', '#F472B6', '#14B8A6'];

    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info' as 'info' | 'success' | 'error' | 'warning',
        showCancel: false,
        onConfirm: () => { },
    });

    // Check for Rollover on Mount
    useEffect(() => {
        const checkRollover = async () => {
            const isPayday = route?.params?.isPayday;
            const resetDue = await BudgetResetService.shouldCheckReset();

            if (isPayday || resetDue) {
                handleResetPress();
            }
        };
        checkRollover();
    }, [route?.params?.isPayday]);

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

    const totalAllocated = envelopes.reduce((sum, item) => sum + item.allocated, 0);
    const totalSpent = envelopes.reduce((sum, item) => sum + item.spent, 0);
    const totalRemaining = totalAllocated - totalSpent;
    const progressPercentage = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

    const handleEnvelopePress = (envelope: any) => {
        if (envelope.spent >= envelope.allocated) {
            showAlert("Envelope Locked 🔒", `The ${envelope.name} envelope is empty! You cannot spend more from this category.`, 'warning');
            return;
        }
        setSelectedEnvelope(envelope);
        setSpendModalVisible(true);
    };

    const handleSpend = () => {
        if (!spendAmount || isNaN(Number(spendAmount))) {
            showAlert("Invalid Amount", "Please enter a valid amount", 'error');
            return;
        }

        const amount = parseInt(spendAmount);
        if (amount <= 0) {
            showAlert("Invalid Amount", "Amount must be greater than 0", 'error');
            return;
        }

        if (selectedEnvelope) {
            const newSpent = selectedEnvelope.spent + amount;
            if (newSpent > selectedEnvelope.allocated) {
                showAlert("Insufficient Funds", "You don't have enough money in this envelope!", 'error');
                return;
            }

            const updatedEnvelopes = envelopes.map(env =>
                env.id === selectedEnvelope.id ? { ...env, spent: newSpent } : env
            );

            setEnvelopes(updatedEnvelopes);
            setSpendModalVisible(false);
            setSpendAmount('');
            setSelectedEnvelope(null);

            // Gamification / Notification Logic
            const remaining = selectedEnvelope.allocated - newSpent;
            if (remaining === 0) {
                showAlert("🚫 Envelope Empty", `${selectedEnvelope.name} budget is now empty.`, 'warning');
            } else if (remaining < selectedEnvelope.allocated * 0.25) {
                showAlert("⚠ Low Balance", `${selectedEnvelope.name} is running low — ${formatCurrency(remaining)} left!`, 'warning');
            } else {
                showAlert("💸 Spent!", `${formatCurrency(amount)} spent from ${selectedEnvelope.name}.`, 'success');
            }
        }
    };

    const openAddModal = () => {
        setEditingEnvelope(null);
        setEnvelopeFormData({
            name: '',
            allocated: '',
            icon: AVAILABLE_ICONS[0],
            color: AVAILABLE_COLORS[0]
        });
        setEditModalVisible(true);
    };

    const openEditModal = (envelope: any) => {
        setEditingEnvelope(envelope);
        setEnvelopeFormData({
            name: envelope.name,
            allocated: envelope.allocated.toString(),
            icon: envelope.icon,
            color: envelope.color
        });
        setEditModalVisible(true);
    };

    const handleSaveEnvelope = () => {
        if (!envelopeFormData.name.trim()) {
            showAlert("Error", "Please enter a category name", 'error');
            return;
        }
        if (!envelopeFormData.allocated || isNaN(Number(envelopeFormData.allocated)) || Number(envelopeFormData.allocated) <= 0) {
            showAlert("Error", "Please enter a valid budget amount", 'error');
            return;
        }

        const allocatedAmount = parseInt(envelopeFormData.allocated);

        if (editingEnvelope) {
            // Update existing
            const updatedEnvelopes = envelopes.map(env =>
                env.id === editingEnvelope.id
                    ? {
                        ...env,
                        name: envelopeFormData.name,
                        allocated: allocatedAmount,
                        icon: envelopeFormData.icon,
                        color: envelopeFormData.color
                    }
                    : env
            );
            setEnvelopes(updatedEnvelopes);
            showAlert("Updated", "Envelope updated successfully", 'success');
        } else {
            // Create new
            const newEnvelope = {
                id: Date.now().toString(),
                name: envelopeFormData.name,
                allocated: allocatedAmount,
                spent: 0,
                icon: envelopeFormData.icon,
                color: envelopeFormData.color
            };
            setEnvelopes([...envelopes, newEnvelope]);
            showAlert("Created", "New envelope created successfully", 'success');
        }
        setEditModalVisible(false);
    };

    const handleDeleteEnvelope = () => {
        if (!editingEnvelope) return;

        showAlert(
            "Delete Envelope",
            `Are you sure you want to delete ${editingEnvelope.name}? This cannot be undone.`,
            'warning',
            true,
            () => {
                const filteredEnvelopes = envelopes.filter(env => env.id !== editingEnvelope.id);
                setEnvelopes(filteredEnvelopes);
                setEditModalVisible(false);
                showAlert("Deleted", "Envelope deleted successfully", 'success');
            }
        );
    };

    // --- Smart Reset Logic ---
    const handleResetPress = async () => {
        const remaining = envelopes.reduce((sum, item) => sum + item.allocated, 0) - envelopes.reduce((sum, item) => sum + item.spent, 0);

        if (remaining > 0) {
            // Check for goals
            try {
                const goals = await GoalService.getGoals();
                const activeGoals = goals.filter(g => g.status === 'active');
                setAvailableGoals(activeGoals);
                setResetStep('initial');
                setResetModalVisible(true);
            } catch (e) {
                console.error("Error fetching goals", e);
                // Fallback to simple reset if error
                confirmSimpleReset();
            }
        } else {
            confirmSimpleReset();
        }
    };

    const confirmSimpleReset = () => {
        setResetModalVisible(false);
        showAlert(
            "Reset All Envelopes",
            "Are you sure you want to reset all spending back to 0?",
            'warning',
            true,
            () => {
                performReset();
            }
        );
    };

    const performReset = async () => {
        const resetEnvelopes = envelopes.map(env => ({ ...env, spent: 0 }));
        setEnvelopes(resetEnvelopes);
        setResetModalVisible(false);

        await BudgetResetService.commitReset('budget', 0);

        showAlert("Reset Complete", "All envelopes have been reset for the new month.", 'success');
    };

    const handleAllocateToGoal = async (goal: any) => {
        const remaining = envelopes.reduce((sum, item) => sum + item.allocated, 0) - envelopes.reduce((sum, item) => sum + item.spent, 0);

        try {
            await GoalService.addSavings(goal.id, remaining, goal.title);
            await BudgetResetService.commitReset('savings', remaining);

            // Reset local state
            const resetEnvelopes = envelopes.map(env => ({ ...env, spent: 0 }));
            setEnvelopes(resetEnvelopes);
            setResetModalVisible(false);

            showAlert("Success", `Transferred ${formatCurrency(remaining)} to ${goal.title} and reset envelopes!`, 'success');
        } catch (error) {
            showAlert("Error", "Failed to transfer funds to goal.", 'error');
        }
    };
    // -------------------------

    const isDark = theme.colors.background === '#000000';

    // Sort envelopes by remaining amount (lowest first)
    const sortedEnvelopes = [...envelopes].sort((a, b) => {
        const aRemaining = a.allocated - a.spent;
        const bRemaining = b.allocated - b.spent;
        return aRemaining - bRemaining;
    });

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                showCancel={alertConfig.showCancel}
                onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
                onConfirm={alertConfig.onConfirm}
            />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.iconButton, { backgroundColor: theme.colors.surface }]}
                >
                    <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
                </TouchableOpacity>
                <View>
                    <AppText style={[styles.headerTitle, { color: theme.colors.text }]}>Cash Envelopes</AppText>
                    <AppText style={[styles.headerSubtitle, { color: theme.colors.textMuted }]}>
                        {envelopes.length} categories • {formatCurrency(totalRemaining)} left
                    </AppText>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
                        onPress={handleResetPress}
                    >
                        <Ionicons name="refresh" size={18} color={theme.colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                        onPress={openAddModal}
                    >
                        <Ionicons name="add" size={18} color={isDark ? "#000" : "#FFF"} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* Hero Summary Card */}
                <Animated.View entering={ZoomIn.duration(600).springify()}>
                    <LinearGradient
                        colors={isDark ? ['#14213D', '#1A2A4A', '#14213D'] : ['#FCA311', '#E59400', '#FCA311']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroCard}
                    >
                        {/* Decorative Elements */}
                        <View style={[styles.decorCircle, styles.decorCircle1, { backgroundColor: isDark ? 'rgba(252, 163, 17, 0.1)' : 'rgba(255, 255, 255, 0.15)' }]} />
                        <View style={[styles.decorCircle, styles.decorCircle2, { backgroundColor: isDark ? 'rgba(252, 163, 17, 0.05)' : 'rgba(255, 255, 255, 0.1)' }]} />

                        <View style={styles.heroContent}>
                            <View style={styles.heroHeader}>
                                <View>
                                    <AppText style={[styles.heroLabel, { color: isDark ? '#E5E5E5' : '#000' }]}>
                                        TOTAL REMAINING
                                    </AppText>
                                    <AppText style={[styles.heroAmount, { color: isDark ? '#FFF' : '#000' }]}>
                                        {formatCurrency(totalRemaining)}
                                    </AppText>
                                </View>
                                <View style={[styles.heroIconContainer, { backgroundColor: isDark ? 'rgba(252, 163, 17, 0.2)' : 'rgba(0, 0, 0, 0.1)' }]}>
                                    <Ionicons name="wallet" size={28} color={isDark ? '#FCA311' : '#000'} />
                                </View>
                            </View>

                            {/* Progress Section */}
                            <View style={styles.progressSection}>
                                <View style={styles.progressHeader}>
                                    <AppText style={[styles.progressLabel, { color: isDark ? '#E5E5E5' : 'rgba(0,0,0,0.7)' }]}>
                                        Budget Usage
                                    </AppText>
                                    <AppText style={[styles.progressPercentage, { color: isDark ? '#FCA311' : '#000' }]}>
                                        {Math.round(progressPercentage)}%
                                    </AppText>
                                </View>
                                <View style={[styles.progressBarBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)' }]}>
                                    <Animated.View
                                        style={[
                                            styles.progressBarFill,
                                            {
                                                width: `${Math.min(progressPercentage, 100)}%`,
                                                backgroundColor: isDark ? '#FCA311' : '#000',
                                            }
                                        ]}
                                    />
                                </View>
                            </View>

                            {/* Stats Grid */}
                            <View style={styles.statsGrid}>
                                <View style={styles.statCard}>
                                    <AppText style={[styles.statLabel, { color: isDark ? '#A0A0A0' : 'rgba(0,0,0,0.6)' }]}>
                                        Allocated
                                    </AppText>
                                    <AppText style={[styles.statValue, { color: isDark ? '#22C55E' : '#000' }]}>
                                        {formatCurrency(totalAllocated)}
                                    </AppText>
                                </View>
                                <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
                                <View style={styles.statCard}>
                                    <AppText style={[styles.statLabel, { color: isDark ? '#A0A0A0' : 'rgba(0,0,0,0.6)' }]}>
                                        Spent
                                    </AppText>
                                    <AppText style={[styles.statValue, { color: isDark ? '#EF4444' : '#000' }]}>
                                        {formatCurrency(totalSpent)}
                                    </AppText>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Section Header */}
                <Animated.View entering={FadeInRight.delay(200).duration(600)} style={styles.sectionHeader}>
                    <View style={styles.sectionTitleContainer}>
                        <LinearGradient
                            colors={[theme.colors.primary, theme.colors.primaryDark]}
                            style={styles.sectionIconContainer}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Ionicons name="folder-open" size={18} color="#FFF" />
                        </LinearGradient>
                        <View>
                            <AppText style={[styles.sectionTitle, { color: theme.colors.text }]}>
                                Budget Categories
                            </AppText>
                            <AppText style={[styles.sectionSubtitle, { color: theme.colors.textMuted }]}>
                                Tap to spend • Long press to edit
                            </AppText>
                        </View>
                    </View>
                    <View style={[styles.countBadge, { backgroundColor: isDark ? 'rgba(252, 163, 17, 0.1)' : '#FCA31120' }]}>
                        <AppText style={[styles.countText, { color: theme.colors.primary }]}>
                            {envelopes.length}
                        </AppText>
                    </View>
                </Animated.View>

                {/* Empty State Warning */}
                {sortedEnvelopes.filter(e => (e.allocated - e.spent) <= 0).length > 0 && (
                    <Animated.View entering={FadeInRight.delay(300).duration(600)}>
                        <View style={[styles.warningCard, {
                            backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#EF444410',
                            borderLeftColor: theme.colors.danger
                        }]}>
                            <View style={styles.warningHeader}>
                                <Ionicons name="warning" size={20} color={theme.colors.danger} />
                                <AppText style={[styles.warningTitle, { color: theme.colors.text }]}>
                                    Empty Envelopes
                                </AppText>
                            </View>
                            <AppText style={[styles.warningText, { color: theme.colors.textMuted }]}>
                                {sortedEnvelopes.filter(e => (e.allocated - e.spent) <= 0).length} category(s) have no budget left
                            </AppText>
                        </View>
                    </Animated.View>
                )}

                {/* Envelopes Grid */}
                <View style={styles.gridContainer}>
                    <View style={styles.grid}>
                        {sortedEnvelopes.map((envelope, index) => (
                            <Animated.View
                                key={envelope.id}
                                entering={FadeInUp.delay(400 + (index * 50)).duration(600).springify()}
                                style={styles.gridItem}
                            >
                                <EnvelopeCard
                                    name={envelope.name}
                                    allocated={envelope.allocated}
                                    spent={envelope.spent}
                                    icon={envelope.icon}
                                    color={envelope.color}
                                    onPress={() => handleEnvelopePress(envelope)}
                                    onLongPress={() => openEditModal(envelope)}
                                />
                            </Animated.View>
                        ))}
                    </View>
                </View>

                {/* Tips Section */}
                <Animated.View entering={FadeInRight.delay(500).duration(600)} style={styles.tipsSection}>
                    <View style={[styles.tipsCard, { backgroundColor: isDark ? 'rgba(20, 33, 61, 0.5)' : theme.colors.surface }]}>
                        <View style={styles.tipsHeader}>
                            <Ionicons name="bulb-outline" size={18} color={theme.colors.primary} />
                            <AppText style={[styles.tipsTitle, { color: theme.colors.text }]}>
                                Budgeting Tips
                            </AppText>
                        </View>
                        <View style={styles.tipItem}>
                            <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
                            <AppText style={[styles.tipText, { color: theme.colors.textMuted }]}>
                                Assign money to envelopes as soon as you get paid
                            </AppText>
                        </View>
                        <View style={styles.tipItem}>
                            <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
                            <AppText style={[styles.tipText, { color: theme.colors.textMuted }]}>
                                Review spending weekly to stay on track
                            </AppText>
                        </View>
                        <View style={styles.tipItem}>
                            <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
                            <AppText style={[styles.tipText, { color: theme.colors.textMuted }]}>
                                Move unused funds to savings at month-end
                            </AppText>
                        </View>
                    </View>
                </Animated.View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Spend Modal */}
            <ActionSheet
                visible={isSpendModalVisible}
                onClose={() => {
                    setSpendModalVisible(false);
                    setSpendAmount('');
                    setSelectedEnvelope(null);
                }}
                title={`Spend from ${selectedEnvelope?.name}`}
                actionLabel="Confirm Spend"
                onAction={handleSpend}
                actionDisabled={!spendAmount || isNaN(parseInt(spendAmount)) || parseInt(spendAmount) <= 0}
            >
                <View style={styles.modalContent}>
                    <LinearGradient
                        colors={[selectedEnvelope?.color || theme.colors.primary, selectedEnvelope?.color + 'DD' || theme.colors.primaryDark]}
                        style={styles.envelopeIconContainer}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons name={selectedEnvelope?.icon || 'cash'} size={32} color="#FFF" />
                    </LinearGradient>

                    <AppText style={[styles.modalSubtitle, { color: theme.colors.textMuted }]}>
                        Enter spending amount
                    </AppText>

                    <View style={styles.inputContainer}>
                        <AppText style={[styles.currencySymbol, { color: theme.colors.text }]}>₹</AppText>
                        <TextInput
                            style={[styles.amountInput, { color: theme.colors.text }]}
                            placeholder="0"
                            placeholderTextColor={theme.colors.textMuted}
                            keyboardType="numeric"
                            value={spendAmount}
                            onChangeText={setSpendAmount}
                            autoFocus
                            maxLength={8}
                        />
                    </View>

                    <View style={styles.budgetInfo}>
                        <View style={styles.budgetRow}>
                            <AppText style={[styles.budgetLabel, { color: theme.colors.textMuted }]}>
                                Available in envelope:
                            </AppText>
                            <AppText style={[styles.budgetValue, { color: theme.colors.success }]}>
                                {selectedEnvelope ? formatCurrency(selectedEnvelope.allocated - selectedEnvelope.spent) : ''}
                            </AppText>
                        </View>
                        <View style={styles.budgetRow}>
                            <AppText style={[styles.budgetLabel, { color: theme.colors.textMuted }]}>
                                After spending:
                            </AppText>
                            <AppText style={[styles.budgetValue, {
                                color: selectedEnvelope && spendAmount ?
                                    ((selectedEnvelope.allocated - selectedEnvelope.spent - parseInt(spendAmount)) < 0 ? theme.colors.danger : theme.colors.text)
                                    : theme.colors.text
                            }]}>
                                {selectedEnvelope && spendAmount && !isNaN(parseInt(spendAmount))
                                    ? formatCurrency(selectedEnvelope.allocated - selectedEnvelope.spent - parseInt(spendAmount))
                                    : '--'
                                }
                            </AppText>
                        </View>
                    </View>
                </View>
            </ActionSheet>

            {/* Edit/Add Envelope Modal */}
            <ActionSheet
                visible={isEditModalVisible}
                onClose={() => setEditModalVisible(false)}
                title={editingEnvelope ? "Edit Category" : "New Category"}
                actionLabel={editingEnvelope ? "Save Changes" : "Create Category"}
                onAction={handleSaveEnvelope}
                secondaryActionLabel={editingEnvelope ? "Delete Category" : undefined}
                onSecondaryAction={editingEnvelope ? handleDeleteEnvelope : undefined}
                secondaryActionDestructive
            >
                <View style={styles.modalContent}>
                    <View style={styles.inputGroup}>
                        <AppText style={[styles.label, { color: theme.colors.text }]}>Category Name</AppText>
                        <TextInput
                            style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                            placeholder="e.g. Groceries"
                            placeholderTextColor={theme.colors.textMuted}
                            value={envelopeFormData.name}
                            onChangeText={(text) => setEnvelopeFormData({ ...envelopeFormData, name: text })}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <AppText style={[styles.label, { color: theme.colors.text }]}>Budget Amount</AppText>
                        <TextInput
                            style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                            placeholder="0.00"
                            placeholderTextColor={theme.colors.textMuted}
                            keyboardType="numeric"
                            value={envelopeFormData.allocated}
                            onChangeText={(text) => setEnvelopeFormData({ ...envelopeFormData, allocated: text })}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <AppText style={[styles.label, { color: theme.colors.text }]}>Icon</AppText>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.iconSelector}>
                            {AVAILABLE_ICONS.map(icon => (
                                <TouchableOpacity
                                    key={icon}
                                    style={[
                                        styles.iconOption,
                                        envelopeFormData.icon === icon && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                                    ]}
                                    onPress={() => setEnvelopeFormData({ ...envelopeFormData, icon })}
                                >
                                    <Ionicons name={icon as any} size={24} color={envelopeFormData.icon === icon ? '#FFF' : theme.colors.textMuted} />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.inputGroup}>
                        <AppText style={[styles.label, { color: theme.colors.text }]}>Color</AppText>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorSelector}>
                            {AVAILABLE_COLORS.map(color => (
                                <TouchableOpacity
                                    key={color}
                                    style={[
                                        styles.colorOption,
                                        { backgroundColor: color },
                                        envelopeFormData.color === color && styles.selectedColorOption
                                    ]}
                                    onPress={() => setEnvelopeFormData({ ...envelopeFormData, color })}
                                >
                                    {envelopeFormData.color === color && <Ionicons name="checkmark" size={16} color="#FFF" />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </ActionSheet>

            {/* Smart Reset Modal */}
            <ActionSheet
                visible={isResetModalVisible}
                onClose={() => setResetModalVisible(false)}
                title="Monthly Rollover"
            >
                <View style={styles.modalContent}>
                    <AppText style={[styles.modalLabel, { color: theme.colors.textMuted }]}>
                        You have {formatCurrency(envelopes.reduce((sum, item) => sum + item.allocated, 0) - envelopes.reduce((sum, item) => sum + item.spent, 0))} remaining from this month's budget.
                    </AppText>

                    {resetStep === 'initial' ? (
                        <View style={{ gap: 12 }}>
                            <TouchableOpacity
                                style={[styles.optionButton, { backgroundColor: theme.colors.primary }]}
                                onPress={() => setResetStep('goals')}
                            >
                                <Ionicons name="trophy-outline" size={20} color="#FFF" />
                                <AppText style={styles.optionButtonText}>Add to Savings Goal</AppText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.optionButton, { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }]}
                                onPress={confirmSimpleReset}
                            >
                                <Ionicons name="refresh-outline" size={20} color={theme.colors.text} />
                                <AppText style={[styles.optionButtonText, { color: theme.colors.text }]}>Just Reset Envelopes</AppText>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View>
                            <AppText style={[styles.modalLabel, { marginBottom: 12 }]}>Select a Goal:</AppText>
                            {availableGoals.length > 0 ? (
                                availableGoals.map(goal => (
                                    <TouchableOpacity
                                        key={goal.id}
                                        style={[styles.goalItem, { backgroundColor: theme.colors.surface }]}
                                        onPress={() => handleAllocateToGoal(goal)}
                                    >
                                        <View style={[styles.goalIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                                            <Ionicons name="trophy" size={18} color={theme.colors.primary} />
                                        </View>
                                        <View>
                                            <AppText style={[styles.goalTitle, { color: theme.colors.text }]}>{goal.title}</AppText>
                                            <AppText style={[styles.goalSubtitle, { color: theme.colors.textMuted }]}>
                                                Target: {formatCurrency(goal.target_amount)}
                                            </AppText>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <AppText style={{ color: theme.colors.textMuted, textAlign: 'center' }}>No active goals found.</AppText>
                            )}

                            <TouchableOpacity
                                onPress={() => setResetStep('initial')}
                                style={{ marginTop: 16, padding: 12, alignItems: 'center' }}
                            >
                                <AppText style={{ color: theme.colors.textMuted }}>Back</AppText>
                            </TouchableOpacity>
                        </View>
                    )}
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
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerActions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 13,
        fontWeight: '500',
        textAlign: 'center',
        marginTop: 2,
    },
    scrollContent: {
        paddingBottom: spacing.xl,
    },
    heroCard: {
        borderRadius: 28,
        padding: spacing.lg,
        margin: spacing.lg,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
        elevation: 12,
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
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: 8,
        opacity: 0.9,
    },
    heroAmount: {
        fontSize: 42,
        fontWeight: '900',
        letterSpacing: -1,
    },
    heroIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressSection: {
        marginBottom: spacing.md,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    progressLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    progressPercentage: {
        fontSize: 16,
        fontWeight: '800',
    },
    progressBarBg: {
        height: 10,
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 5,
    },
    statsGrid: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.md,
    },
    statCard: {
        flex: 1,
    },
    statDivider: {
        width: 1,
        height: 40,
        marginHorizontal: spacing.md,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 6,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '800',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        marginTop: spacing.xl,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
    },
    sectionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 19,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
    sectionSubtitle: {
        fontSize: 13,
        fontWeight: '500',
        marginTop: 2,
    },
    countBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    countText: {
        fontSize: 15,
        fontWeight: '800',
    },
    warningCard: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        padding: spacing.md,
        borderRadius: 16,
        borderLeftWidth: 4,
    },
    warningHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    warningTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    warningText: {
        fontSize: 14,
    },
    gridContainer: {
        paddingHorizontal: spacing.lg,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    gridItem: {
        width: (width - (spacing.lg * 2) - spacing.md) / 2,
    },
    tipsSection: {
        marginHorizontal: spacing.lg,
        marginTop: spacing.xl,
    },
    tipsCard: {
        padding: spacing.lg,
        borderRadius: 20,
    },
    tipsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: spacing.md,
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    tipText: {
        fontSize: 13,
        flex: 1,
    },
    modalContent: {
        paddingVertical: spacing.md,
        width: '100%',
    },
    envelopeIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: spacing.lg,
    },
    modalSubtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xl,
    },
    currencySymbol: {
        fontSize: 32,
        fontWeight: '700',
        marginRight: 8,
    },
    amountInput: {
        fontSize: 48,
        fontWeight: '800',
        minWidth: 100,
        textAlign: 'center',
    },
    budgetInfo: {
        backgroundColor: 'rgba(0,0,0,0.03)',
        padding: spacing.lg,
        borderRadius: 16,
    },
    budgetRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    budgetLabel: {
        fontSize: 14,
    },
    budgetValue: {
        fontSize: 14,
        fontWeight: '700',
    },
    inputGroup: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: spacing.md,
        fontSize: 16,
    },
    iconSelector: {
        flexDirection: 'row',
        gap: 12,
    },
    iconOption: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    colorSelector: {
        flexDirection: 'row',
        gap: 12,
    },
    colorOption: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedColorOption: {
        borderWidth: 3,
        borderColor: 'rgba(0,0,0,0.2)',
    },
    modalLabel: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    optionButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
    goalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    goalIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    goalTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    goalSubtitle: {
        fontSize: 12,
    },
});

export default CashEnvelopeScreen;