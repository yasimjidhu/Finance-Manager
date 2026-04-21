import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    TextInput,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeProvider';
import ActionSheet from '../../components/common/ActionSheet';
import { spacing } from '../../theme/spacing';
import { formatCurrency } from '../../utils/helpers';
import { ReminderService, Reminder } from '../../services/reminder.service';
import { NotificationService } from '../../services/notification.service';
import { Calendar } from 'react-native-calendars';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import CustomAlert from '../../components/common/CustomAlert';

const DueRemindersScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalVisible, setModalVisible] = useState(false);
    const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
    const [reminderFormData, setReminderFormData] = useState({
        title: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [showDatePicker, setShowDatePicker] = useState(false);

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
        loadReminders();
        NotificationService.registerForPushNotificationsAsync();
    }, []);

    const loadReminders = async () => {
        setIsLoading(true);
        const data = await ReminderService.getAllReminders();
        setReminders(data);
        setIsLoading(false);
    };

    // Helper to calculate days left
    const getDaysLeft = (dateStr: string) => {
        const today = new Date();
        const due = new Date(dateStr);
        const diffTime = due.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const toggleNotification = async (id: number) => {
        const reminder = reminders.find(r => r.id === id);
        if (reminder) {
            const updated = { ...reminder, notifications: !reminder.notifications };
            await ReminderService.updateReminder(updated);
            setReminders(reminders.map(r => r.id === id ? updated : r));

            if (updated.notifications) {
                const smartBody = NotificationService.getSmartMessage(updated.title, formatCurrency(updated.amount), 'reminder');
                await NotificationService.scheduleNotification(
                    `Reminder: ${updated.title}`,
                    smartBody,
                    new Date(updated.date),
                    updated.id
                );
            } else {
                await NotificationService.cancelNotificationByDataId(updated.id);
            }
        }
    };

    const handlePay = async (id: number) => {
        const reminder = reminders.find(r => r.id === id);
        if (reminder) {
            showAlert(
                "Confirm Payment",
                `Mark ${reminder.title} as paid?`,
                'info',
                true,
                async () => {
                    const updated: Reminder = { ...reminder, status: 'Paid' };
                    await ReminderService.updateReminder(updated);
                    await NotificationService.cancelNotificationByDataId(updated.id);
                    loadReminders();
                    showAlert("Success", "Bill marked as paid!", 'success');
                }
            );
        }
    };

    const openAddModal = () => {
        setEditingReminder(null);
        setReminderFormData({
            title: '',
            amount: '',
            date: new Date().toISOString().split('T')[0]
        });
        setShowDatePicker(false);
        setModalVisible(true);
    };

    const openEditModal = (reminder: Reminder) => {
        setEditingReminder(reminder);
        setReminderFormData({
            title: reminder.title,
            amount: reminder.amount.toString(),
            date: reminder.date
        });
        setShowDatePicker(false);
        setModalVisible(true);
    };

    const handleSaveReminder = async () => {
        if (!reminderFormData.title.trim() || !reminderFormData.amount || !reminderFormData.date) {
            showAlert("Error", "Please fill all fields", 'error');
            return;
        }

        const amount = parseInt(reminderFormData.amount);
        if (isNaN(amount) || amount <= 0) {
            showAlert("Error", "Please enter a valid amount", 'error');
            return;
        }

        try {
            if (editingReminder) {
                const updated: Reminder = {
                    ...editingReminder,
                    title: reminderFormData.title,
                    amount: amount,
                    date: reminderFormData.date,
                    status: editingReminder.status === 'Paid' ? 'Paid' : 'Upcoming'
                };
                await ReminderService.updateReminder(updated);

                // Update Notification
                await NotificationService.cancelNotificationByDataId(updated.id);
                if (updated.notifications && updated.status !== 'Paid') {
                    const smartBody = NotificationService.getSmartMessage(updated.title, formatCurrency(updated.amount), 'reminder');
                    await NotificationService.scheduleNotification(
                        `Reminder: ${updated.title}`,
                        smartBody,
                        new Date(updated.date),
                        updated.id
                    );
                }

                showAlert("Updated", "Reminder updated successfully", 'success');
            } else {
                const newItem = {
                    title: reminderFormData.title,
                    amount: amount,
                    date: reminderFormData.date,
                    status: 'Upcoming' as const,
                    notifications: true,
                    icon: 'receipt',
                    color: theme.colors.primary
                };
                const savedItem = await ReminderService.addReminder(newItem);

                if (savedItem) {
                    const smartBody = NotificationService.getSmartMessage(savedItem.title, formatCurrency(savedItem.amount), 'reminder');
                    await NotificationService.scheduleNotification(
                        `Reminder: ${savedItem.title}`,
                        smartBody,
                        new Date(savedItem.date),
                        savedItem.id
                    );
                }

                showAlert("Created", "Reminder created successfully", 'success');
            }
            setModalVisible(false);
            loadReminders();
        } catch (error) {
            showAlert("Error", "Failed to save reminder", 'error');
        }
    };

    const handleDeleteReminder = () => {
        if (!editingReminder) return;

        showAlert(
            "Delete Reminder",
            `Are you sure you want to delete ${editingReminder.title}?`,
            'warning',
            true,
            async () => {
                try {
                    await ReminderService.deleteReminder(editingReminder.id);
                    await NotificationService.cancelNotificationByDataId(editingReminder.id);
                    setModalVisible(false);
                    loadReminders();
                    showAlert("Deleted", "Reminder deleted successfully", 'success');
                } catch (error) {
                    showAlert("Error", "Failed to delete reminder", 'error');
                }
            }
        );
    };

    const totalUpcoming = reminders
        .filter(r => r.status === 'Upcoming' || r.status === 'Overdue')
        .reduce((sum, item) => sum + item.amount, 0);

    const totalPaid = reminders
        .filter(r => r.status === 'Paid')
        .reduce((sum, item) => sum + item.amount, 0);

    const upcomingReminder = reminders
        .filter(r => r.status === 'Upcoming' || r.status === 'Overdue')
        .sort((a, b) => getDaysLeft(a.date) - getDaysLeft(b.date))[0];

    const renderReminderCard = (item: Reminder, index: number) => {
        const daysLeft = getDaysLeft(item.date);
        const isOverdue = item.status === 'Overdue' || (daysLeft < 0 && item.status !== 'Paid');
        const isPaid = item.status === 'Paid';

        return (
            <Animated.View
                key={item.id}
                entering={FadeInDown.delay(300 + (index * 100)).duration(600).springify()}
            >
                <TouchableOpacity
                    activeOpacity={0.9}
                    style={[styles.card, { backgroundColor: theme.colors.card, shadowColor: theme.colors.text }]}
                    onLongPress={() => openEditModal(item)}
                >
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                            <Ionicons name={item.icon as any} size={20} color={item.color} />
                        </View>
                        <View style={styles.headerContent}>
                            <Text style={[styles.cardTitle, { color: theme.colors.text }]} numberOfLines={1}>{item.title}</Text>
                            <Text style={[styles.cardDate, { color: isOverdue ? theme.colors.danger : theme.colors.textMuted }]}>
                                {isPaid ? 'Paid' : (isOverdue ? `Overdue • ${Math.abs(daysLeft)} days ago` : `Due ${item.date} • ${daysLeft} days left`)}
                            </Text>
                        </View>
                        <Switch
                            value={item.notifications}
                            onValueChange={() => toggleNotification(item.id)}
                            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                            thumbColor={"#fff"}
                            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                        />
                    </View>

                    <View style={styles.cardFooter}>
                        <View>
                            <Text style={[styles.amountLabel, { color: theme.colors.textMuted }]}>Amount</Text>
                            <Text style={[styles.amountValue, { color: theme.colors.text }]}>{formatCurrency(item.amount)}</Text>
                        </View>
                        <TouchableOpacity
                            style={[
                                styles.payButton,
                                {
                                    backgroundColor: isPaid ? theme.colors.success + '20' : theme.colors.primary + '15',
                                    borderColor: isPaid ? theme.colors.success : theme.colors.primary
                                }
                            ]}
                            onPress={() => !isPaid && handlePay(item.id)}
                            disabled={isPaid}
                        >
                            <Text style={[styles.payButtonText, { color: isPaid ? theme.colors.success : theme.colors.primary }]}>
                                {isPaid ? 'Paid' : 'Pay Now'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <LoadingOverlay visible={isLoading} />
            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                showCancel={alertConfig.showCancel}
                onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
                onConfirm={alertConfig.onConfirm}
            />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Due Reminders</Text>
                <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
                    <Ionicons name="add" size={24} color={theme.colors.white} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Hero: Most Urgent Due */}
                {upcomingReminder && (
                    <Animated.View entering={ZoomIn.duration(600).springify()} style={styles.heroSection}>
                        <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>NEXT PAYMENT</Text>
                        <LinearGradient
                            colors={[upcomingReminder.status === 'Overdue' ? '#EF4444' : '#4F46E5', '#000']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.heroCard}
                        >
                            <View style={styles.heroContent}>
                                <View>
                                    <Text style={styles.heroTitle}>{upcomingReminder.title}</Text>
                                    <View style={styles.heroBadge}>
                                        <Ionicons name="alert-circle-outline" size={14} color="#fff" />
                                        <Text style={styles.heroBadgeText}>
                                            {upcomingReminder.status === 'Overdue' ? 'Overdue!' : `Due ${upcomingReminder.date}`}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.heroIconBox}>
                                    <Ionicons name="notifications" size={32} color="#fff" />
                                </View>
                            </View>

                            <View style={styles.heroFooter}>
                                <Text style={styles.heroAmount}>{formatCurrency(upcomingReminder.amount)}</Text>
                                <TouchableOpacity style={styles.heroButton} onPress={() => handlePay(upcomingReminder.id)}>
                                    <Text style={styles.heroButtonText}>Pay Now</Text>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </Animated.View>
                )}

                {/* Quick Stats Row */}
                <Animated.View entering={FadeInDown.delay(200).duration(600).springify()} style={styles.statsRow}>
                    <View style={[styles.statBox, { backgroundColor: theme.colors.card }]}>
                        <Text style={[styles.statValue, { color: theme.colors.primary }]}>{reminders.length}</Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Total Bills</Text>
                    </View>
                    <View style={[styles.statBox, { backgroundColor: theme.colors.card }]}>
                        <Text style={[styles.statValue, { color: theme.colors.danger }]}>{formatCurrency(totalUpcoming)}</Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>To Pay</Text>
                    </View>
                    <View style={[styles.statBox, { backgroundColor: theme.colors.card }]}>
                        <Text style={[styles.statValue, { color: theme.colors.success }]}>{formatCurrency(totalPaid)}</Text>
                        <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Paid</Text>
                    </View>
                </Animated.View>

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>All Reminders</Text>
                </View>

                <View style={styles.listContainer}>
                    {reminders.map((item, index) => renderReminderCard(item, index))}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            <ActionSheet
                visible={isModalVisible}
                onClose={() => setModalVisible(false)}
                title={editingReminder ? "Edit Reminder" : "Add New Reminder"}
                actionLabel={editingReminder ? "Update Reminder" : "Add Reminder"}
                onAction={handleSaveReminder}
                secondaryActionLabel={editingReminder ? "Delete Reminder" : undefined}
                onSecondaryAction={editingReminder ? handleDeleteReminder : undefined}
                secondaryActionDestructive
            >
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>Title</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                        placeholder="e.g. House Rent"
                        placeholderTextColor={theme.colors.textMuted}
                        value={reminderFormData.title}
                        onChangeText={(text) => setReminderFormData({ ...reminderFormData, title: text })}
                    />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>Amount (₹)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                        placeholder="e.g. 15000"
                        placeholderTextColor={theme.colors.textMuted}
                        keyboardType="numeric"
                        value={reminderFormData.amount}
                        onChangeText={(text) => setReminderFormData({ ...reminderFormData, amount: text })}
                    />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>Due Date</Text>
                    <TouchableOpacity
                        style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, justifyContent: 'center' }]}
                        onPress={() => setShowDatePicker(!showDatePicker)}
                    >
                        <Text style={{ color: theme.colors.text }}>{reminderFormData.date}</Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <View style={{ marginTop: 10, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.border }}>
                            <Calendar
                                current={reminderFormData.date}
                                onDayPress={(day: any) => {
                                    setReminderFormData({ ...reminderFormData, date: day.dateString });
                                    setShowDatePicker(false);
                                }}
                                theme={{
                                    backgroundColor: theme.colors.card,
                                    calendarBackground: theme.colors.card,
                                    textSectionTitleColor: theme.colors.textMuted,
                                    selectedDayBackgroundColor: theme.colors.primary,
                                    selectedDayTextColor: '#ffffff',
                                    todayTextColor: theme.colors.primary,
                                    dayTextColor: theme.colors.text,
                                    textDisabledColor: theme.colors.textMuted + '50',
                                    dotColor: theme.colors.primary,
                                    selectedDotColor: '#ffffff',
                                    arrowColor: theme.colors.primary,
                                    monthTextColor: theme.colors.text,
                                    indicatorColor: theme.colors.primary,
                                }}
                                markedDates={{
                                    [reminderFormData.date]: { selected: true, selectedColor: theme.colors.primary }
                                }}
                            />
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
    },
    iconButton: {
        padding: 4,
    },
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FCA311',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    scrollContent: {
        paddingBottom: spacing.xl,
    },
    heroSection: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
        letterSpacing: 1,
    },
    heroCard: {
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    heroContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    heroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        gap: 4,
    },
    heroBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    heroIconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    heroAmount: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
    },
    heroButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    heroButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14,
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        gap: 12,
        marginBottom: spacing.xl,
    },
    statBox: {
        flex: 1,
        padding: 12,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 10,
    },
    sectionHeader: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    listContainer: {
        paddingHorizontal: spacing.lg,
        gap: 12,
    },
    card: {
        borderRadius: 20,
        padding: 16,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    cardDate: {
        fontSize: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    amountLabel: {
        fontSize: 12,
        marginBottom: 2,
    },
    amountValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    payButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
    },
    payButtonText: {
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

export default DueRemindersScreen;
