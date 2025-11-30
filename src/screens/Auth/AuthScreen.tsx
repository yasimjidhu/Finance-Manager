import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    TextInput,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import AppText from '../../components/common/AppText';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import { AuthService } from '../../services/auth.service';
import { useAlert } from '../../context/AlertContext';
import { handleError } from '../../utils/errorHandler';

const { width } = Dimensions.get('window');

// Define navigation type to fix TypeScript errors
type AuthScreenNavigationProp = {
    reset: (config: {
        index: number;
        routes: Array<{ name: string }>;
    }) => void;
};

export default function AuthScreen() {
    const navigation = useNavigation<AuthScreenNavigationProp>();
    const [isSignUp, setIsSignUp] = useState(true);
    const { theme } = useTheme();
    const { showAlert } = useAlert();

    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: ''
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAuthAction = async () => {
        // Basic validation
        if (!formData.email || !formData.password) {
            showAlert({
                title: 'Error',
                message: 'Please fill in all required fields',
                type: 'error'
            });
            return;
        }

        if (isSignUp && !formData.fullName) {
            showAlert({
                title: 'Error',
                message: 'Please enter your full name',
                type: 'error'
            });
            return;
        }

        try {
            if (isSignUp) {
                const { data, error } = await AuthService.signUp(formData.email, formData.password, formData.fullName);
                if (error) {
                    const { title, message } = handleError(error);
                    showAlert({ title, message, type: 'error' });
                    return;
                }

                // If user created but no session, try to sign in immediately
                if (data.user && !data.session) {
                    const { data: signInData, error: signInError } = await AuthService.signIn(formData.email, formData.password);

                    if (signInError || !signInData.session) {
                        showAlert({
                            title: 'Success',
                            message: 'Account created! Please check your email to verify your account.',
                            type: 'success'
                        });
                        setIsSignUp(false);
                        return;
                    }
                }
            } else {
                const { error } = await AuthService.signIn(formData.email, formData.password);
                if (error) {
                    const { title, message } = handleError(error);
                    showAlert({ title, message, type: 'error' });
                    return;
                }
            }

            // Navigate to Main tabs on success
            navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
            });

        } catch (e) {
            const { title, message } = handleError(e);
            showAlert({ title, message, type: 'error' });
            console.error(e);
        }
    };

    const handleSocialLogin = (provider: string) => {
        console.log(`Social login with: ${provider}`);
        showAlert({
            title: 'Coming Soon',
            message: `${provider} login is not yet implemented.`,
            type: 'info'
        });
    };

    return (
        <LinearGradient
            colors={[theme.colors.prussianBlue, '#0A1128']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    style={styles.keyboardAvoidingView}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Header / Logo */}
                        <Animated.View entering={FadeInDown.duration(800).springify()} style={styles.header}>
                            <View style={styles.logoContainer}>
                                <Ionicons name="wallet" size={48} color={theme.colors.primary} />
                            </View>
                            <AppText style={styles.appName}>Finance Tracker</AppText>
                            <AppText style={styles.tagline}>Master your money, master your life.</AppText>
                        </Animated.View>

                        {/* Auth Card */}
                        <Animated.View entering={FadeInDown.delay(200).duration(800).springify()} style={styles.authCard}>
                            {/* Toggle */}
                            <View style={styles.toggleContainer}>
                                <TouchableOpacity
                                    style={[styles.toggleButton, isSignUp && styles.activeToggle]}
                                    onPress={() => setIsSignUp(true)}
                                >
                                    <AppText style={[styles.toggleText, isSignUp ? { color: '#fff' } : { color: 'rgba(255,255,255,0.5)' }]}>
                                        Sign Up
                                    </AppText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.toggleButton, !isSignUp && styles.activeToggle]}
                                    onPress={() => setIsSignUp(false)}
                                >
                                    <AppText style={[styles.toggleText, !isSignUp ? { color: '#fff' } : { color: 'rgba(255,255,255,0.5)' }]}>
                                        Log In
                                    </AppText>
                                </TouchableOpacity>
                            </View>

                            {/* Form */}
                            <View style={styles.form}>
                                {isSignUp && (
                                    <View style={styles.inputGroup}>
                                        <Ionicons name="person-outline" size={20} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
                                        <TextInput
                                            placeholder="Full Name"
                                            placeholderTextColor="rgba(255,255,255,0.3)"
                                            style={styles.input}
                                            value={formData.fullName}
                                            onChangeText={(value) => handleInputChange('fullName', value)}
                                            autoCapitalize="words"
                                        />
                                    </View>
                                )}
                                <View style={styles.inputGroup}>
                                    <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
                                    <TextInput
                                        placeholder="Email Address"
                                        placeholderTextColor="rgba(255,255,255,0.3)"
                                        style={styles.input}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        value={formData.email}
                                        onChangeText={(value) => handleInputChange('email', value)}
                                        autoComplete="email"
                                    />
                                </View>
                                <View style={styles.inputGroup}>
                                    <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.5)" style={styles.inputIcon} />
                                    <TextInput
                                        placeholder="Password"
                                        placeholderTextColor="rgba(255,255,255,0.3)"
                                        style={styles.input}
                                        secureTextEntry
                                        value={formData.password}
                                        onChangeText={(value) => handleInputChange('password', value)}
                                        autoComplete={isSignUp ? "new-password" : "current-password"}
                                    />
                                </View>

                                <TouchableOpacity
                                    style={styles.submitButton}
                                    onPress={handleAuthAction}
                                    activeOpacity={0.9}
                                >
                                    <LinearGradient
                                        colors={['#FCA311', '#E89200']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.submitButtonGradient}
                                    >
                                        <AppText style={styles.submitButtonText}>
                                            {isSignUp ? 'Create Account' : 'Welcome Back'}
                                        </AppText>
                                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>

                            {/* Social Login */}
                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <AppText style={styles.dividerText}>OR CONTINUE WITH</AppText>
                                <View style={styles.dividerLine} />
                            </View>

                            <View style={styles.socialButtons}>
                                <TouchableOpacity
                                    style={styles.socialButton}
                                    onPress={() => handleSocialLogin('google')}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="logo-google" size={24} color="#fff" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.socialButton}
                                    onPress={() => handleSocialLogin('apple')}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="logo-apple" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </Animated.View>

                        {/* Footer */}
                        <Animated.View entering={FadeInUp.delay(400).duration(800).springify()} style={styles.footer}>
                            <AppText style={styles.footerText}>
                                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                            </AppText>
                            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                                <AppText style={styles.footerLink}>
                                    {isSignUp ? ' Log In' : ' Sign Up'}
                                </AppText>
                            </TouchableOpacity>
                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    appName: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
    },
    tagline: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
    },
    authCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 30,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: spacing.xl,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 16,
        padding: 4,
        marginBottom: 24,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    activeToggle: {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    toggleText: {
        fontWeight: '600',
        fontSize: 14,
    },
    form: {
        gap: 16,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        height: '100%',
    },
    submitButton: {
        marginTop: 8,
        shadowColor: '#FCA311',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    submitButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        marginRight: 8,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    dividerText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        fontWeight: '600',
        marginHorizontal: 16,
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
    },
    socialButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
    },
    footerLink: {
        color: '#FCA311',
        fontSize: 14,
        fontWeight: '600',
    },
});