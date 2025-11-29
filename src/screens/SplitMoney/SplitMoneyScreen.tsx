import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
} from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import ActionSheet from '../../components/common/ActionSheet';

const SplitMoneyScreen = ({ navigation }: any) => {
    const flatmates = [
        {
            id: 1,
            name: 'Anjali Sharma',
            status: 'Owes you ₹500',
            statusColor: '#111',
            avatar: 'https://randomuser.me/api/portraits/women/1.jpg', // Placeholder
            actions: [
                { label: 'Remind', type: 'outline' },
                { label: 'Settle', type: 'solid', color: '#F43F5E' },
            ],
        },
        {
            id: 2,
            name: 'Rahul Singh',
            status: 'You owe ₹250',
            statusColor: '#EF4444',
            avatar: 'https://randomuser.me/api/portraits/men/2.jpg', // Placeholder
            actions: [
                { label: 'Remind', type: 'outline' },
                { label: 'Settle', type: 'solid', color: '#F43F5E' },
            ],
        },
        {
            id: 3,
            name: 'Priya Verma',
            status: 'Settled up',
            statusColor: '#666',
            avatar: 'https://randomuser.me/api/portraits/women/3.jpg', // Placeholder
            actions: [],
        },
    ];

    const bills = [
        {
            id: 1,
            title: 'Monthly Rent',
            amount: 15000,
            date: '10th May 2024',
            payer: 'Anjali Sharma',
            icon: 'home-outline',
            iconType: 'Ionicons',
            shares: [
                { name: 'Anjali Sharma', amount: 5000, status: 'paid', color: '#111' },
                { name: 'Rahul Singh', amount: 5000, status: 'pending', color: '#EF4444' },
                { name: 'Priya Verma', amount: 5000, status: 'paid', color: '#111' },
            ],
        },
        {
            id: 2,
            title: 'Electricity Bill',
            amount: 1800,
            date: '5th May 2024',
            payer: 'Rahul Singh',
            icon: 'flash-outline', // Changed to flash-outline for electricity
            iconType: 'Ionicons',
            shares: [
                { name: 'Anjali Sharma', amount: 600, status: 'pending', color: '#EF4444' },
                { name: 'Rahul Singh', amount: 600, status: 'paid', color: '#111' },
                { name: 'Priya Verma', amount: 600, status: 'pending', color: '#EF4444' },
            ],
        },
        {
            id: 3,
            title: 'Groceries (May)',
            amount: 2500,
            date: '1st May 2024',
            payer: 'Priya Verma',
            icon: 'silverware-fork-knife',
            iconType: 'MaterialCommunityIcons',
            shares: [
                { name: 'Anjali Sharma', amount: 833, status: 'paid', color: '#111' },
                { name: 'Rahul Singh', amount: 833, status: 'paid', color: '#111' },
                { name: 'Priya Verma', amount: 834, status: 'paid', color: '#111' },
            ],
        },
        {
            id: 4,
            title: 'Internet Subscription',
            amount: 999,
            date: '28th April 2024',
            payer: 'Anjali Sharma',
            icon: 'currency-usd',
            iconType: 'MaterialCommunityIcons',
            shares: [
                { name: 'Anjali Sharma', amount: 333, status: 'paid', color: '#111' },
                { name: 'Rahul Singh', amount: 333, status: 'pending', color: '#EF4444' },
                { name: 'Priya Verma', amount: 333, status: 'paid', color: '#111' },
            ],
        },
    ];

    const { theme } = useTheme();
    const [isModalVisible, setModalVisible] = useState(false);
    const [newBill, setNewBill] = useState({ title: '', amount: '', payer: '' });
    const [billsList, setBillsList] = useState(bills);

    const handleAddBill = () => {
        if (!newBill.title || !newBill.amount || !newBill.payer) return;

        const newItem = {
            id: Date.now(),
            title: newBill.title,
            amount: parseInt(newBill.amount),
            date: 'Just now',
            payer: newBill.payer,
            icon: 'receipt',
            iconType: 'Ionicons',
            shares: [
                { name: 'You', amount: parseInt(newBill.amount) / 2, status: 'paid', color: theme.colors.text },
                { name: 'Others', amount: parseInt(newBill.amount) / 2, status: 'pending', color: theme.colors.danger },
            ],
        };

        setBillsList([newItem, ...billsList]);
        setModalVisible(false);
        setNewBill({ title: '', amount: '', payer: '' });
    };

    const renderFlatmate = (item: any) => (
        <View key={item.id} style={[styles.flatmateCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.flatmateInfo}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                <View>
                    <Text style={[styles.flatmateName, { color: theme.colors.text }]}>{item.name}</Text>
                    <Text style={[styles.flatmateStatus, { color: item.statusColor }]}>{item.status}</Text>
                </View>
            </View>
            <View style={styles.actionButtons}>
                {item.actions.map((action: any, index: number) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.actionButton,
                            action.type === 'outline' ? [styles.btnOutline, { borderColor: theme.colors.primary, backgroundColor: 'transparent' }] : { backgroundColor: action.color },
                        ]}
                    >
                        <Text
                            style={[
                                styles.actionBtnText,
                                action.type === 'outline' ? { color: theme.colors.primary } : styles.textWhite,
                            ]}
                        >
                            {action.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderBill = (item: any) => (
        <View key={item.id} style={[styles.billCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.billHeader}>
                <View style={styles.billTitleRow}>
                    <View style={styles.billIconContainer}>
                        {item.iconType === 'MaterialCommunityIcons' ? (
                            <MaterialCommunityIcons name={item.icon} size={20} color={theme.colors.text} />
                        ) : (
                            <Ionicons name={item.icon} size={20} color={theme.colors.text} />
                        )}
                    </View>
                    <Text style={[styles.billTitle, { color: theme.colors.text }]}>{item.title}</Text>
                </View>
                <View style={[styles.amountBadge, { backgroundColor: theme.mode === 'dark' ? '#333' : '#E0E7FF' }]}>
                    <Text style={[styles.amountBadgeText, { color: theme.colors.primary }]}>₹{item.amount}</Text>
                </View>
            </View>
            <Text style={[styles.billDate, { color: theme.colors.textMuted }]}>Paid by {item.payer} on {item.date}</Text>

            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

            <Text style={[styles.sharesLabel, { color: theme.colors.text }]}>Shares:</Text>
            {item.shares.map((share: any, index: number) => (
                <View key={index} style={styles.shareRow}>
                    <Text style={[styles.shareName, { color: theme.colors.textMuted }]}>{share.name}</Text>
                    <Text style={[styles.shareAmount, { color: share.color }]}>
                        ₹{share.amount} ({share.status})
                    </Text>
                </View>
            ))}
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Split Money</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Ionicons name="person-add-outline" size={22} color={theme.colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIcon} onPress={() => setModalVisible(true)}>
                        <Ionicons name="add" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Your Flatmates</Text>
                {flatmates.map(renderFlatmate)}

                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Shared Bills</Text>
                {billsList.map(renderBill)}

                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Actions</Text>
                <View style={styles.quickActionsRow}>
                    <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <Ionicons name="notifications-outline" size={20} color={theme.colors.text} />
                        <Text style={[styles.quickActionText, { color: theme.colors.text }]}>Send Reminder</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <MaterialCommunityIcons name="currency-usd" size={20} color={theme.colors.text} />
                        <Text style={[styles.quickActionText, { color: theme.colors.text }]}>Suggest Settlement</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>

            <ActionSheet
                visible={isModalVisible}
                onClose={() => setModalVisible(false)}
                title="Add New Bill"
                actionLabel="Add Bill"
                onAction={handleAddBill}
            >
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>Description</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                        placeholder="e.g. Dinner"
                        placeholderTextColor={theme.colors.textMuted}
                        value={newBill.title}
                        onChangeText={(text) => setNewBill({ ...newBill, title: text })}
                    />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>Amount (₹)</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                        placeholder="e.g. 1200"
                        placeholderTextColor={theme.colors.textMuted}
                        keyboardType="numeric"
                        value={newBill.amount}
                        onChangeText={(text) => setNewBill({ ...newBill, amount: text })}
                    />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>Paid By</Text>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                        placeholder="e.g. You"
                        placeholderTextColor={theme.colors.textMuted}
                        value={newBill.payer}
                        onChangeText={(text) => setNewBill({ ...newBill, payer: text })}
                    />
                </View>
            </ActionSheet>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 16,
    },
    headerIcon: {
        padding: 4,
    },
    scrollContent: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111',
        marginTop: 8,
        marginBottom: 12,
    },
    flatmateCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    flatmateInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: '#eee',
    },
    flatmateName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111',
    },
    flatmateStatus: {
        fontSize: 12,
        marginTop: 2,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    btnOutline: {
        borderColor: '#5C66F0',
        backgroundColor: '#fff',
    },
    actionBtnText: {
        fontSize: 12,
        fontWeight: '500',
    },
    textBlue: {
        color: '#5C66F0',
    },
    textWhite: {
        color: '#fff',
    },
    billCard: {
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    billHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    billTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    billIconContainer: {
        marginRight: 8,
    },
    billTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111',
    },
    amountBadge: {
        backgroundColor: '#E0E7FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    amountBadgeText: {
        fontSize: 12,
        color: '#5C66F0',
        fontWeight: '600',
    },
    billDate: {
        fontSize: 12,
        color: '#666',
        marginBottom: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginBottom: 12,
    },
    sharesLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    shareRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    shareName: {
        fontSize: 13,
        color: '#666',
    },
    shareAmount: {
        fontSize: 13,
        fontWeight: '500',
    },
    quickActionsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    quickActionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e5e5',
        gap: 8,
    },
    quickActionText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111',
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

export default SplitMoneyScreen;
