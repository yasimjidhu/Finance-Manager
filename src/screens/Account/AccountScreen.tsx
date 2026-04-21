import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';

import AppText from '../../components/common/AppText';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import { SpendingPersonalityService, PersonalityProfile } from '../../services/spendingPersonality.service';

const { width } = Dimensions.get('window');

import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

export default function AccountScreen() {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const [personality, setPersonality] = useState<PersonalityProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const toggleDrawer = () => {
        navigation.dispatch(DrawerActions.toggleDrawer());
    };

    useEffect(() => {
        const fetchPersonality = async () => {
            setLoading(true);
            const profile = await SpendingPersonalityService.getPersonality();
            setPersonality(profile);
            setLoading(false);
        };

        fetchPersonality();
    }, []);

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
                <Ionicons name="menu" size={28} color={theme.colors.text} />
            </TouchableOpacity>
            <AppText style={[styles.headerTitle, { color: theme.colors.text }]}>My Account</AppText>
            <TouchableOpacity style={styles.editButton}>
                <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
            </TouchableOpacity>
        </View>
    );

    const renderProfileCard = () => (
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.profileSection}>
            <View style={styles.avatarContainer}>
                <LinearGradient
                    colors={[theme.colors.primary, '#F97316']}
                    style={styles.avatarGradient}
                >
                    <Image
                        source={{ uri: 'https://i.pravatar.cc/150?img=11' }}
                        style={styles.avatarImage}
                    />
                </LinearGradient>
                <View style={styles.editAvatarBadge}>
                    <Ionicons name="camera" size={14} color="#fff" />
                </View>
            </View>
            <AppText style={[styles.userName, { color: theme.colors.text }]}>Dirshith</AppText>
            <AppText style={[styles.userEmail, { color: theme.colors.textMuted }]}>dirshith@example.com</AppText>
            <View style={[styles.memberBadge, { backgroundColor: 'rgba(255, 215, 0, 0.15)' }]}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <AppText style={styles.memberText}>Pro Member</AppText>
            </View>
        </Animated.View>
    );

    const renderPersonalityBadge = () => {
        if (!personality) return null;

        return (
            <Animated.View entering={ZoomIn.delay(200).duration(600).springify()}>
                <LinearGradient
                    colors={[theme.colors.card, theme.colors.card]}
                    style={[styles.personalityCard, { shadowColor: personality.color }]}
                >
                    <View style={styles.badgeHeader}>
                        <AppText style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>SPENDING PERSONALITY</AppText>
                        <View style={[styles.monthBadge, { backgroundColor: theme.colors.background }]}>
                            <AppText style={[styles.monthText, { color: theme.colors.text }]}>Nov 2025</AppText>
                        </View>
                    </View>

                    <View style={styles.badgeContent}>
                        <View style={[styles.iconContainer, { backgroundColor: `${personality.color}20`, borderColor: personality.color }]}>
                            <AppText style={styles.badgeIcon}>{personality.icon}</AppText>
                        </View>
                        <View style={styles.badgeTextContent}>
                            <AppText style={[styles.badgeTitle, { color: personality.color }]}>{personality.title}</AppText>
                            <AppText style={[styles.badgeDesc, { color: theme.colors.text }]}>{personality.description}</AppText>
                        </View>
                    </View>

                    <View style={styles.traitsContainer}>
                        {personality.traits.map((trait, index) => (
                            <View key={index} style={[styles.traitTag, { backgroundColor: theme.colors.background }]}>
                                <AppText style={[styles.traitText, { color: theme.colors.textMuted }]}>#{trait}</AppText>
                            </View>
                        ))}
                    </View>
                </LinearGradient>
            </Animated.View>
        );
    };

    const renderStats = () => (
        <Animated.View entering={FadeInDown.delay(300).duration(600).springify()} style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                <AppText style={[styles.statValue, { color: theme.colors.text }]}>85%</AppText>
                <AppText style={[styles.statLabel, { color: theme.colors.textMuted }]}>Budget Score</AppText>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                <AppText style={[styles.statValue, { color: theme.colors.text }]}>12</AppText>
                <AppText style={[styles.statLabel, { color: theme.colors.textMuted }]}>Goals Met</AppText>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                <AppText style={[styles.statValue, { color: theme.colors.text }]}>₹1.2L</AppText>
                <AppText style={[styles.statLabel, { color: theme.colors.textMuted }]}>Total Saved</AppText>
            </View>
        </Animated.View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {renderHeader()}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {renderProfileCard()}
                {renderPersonalityBadge()}
                {renderStats()}

                <Animated.View entering={FadeInDown.delay(400).duration(600).springify()}>
                    <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.colors.card }]}>
                        <View style={styles.menuIconBox}>
                            <Ionicons name="card-outline" size={20} color={theme.colors.primary} />
                        </View>
                        <AppText style={[styles.menuText, { color: theme.colors.text }]}>Payment Methods</AppText>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(500).duration(600).springify()}>
                    <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.colors.card }]}>
                        <View style={styles.menuIconBox}>
                            <Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.primary} />
                        </View>
                        <AppText style={[styles.menuText, { color: theme.colors.text }]}>Security & Privacy</AppText>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(600).duration(600).springify()}>
                    <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.colors.card }]}>
                        <View style={styles.menuIconBox}>
                            <Ionicons name="help-circle-outline" size={20} color={theme.colors.primary} />
                        </View>
                        <AppText style={[styles.menuText, { color: theme.colors.text }]}>Help & Support</AppText>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(700).duration(600).springify()}>
                    <TouchableOpacity style={[styles.logoutButton, { borderColor: theme.colors.danger }]}>
                        <AppText style={[styles.logoutText, { color: theme.colors.danger }]}>Log Out</AppText>
                    </TouchableOpacity>
                </Animated.View>

                <View style={{ height: 40 }} />
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
    menuButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    editButton: {
        padding: 4,
    },
    scrollContent: {
        padding: spacing.lg,
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: spacing.md,
    },
    avatarGradient: {
        width: 100,
        height: 100,
        borderRadius: 50,
        padding: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: 94,
        height: 94,
        borderRadius: 47,
        backgroundColor: '#ccc',
    },
    editAvatarBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#22C55E',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000', // Should match background
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        marginBottom: 12,
    },
    memberBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    memberText: {
        color: '#FFD700',
        fontSize: 12,
        fontWeight: 'bold',
    },
    personalityCard: {
        borderRadius: 24,
        padding: 24,
        marginBottom: spacing.xl,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
    badgeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
    },
    monthBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    monthText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    badgeContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        marginRight: spacing.md,
    },
    badgeIcon: {
        fontSize: 32,
    },
    badgeTextContent: {
        flex: 1,
    },
    badgeTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    badgeDesc: {
        fontSize: 14,
        lineHeight: 20,
        opacity: 0.8,
    },
    traitsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    traitTag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    traitText: {
        fontSize: 12,
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
    },
    statCard: {
        width: '31%',
        padding: 12,
        borderRadius: 16,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    menuIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginTop: spacing.md,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
