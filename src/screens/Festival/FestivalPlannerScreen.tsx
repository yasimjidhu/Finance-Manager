import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import Screen from '../../components/common/Screen';
import AppText from '../../components/common/AppText';
import AppButton from '../../components/common/AppButton';
import { Input } from '../../components/common/Input';
import FestivalCard from '../../components/Festival/FestivalCard';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import Ionicons from '@expo/vector-icons/Ionicons';
import ActionSheet from '../../components/common/ActionSheet';

const DUMMY_FESTIVALS = [
    {
        id: '1',
        name: 'Diwali',
        budget: 15000,
        spent: 12500,
        image: require('../../../assets/diwali.png'),
    },
    {
        id: '2',
        name: 'Eid al-Fitr',
        budget: 10000,
        spent: 11000,
        image: require('../../../assets/eid.png'),
    },
    {
        id: '3',
        name: 'Onam',
        budget: 8000,
        spent: 7500,
        image: require('../../../assets/onam.png'),
    },
    {
        id: '4',
        name: 'Christmas',
        budget: 12000,
        spent: 13500,
        // Fallback image or color will be used
        image: null,
    },
];

export default function FestivalPlannerScreen() {
    const { theme } = useTheme();
    const [isModalVisible, setModalVisible] = useState(false);
    const [festivals, setFestivals] = useState(DUMMY_FESTIVALS);
    const [newFestival, setNewFestival] = useState({ name: '', budget: '' });

    const handleAddFestival = () => {
        if (!newFestival.name || !newFestival.budget) return;

        const newItem = {
            id: Date.now().toString(),
            name: newFestival.name,
            budget: parseInt(newFestival.budget),
            spent: 0,
            image: null,
        };

        setFestivals([newItem, ...festivals]);
        setModalVisible(false);
        setNewFestival({ name: '', budget: '' });
    };

    return (
        <Screen
            headerTitle="Festival Planner"
            showBackButton={true}
            rightComponent={
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Ionicons name="add" size={24} color={theme.colors.text} />
                </TouchableOpacity>
            }
        >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <AppText style={[styles.sectionTitle, { color: theme.colors.text }]}>Your Festivals</AppText>

                <View style={styles.list}>
                    {festivals.map((festival) => (
                        <FestivalCard
                            key={festival.id}
                            name={festival.name}
                            budget={festival.budget}
                            spent={festival.spent}
                            image={festival.image}
                            onPress={() => { }}
                        />
                    ))}
                </View>

                {/* Spending Comparison Chart Placeholder */}
                <View style={[styles.chartSection, { backgroundColor: theme.colors.card }]}>
                    <AppText style={[styles.sectionTitle, { color: theme.colors.text, marginBottom: spacing.md }]}>Spending Comparison</AppText>
                    {/* Simple Bar Chart Visualization using Views */}
                    <View style={styles.chartContainer}>
                        {festivals.map((item) => {
                            const maxVal = Math.max(item.budget, item.spent);
                            const scale = 100 / (maxVal || 10000); // Avoid divide by zero
                            return (
                                <View key={item.id} style={styles.chartBarGroup}>
                                    <View style={styles.bars}>
                                        <View style={[styles.bar, { height: Math.max(item.budget * scale * 0.8, 4), backgroundColor: '#636AE8' }]} />
                                        <View style={[styles.bar, { height: Math.max(item.spent * scale * 0.8, 4), backgroundColor: '#F472B6' }]} />
                                    </View>
                                    <AppText style={[styles.chartLabel, { color: theme.colors.textMuted }]}>{item.name.split(' ')[0]}</AppText>
                                </View>
                            )
                        })}
                    </View>
                    <View style={styles.legend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#636AE8' }]} />
                            <AppText style={[styles.legendText, { color: theme.colors.textMuted }]}>Budget</AppText>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#F472B6' }]} />
                            <AppText style={[styles.legendText, { color: theme.colors.textMuted }]}>Actual Spending</AppText>
                        </View>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            <ActionSheet
                visible={isModalVisible}
                onClose={() => setModalVisible(false)}
                title="New Festival Budget"
                actionLabel="Save Budget"
                onAction={handleAddFestival}
            >
                <View style={styles.inputGroup}>
                    <AppText style={[styles.label, { color: theme.colors.text }]}>Festival Name</AppText>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                        placeholder="e.g. Holi"
                        placeholderTextColor={theme.colors.textMuted}
                        value={newFestival.name}
                        onChangeText={(text) => setNewFestival({ ...newFestival, name: text })}
                    />
                </View>
                <View style={styles.inputGroup}>
                    <AppText style={[styles.label, { color: theme.colors.text }]}>Budget Amount (₹)</AppText>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }]}
                        placeholder="e.g. 5000"
                        placeholderTextColor={theme.colors.textMuted}
                        keyboardType="numeric"
                        value={newFestival.budget}
                        onChangeText={(text) => setNewFestival({ ...newFestival, budget: text })}
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: spacing.md,
    },
    list: {
        marginBottom: spacing.xl,
    },
    chartSection: {
        padding: spacing.md,
        borderRadius: spacing.md,
    },
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: 150,
        marginBottom: spacing.md,
    },
    chartBarGroup: {
        alignItems: 'center',
    },
    bars: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 4,
    },
    bar: {
        width: 12,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
    },
    chartLabel: {
        fontSize: 10,
        marginTop: 4,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.lg,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 12,
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
