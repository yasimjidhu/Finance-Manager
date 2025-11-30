import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, ZoomIn, FadeOut, ZoomOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AppText from './AppText';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';

const { width } = Dimensions.get('window');

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    type?: AlertType;
    onClose: () => void;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
    visible,
    title,
    message,
    type = 'info',
    onClose,
    onConfirm,
    confirmText = 'OK',
    cancelText = 'Cancel',
    showCancel = false,
}) => {
    const { theme } = useTheme();

    if (!visible) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return 'checkmark-circle';
            case 'error': return 'alert-circle';
            case 'warning': return 'warning';
            case 'info': return 'information-circle';
            default: return 'information-circle';
        }
    };

    const getColor = () => {
        switch (type) {
            case 'success': return '#22C55E'; // Green
            case 'error': return '#EF4444'; // Red
            case 'warning': return '#F59E0B'; // Amber
            case 'info': return '#3B82F6'; // Blue
            default: return theme.colors.primary;
        }
    };

    const color = getColor();

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
                <Animated.View
                    entering={ZoomIn.duration(300)}
                    exiting={ZoomOut.duration(200)}
                    style={[styles.container, { backgroundColor: theme.colors.card }]}
                >
                    <LinearGradient
                        colors={[color + '20', 'transparent']}
                        style={styles.gradientHeader}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                    />

                    <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                        <Ionicons name={getIcon()} size={32} color={color} />
                    </View>

                    <AppText style={[styles.title, { color: theme.colors.text }]}>{title}</AppText>
                    <AppText style={[styles.message, { color: theme.colors.textSecondary }]}>{message}</AppText>

                    <View style={styles.buttonContainer}>
                        {showCancel && (
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton, { borderColor: theme.colors.border }]}
                                onPress={onClose}
                            >
                                <AppText style={[styles.buttonText, { color: theme.colors.textSecondary }]}>
                                    {cancelText}
                                </AppText>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: color, flex: showCancel ? 1 : 0, minWidth: showCancel ? 0 : 120 }]}
                            onPress={() => {
                                if (onConfirm) onConfirm();
                                onClose();
                            }}
                        >
                            <AppText style={[styles.buttonText, { color: '#fff' }]}>{confirmText}</AppText>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    container: {
        width: width * 0.85,
        borderRadius: 24,
        padding: spacing.xl,
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    gradientHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    message: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: spacing.md,
        width: '100%',
        justifyContent: 'center',
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: 'transparent',
        borderWidth: 1,
    },
    buttonText: {
        fontWeight: '600',
        fontSize: 16,
    },
});

export default CustomAlert;
