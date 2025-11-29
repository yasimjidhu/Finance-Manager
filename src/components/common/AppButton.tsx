import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import Ionicons from '@expo/vector-icons/Ionicons';

interface AppButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'outline';
    icon?: keyof typeof Ionicons.glyphMap;
    style?: ViewStyle;
}

export default function AppButton({ title, onPress, variant = 'primary', icon, style }: AppButtonProps) {
    const { theme } = useTheme();

    const isOutline = variant === 'outline';

    const containerStyle: ViewStyle = {
        backgroundColor: isOutline ? 'transparent' : theme.colors.primary,
        borderWidth: isOutline ? 1 : 0,
        borderColor: isOutline ? theme.colors.border : 'transparent',
    };

    const textStyle: TextStyle = {
        color: isOutline ? theme.colors.text : 'white',
        fontFamily: theme.typography.fontFamilyBold,
        marginLeft: icon ? 8 : 0,
    };

    return (
        <TouchableOpacity
            style={[styles.button, containerStyle, style]}
            onPress={onPress}
        >
            {icon && (
                <Ionicons
                    name={icon}
                    size={20}
                    color={isOutline ? theme.colors.text : 'white'}
                />
            )}
            <Text style={textStyle}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        padding: 14,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: 'center',
        marginVertical: 8,
        flexDirection: 'row',
    },
});
