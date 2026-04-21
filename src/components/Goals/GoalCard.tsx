import React from 'react';
import { View, StyleSheet, Image, ViewStyle, ImageSourcePropType, TouchableOpacity } from 'react-native';
import AppText from '../common/AppText';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import { formatCurrency } from '../../utils/helpers';
import Ionicons from '@expo/vector-icons/Ionicons';

interface GoalCardProps {
    title: string;
    targetAmount: number;
    savedAmount: number;
    monthlySavings: number;
    image?: ImageSourcePropType;
    style?: ViewStyle;
    onPress?: () => void;
    onLongPress?: () => void;
}

export default function GoalCard({
    title,
    targetAmount,
    savedAmount,
    monthlySavings,
    image,
    style,
    onPress,
    onLongPress
}: GoalCardProps) {
    const { theme } = useTheme();

    const progress = Math.min(savedAmount / targetAmount, 1);
    const percentage = Math.round(progress * 100);

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[styles.card, { backgroundColor: theme.colors.card, shadowColor: theme.colors.text }, style]}
        >
            <View style={styles.header}>
                {image ? (
                    <Image source={image} style={styles.image} />
                ) : (
                    <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.surface }]}>
                        <Ionicons name="trophy-outline" size={24} color={theme.colors.primary} />
                    </View>
                )}
                <View style={styles.headerText}>
                    <AppText style={[styles.title, { color: theme.colors.text }]}>{title}</AppText>
                    <View style={styles.targetRow}>
                        <Ionicons name="flag-outline" size={12} color={theme.colors.textMuted} style={{ marginRight: 4 }} />
                        <AppText style={[styles.target, { color: theme.colors.textMuted }]}>
                            Target: {formatCurrency(targetAmount)}
                        </AppText>
                    </View>
                </View>
                <View style={[styles.percentageBadge, { backgroundColor: 'rgba(252, 163, 17, 0.1)' }]}>
                    <AppText style={[styles.percentageText, { color: theme.colors.primary }]}>{percentage}%</AppText>
                </View>
            </View>

            <View style={styles.progressSection}>
                <View style={[styles.progressBarBg, { backgroundColor: theme.colors.surface }]}>
                    <View
                        style={[
                            styles.progressBarFill,
                            {
                                width: `${percentage}%`,
                                backgroundColor: theme.colors.primary
                            }
                        ]}
                    />
                </View>
                <View style={styles.progressLabels}>
                    <AppText style={[styles.savedAmount, { color: theme.colors.text }]}>
                        {formatCurrency(savedAmount)} <AppText style={{ color: theme.colors.textMuted, fontSize: 12 }}>Saved</AppText>
                    </AppText>
                    <AppText style={[styles.remainingAmount, { color: theme.colors.textMuted }]}>
                        {formatCurrency(targetAmount - savedAmount)} Left
                    </AppText>
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: 'rgba(0,0,0,0.05)' }]} />

            <View style={styles.footer}>
                <View style={styles.footerIconBox}>
                    <Ionicons name="trending-up" size={14} color={theme.colors.success} />
                </View>
                <AppText style={[styles.footerLabel, { color: theme.colors.textMuted }]}>
                    Monthly Savings Needed:
                </AppText>
                <AppText style={[styles.footerValue, { color: theme.colors.text }]}>
                    {formatCurrency(monthlySavings)}
                </AppText>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: spacing.lg,
        padding: spacing.md,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    image: {
        width: 56,
        height: 56,
        borderRadius: 12,
        marginRight: spacing.md,
    },
    imagePlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 12,
        marginRight: spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    targetRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    target: {
        fontSize: 12,
    },
    percentageBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    percentageText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    progressSection: {
        marginBottom: spacing.md,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.xs,
    },
    savedAmount: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    remainingAmount: {
        fontSize: 12,
    },
    progressBarBg: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    divider: {
        height: 1,
        marginBottom: spacing.md,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerIconBox: {
        width: 24,
        height: 24,
        borderRadius: 8,
        backgroundColor: 'rgba(34, 197, 94, 0.1)', // Green opacity
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    footerLabel: {
        fontSize: 12,
        flex: 1,
    },
    footerValue: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});

