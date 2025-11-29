import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LightColors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export const Card = ({ children, style }: CardProps) => {
    return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: LightColors.card,
        borderRadius: spacing.sm,
        padding: spacing.md,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
});
