import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Screen from '../../components/common/Screen';
import BudgetScreen from '../Budget/BudgetScreen';

const PlaceholderScreen = ({ title }: { title: string }) => (
    <Screen headerTitle={title} showBackButton={true}>
        <View style={styles.container}>
            <Text style={styles.text}>{title} Coming Soon</Text>
        </View>
    </Screen>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 18,
        color: '#666',
    },
});

export const BudgetingForecastingScreen = () => <BudgetScreen />;
export const UpiSpendScreen = () => <PlaceholderScreen title="UPI Spend Money" />;
export const SplitMoneyScreen = () => <PlaceholderScreen title="Split Money" />;
export const DueRemindersScreen = () => <PlaceholderScreen title="Due Reminders" />;
