import React from 'react';
import { TextInput, StyleSheet, TextInputProps, View, Text, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import Ionicons from '@expo/vector-icons/Ionicons';

interface InputProps extends TextInputProps {
    label?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    containerStyle?: ViewStyle;
}

export const Input = ({ label, icon, style, containerStyle, ...props }: InputProps) => {
    const { theme } = useTheme();

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>}
            <View style={[styles.inputContainer, {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border
            }]}>
                {icon && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={theme.colors.textMuted}
                        style={styles.icon}
                    />
                )}
                <TextInput
                    style={[styles.input, { color: theme.colors.text }, style]}
                    placeholderTextColor={theme.colors.textMuted}
                    {...props}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        marginBottom: spacing.xs,
        fontSize: 14,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: spacing.xl,
        borderWidth: 1,
        paddingHorizontal: spacing.sm,
    },
    icon: {
        marginRight: spacing.xs,
    },
    input: {
        flex: 1,
        paddingVertical: spacing.md,
        fontSize: 16,
    },
});