import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Screen from '../../components/common/Screen';
import AppText from '../../components/common/AppText';
import AppButton from '../../components/common/AppButton';
import KuriCard, { KuriStatus } from '../../components/Kuri/KuriCard';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import Ionicons from '@expo/vector-icons/Ionicons';
import ActionSheet from '../../components/common/ActionSheet';

const DUMMY_KURIS = [
    {
        id: '1',
        title: 'Friends Kuri - Goa Trip',
        totalValue: 150000,
        nextInstallmentDate: '28 Oct 2023',
        installmentAmount: 5000,
        status: 'Missed' as KuriStatus,
    },
    {
        id: '2',
        title: 'Family Kuri Group',
        totalValue: 500000,
        nextInstallmentDate: '10 Nov 2023',
        installmentAmount: 10000,
        status: 'Pending' as KuriStatus,
    },
    {
        id: '3',
        title: 'Investment Kuri - Group A',
        totalValue: 1000000,
        nextInstallmentDate: '15 Nov 2023',
        installmentAmount: 25000,
        status: 'Due Soon' as KuriStatus,
    },
    {
        id: '4',
        title: 'Property Savings Kuri',
        totalValue: 2000000,
        nextInstallmentDate: '5 Dec 2023',
        installmentAmount: 30000,
        status: 'Pending' as KuriStatus,
    },
];

export default function KuriScreen() {
    const { theme } = useTheme();
    const [isModalVisible, setModalVisible] = useState(false);
    const [kuris, setKuris] = useState(DUMMY_KURIS);
    const [newKuri, setNewKuri] = useState({ title: '', totalValue: '', installmentAmount: '' });

    const handleAddKuri = () => {
        if (!newKuri.title || !newKuri.totalValue || !newKuri.installmentAmount) return;

        const newItem = {
            id: Date.now().toString(),
            title: newKuri.title,
            totalValue: parseInt(newKuri.totalValue),
            nextInstallmentDate: '1st Dec 2023', // Default for now
            installmentAmount: parseInt(newKuri.installmentAmount),
            status: 'Pending' as KuriStatus,
        };

        setKuris([newItem, ...kuris]);
        setModalVisible(false);
        setNewKuri({ title: '', totalValue: '', installmentAmount: '' });
    };

    return (
        <Screen
            headerTitle="Kuri Tracker"
            showBackButton={true}
            rightComponent={
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Ionicons name="add" size={24} color={theme.colors.text} />
                </TouchableOpacity>
            }
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Alert Card */}
                <View style={[styles.alertCard, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                    <View style={styles.alertHeader}>
                        <Ionicons name="warning-outline" size={24} color={theme.colors.danger} style={{ marginRight: spacing.sm }} />
                        <AppText style={[styles.alertTitle, { color: '#991B1B' }]}>Missed Payment Alert!</AppText>
                    </View>
                    <AppText style={[styles.alertMessage, { color: '#991B1B' }]}>
                        Your installment for 'Friends Kuri - Goa Trip' was due on Oct 28, 2023. Please pay to avoid penalties.
                    </AppText>
                    <AppButton
                        title="Pay Now"
                        onPress={() => { }}
                        style={styles.payButton}
                    />
                </View>

                {/* Real Calendar Integration */}
                <View style={[styles.calendarCard, { borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}>
                    <Calendar
                        theme={{
                            backgroundColor: theme.colors.background,
                            calendarBackground: theme.colors.background,
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
                            textDayFontWeight: '300',
                            textMonthFontWeight: 'bold',
                            textDayHeaderFontWeight: '300',
                            textDayFontSize: 14,
                            textMonthFontSize: 16,
                            textDayHeaderFontSize: 12
                        }}
                        markedDates={{
                            '2025-11-23': { selected: true, marked: true, selectedColor: theme.colors.primary },
                            '2025-11-28': { marked: true, dotColor: 'red' },
                        }}
                    />
                </View>

                <AppText style={[styles.sectionTitle, { color: theme.colors.text }]}>Upcoming Installments</AppText>

                <View style={styles.list}>
                    {kuris.map((kuri) => (
                        <KuriCard
                            key={kuri.id}
                            title={kuri.title}
                            totalValue={kuri.totalValue}
                            nextInstallmentDate={kuri.nextInstallmentDate}
                            installmentAmount={kuri.installmentAmount}
                            status={kuri.status}
                            onPress={() => { }}
                        />
                    ))}
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>

            <ActionSheet
                visible={isModalVisible}
                onClose={() => setModalVisible(false)}
                title="Join New Kuri"
                actionLabel="Join Kuri"
                onAction={handleAddKuri}
            >
                <View style={styles.inputGroup}>
                    <AppText style={[styles.label, { color: theme.colors.text }]}>Kuri Name</AppText>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                        placeholder="e.g. Office Savings"
                        placeholderTextColor={theme.colors.textMuted}
                        value={newKuri.title}
                        onChangeText={(text) => setNewKuri({ ...newKuri, title: text })}
                    />
                </View>
                <View style={styles.inputGroup}>
                    <AppText style={[styles.label, { color: theme.colors.text }]}>Total Value (₹)</AppText>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
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
                        style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                        placeholder="e.g. 5000"
                        placeholderTextColor={theme.colors.textMuted}
                        keyboardType="numeric"
                        value={newKuri.installmentAmount}
                        onChangeText={(text) => setNewKuri({ ...newKuri, installmentAmount: text })}
                    />
                </View>
            </ActionSheet>
        </Screen>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: spacing.xl,
    },
    alertCard: {
        padding: spacing.md,
        borderRadius: spacing.md,
        borderWidth: 1,
        marginBottom: spacing.lg,
    },
    alertHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    alertTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    alertMessage: {
        fontSize: 14,
        marginBottom: spacing.md,
        lineHeight: 20,
    },
    payButton: {
        backgroundColor: '#EF4444',
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.lg,
        height: 36,
    },
    calendarCard: {
        padding: spacing.md,
        borderRadius: spacing.lg,
        borderWidth: 1,
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: spacing.md,
    },
    list: {
        gap: spacing.xs,
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
