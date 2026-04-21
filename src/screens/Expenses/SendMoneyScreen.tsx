import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import AppText from '../../components/common/AppText';
import { ExpenseService } from '../../services/expense.service';
import { LinearGradient } from 'expo-linear-gradient';

import Animated, { FadeInDown } from 'react-native-reanimated';

export default function SendMoneyScreen({ navigation }: any) {
    const { theme } = useTheme();
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!recipient || !amount) {
            Alert.alert('Error', 'Please enter recipient and amount');
            return;
        }

        setLoading(true);
        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            await ExpenseService.addTransaction({
                title: `Sent to ${recipient}`,
                amount: parseFloat(amount),
                date: new Date().toISOString(),
                type: 'expense',
                category: 'Transfer',
                icon: 'send',
                color: '#6366F1'
            });

            Alert.alert('Success', `₹${amount} sent to ${recipient} successfully!`, [
                { text: 'Done', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Transaction failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <AppText style={[styles.headerTitle, { color: theme.colors.text }]}>Send Money</AppText>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <Animated.View entering={FadeInDown.duration(600).springify()}>
                        <View style={styles.inputGroup}>
                            <AppText style={[styles.label, { color: theme.colors.text }]}>To</AppText>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
                                placeholder="Name, UPI ID, or Mobile Number"
                                placeholderTextColor={theme.colors.textMuted}
                                value={recipient}
                                onChangeText={setRecipient}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <AppText style={[styles.label, { color: theme.colors.text }]}>Amount</AppText>
                            <View style={[styles.amountInputContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                                <AppText style={[styles.currencySymbol, { color: theme.colors.text }]}>₹</AppText>
                                <TextInput
                                    style={[styles.amountInput, { color: theme.colors.text }]}
                                    placeholder="0"
                                    placeholderTextColor={theme.colors.textMuted}
                                    keyboardType="numeric"
                                    value={amount}
                                    onChangeText={setAmount}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <AppText style={[styles.label, { color: theme.colors.text }]}>Note (Optional)</AppText>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
                                placeholder="What's this for?"
                                placeholderTextColor={theme.colors.textMuted}
                                value={note}
                                onChangeText={setNote}
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.sendButtonWrapper}
                            onPress={handleSend}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={['#6366F1', '#4F46E5']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.sendButton}
                            >
                                {loading ? (
                                    <AppText style={styles.sendButtonText}>Sending...</AppText>
                                ) : (
                                    <>
                                        <Ionicons name="send" size={20} color="#fff" style={{ marginRight: 8 }} />
                                        <AppText style={styles.sendButtonText}>Send Money</AppText>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

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
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    content: {
        padding: spacing.lg,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    input: {
        height: 56,
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 64,
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
    },
    currencySymbol: {
        fontSize: 24,
        fontWeight: '600',
        marginRight: 8,
    },
    amountInput: {
        flex: 1,
        fontSize: 24,
        fontWeight: '600',
    },
    sendButtonWrapper: {
        marginTop: 24,
        borderRadius: 16,
        overflow: 'hidden',
    },
    sendButton: {
        height: 56,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
