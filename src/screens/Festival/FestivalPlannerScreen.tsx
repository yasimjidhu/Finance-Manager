import React, { useState, useEffect } from 'react';
import {
    View, StyleSheet, TouchableOpacity, ScrollView,
    TextInput, Dimensions, Platform, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    FadeInDown,
    FadeInRight,
    FadeInUp,
    Layout,
    SlideInRight,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    runOnJS
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import AppText from '../../components/common/AppText';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';
import Ionicons from '@expo/vector-icons/Ionicons';
import ActionSheet from '../../components/common/ActionSheet';
import { formatCurrency } from '../../utils/helpers';
import { FestivalService, Festival } from '../../services/festival.service';
import CustomAlert from '../../components/common/CustomAlert';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

export default function FestivalPlannerScreen({ navigation }: any) {
    const { theme, isDark } = useTheme();
    const [isModalVisible, setModalVisible] = useState(false);
    const [festivals, setFestivals] = useState<Festival[]>([]);
    const [newFestival, setNewFestival] = useState({ name: '', budget: '' });
    const [loading, setLoading] = useState(false);
    const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);

    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info' as 'info' | 'success' | 'error' | 'warning',
        showCancel: false,
        onConfirm: () => { },
    });

    const showAlert = (
        title: string,
        message: string,
        type: 'info' | 'success' | 'error' | 'warning' = 'info',
        showCancel = false,
        onConfirm?: () => void
    ) => {
        setAlertConfig({
            visible: true,
            title,
            message,
            type,
            showCancel,
            onConfirm: onConfirm || (() => { }),
        });
    };

    useEffect(() => {
        loadFestivals();
    }, []);

    const loadFestivals = async () => {
        setLoading(true);
        try {
            const data = await FestivalService.getAllFestivals();
            setFestivals(data || []);
        } catch {
            showAlert('Error', 'Failed to load festivals', 'error');
        } finally {
            setLoading(false);
        }
    };

    const totalBudget = festivals.reduce((s, f) => s + (f.budget || 0), 0);
    const totalSpent = festivals.reduce((s, f) => s + (f.spent || 0), 0);
    const totalRemaining = totalBudget - totalSpent;
    const progressPct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

    const upcomingFestivals = [...festivals]
        .filter(f => f.daysLeft > 0)
        .sort((a, b) => a.daysLeft - b.daysLeft)
        .slice(0, 3);

    const handleAddFestival = async () => {
        if (!newFestival.name || !newFestival.budget) {
            showAlert('Missing Fields', 'Please enter a name and budget amount.', 'error');
            return;
        }
        setLoading(true);
        try {
            await FestivalService.addFestival({
                name: newFestival.name,
                date: 'TBD',
                budget: parseInt(newFestival.budget),
                spent: 0,
                daysLeft: 365,
                image: null,
                color: theme.colors.primary,
            });
            await loadFestivals();
            setModalVisible(false);
            setNewFestival({ name: '', budget: '' });
            showAlert('Success!', 'Festival budget created successfully.', 'success');
        } catch {
            showAlert('Error', 'Failed to add festival.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFestival = async (id: string) => {
        showAlert(
            'Delete Festival',
            'This will permanently remove this festival budget.',
            'warning',
            true,
            async () => {
                setLoading(true);
                try {
                    await FestivalService.deleteFestival(id);
                    await loadFestivals();
                    showAlert('Deleted', 'Festival removed successfully.', 'success');
                } catch {
                    showAlert('Error', 'Failed to delete festival.', 'error');
                } finally {
                    setLoading(false);
                }
            }
        );
    };

    // Animated Header Component
    const AnimatedHeader = () => {
        const scrollY = useSharedValue(0);

        return (
            <Animated.View
                entering={FadeInDown.duration(600).springify()}
                style={[styles.header, {
                    backgroundColor: isDark ? 'rgba(11, 15, 25, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                    borderBottomColor: theme.colors.border
                }]}
            >
                <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />

                <View style={styles.headerContent}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={[styles.iconBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
                    >
                        <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
                    </TouchableOpacity>

                    <View style={styles.headerTextContainer}>
                        <AppText style={[styles.headerTitle, { color: theme.colors.text }]}>
                            Festival Planner
                        </AppText>
                        <AppText style={[styles.headerSub, { color: theme.colors.textSecondary }]}>
                            {festivals.length} active festivals
                        </AppText>
                    </View>

                    <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        );
    };

    // Summary Card Component
    const SummaryCard = () => {
        const scale = useSharedValue(1);

        const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }]
        }));

        return (
            <Animated.View
                entering={FadeInUp.duration(600).springify()}
                style={[styles.summaryWrapper, animatedStyle]}
            >
                <LinearGradient
                    colors={isDark ?
                        [theme.colors.surface, '#040911'] : // Use theme surface
                        ['#FFFFFF', '#F8F9FA']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.summaryCard, {
                        borderColor: theme.colors.border,
                        shadowColor: isDark ? '#000' : theme.colors.primary + '40'
                    }]}
                >
                    <View style={styles.summaryHeader}>
                        <View>
                            <AppText style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                                Total Budget
                            </AppText>
                            <AppText style={[styles.summaryAmount, { color: theme.colors.text }]}>
                                {formatCurrency(totalBudget)}
                            </AppText>
                        </View>

                        <View style={[styles.summaryIconContainer, {
                            backgroundColor: theme.colors.primary + '15'
                        }]}>
                            <Ionicons name="wallet-outline" size={24} color={theme.colors.primary} />
                        </View>
                    </View>

                    <View style={styles.progressSection}>
                        <View style={styles.progressHeader}>
                            <AppText style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
                                Budget Utilization
                            </AppText>
                            <AppText style={[styles.progressPercentage, { color: theme.colors.primary }]}>
                                {Math.round(progressPct)}%
                            </AppText>
                        </View>

                        <View style={[styles.progressTrack, { backgroundColor: theme.colors.border }]}>
                            <Animated.View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${progressPct}%`,
                                        backgroundColor: theme.colors.primary
                                    }
                                ]}
                            />
                        </View>
                    </View>

                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <View style={[styles.statIcon, { backgroundColor: theme.colors.success + '15' }]}>
                                <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                            </View>
                            <View>
                                <AppText style={[styles.statValue, { color: theme.colors.text }]}>
                                    {formatCurrency(totalSpent)}
                                </AppText>
                                <AppText style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                    Spent
                                </AppText>
                            </View>
                        </View>

                        <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />

                        <View style={styles.statItem}>
                            <View style={[styles.statIcon, { backgroundColor: theme.colors.warning + '15' }]}>
                                <Ionicons name="time" size={16} color={theme.colors.warning} />
                            </View>
                            <View>
                                <AppText style={[styles.statValue, { color: theme.colors.text }]}>
                                    {formatCurrency(totalRemaining)}
                                </AppText>
                                <AppText style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                                    Remaining
                                </AppText>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            </Animated.View>
        );
    };

    // Enhanced Festival Card with Gestures
    const FestivalCard = ({ item, index }: { item: Festival; index: number }) => {
        const translateX = useSharedValue(0);
        const opacity = useSharedValue(1);
        const scale = useSharedValue(1);

        const progress = Math.min(item.spent / item.budget, 1);
        const isOver = item.spent > item.budget;
        const pct = Math.round(progress * 100);

        const barColor = isOver
            ? theme.colors.danger
            : progress < 0.6
                ? theme.colors.success
                : theme.colors.warning;

        const gesture = Gesture.Pan()
            .onUpdate((event) => {
                if (event.translationX < 0) {
                    translateX.value = event.translationX;
                }
            })
            .onEnd((event) => {
                if (event.translationX < -50) {
                    translateX.value = withTiming(-100, { duration: 200 });
                    opacity.value = withTiming(0, { duration: 200 });
                    runOnJS(handleDeleteFestival)(item.id);
                } else {
                    translateX.value = withSpring(0);
                }
            });

        const animatedStyle = useAnimatedStyle(() => ({
            transform: [
                { translateX: translateX.value } as any,
                { scale: scale.value } as any
            ],
            opacity: opacity.value
        }));

        return (
            <GestureDetector gesture={gesture}>
                <Animated.View
                    entering={SlideInRight.delay(index * 100).springify()}
                    layout={Layout.springify()}
                    style={animatedStyle}
                >
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setSelectedFestival(item)}
                        onLongPress={() => handleDeleteFestival(item.id)}
                    >
                        <LinearGradient
                            colors={isDark ?
                                [theme.colors.card, theme.colors.background] : // Use card color
                                ['#FFFFFF', '#FAFAFA']
                            }
                            style={[styles.festivalCard, {
                                borderColor: theme.colors.border,
                                shadowColor: isDark ? '#000' : barColor + '30'
                            }]}
                        >
                            <View style={styles.cardHeader}>
                                <View style={styles.cardTitleContainer}>
                                    <View style={[styles.cardIcon, {
                                        backgroundColor: barColor + '20'
                                    }]}>
                                        <Ionicons
                                            name={isOver ? "alert-circle" : "sparkles"}
                                            size={18}
                                            color={barColor}
                                        />
                                    </View>
                                    <View>
                                        <AppText style={[styles.cardName, { color: theme.colors.text }]}>
                                            {item.name}
                                        </AppText>
                                        <AppText style={[styles.cardDate, { color: theme.colors.textSecondary }]}>
                                            {item.daysLeft} days to go
                                        </AppText>
                                    </View>
                                </View>

                                <View style={[styles.cardBadge, {
                                    backgroundColor: barColor + '15'
                                }]}>
                                    <AppText style={[styles.cardBadgeText, { color: barColor }]}>
                                        {pct}%
                                    </AppText>
                                </View>
                            </View>

                            <View style={styles.cardProgress}>
                                <View style={[styles.progressTrack, { backgroundColor: theme.colors.border }]}>
                                    <Animated.View
                                        style={[
                                            styles.progressFill,
                                            {
                                                width: `${pct}%`,
                                                backgroundColor: barColor
                                            }
                                        ]}
                                    />
                                </View>
                            </View>

                            <View style={styles.cardFooter}>
                                <View style={styles.cardStat}>
                                    <AppText style={[styles.cardStatLabel, { color: theme.colors.textSecondary }]}>
                                        Budget
                                    </AppText>
                                    <AppText style={[styles.cardStatValue, { color: theme.colors.text }]}>
                                        {formatCurrency(item.budget)}
                                    </AppText>
                                </View>

                                <View style={[styles.cardStatDivider, { backgroundColor: theme.colors.border }]} />

                                <View style={styles.cardStat}>
                                    <AppText style={[styles.cardStatLabel, { color: theme.colors.textSecondary }]}>
                                        Spent
                                    </AppText>
                                    <AppText style={[styles.cardStatValue, { color: barColor }]}>
                                        {formatCurrency(item.spent)}
                                    </AppText>
                                </View>

                                <View style={[styles.cardStatDivider, { backgroundColor: theme.colors.border }]} />

                                <View style={styles.cardStat}>
                                    <AppText style={[styles.cardStatLabel, { color: theme.colors.textSecondary }]}>
                                        Left
                                    </AppText>
                                    <AppText style={[styles.cardStatValue, {
                                        color: item.budget - item.spent >= 0 ? theme.colors.success : theme.colors.danger
                                    }]}>
                                        {formatCurrency(Math.abs(item.budget - item.spent))}
                                    </AppText>
                                </View>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </GestureDetector>
        );
    };

    // Upcoming Festival Carousel
    const UpcomingCarousel = () => {
        if (upcomingFestivals.length === 0) return null;

        return (
            <Animated.View
                entering={FadeInRight.delay(200).springify()}
                style={styles.carouselSection}
            >
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleContainer}>
                        <Ionicons name="calendar" size={20} color={theme.colors.primary} />
                        <AppText style={[styles.sectionTitle, { color: theme.colors.text }]}>
                            Upcoming Festivals
                        </AppText>
                    </View>
                    <TouchableOpacity>
                        <AppText style={[styles.sectionLink, { color: theme.colors.primary }]}>
                            View All
                        </AppText>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.carouselContent}
                >
                    {upcomingFestivals.map((festival, index) => (
                        <TouchableOpacity
                            key={festival.id}
                            activeOpacity={0.7}
                            onPress={() => setSelectedFestival(festival)}
                        >
                            <LinearGradient
                                colors={[festival.color || theme.colors.primary, (festival.color || theme.colors.primary) + 'CC']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.carouselCard}
                            >
                                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />

                                <View style={styles.carouselCardHeader}>
                                    <View style={styles.carouselIcon}>
                                        <Ionicons name="sparkles" size={20} color="#FFF" />
                                    </View>
                                    <View style={[styles.carouselDaysBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                        <AppText style={styles.carouselDaysText}>
                                            {festival.daysLeft}d
                                        </AppText>
                                    </View>
                                </View>

                                <AppText style={styles.carouselTitle} numberOfLines={1}>
                                    {festival.name}
                                </AppText>

                                <AppText style={styles.carouselDate}>
                                    {festival.date}
                                </AppText>

                                <View style={styles.carouselFooter}>
                                    <View>
                                        <AppText style={styles.carouselBudgetLabel}>Budget</AppText>
                                        <AppText style={styles.carouselBudget}>
                                            {formatCurrency(festival.budget)}
                                        </AppText>
                                    </View>
                                    <View style={[styles.carouselProgress, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                        <View style={[styles.carouselProgressFill, {
                                            width: `${(festival.spent / festival.budget) * 100}%`,
                                            backgroundColor: '#FFF'
                                        }]} />
                                    </View>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </Animated.View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <LinearGradient
                colors={isDark ? ['#040911', '#0B1221'] : ['#F8FAFC', '#F1F5F9']}
                style={StyleSheet.absoluteFillObject}
            />
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                showCancel={alertConfig.showCancel}
                onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
                onConfirm={alertConfig.onConfirm}
            />

            <AnimatedHeader />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                bounces={true}
            >
                <SummaryCard />
                <UpcomingCarousel />

                <Animated.View
                    entering={FadeInDown.delay(300).springify()}
                    style={styles.festivalsSection}
                >
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleContainer}>
                            <Ionicons name="list" size={20} color={theme.colors.primary} />
                            <AppText style={[styles.sectionTitle, { color: theme.colors.text }]}>
                                All Festivals
                            </AppText>
                        </View>
                        <AppText style={[styles.sectionHint, { color: theme.colors.textSecondary }]}>
                            Swipe left to delete
                        </AppText>
                    </View>

                    {festivals.length === 0 ? (
                        <Animated.View
                            entering={FadeInUp.springify()}
                            style={[styles.emptyState, {
                                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : theme.colors.surface,
                                borderColor: theme.colors.border
                            }]}
                        >
                            <View style={[styles.emptyIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                                <Ionicons name="calendar-outline" size={48} color={theme.colors.primary} />
                            </View>
                            <AppText style={[styles.emptyTitle, { color: theme.colors.text }]}>
                                No Festivals Yet
                            </AppText>
                            <AppText style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
                                Tap the + button to start planning your first festival budget
                            </AppText>
                            <TouchableOpacity
                                style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]}
                                onPress={() => setModalVisible(true)}
                                activeOpacity={0.8}
                            >
                                <AppText style={styles.emptyButtonText}>
                                    Create Festival
                                </AppText>
                                <Ionicons name="arrow-forward" size={18} color="#FFF" />
                            </TouchableOpacity>
                        </Animated.View>
                    ) : (
                        festivals.map((item, index) => (
                            <FestivalCard key={item.id} item={item} index={index} />
                        ))
                    )}
                </Animated.View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Add Festival Modal */}
            <ActionSheet
                visible={isModalVisible}
                onClose={() => setModalVisible(false)}
                title="Create New Festival"
                actionLabel={loading ? 'Creating...' : 'Create Festival'}
                onAction={handleAddFestival}
            >
                <View style={styles.modalContent}>
                    <View style={styles.inputGroup}>
                        <AppText style={[styles.inputLabel, { color: theme.colors.text }]}>
                            Festival Name
                        </AppText>
                        <View style={[styles.inputWrapper, {
                            backgroundColor: theme.colors.surface,
                            borderColor: theme.colors.border
                        }]}>
                            <Ionicons name="gift-outline" size={20} color={theme.colors.textSecondary} />
                            <TextInput
                                style={[styles.input, { color: theme.colors.text }]}
                                placeholder="e.g. Diwali, Christmas, Eid"
                                placeholderTextColor={theme.colors.textSecondary}
                                value={newFestival.name}
                                onChangeText={t => setNewFestival({ ...newFestival, name: t })}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <AppText style={[styles.inputLabel, { color: theme.colors.text }]}>
                            Budget Amount
                        </AppText>
                        <View style={[styles.inputWrapper, {
                            backgroundColor: theme.colors.surface,
                            borderColor: theme.colors.border
                        }]}>
                            <Ionicons name="cash-outline" size={20} color={theme.colors.textSecondary} />
                            <TextInput
                                style={[styles.input, { color: theme.colors.text }]}
                                placeholder="Enter amount"
                                placeholderTextColor={theme.colors.textSecondary}
                                keyboardType="numeric"
                                value={newFestival.budget}
                                onChangeText={t => setNewFestival({ ...newFestival, budget: t })}
                            />
                        </View>
                    </View>
                </View>
            </ActionSheet>

            {/* Festival Details Modal would go here */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight,
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTextContainer: {
        flex: 1,
        marginLeft: spacing.md,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: -0.5,
        fontFamily: 'Poppins_700Bold',
    },
    headerSub: {
        fontSize: 13,
        fontWeight: '400',
        marginTop: 2,
        fontFamily: 'Poppins_400Regular',
    },
    fab: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    scrollContent: {
        paddingTop: Platform.OS === 'ios' ? 120 : 100,
        paddingBottom: 20,
    },
    summaryWrapper: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.xl,
    },
    summaryCard: {
        borderRadius: 24,
        padding: spacing.lg,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    summaryLabel: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
        fontFamily: 'Poppins_500Medium',
    },
    summaryAmount: {
        fontSize: 36,
        fontWeight: '800',
        letterSpacing: -1,
        fontFamily: 'Poppins_700Bold',
    },
    summaryIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressSection: {
        marginBottom: spacing.lg,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    progressLabel: {
        fontSize: 13,
        fontWeight: '500',
        fontFamily: 'Poppins_500Medium',
    },
    progressPercentage: {
        fontSize: 15,
        fontWeight: '700',
        fontFamily: 'Poppins_700Bold',
    },
    progressTrack: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    statsGrid: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: spacing.md,
    },
    statItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    statIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '500',
        marginTop: 2,
        fontFamily: 'Poppins_500Medium',
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'Poppins_700Bold',
    },
    statDivider: {
        width: 1,
        height: 30,
        marginHorizontal: spacing.md,
    },
    carouselSection: {
        marginBottom: spacing.xl,
    },
    carouselContent: {
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
    },
    carouselCard: {
        width: CARD_WIDTH,
        height: 160,
        borderRadius: 20,
        padding: spacing.lg,
        overflow: 'hidden',
        justifyContent: 'space-between',
    },
    carouselCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    carouselIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    carouselDaysBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 12,
    },
    carouselDaysText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
        fontFamily: 'Poppins_500Medium',
    },
    carouselTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
        marginTop: spacing.sm,
        fontFamily: 'Poppins_700Bold',
    },
    carouselDate: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
        fontWeight: '500',
        fontFamily: 'Poppins_500Medium',
    },
    carouselFooter: {
        marginTop: 'auto',
    },
    carouselBudgetLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 11,
        fontWeight: '500',
        marginBottom: 2,
        fontFamily: 'Poppins_500Medium',
    },
    carouselBudget: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: spacing.sm,
        fontFamily: 'Poppins_700Bold',
    },
    carouselProgress: {
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    carouselProgressFill: {
        height: '100%',
        borderRadius: 2,
    },
    festivalsSection: {
        paddingHorizontal: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: -0.5,
        fontFamily: 'Poppins_700Bold',
    },
    sectionLink: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'Poppins_500Medium',
    },
    sectionHint: {
        fontSize: 12,
        fontWeight: '400',
        fontFamily: 'Poppins_400Regular',
    },
    festivalCard: {
        borderRadius: 20,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    cardTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        flex: 1,
    },
    cardIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
        fontFamily: 'Poppins_500Medium',
    },
    cardDate: {
        fontSize: 12,
        fontWeight: '400',
        fontFamily: 'Poppins_400Regular',
    },
    cardBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 12,
    },
    cardBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        fontFamily: 'Poppins_500Medium',
    },
    cardProgress: {
        marginBottom: spacing.md,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardStat: {
        flex: 1,
        alignItems: 'center',
    },
    cardStatLabel: {
        fontSize: 10,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
        fontFamily: 'Poppins_500Medium',
    },
    cardStatValue: {
        fontSize: 14,
        fontWeight: '700',
        fontFamily: 'Poppins_700Bold',
    },
    cardStatDivider: {
        width: 1,
        height: 20,
        marginHorizontal: spacing.sm,
    },
    emptyState: {
        alignItems: 'center',
        padding: spacing.xl,
        borderRadius: 24,
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: spacing.sm,
        fontFamily: 'Poppins_700Bold',
    },
    emptySubtitle: {
        fontSize: 14,
        fontWeight: '400',
        textAlign: 'center',
        marginBottom: spacing.lg,
        opacity: 0.7,
        fontFamily: 'Poppins_400Regular',
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: 30,
    },
    emptyButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Poppins_500Medium',
    },
    modalContent: {
        gap: spacing.lg,
    },
    inputGroup: {
        gap: spacing.sm,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
        fontFamily: 'Poppins_500Medium',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        borderWidth: 1.5,
        borderRadius: 16,
        paddingHorizontal: spacing.md,
        height: 52,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        height: '100%',
        fontFamily: 'Poppins_500Medium',
    },
});