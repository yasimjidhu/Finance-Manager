import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AppText from '../common/AppText';
import { useTheme } from '../../theme/ThemeProvider';
import { formatCurrency } from '../../utils/helpers';
import { spacing } from '../../theme/spacing';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.lg * 3) / 2;

interface EnvelopeCardProps {
    name: string;
    allocated: number;
    spent: number;
    icon: any;
    color: string;
    onPress: () => void;
    onLongPress?: () => void;
}

const EnvelopeCard = ({ name, allocated, spent, icon, color, onPress, onLongPress }: EnvelopeCardProps) => {
    const { theme } = useTheme();
    const remaining = allocated - spent;
    const progress = Math.min(spent / allocated, 1);
    const percentage = Math.round(progress * 100);
    const isEmpty = remaining <= 0;
    const isLow = !isEmpty && remaining < (allocated * 0.25);

    // Clean status logic
    const getStatusInfo = () => {
        if (isEmpty) return { color: theme.colors.danger, label: 'EMPTY' };
        if (isLow) return { color: theme.colors.warning, label: 'LOW' };
        if (percentage < 50) return { color: '#22C55E', label: 'GOOD' };
        if (percentage < 80) return { color: theme.colors.warning, label: 'OK' };
        return { color: theme.colors.danger, label: 'HIGH' };
    };

    const { color: statusColor, label: statusLabel } = getStatusInfo();
    const isDark = theme.colors.background === '#000000';

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.card,
                    borderWidth: 1,
                    borderColor: isEmpty ? theme.colors.danger : 'rgba(0,0,0,0.05)',
                    shadowColor: theme.colors.text,
                }
            ]}
        >
            {/* Envelope Flap Design */}
            <View style={[styles.flap, { backgroundColor: color + '40' }]} />

            {/* Icon with Gradient */}
            <LinearGradient
                colors={[color, color + 'DD']}
                style={styles.iconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Ionicons name={icon} size={20} color="#FFF" />
            </LinearGradient>

            {/* Content */}
            <View style={styles.content}>
                <AppText style={[styles.name, { color: theme.colors.text }]} numberOfLines={2}>
                    {name}
                </AppText>

                {/* Remaining Amount */}
                <View style={styles.amountContainer}>
                    <AppText style={[styles.remainingAmount, { color: statusColor }]}>
                        {formatCurrency(Math.max(0, remaining))}
                    </AppText>
                    <AppText style={[styles.remainingLabel, { color: theme.colors.textMuted }]}>
                        left
                    </AppText>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={[styles.progressBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}>
                        <LinearGradient
                            colors={[statusColor, statusColor + 'DD']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` }]}
                        />
                    </View>
                    <View style={styles.progressLabels}>
                        <AppText style={[styles.progressText, { color: theme.colors.textMuted }]}>
                            {percentage}%
                        </AppText>
                        <AppText style={[styles.progressText, { color: theme.colors.textMuted }]}>
                            of {formatCurrency(allocated)}
                        </AppText>
                    </View>
                </View>
            </View>

            {/* Clean Status Indicator */}
            <View style={[styles.statusContainer, { backgroundColor: theme.colors.card }]}>
                <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
                <AppText style={[styles.statusLabel, { color: statusColor }]}>
                    {statusLabel}
                </AppText>
            </View>

            {/* Lock Overlay if Empty */}
            {isEmpty && (
                <View style={styles.lockOverlay}>
                    <LinearGradient
                        colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
                        style={styles.lockGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                    >
                        <Ionicons name="lock-closed" size={24} color="#FFF" />
                        <AppText style={styles.lockText}>LOCKED</AppText>
                    </LinearGradient>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        borderRadius: 20,
        padding: spacing.md,
        marginBottom: spacing.md,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        position: 'relative',
        overflow: 'hidden',
    },
    flap: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 12,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: spacing.md,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    content: {
        alignItems: 'center',
    },
    name: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: spacing.sm,
        textAlign: 'center',
        lineHeight: 20,
        minHeight: 40,
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: spacing.sm,
    },
    remainingAmount: {
        fontSize: 20,
        fontWeight: '800',
        marginRight: 4,
    },
    remainingLabel: {
        fontSize: 12,
        fontWeight: '500',
        opacity: 0.8,
    },
    progressContainer: {
        width: '100%',
    },
    progressBg: {
        width: '100%',
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 4,
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressText: {
        fontSize: 11,
        fontWeight: '600',
    },
    statusContainer: {
        position: 'absolute',
        top: spacing.sm,
        right: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    statusIndicator: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusLabel: {
        fontSize: 9,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    lockOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    lockGradient: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    lockText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});

export default EnvelopeCard;