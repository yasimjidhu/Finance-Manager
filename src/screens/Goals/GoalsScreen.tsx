import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Screen from '../../components/common/Screen';
import AppText from '../../components/common/AppText';
import GoalCard from '../../components/Goals/GoalCard';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import Ionicons from '@expo/vector-icons/Ionicons';
import ActionSheet from '../../components/common/ActionSheet';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GoalService, Goal } from '../../services/goal.service';
import { ReceiptScannerService } from '../../services/receiptScanner.service';
import CustomAlert from '../../components/common/CustomAlert';
import LoadingOverlay from '../../components/common/LoadingOverlay';

const GoalsScreen = () => {
    const { theme } = useTheme();
    const [isModalVisible, setModalVisible] = useState(false);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [newGoal, setNewGoal] = useState({ title: '', targetAmount: '', savedAmount: '', imageUri: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadGoals();
    }, []);

    const loadGoals = async () => {
        const data = await GoalService.getGoals();
        setGoals(data);
    };

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

    const handlePickImage = async () => {
        const hasPermission = await ReceiptScannerService.requestPermissions();
        if (!hasPermission) {
            showAlert('Permission Denied', 'We need permission to access your gallery.', 'error');
            return;
        }

        const uri = await ReceiptScannerService.pickImage();
        if (uri) {
            setNewGoal({ ...newGoal, imageUri: uri });
        }
    };

    const handleAddGoal = async () => {
        if (!newGoal.title || !newGoal.targetAmount) {
            showAlert('Error', 'Please enter a title and target amount.', 'error');
            return;
        }

        setLoading(true);
        try {
            const target = parseInt(newGoal.targetAmount);
            // Default deadline to 1 year from now for demo
            const deadline = new Date(Date.now() + 31536000000).toISOString();

            await GoalService.addGoal({
                title: newGoal.title,
                target_amount: target,
                deadline: deadline,
            }, newGoal.imageUri); // Pass image URI (base64 handling is in service)

            await loadGoals();
            setModalVisible(false);
            setNewGoal({ title: '', targetAmount: '', savedAmount: '', imageUri: '' });
            showAlert('Success', 'Goal added successfully!', 'success');
        } catch (error) {
            showAlert('Error', 'Failed to add goal. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const [savingsModalVisible, setSavingsModalVisible] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
    const [savingsAmount, setSavingsAmount] = useState('');

    const handleGoalPress = (goal: Goal) => {
        setSelectedGoal(goal);
        setSavingsModalVisible(true);
    };

    const handleAddSavings = async () => {
        if (!selectedGoal || !savingsAmount) {
            showAlert('Error', 'Please enter an amount.', 'error');
            return;
        }

        setLoading(true);
        try {
            await GoalService.addSavings(selectedGoal.id, parseFloat(savingsAmount), selectedGoal.title);
            await loadGoals();
            setSavingsModalVisible(false);
            setSavingsAmount('');
            setSelectedGoal(null);
            showAlert('Success', 'Savings added successfully!', 'success');
        } catch (error) {
            showAlert('Error', 'Failed to add savings.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleGoalLongPress = (goal: Goal) => {
        showAlert(
            "Delete Goal",
            `Are you sure you want to delete "${goal.title}"?`,
            'warning',
            true,
            async () => {
                try {
                    setLoading(true);
                    await GoalService.deleteGoal(goal.id);
                    await loadGoals();
                    showAlert('Deleted', 'Goal deleted successfully.', 'success');
                } catch (error) {
                    showAlert("Error", "Failed to delete goal.", 'error');
                } finally {
                    setLoading(false);
                }
            }
        );
    };

    const isDark = theme.colors.background === '#000000';

    return (
        <Screen
            headerTitle="Savings Goals"
            showBackButton={true}
            rightComponent={
                <TouchableOpacity onPress={() => setModalVisible(true)} style={[styles.addButton, { backgroundColor: theme.colors.primary }]}>
                    <Ionicons name="add" size={24} color={isDark ? "#000" : "#FFF"} />
                </TouchableOpacity>
            }
        >
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

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Goals Section Header */}
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleContainer}>
                        <LinearGradient
                            colors={[theme.colors.primary, theme.colors.primaryDark]}
                            style={styles.sectionIconContainer}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Ionicons name="flag" size={18} color="#FFF" />
                        </LinearGradient>
                        <View>
                            <AppText style={[styles.sectionTitle, { color: theme.colors.text }]}>
                                Your Goals
                            </AppText>
                            <AppText style={[styles.sectionSubtitle, { color: theme.colors.textMuted }]}>
                                Track your financial milestones
                            </AppText>
                        </View>
                    </View>
                    
                    <View style={[styles.countBadge, { backgroundColor: isDark ? 'rgba(252, 163, 17, 0.1)' : '#FCA31120' }]}>
                        <AppText style={[styles.countText, { color: theme.colors.primary }]}>
                            {goals.length}
                        </AppText>
                    </View>
                </View>

                {/* Helper Text */}
                <View style={[styles.helperContainer, { backgroundColor: isDark ? 'rgba(252, 163, 17, 0.05)' : '#FCA31110' }]}>
                    <Ionicons name="information-circle-outline" size={14} color={theme.colors.primary} style={{ marginRight: 6 }} />
                    <AppText style={[styles.helperText, { color: theme.colors.textMuted }]}>
                        Tap to add savings • Long press to delete
                    </AppText>
                </View>

                {/* Goals List */}
                <View style={styles.list}>
                    {goals.map((goal, index) => (
                        <Animated.View
                            key={goal.id}
                            entering={FadeInDown.delay(300 + (index * 100)).duration(600).springify()}
                        >
                            <GoalCard
                                title={goal.title}
                                targetAmount={goal.target_amount}
                                savedAmount={goal.saved_amount}
                                monthlySavings={Math.round((goal.target_amount - goal.saved_amount) / 12)} // Estimate
                                image={goal.image_url ? { uri: goal.image_url } : undefined}
                                onPress={() => handleGoalPress(goal)}
                                onLongPress={() => handleGoalLongPress(goal)}
                            />
                        </Animated.View>
                    ))}
                </View>
                
                {/* Empty State */}
                {goals.length === 0 && (
                    <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.emptyState}>
                        <LinearGradient
                            colors={isDark ? 
                                ['rgba(20, 33, 61, 0.5)', 'rgba(10, 17, 40, 0.7)'] : 
                                ['#F5F5F5', '#FFFFFF']}
                            style={styles.emptyContainer}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={[styles.emptyIcon, { backgroundColor: isDark ? 'rgba(252, 163, 17, 0.1)' : '#FCA31120' }]}>
                                <Ionicons name="flag-outline" size={48} color={theme.colors.primary} />
                            </View>
                            <AppText style={[styles.emptyTitle, { color: theme.colors.text }]}>
                                No Goals Yet
                            </AppText>
                            <AppText style={[styles.emptySubtitle, { color: theme.colors.textMuted }]}>
                                Start your financial journey by creating your first savings goal
                            </AppText>
                        </LinearGradient>
                    </Animated.View>
                )}
                
                <View style={{ height: 30 }} />
            </ScrollView>

            {/* Add Goal Modal */}
            <ActionSheet
                visible={isModalVisible}
                onClose={() => setModalVisible(false)}
                title="Add New Goal"
                actionLabel={loading ? "Creating..." : "Create Goal"}
                onAction={handleAddGoal}
            >
                <View style={styles.inputGroup}>
                    <AppText style={[styles.label, { color: theme.colors.text }]}>Goal Title</AppText>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
                        placeholder="e.g. New Car"
                        placeholderTextColor={theme.colors.textMuted}
                        value={newGoal.title}
                        onChangeText={(text) => setNewGoal({ ...newGoal, title: text })}
                    />
                </View>
                <View style={styles.inputGroup}>
                    <AppText style={[styles.label, { color: theme.colors.text }]}>Target Amount (₹)</AppText>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
                        placeholder="e.g. 500000"
                        placeholderTextColor={theme.colors.textMuted}
                        keyboardType="numeric"
                        value={newGoal.targetAmount}
                        onChangeText={(text) => setNewGoal({ ...newGoal, targetAmount: text })}
                    />
                </View>

                {/* Image Picker */}
                <View style={styles.inputGroup}>
                    <AppText style={[styles.label, { color: theme.colors.text }]}>Goal Image (Optional)</AppText>
                    <TouchableOpacity
                        style={[styles.imagePicker, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
                        onPress={handlePickImage}
                    >
                        {newGoal.imageUri ? (
                            <Image source={{ uri: newGoal.imageUri }} style={styles.previewImage} />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Ionicons name="image-outline" size={24} color={theme.colors.textMuted} />
                                <AppText style={[styles.imagePlaceholderText, { color: theme.colors.textMuted }]}>
                                    Tap to select an image
                                </AppText>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </ActionSheet>

            {/* Add Savings Modal */}
            <ActionSheet
                visible={savingsModalVisible}
                onClose={() => {
                    setSavingsModalVisible(false);
                    setSavingsAmount('');
                    setSelectedGoal(null);
                }}
                title={`Add Savings to ${selectedGoal?.title || 'Goal'}`}
                actionLabel={loading ? "Adding..." : "Add Savings"}
                onAction={handleAddSavings}
            >
                <View style={styles.inputGroup}>
                    <AppText style={[styles.label, { color: theme.colors.text }]}>Amount to Save (₹)</AppText>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
                        placeholder="e.g. 5000"
                        placeholderTextColor={theme.colors.textMuted}
                        keyboardType="numeric"
                        value={savingsAmount}
                        onChangeText={setSavingsAmount}
                        autoFocus={true}
                    />
                </View>
                <AppText style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: -8, marginBottom: 16 }}>
                    This will be recorded as an expense in your transactions.
                </AppText>
            </ActionSheet>
        </Screen>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        paddingHorizontal: spacing.xs,
        paddingTop: spacing.md,
        paddingBottom: spacing.xl,
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#FCA311",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    // Section Header
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
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
        fontSize: 20,
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
    // Helper Text
    helperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 12,
        marginBottom: spacing.md,
    },
    helperText: {
        fontSize: 12,
        fontWeight: '500',
    },
    // List
    list: {
        gap: spacing.md,
    },
    // Empty State
    emptyState: {
        marginTop: spacing.xl,
    },
    emptyContainer: {
        padding: spacing.xl,
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: 'rgba(0,0,0,0.1)',
    },
    emptyIcon: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: spacing.sm,
    },
    emptySubtitle: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 20,
    },
    // Input Styles
    inputGroup: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 10,
        letterSpacing: 0.3,
    },
    input: {
        borderWidth: 2,
        borderRadius: 16,
        paddingHorizontal: 18,
        paddingVertical: 14,
        fontSize: 16,
        fontWeight: '600',
    },
    imagePicker: {
        height: 120,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        alignItems: 'center',
        gap: 8,
    },
    imagePlaceholderText: {
        fontSize: 14,
        fontWeight: '500',
    },
});

export default GoalsScreen;