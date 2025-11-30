import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LightColors } from '../../theme/colors';

const AddExpenseScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.text}>Add Expense Screen</Text>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: LightColors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: LightColors.text,
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default AddExpenseScreen;
