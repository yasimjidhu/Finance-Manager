import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AppText from '../../components/common/AppText';
import AppButton from '../../components/common/AppButton';
import { Input } from '../../components/common/Input';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import { DarkColors, LightColors } from '../../theme/colors';
import Screen from '../../components/common/Screen';

export default function AuthScreen() {
    const navigation = useNavigation();
    const [isSignUp, setIsSignUp] = useState(true);
    const { theme } = useTheme();

    const handleGoBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            // Fallback if no history
            console.log("No history to go back to");
        }
    };

    const handleAuthAction = () => {
        // Navigate to Main tabs
        navigation.reset({
            index: 0,
            routes: [{ name: 'Main' as never }],
        });
    };

    return (
        <Screen>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={handleGoBack}
                        style={styles.backButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <AppText style={[styles.headerTitle, { color: theme.colors.primary }]}>
                        Join Personal Finance Tracker
                    </AppText>
                </View>

                {/* Toggle Sign Up / Log In */}
                <View style={[styles.toggleContainer, { backgroundColor: theme.colors.card }]}>
                    <TouchableOpacity
                        style={[
                            styles.toggleButton,
                            isSignUp && {
                                backgroundColor: theme.colors.primary,
                                shadowColor: theme.colors.text
                            }
                        ]}
                        onPress={() => setIsSignUp(true)}
                    >
                        <AppText style={[
                            styles.toggleText,
                            { color: isSignUp ? theme.colors.white : theme.colors.textSecondary }
                        ]}>
                            Sign Up
                        </AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.toggleButton,
                            !isSignUp && {
                                backgroundColor: theme.colors.primary,
                                shadowColor: theme.colors.text
                            }
                        ]}
                        onPress={() => setIsSignUp(false)}
                    >
                        <AppText style={[
                            styles.toggleText,
                            { color: !isSignUp ? theme.colors.white : theme.colors.textSecondary }
                        ]}>
                            Log In
                        </AppText>
                    </TouchableOpacity>
                </View>

                {/* Title & Subtitle */}
                <View style={styles.titleContainer}>
                    <AppText style={[styles.title, { color: theme.colors.text }]}>
                        {isSignUp ? "Create an Account" : "Welcome Back"}
                    </AppText>
                    <AppText style={[styles.subtitle, { color: theme.colors.textMuted }]}>
                        {isSignUp ? "Start your financial journey with us." : "Log in to continue your journey."}
                    </AppText>
                </View>

                {/* Form */}
                <View style={styles.formContainer}>
                    {isSignUp && (
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            icon="person-outline"
                            containerStyle={styles.inputContainer}
                        />
                    )}
                    <Input
                        label="Email"
                        placeholder="name@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        icon="mail-outline"
                        containerStyle={styles.inputContainer}
                    />
                    <Input
                        label="Password"
                        placeholder="********"
                        secureTextEntry
                        icon="lock-closed-outline"
                        containerStyle={styles.inputContainer}
                    />

                    <AppButton
                        title={isSignUp ? "Sign Up" : "Log In"}
                        onPress={handleAuthAction}
                        style={styles.submitButton}
                    />
                </View>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                    <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
                    <AppText style={[styles.dividerText, { color: theme.colors.textMuted }]}>
                        OR CONTINUE WITH
                    </AppText>
                    <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
                </View>

                {/* Social Buttons */}
                <AppButton
                    title="Continue with Google"
                    variant="primary"
                    icon="logo-google"
                    onPress={handleAuthAction}
                    style={styles.socialButton}
                />
                <AppButton
                    title="Continue with PhonePe"
                    variant="primary"
                    icon="phone-portrait-outline"
                    onPress={handleAuthAction}
                    style={styles.socialButton}
                />
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.md,
        flexGrow: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    backButton: {
        marginRight: spacing.sm,
        padding: spacing.xs,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
        marginLeft: spacing.xs,
    },
    toggleContainer: {
        flexDirection: 'row',
        borderRadius: spacing.xl,
        padding: 4,
        marginBottom: spacing.xl,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: spacing.sm,
        alignItems: 'center',
        borderRadius: spacing.xl,
    },
    toggleText: {
        fontWeight: '500',
        fontSize: 14,
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    subtitle: {
        textAlign: 'center',
        fontSize: 14,
        lineHeight: 20,
    },
    formContainer: {
        marginBottom: spacing.lg,
    },
    inputContainer: {
        marginBottom: spacing.md,
    },
    submitButton: {
        marginTop: spacing.sm,
        borderRadius: spacing.xl,
        backgroundColor: LightColors.primaryDark
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
        marginTop: spacing.sm,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: spacing.md,
        fontSize: 12,
        fontWeight: '500',
    },
    socialButton: {
        borderRadius: spacing.xl,
        marginBottom: spacing.sm,
        backgroundColor: DarkColors.prussianBlue
    },
});