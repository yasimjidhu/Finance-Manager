import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import BottomTabs from './BottomTabs';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import {
    BudgetingForecastingScreen,
} from '../screens/Dashboard/PlaceholderScreens';
import SplitMoneyScreen from '../screens/SplitMoney/SplitMoneyScreen';
import DueRemindersScreen from '../screens/DueReminders/DueRemindersScreen';
import UpiSpendScreen from '../screens/UpiSpend/UpiSpendScreen';
import AIAdvisorScreen from '../screens/AIAdvisor/AIAdvisorScreen';
import { useTheme } from '../theme/ThemeProvider';
import Ionicons from '@expo/vector-icons/Ionicons';
import FestivalPlannerScreen from '../screens/Festival/FestivalPlannerScreen';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props: any) => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme.mode === 'dark';

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <DrawerItemList {...props} />
            </View>

            <View style={[styles.preferenceContainer, { borderTopColor: theme.colors.border }]}>
                <View style={styles.preference}>
                    <View style={styles.preferenceLabel}>
                        <Ionicons
                            name={isDark ? "moon" : "sunny"}
                            size={24}
                            color={theme.colors.text}
                            style={{ marginRight: 12 }}
                        />
                        <Text style={{ color: theme.colors.text, fontSize: 16 }}>
                            {isDark ? "Dark Mode" : "Light Mode"}
                        </Text>
                    </View>
                    <Switch
                        value={isDark}
                        onValueChange={toggleTheme}
                        trackColor={{ false: "#767577", true: theme.colors.primary }}
                        thumbColor={theme.colors.card}
                    />
                </View>
            </View>
        </DrawerContentScrollView>
    );
};

export default function DrawerNavigator() {
    const { theme } = useTheme();

    return (
        <Drawer.Navigator
            id=''
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                drawerActiveTintColor: theme.colors.primary,
                drawerInactiveTintColor: theme.colors.text,
                drawerStyle: {
                    backgroundColor: theme.colors.background,
                },
                drawerLabelStyle: {
                    // marginLeft: -20, // Removed to fix spacing
                }
            }}
        >
            <Drawer.Screen
                name="Home"
                component={BottomTabs}
                options={{
                    drawerLabel: 'Home',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    )
                }}
            />
            <Drawer.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    drawerLabel: 'Dashboard',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="grid-outline" size={size} color={color} />
                    )
                }}
            />
            <Drawer.Screen
                name="BudgetingForecasting"
                component={BudgetingForecastingScreen}
                options={{
                    drawerLabel: 'Budgeting & Forecasting',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="trending-up-outline" size={size} color={color} />
                    )
                }}
            />
            <Drawer.Screen
                name="UpiSpend"
                component={UpiSpendScreen}
                options={{
                    drawerLabel: 'UPI Spend Money',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="qr-code-outline" size={size} color={color} />
                    )
                }}
            />
            <Drawer.Screen
                name="SplitMoney"
                component={SplitMoneyScreen}
                options={{
                    drawerLabel: 'Split Money',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="people-outline" size={size} color={color} />
                    )
                }}
            />
            <Drawer.Screen
                name="DueReminders"
                component={DueRemindersScreen}
                options={{
                    drawerLabel: 'Due Reminders',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="alarm-outline" size={size} color={color} />
                    )
                }}
            />
            <Drawer.Screen
                name="FestivalPlanner"
                component={FestivalPlannerScreen}
                options={{
                    drawerLabel: 'Festival Planner',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="sparkles-outline" size={size} color={color} />
                    )
                }}
            />
            <Drawer.Screen
                name="AIAdvisor"
                component={AIAdvisorScreen}
                options={{
                    drawerLabel: 'AI Financial Advisor',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="chatbubbles-outline" size={size} color={color} />
                    )
                }}
            />
        </Drawer.Navigator>
    );
}

const styles = StyleSheet.create({
    preferenceContainer: {
        padding: 20,
        borderTopWidth: 1,
    },
    preference: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    preferenceLabel: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
