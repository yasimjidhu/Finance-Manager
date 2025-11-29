import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import ActionSheet from '../../components/common/ActionSheet';

const DueRemindersScreen = ({ navigation }: any) => {
    const { theme } = useTheme();

    const [reminders, setReminders] = useState([
        {
            id: 1,
            title: 'House Rent',
            amount: 15000,
            date: '1st May 2024',
            status: 'Upcoming',
            notifications: true,
        },
        {
            id: 2,
            title: 'Netflix Subscription',
            amount: 649,
            date: '20th April 2024',
            status: 'Overdue',
            notifications: false,
        },
        {
            id: 3,
            title: 'Mobile Recharge',
            amount: 299,
            date: '25th April 2024',
            status: 'Upcoming',
            notifications: true,
        },
        {
            id: 4,
            title: 'Petrol Bill',
            amount: 3500,
            date: '30th March 2024',
            status: 'Paid',
            notifications: false,
        },
        {
            id: 5,
            title: 'Gym Membership',
            amount: 1200,
            date: '5th May 2024',
            status: 'Upcoming',
            notifications: true,
        },
    ]);

    const toggleNotification = (id: number) => {
        setReminders(reminders.map(item =>
            item.id === id ? { ...item, notifications: !item.notifications } : item
        ));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Upcoming': return '#5C66F0'; // Purple/Blue
            case 'Overdue': return '#EF4444'; // Red
            case 'Paid': return '#10B981'; // Green
            default: return '#666';
        }
    };

    const getStatusBgColor = (status: string) => {
        switch (status) {
            case 'Upcoming': return '#E0E7FF';
            case 'Overdue': return '#FEE2E2';
            case 'Paid': return '#D1FAE5';
            default: return '#F3F4F6';
        }
    };

    const renderReminderItem = (item: any) => {
        const isDark = theme.mode === 'dark';

        return (
            <View key={item.id} style={[styles.card, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.title, { color: theme.colors.text }]}>{item.title}</Text>
                    {item.status !== 'Paid' ? (
                        <View style={[styles.statusTag, { backgroundColor: getStatusBgColor(item.status) }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                        </View>
                    ) : (
                        <Text style={[styles.paidText, { color: theme.colors.text }]}>Paid</Text>
                    )}
                </View>

                <Text style={[styles.amount, { color: theme.colors.text }]}>₹ {item.amount.toLocaleString()}</Text>

                <View style={styles.dateRow}>
                    <Ionicons name="calendar-outline" size={16} color={theme.colors.textMuted} />
                    <Text style={[styles.dateText, { color: theme.colors.textMuted }]}>{item.date}</Text>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                <View style={styles.notificationRow}>
                    <View style={styles.notificationLabel}>
                        <Ionicons name="notifications-outline" size={20} color={theme.colors.text} />
                        <Text style={[styles.notificationText, { color: theme.colors.text }]}>Notifications</Text>
                    </View>
                    <Switch
                        value={item.notifications}
                        onValueChange={() => toggleNotification(item.id)}
                        trackColor={{ false: "#D1D5DB", true: "#5C66F0" }}
                        thumbColor={"#fff"}
                        ios_backgroundColor="#D1D5DB"
                    />
                </View>
            </View>
        );
    };

    const [isModalVisible, setModalVisible] = useState(false);
    const [newReminder, setNewReminder] = useState({ title: '', amount: '', date: '' });

    const handleAddReminder = () => {
        if (!newReminder.title || !newReminder.amount || !newReminder.date) return;

        const newItem = {
            id: Date.now(),
            title: newReminder.title,
            amount: parseInt(newReminder.amount),
            date: newReminder.date,
            status: 'Upcoming',
            notifications: true,
        };

        setReminders([newItem, ...reminders]);
        setModalVisible(false);
        setNewReminder({ title: '', amount: '', date: '' });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Dues Reminders</Text>
                <TouchableOpacity style={styles.iconButton} onPress={() => setModalVisible(true)}>
                    <Ionicons name="add" size={24} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {reminders.map(renderReminderItem)}
                <View style={{ height: 20 }} />
            </ScrollView>

            <ActionSheet
                visible={isModalVisible}
                onClose={() => setModalVisible(false)}
                title="Add New Reminder"
                actionLabel="Add Reminder"
                onAction={handleAddReminder}
            >
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>Title</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                        placeholder="e.g. House Rent"
                        placeholderTextColor={theme.colors.textMuted}
                        value={newReminder.title}
                        onChangeText={(text) => setNewReminder({ ...newReminder, title: text })}
                    />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>Amount (₹)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                        placeholder="e.g. 15000"
                        placeholderTextColor={theme.colors.textMuted}
                        keyboardType="numeric"
                        value={newReminder.amount}
                        onChangeText={(text) => setNewReminder({ ...newReminder, amount: text })}
                    />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>Due Date</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                        placeholder="e.g. 5th June 2024"
                        placeholderTextColor={theme.colors.textMuted}
                        value={newReminder.date}
                        onChangeText={(text) => setNewReminder({ ...newReminder, date: text })}
                    />
                </View>
            </ActionSheet>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    // ... existing styles ...
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
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    iconButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    scrollContent: {
        padding: 16,
    },
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
        marginRight: 8,
    },
    statusTag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    paidText: {
        fontSize: 12,
        fontWeight: '600',
        opacity: 0.7,
    },
    amount: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    dateText: {
        fontSize: 13,
        marginLeft: 6,
    },
    divider: {
        height: 1,
        width: '100%',
        marginBottom: 12,
    },
    notificationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    notificationLabel: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    notificationText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
    },
});

export default DueRemindersScreen;
