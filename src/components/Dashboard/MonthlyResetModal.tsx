import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AppText from '../common/AppText';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import { formatCurrency } from '../../utils/helpers';
import { MonthlySummary, RolloverAction } from '../../services/budgetReset.service';

const { width } = Dimensions.get('window');

interface MonthlyResetModalProps {
    visible: boolean;
    onClose: (action: RolloverAction) => void;
    summary: MonthlySummary | null;
}

type Step = 'salary_check' | 'surplus_action' | 'summary';

const MonthlyResetModal = ({ visible, onClose, summary }: MonthlyResetModalProps) => {
    const { theme } = useTheme();
    const [step, setStep] = useState<Step>('salary_check');
    const [selectedAction, setSelectedAction] = useState<RolloverAction>('none');

    if (!summary) return null;

    const handleSalaryConfirm = (confirmed: boolean) => {
        if (!confirmed) {
            onClose('none'); // Close modal, do nothing
            return;
        }

        if (summary.saved > 0) {
            setStep('surplus_action');
        } else {
            setStep('summary');
        }
    };

    const handleActionSelect = (action: RolloverAction) => {
        setSelectedAction(action);
        setStep('summary');
    };

    const handleFinalize = () => {
        onClose(selectedAction);
    };

    const renderSalaryCheck = () => (
        <>
            <View style={styles.iconContainer}>
                <Ionicons name="calendar" size={48} color={theme.colors.primary} />
            </View>
            <AppText style={styles.title}>It's Payday!</AppText>
            <AppText style={styles.subtitle}>
                Did you receive your salary for {summary.month}?
            </AppText>
            <View style={styles.buttonGroup}>
                <TouchableOpacity
                    style={[styles.secondaryButton, { borderColor: 'rgba(255,255,255,0.2)', flex: 1 }]}
                    onPress={() => handleSalaryConfirm(false)}
                >
                    <AppText style={styles.secondaryButtonText}>Not Yet</AppText>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: theme.colors.primary, flex: 1 }]}
                    onPress={() => handleSalaryConfirm(true)}
                >
                    <AppText style={styles.primaryButtonText}>Yes, I got it</AppText>
                </TouchableOpacity>
            </View>
        </>
    );

    const renderSurplusAction = () => (
        <>
            <View style={styles.iconContainer}>
                <Ionicons name="wallet" size={48} color={theme.colors.success} />
            </View>
            <AppText style={styles.title}>Great Job!</AppText>
            <AppText style={styles.subtitle}>
                You have <AppText style={{ fontWeight: 'bold', color: theme.colors.success }}>{formatCurrency(summary.saved)}</AppText> leftover from last month.
                What would you like to do with it?
            </AppText>

            <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: 'rgba(255,255,255,0.05)' }]}
                onPress={() => handleActionSelect('savings')}
            >
                <View style={[styles.actionIcon, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
                    <Ionicons name="add-circle" size={24} color={theme.colors.success} />
                </View>
                <View style={styles.actionContent}>
                    <AppText style={styles.actionTitle}>Add to Savings Goal</AppText>
                    <AppText style={styles.actionDesc}>Boost your progress</AppText>
                </View>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: 'rgba(255,255,255,0.05)' }]}
                onPress={() => handleActionSelect('emergency')}
            >
                <View style={[styles.actionIcon, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
                    <Ionicons name="briefcase" size={24} color="#F97316" />
                </View>
                <View style={styles.actionContent}>
                    <AppText style={styles.actionTitle}>Move to Emergency Fund</AppText>
                    <AppText style={styles.actionDesc}>Save for a rainy day</AppText>
                </View>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: 'rgba(255,255,255,0.05)' }]}
                onPress={() => handleActionSelect('budget')}
            >
                <View style={[styles.actionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                    <Ionicons name="refresh" size={24} color="#3B82F6" />
                </View>
                <View style={styles.actionContent}>
                    <AppText style={styles.actionTitle}>Keep in Next Month Budget</AppText>
                    <AppText style={styles.actionDesc}>Increase spending limit</AppText>
                </View>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>
        </>
    );

    const renderSummary = () => (
        <>
            <View style={styles.iconContainer}>
                <Ionicons name="gift" size={48} color={theme.colors.primary} />
            </View>

            <AppText style={styles.title}>New Month Started!</AppText>
            <AppText style={[styles.subtitle, { color: 'rgba(255,255,255,0.7)' }]}>
                Your budgets have been reset. Here's how you did last month:
            </AppText>

            <View style={[styles.statsContainer, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                <View style={styles.statRow}>
                    <AppText style={styles.statLabel}>Total Saved</AppText>
                    <AppText style={[styles.statValue, { color: theme.colors.success }]}>
                        {formatCurrency(summary.saved)}
                    </AppText>
                </View>
                <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
                <View style={styles.statRow}>
                    <AppText style={styles.statLabel}>Total Spent</AppText>
                    <AppText style={[styles.statValue, { color: theme.colors.danger }]}>
                        {formatCurrency(summary.spent)}
                    </AppText>
                </View>
            </View>

            {selectedAction !== 'none' && (
                <View style={[styles.actionSummary, { backgroundColor: 'rgba(252, 163, 17, 0.1)', borderColor: theme.colors.primary }]}>
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                    <AppText style={[styles.actionSummaryText, { color: '#fff' }]}>
                        {formatCurrency(summary.saved)} moved to {selectedAction === 'savings' ? 'Savings Goal' : selectedAction === 'emergency' ? 'Emergency Fund' : 'Next Month Budget'}
                    </AppText>
                </View>
            )}

            <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: theme.colors.primary, width: '100%' }]}
                onPress={handleFinalize}
            >
                <AppText style={styles.primaryButtonText}>Let's Go!</AppText>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
        </>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={() => onClose('none')}
        >
            <View style={styles.overlay}>
                <LinearGradient
                    colors={[theme.colors.prussianBlue, '#0A1128']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.modalContainer}
                >
                    {step === 'salary_check' && renderSalaryCheck()}
                    {step === 'surplus_action' && renderSurplusAction()}
                    {step === 'summary' && renderSummary()}
                </LinearGradient>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    modalContainer: {
        width: '100%',
        borderRadius: 30,
        padding: 30,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: 22,
        color: 'rgba(255,255,255,0.7)',
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    secondaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        width: '100%',
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 2,
    },
    actionDesc: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
    },
    statsContainer: {
        width: '100%',
        borderRadius: 20,
        padding: 20,
        marginBottom: spacing.lg,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    statLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        width: '100%',
        marginVertical: 12,
    },
    actionSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: spacing.xl,
        width: '100%',
        gap: 8,
    },
    actionSummaryText: {
        fontSize: 13,
        flex: 1,
    },
});

export default MonthlyResetModal;
