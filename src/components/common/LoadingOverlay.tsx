import React, { useEffect } from 'react';
import { View, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';
import AppText from './AppText';

interface LoadingOverlayProps {
    visible: boolean;
    message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible, message = 'Loading...' }) => {
    const { theme } = useTheme();
    const rotation = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            rotation.value = withRepeat(
                withTiming(360, {
                    duration: 1000,
                    easing: Easing.linear,
                }),
                -1
            );
        } else {
            rotation.value = 0;
        }
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotateZ: `${rotation.value}deg` }],
        };
    });

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.container}>
                <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
                <View style={[styles.content, { backgroundColor: theme.colors.card }]}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    {message && (
                        <AppText style={[styles.message, { color: theme.colors.text }]}>
                            {message}
                        </AppText>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    content: {
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        minWidth: 150,
    },
    message: {
        marginTop: 12,
        fontSize: 14,
        fontWeight: '500',
    },
});

export default LoadingOverlay;
