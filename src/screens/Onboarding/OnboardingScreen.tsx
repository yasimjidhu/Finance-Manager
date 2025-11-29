import React, { useState, useRef } from 'react';
import { View, StyleSheet, FlatList, Dimensions, Image, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../../components/common/AppText';
import AppButton from '../../components/common/AppButton';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing } from '../../theme/spacing';

const { width } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: 'Welcome to Finance Tracker!',
        description: 'Your intelligent companion for mastering personal finance. Take control of your money, track expenses, and reach your savings goals with ease.',
        image: require('../../../assets/onboarding.png'),
    },
    {
        id: '2',
        title: 'Track Your Expenses',
        description: 'Keep track of every penny you spend and understand your spending habits with detailed analytics.',
        image: require('../../../assets/expense-tracker.jpg'),
    },
    {
        id: '3',
        title: 'Achieve Your Goals',
        description: 'Set financial goals, track your progress, and celebrate your achievements along the way.',
        image: require('../../../assets/goals-tracker.jpg'),
    },
];

export default function OnboardingScreen() {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef<FlatList>(null);

    const viewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems && viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            // Navigate to Auth
            navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' as never }],
            });
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={{ flex: 3 }}>
                <FlatList
                    data={SLIDES}
                    renderItem={({ item }) => (
                        <View style={[styles.slide, { width }]}>
                            <View style={[styles.imageContainer, { borderColor: theme.colors.primary }]}>
                                <Image source={item.image} style={styles.image} resizeMode="contain" />
                            </View>
                            <View style={styles.textContainer}>
                                <AppText style={[styles.title, { color: theme.colors.text }]}>{item.title}</AppText>
                                <AppText style={[styles.description, { color: theme.colors.textMuted }]}>
                                    {item.description}
                                </AppText>
                            </View>
                        </View>
                    )}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    bounces={false}
                    keyExtractor={(item) => item.id}
                    onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                        useNativeDriver: false,
                    })}
                    scrollEventThrottle={32}
                    onViewableItemsChanged={viewableItemsChanged}
                    viewabilityConfig={viewConfig}
                    ref={slidesRef}
                />
            </View>

            <View style={styles.footer}>
                {/* Paginator */}
                <View style={styles.paginator}>
                    {SLIDES.map((_, i) => {
                        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [10, 20, 10],
                            extrapolate: 'clamp',
                        });
                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: 'clamp',
                        });

                        return (
                            <Animated.View
                                key={i.toString()}
                                style={[
                                    styles.dot,
                                    { width: dotWidth, opacity, backgroundColor: theme.colors.primary },
                                ]}
                            />
                        );
                    })}
                </View>

                <AppButton
                    title={currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
                    onPress={handleNext}
                    style={styles.button}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    slide: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
    },
    imageContainer: {
        width: width * 0.8,
        height: width * 0.6,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xl,
        borderWidth: 2,
        borderRadius: spacing.md,
        padding: spacing.md,
        borderColor: '#E0E0E0', // Fallback, overridden by theme
    },
    image: {
        width: '100%',
        height: '100%',
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: spacing.md,
        lineHeight: 24,
    },
    footer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
        width: '100%',
    },
    paginator: {
        flexDirection: 'row',
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        height: 10,
        borderRadius: 5,
        marginHorizontal: 8,
    },
    button: {
        width: '100%',
    },
});
