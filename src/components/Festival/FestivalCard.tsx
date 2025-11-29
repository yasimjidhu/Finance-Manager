import React from 'react';
import { View, StyleSheet, ImageBackground, TouchableOpacity, ImageSourcePropType, ViewStyle } from 'react-native';
import AppText from '../common/AppText';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import { formatCurrency } from '../../utils/helpers';
import Ionicons from '@expo/vector-icons/Ionicons';

interface FestivalCardProps {
    name: string;
    budget: number;
    spent: number;
    image?: ImageSourcePropType;
    onPress?: () => void;
    style?: ViewStyle;
}

export default function FestivalCard({
    name,
    budget,
    spent,
    image,
    onPress,
    style
}: FestivalCardProps) {
    const { theme } = useTheme();

    const progress = Math.min(spent / budget, 1);
    const isOverBudget = spent > budget;
    const percentage = Math.round((spent / budget) * 100);

    // Status badge colors
    const statusColor = isOverBudget ? theme.colors.danger : '#636AE8'; // Using the indigo/purple for under budget
    const statusBg = isOverBudget ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 106, 232, 0.1)';
    const statusText = isOverBudget ? 'Over Budget' : 'Under Budget';

    return (
        <View style={[styles.card, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }, style]}>
            {/* Image Header */}
            <View style={styles.imageContainer}>
                {image ? (
                    <ImageBackground source={image} style={styles.image} resizeMode="cover">
                        <View style={styles.overlay} />
                        <AppText style={styles.festivalName}>{name}</AppText>
                    </ImageBackground>
                ) : (
                    <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.primary }]}>
                        <AppText style={styles.festivalName}>{name}</AppText>
                    </View>
                )}
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.row}>
                    <AppText style={[styles.label, { color: theme.colors.textMuted }]}>Budget</AppText>
                    <AppText style={[styles.value, { color: theme.colors.text }]}>{formatCurrency(budget)}</AppText>
                </View>
                <View style={styles.row}>
                    <AppText style={[styles.label, { color: theme.colors.textMuted }]}>Actual Spending</AppText>
                    <AppText style={[styles.value, { color: isOverBudget ? theme.colors.danger : '#636AE8' }]}>
                        {formatCurrency(spent)}
                    </AppText>
                </View>

                {/* Progress Bar */}
                <View style={[styles.progressBarBg, { backgroundColor: theme.colors.surface }]}>
                    <View
                        style={[
                            styles.progressBarFill,
                            {
                                width: `${percentage}%`,
                                backgroundColor: isOverBudget ? theme.colors.danger : '#636AE8'
                            }
                        ]}
                    />
                </View>

                {/* Status Badge */}
                <View style={styles.badgeContainer}>
                    <View style={[styles.badge, { backgroundColor: statusBg }]}>
                        <AppText style={[styles.badgeText, { color: statusColor }]}>{statusText}</AppText>
                    </View>
                </View>

                {/* View Details Button */}
                <TouchableOpacity style={[styles.detailsButton, { borderColor: theme.colors.border }]} onPress={onPress}>
                    <AppText style={[styles.detailsText, { color: '#636AE8' }]}>View Details</AppText>
                    <Ionicons name="chevron-forward" size={16} color="#636AE8" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: spacing.md,
        marginBottom: spacing.lg,
        borderWidth: 1,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    imageContainer: {
        height: 120,
        width: '100%',
    },
    image: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
        padding: spacing.md,
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
        padding: spacing.md,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    festivalName: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    content: {
        padding: spacing.md,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    label: {
        fontSize: 14,
    },
    value: {
        fontSize: 14,
        fontWeight: '600',
    },
    progressBarBg: {
        height: 6,
        borderRadius: 3,
        marginTop: spacing.sm,
        marginBottom: spacing.md,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    badgeContainer: {
        flexDirection: 'row',
        marginBottom: spacing.md,
    },
    badge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: spacing.sm,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    detailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        borderWidth: 1,
        borderRadius: spacing.sm,
        marginTop: spacing.xs,
    },
    detailsText: {
        fontSize: 14,
        fontWeight: '500',
        marginRight: 4,
    },
});
