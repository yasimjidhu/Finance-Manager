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
    const statusColor = isOverBudget ? theme.colors.danger : theme.colors.success;
    const statusBg = isOverBudget ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)';
    const statusText = isOverBudget ? 'Over Budget' : 'Under Budget';

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            style={[styles.card, { backgroundColor: theme.colors.card, shadowColor: theme.colors.text }, style]}
        >
            {/* Image Header */}
            <View style={styles.imageContainer}>
                {image ? (
                    <ImageBackground source={image} style={styles.image} resizeMode="cover">
                        <View style={styles.overlay} />
                        <View style={styles.headerContent}>
                            <AppText style={styles.festivalName}>{name}</AppText>
                            <View style={[styles.badge, { backgroundColor: statusBg }]}>
                                <AppText style={[styles.badgeText, { color: statusColor }]}>{statusText}</AppText>
                            </View>
                        </View>
                    </ImageBackground>
                ) : (
                    <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.primary }]}>
                        <View style={styles.headerContent}>
                            <AppText style={styles.festivalName}>{name}</AppText>
                            <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                <AppText style={[styles.badgeText, { color: '#fff' }]}>{statusText}</AppText>
                            </View>
                        </View>
                    </View>
                )}
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.row}>
                    <View>
                        <AppText style={[styles.label, { color: theme.colors.textMuted }]}>Budget</AppText>
                        <AppText style={[styles.value, { color: theme.colors.text }]}>{formatCurrency(budget)}</AppText>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <AppText style={[styles.label, { color: theme.colors.textMuted }]}>Spent</AppText>
                        <AppText style={[styles.value, { color: isOverBudget ? theme.colors.danger : theme.colors.success }]}>
                            {formatCurrency(spent)}
                        </AppText>
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={[styles.progressBarBg, { backgroundColor: theme.colors.surface }]}>
                    <View
                        style={[
                            styles.progressBarFill,
                            {
                                width: `${Math.min(percentage, 100)}%`,
                                backgroundColor: isOverBudget ? theme.colors.danger : theme.colors.primary
                            }
                        ]}
                    />
                </View>

                <View style={styles.footer}>
                    <AppText style={[styles.percentageText, { color: theme.colors.textMuted }]}>
                        {percentage}% Used
                    </AppText>
                    <TouchableOpacity style={styles.detailsButton} onPress={onPress}>
                        <AppText style={[styles.detailsText, { color: theme.colors.primary }]}>Details</AppText>
                        <Ionicons name="chevron-forward" size={14} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        marginBottom: spacing.lg,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    imageContainer: {
        height: 140,
        width: '100%',
    },
    image: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    headerContent: {
        padding: spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    festivalName: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    content: {
        padding: spacing.md,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    label: {
        fontSize: 12,
        marginBottom: 4,
    },
    value: {
        fontSize: 18,
        fontWeight: '700',
    },
    progressBarBg: {
        height: 6,
        borderRadius: 3,
        marginBottom: spacing.md,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    percentageText: {
        fontSize: 12,
        fontWeight: '500',
    },
    detailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    detailsText: {
        fontSize: 13,
        fontWeight: '600',
        marginRight: 4,
    },
});
