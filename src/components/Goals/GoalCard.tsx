import React from 'react';
import { View, StyleSheet, Image, ViewStyle, ImageSourcePropType } from 'react-native';
import AppText from '../common/AppText';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import { formatCurrency } from '../../utils/helpers';

interface GoalCardProps {
    title: string;
    targetAmount: number;
    savedAmount: number;
    monthlySavings: number;
    image?: ImageSourcePropType;
    style?: ViewStyle;
}

export default function GoalCard({
    title,
    targetAmount,
    savedAmount,
    monthlySavings,
    image,
    style
}: GoalCardProps) {
    const { theme } = useTheme();

    const progress = Math.min(savedAmount / targetAmount, 1);
    const percentage = Math.round(progress * 100);

    return (
        <View style={[styles.card, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }, style]}>
            <View style={styles.header}>
                {image ? (
                    <Image source={image} style={styles.image} />
                ) : (
                    <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.surface }]} />
                )}
                <View style={styles.headerText}>
                    <AppText style={[styles.title, { color: theme.colors.text }]}>{title}</AppText>
                    <AppText style={[styles.target, { color: theme.colors.textMuted }]}>
                        Target: {formatCurrency(targetAmount)}
                    </AppText>
                </View>
            </View>

            <View style={styles.progressSection}>
                <View style={styles.progressLabels}>
                    <AppText style={[styles.savedAmount, { color: theme.colors.text }]}>
                        Saved: {formatCurrency(savedAmount)}
                    </AppText>
                    <AppText style={[styles.percentage, { color: theme.colors.primary }]}>
                        {percentage}%
                    </AppText>
                </View>

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
            </View>

            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

            <View style={styles.footer}>
                <AppText style={[styles.footerLabel, { color: theme.colors.textMuted }]}>
                    Monthly Savings Needed:
                </AppText>
                <AppText style={[styles.footerValue, { color: theme.colors.text }]}>
                    {formatCurrency(monthlySavings)}
                </AppText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: spacing.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    image: {
        width: 48,
        height: 48,
        borderRadius: 8,
        marginRight: spacing.md,
    },
    imagePlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 8,
        marginRight: spacing.md,
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    target: {
        fontSize: 14,
    },
    progressSection: {
        marginBottom: spacing.md,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    savedAmount: {
        fontSize: 14,
        fontWeight: '500',
    },
    percentage: {
        fontSize: 14,
        fontWeight: '600',
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
        opacity: 0.5,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerLabel: {
        fontSize: 14,
    },
    footerValue: {
        fontSize: 16,
        fontWeight: '600',
    },
});
