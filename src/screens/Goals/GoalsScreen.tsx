import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import Screen from '../../components/common/Screen';
import AppText from '../../components/common/AppText';
import GoalCard from '../../components/Goals/GoalCard';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import Ionicons from '@expo/vector-icons/Ionicons';
import ActionSheet from '../../components/common/ActionSheet';

const DUMMY_GOALS = [
    {
        id: '1',
        title: 'Dream Vacation to Bali',
        targetAmount: 150000,
        savedAmount: 45000,
        monthlySavings: 11667,
        image: require('../../../assets/bali.png'),
    },
    {
        id: '2',
        title: 'New iPhone 15 Pro',
        targetAmount: 120000,
        savedAmount: 80000,
        monthlySavings: 8000,
        image: require('../../../assets/iphone.png'),
    },
];

const GoalsScreen = () => {
    const { theme } = useTheme();
    const [isModalVisible, setModalVisible] = useState(false);
    const [goals, setGoals] = useState(DUMMY_GOALS);
    const [newGoal, setNewGoal] = useState({ title: '', targetAmount: '', savedAmount: '' });

    const handleAddGoal = () => {
        if (!newGoal.title || !newGoal.targetAmount) return;

        const target = parseInt(newGoal.targetAmount);
        const saved = newGoal.savedAmount ? parseInt(newGoal.savedAmount) : 0;
        // Simple logic to estimate monthly savings (e.g., over 12 months)
        const monthly = Math.round((target - saved) / 12);

        const newItem = {
            id: Date.now().toString(),
            title: newGoal.title,
            targetAmount: target,
            savedAmount: saved,
            monthlySavings: monthly > 0 ? monthly : 0,
            image: null, // Placeholder or allow image selection later
        };

        setGoals([newItem, ...goals]);
        setModalVisible(false);
        setNewGoal({ title: '', targetAmount: '', savedAmount: '' });
    };

    return (
        <Screen
            headerTitle="Savings Goals"
            showBackButton={true}
            rightComponent={
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Ionicons name="add" size={24} color={theme.colors.text} />
                </TouchableOpacity>
            }
        >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.quoteContainer}>
                    <AppText style={[styles.quote, { color: theme.colors.textMuted }]}>
                        "Small steps today lead to big achievements tomorrow! Keep saving."
                    </AppText>
                </View>

                <View style={styles.list}>
                    {goals.map((goal) => (
                        <GoalCard
                            key={goal.id}
                            title={goal.title}
                            targetAmount={goal.targetAmount}
                            savedAmount={goal.savedAmount}
                            monthlySavings={goal.monthlySavings}
                            image={goal.image}
                        />
                    ))}
                </View>
                <View style={{ height: 20 }} />
            </ScrollView>

            <ActionSheet
                visible={isModalVisible}
                onClose={() => setModalVisible(false)}
                title="Add New Goal"
                actionLabel="Create Goal"
                onAction={handleAddGoal}
            >
                <View style={styles.inputGroup}>
                    <AppText style={[styles.label, { color: theme.colors.text }]}>Goal Title</AppText>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                        placeholder="e.g. New Car"
                        placeholderTextColor={theme.colors.textMuted}
                        value={newGoal.title}
                        onChangeText={(text) => setNewGoal({ ...newGoal, title: text })}
                    />
                </View>
                <View style={styles.inputGroup}>
                    <AppText style={[styles.label, { color: theme.colors.text }]}>Target Amount (₹)</AppText>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                        placeholder="e.g. 500000"
                        placeholderTextColor={theme.colors.textMuted}
                        keyboardType="numeric"
                        value={newGoal.targetAmount}
                        onChangeText={(text) => setNewGoal({ ...newGoal, targetAmount: text })}
                    />
                </View>
                <View style={styles.inputGroup}>
                    <AppText style={[styles.label, { color: theme.colors.text }]}>Already Saved (Optional)</AppText>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                        placeholder="e.g. 50000"
                        placeholderTextColor={theme.colors.textMuted}
                        keyboardType="numeric"
                        value={newGoal.savedAmount}
                        onChangeText={(text) => setNewGoal({ ...newGoal, savedAmount: text })}
                    />
                </View>
            </ActionSheet>
        </Screen>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: spacing.xl,
    },
    quoteContainer: {
        marginBottom: spacing.lg,
        paddingHorizontal: spacing.lg,
    },
    quote: {
        textAlign: 'center',
        fontStyle: 'italic',
        fontSize: 14,
        lineHeight: 20,
    },
    list: {
        gap: spacing.sm,
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

export default GoalsScreen;
