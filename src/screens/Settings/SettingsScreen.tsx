import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import AppText from '../../components/common/AppText';
import { spacing } from '../../theme/spacing';
import { StorageService } from '../../services/storage.service';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAlert } from '../../context/AlertContext';

export default function SettingsScreen({ navigation }: any) {
    const { theme, toggleTheme, isDark } = useTheme();
    const { showAlert } = useAlert();

    // Mock States
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [emailAlerts, setEmailAlerts] = useState(false);
    const [biometricsEnabled, setBiometricsEnabled] = useState(false);

    const handleResetApp = () => {
        showAlert({
            title: "Reset Application",
            message: "Are you sure you want to wipe all data? This cannot be undone.",
            type: "warning",
            showCancel: true,
            confirmText: "Reset",
            onConfirm: async () => {
                await StorageService.clearAll();
                showAlert({
                    title: "Success",
                    message: "App data has been reset. Please restart the app.",
                    type: "success"
                });
            }
        });
    };

    const SettingItem = ({
        icon,
        label,
        value,
        onPress,
        type = 'arrow',
        color = theme.colors.primary,
        danger = false
    }: any) => (
        <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: theme.colors.card }]}
            onPress={onPress}
            activeOpacity={type === 'switch' ? 1 : 0.7}
            disabled={type === 'switch'}
        >
            <View style={[styles.iconBox, { backgroundColor: danger ? '#FEE2E2' : color + '15' }]}>
                <Ionicons name={icon} size={20} color={danger ? '#EF4444' : color} />
            </View>
            <AppText style={[styles.settingLabel, { color: danger ? '#EF4444' : theme.colors.text }]}>
                {label}
            </AppText>

            {type === 'switch' && (
                <Switch
                    value={value}
                    onValueChange={onPress}
                    trackColor={{ false: '#767577', true: theme.colors.primary }}
                    thumbColor={'#f4f3f4'}
                />
            )}

            {type === 'arrow' && (
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
            )}

            {type === 'value' && (
                <AppText style={{ color: theme.colors.textMuted }}>{value}</AppText>
            )}
        </TouchableOpacity>
    );

    const SectionHeader = ({ title }: { title: string }) => (
        <AppText style={[styles.sectionHeader, { color: theme.colors.textMuted }]}>
            {title}
        </AppText>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <AppText style={[styles.headerTitle, { color: theme.colors.text }]}>Settings</AppText>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Preferences */}
                <Animated.View entering={FadeInDown.duration(600).springify()}>
                    <SectionHeader title="PREFERENCES" />
                    <View style={styles.section}>
                        <SettingItem
                            icon={isDark ? "moon" : "sunny"}
                            label="Dark Mode"
                            type="switch"
                            value={isDark}
                            onPress={toggleTheme}
                            color="#8B5CF6"
                        />
                        <SettingItem
                            icon="cash-outline"
                            label="Currency"
                            type="value"
                            value="INR (₹)"
                            onPress={() => { }}
                            color="#10B981"
                        />
                        <SettingItem
                            icon="language-outline"
                            label="Language"
                            type="value"
                            value="English"
                            onPress={() => { }}
                            color="#3B82F6"
                        />
                    </View>
                </Animated.View>

                {/* Notifications */}
                <Animated.View entering={FadeInDown.delay(100).duration(600).springify()}>
                    <SectionHeader title="NOTIFICATIONS" />
                    <View style={styles.section}>
                        <SettingItem
                            icon="notifications-outline"
                            label="Push Notifications"
                            type="switch"
                            value={notificationsEnabled}
                            onPress={() => setNotificationsEnabled(!notificationsEnabled)}
                            color="#F59E0B"
                        />
                        <SettingItem
                            icon="mail-outline"
                            label="Email Alerts"
                            type="switch"
                            value={emailAlerts}
                            onPress={() => setEmailAlerts(!emailAlerts)}
                            color="#EC4899"
                        />
                    </View>
                </Animated.View>

                {/* Security */}
                <Animated.View entering={FadeInDown.delay(200).duration(600).springify()}>
                    <SectionHeader title="SECURITY" />
                    <View style={styles.section}>
                        <SettingItem
                            icon="finger-print-outline"
                            label="Biometric Login"
                            type="switch"
                            value={biometricsEnabled}
                            onPress={() => setBiometricsEnabled(!biometricsEnabled)}
                            color="#6366F1"
                        />
                        <SettingItem
                            icon="lock-closed-outline"
                            label="Change PIN"
                            onPress={() => Alert.alert("Coming Soon", "PIN management will be available in the next update.")}
                            color="#6366F1"
                        />
                    </View>
                </Animated.View>

                {/* Data & Privacy */}
                <Animated.View entering={FadeInDown.delay(300).duration(600).springify()}>
                    <SectionHeader title="DATA & PRIVACY" />
                    <View style={styles.section}>
                        <SettingItem
                            icon="cloud-download-outline"
                            label="Export Data (CSV)"
                            onPress={() => Alert.alert("Export", "Your data is being prepared for export...")}
                            color="#14B8A6"
                        />
                        <SettingItem
                            icon="trash-outline"
                            label="Reset App Data"
                            onPress={handleResetApp}
                            danger={true}
                        />
                    </View>
                </Animated.View>

                {/* About */}
                <Animated.View entering={FadeInDown.delay(400).duration(600).springify()}>
                    <SectionHeader title="ABOUT" />
                    <View style={styles.section}>
                        <SettingItem
                            icon="information-circle-outline"
                            label="About FinanceTracker"
                            onPress={() => { }}
                            color="#64748B"
                        />
                        <SettingItem
                            icon="document-text-outline"
                            label="Privacy Policy"
                            onPress={() => Linking.openURL('https://google.com')}
                            color="#64748B"
                        />
                        <SettingItem
                            icon="star-outline"
                            label="Rate Us"
                            onPress={() => Alert.alert("Thank You!", "We appreciate your feedback!")}
                            color="#FCA311"
                        />
                    </View>
                </Animated.View>

                <View style={styles.footer}>
                    <AppText style={[styles.versionText, { color: theme.colors.textMuted }]}>
                        Version 1.0.0 (Build 2025.11.30)
                    </AppText>
                    <AppText style={[styles.copyrightText, { color: theme.colors.textMuted }]}>
                        © 2025 FinanceTracker Inc.
                    </AppText>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    content: {
        paddingBottom: spacing.xl,
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: spacing.lg,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
        letterSpacing: 1,
    },
    section: {
        marginHorizontal: spacing.lg,
        borderRadius: 16,
        overflow: 'hidden',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 1, // For separator effect if background is same
        borderRadius: 12,
        marginBottom: 8,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    settingLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    footer: {
        alignItems: 'center',
        marginTop: spacing.xl,
        marginBottom: spacing.xl,
    },
    versionText: {
        fontSize: 12,
        marginBottom: 4,
    },
    copyrightText: {
        fontSize: 12,
    },
});
