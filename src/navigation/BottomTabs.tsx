import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/Home/HomeScreen";
import BudgetScreen from "../screens/Budget/BudgetScreen";
import EMITrackerScreen from "../screens/EMI/EMITrackerScreen";
import GoalsScreen from "../screens/Goals/GoalsScreen";
import AllTransactionsScreen from "../screens/Expenses/AllTransactionsScreen";
import { RootTabParamList } from "../types";
import { useTheme } from "../theme/ThemeProvider";
import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function BottomTabs() {
    const { theme, isDark } = useTheme();

    return (
        <Tab.Navigator
            id="BottomTabs"
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    elevation: 0,
                    backgroundColor: isDark ? 'rgba(11, 18, 33, 0.85)' : 'rgba(255, 255, 255, 0.85)',
                    borderTopWidth: 0,
                    height: Platform.OS === 'ios' ? 85 : 70,
                },
                tabBarBackground: () => (
                    Platform.OS === 'ios' ?
                        <BlurView tint={isDark ? "dark" : "light"} intensity={80} style={StyleSheet.absoluteFill} /> :
                        null
                ),
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textMuted,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'help-circle-outline';

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Expenses') {
                        iconName = focused ? 'wallet' : 'wallet-outline';
                    } else if (route.name === 'EMI') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === 'Goals') {
                        iconName = focused ? 'trophy' : 'trophy-outline';
                    } else if (route.name === 'Budget') {
                        iconName = focused ? 'pie-chart' : 'pie-chart-outline';
                    }

                    return (
                        <View style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            top: Platform.OS === 'ios' ? 10 : 0
                        }}>
                            <View style={{
                                width: focused ? 40 : 24,
                                height: focused ? 40 : 24,
                                borderRadius: 12,
                                backgroundColor: focused ? (isDark ? 'rgba(212, 175, 55, 0.15)' : 'rgba(199, 160, 8, 0.1)') : 'transparent',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Ionicons name={iconName} size={focused ? 20 : 22} color={color} />
                            </View>
                            {focused && (
                                <View style={{
                                    width: 4,
                                    height: 4,
                                    borderRadius: 2,
                                    backgroundColor: theme.colors.primary,
                                    marginTop: 4
                                }} />
                            )}
                        </View>
                    );
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Expenses" component={AllTransactionsScreen} />
            <Tab.Screen name="Budget" component={BudgetScreen} />
            <Tab.Screen name="EMI" component={EMITrackerScreen} />
            <Tab.Screen name="Goals" component={GoalsScreen} />
        </Tab.Navigator>
    );
}
