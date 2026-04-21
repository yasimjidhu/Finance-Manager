import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { View, Text, Switch, StyleSheet, TouchableOpacity, Image } from 'react-native';
import BottomTabs from './BottomTabs';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import {
    BudgetingForecastingScreen,
} from '../screens/Dashboard/PlaceholderScreens';
import DueRemindersScreen from '../screens/DueReminders/DueRemindersScreen';

import AIAdvisorScreen from '../screens/AIAdvisor/AIAdvisorScreen';
import { useTheme } from '../theme/ThemeProvider';
import Ionicons from '@expo/vector-icons/Ionicons';
import FestivalPlannerScreen from '../screens/Festival/FestivalPlannerScreen';
import AccountScreen from '../screens/Account/AccountScreen';
import FinancialCalendarScreen from '../screens/Calendar/FinancialCalendarScreen';
import CashEnvelopeScreen from '../screens/CashEnvelope/CashEnvelopeScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import KuriScreen from '../screens/Kuri/KuriScreen';
import { usePaydayCheck } from '../hooks/usePaydayCheck';
import { LinearGradient } from 'expo-linear-gradient';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props: any) => {
    const { theme, toggleTheme, isDark } = useTheme();

    return (
        <DrawerContentScrollView
            {...props}
            contentContainerStyle={{ flex: 1, padding: 0 }}
            style={{ backgroundColor: theme.colors.background }}
        >
            <LinearGradient
                colors={isDark ? ['#0B1221', '#040911'] : ['#F8FAFC', '#F1F5F9']}
                style={{ flex: 1 }}
            >
                {/* User Profile Section in Drawer */}
                <View style={[styles.profileHeader, { borderBottomColor: theme.colors.border }]}>
                    <View style={styles.profileImageContainer}>
                        <Image
                            source={{ uri: 'https://ui-avatars.com/api/?name=Dirsh&background=0A1128&color=fff' }}
                            style={styles.profileImage}
                        />
                    </View>
                    <View>
                        <Text style={[styles.profileName, { color: theme.colors.text }]}>Dirsh</Text>
                        <Text style={[styles.profileEmail, { color: theme.colors.textSecondary }]}>Premium Member</Text>
                    </View>
                </View>

                <View style={{ flex: 1, paddingVertical: 10 }}>
                    <DrawerItemList {...props} />
                </View>

                <View style={[styles.preferenceContainer, { borderTopColor: theme.colors.border }]}>
                    <View style={styles.preference}>
                        <View style={styles.preferenceLabel}>
                            <Ionicons
                                name={isDark ? "moon" : "sunny"}
                                size={22}
                                color={theme.colors.text}
                                style={{ marginRight: 12 }}
                            />
                            <Text style={{ color: theme.colors.text, fontSize: 15, fontFamily: 'Poppins_500Medium' }}>
                                {isDark ? "Dark Mode" : "Light Mode"}
                            </Text>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: "#CBD5E1", true: theme.colors.primary }}
                            thumbColor={'#FFF'}
                            ios_backgroundColor="#CBD5E1"
                        />
                    </View>
                    <Text style={[styles.versionText, { color: theme.colors.textMuted }]}>v1.0.0 • Premium</Text>
                </View>
            </LinearGradient>
        </DrawerContentScrollView>
    );
};

export default function DrawerNavigator() {
    usePaydayCheck();
    const { theme, isDark } = useTheme();

    return (
        <Drawer.Navigator
            id="Drawer"
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                drawerActiveTintColor: isDark ? '#FFF' : theme.colors.primary,
                drawerActiveBackgroundColor: isDark ? theme.colors.primary : theme.colors.primary + '15',
                drawerInactiveTintColor: theme.colors.textSecondary,
                drawerStyle: {
                    width: 280,
                    backgroundColor: theme.colors.background,
                },
                drawerLabelStyle: {
                    fontFamily: 'Poppins_500Medium',
                    fontSize: 14,
                    marginLeft: -10,
                },
                drawerItemStyle: {
                    borderRadius: 12,
                    marginHorizontal: 12,
                    marginVertical: 4,
                }
            }}
        >
            <Drawer.Screen
                name="Home"
                component={BottomTabs}
                options={{
                    drawerLabel: 'Home',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={22} color={color} />
                    )
                }}
            />
            <Drawer.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    drawerLabel: 'Dashboard',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="grid-outline" size={22} color={color} />
                    )
                }}
            />
            <Drawer.Screen
                name="BudgetingForecasting"
                component={BudgetingForecastingScreen}
                options={{
                    drawerLabel: 'Budgeting & Forecast',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="trending-up-outline" size={22} color={color} />
                    )
                }}
            />

            <Drawer.Screen
                name="DueReminders"
                component={DueRemindersScreen}
                options={{
                    drawerLabel: 'Due Reminders',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="alarm-outline" size={22} color={color} />
                    )
                }}
            />
            <Drawer.Screen
                name="FestivalPlanner"
                component={FestivalPlannerScreen}
                options={{
                    drawerLabel: 'Festival Planner',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="sparkles-outline" size={22} color={color} />
                    )
                }}
            />
            <Drawer.Screen
                name="FinancialCalendar"
                component={FinancialCalendarScreen}
                options={{
                    drawerLabel: 'Calendar',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="calendar-outline" size={22} color={color} />
                    )
                }}
            />
            <Drawer.Screen
                name="CashEnvelope"
                component={CashEnvelopeScreen}
                options={{
                    drawerLabel: 'Cash Envelopes',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="wallet-outline" size={22} color={color} />
                    )
                }}
            />
            <Drawer.Screen
                name="AIAdvisor"
                component={AIAdvisorScreen}
                options={{
                    drawerLabel: 'AI Advisor',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="chatbubbles-outline" size={22} color={color} />
                    )
                }}
            />
            <Drawer.Screen
                name="Kuri"
                component={KuriScreen}
                options={{
                    drawerLabel: 'Chit Funds (Kuri)',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="layers-outline" size={22} color={color} />
                    )
                }}
            />
            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 8, marginHorizontal: 16 }} />
            <Drawer.Screen
                name="Account"
                component={AccountScreen}
                options={{
                    drawerLabel: 'My Account',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="person-circle-outline" size={22} color={color} />
                    )
                }}
            />
            <Drawer.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    drawerLabel: 'Settings',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="settings-outline" size={22} color={color} />
                    )
                }}
            />
        </Drawer.Navigator>
    );
}

const styles = StyleSheet.create({
    profileHeader: {
        padding: 24,
        paddingTop: 60,
        marginBottom: 8,
        borderBottomWidth: 1,
    },
    profileImageContainer: {
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    profileName: {
        fontSize: 18,
        fontFamily: 'Poppins_700Bold',
        letterSpacing: -0.5,
    },
    profileEmail: {
        fontSize: 13,
        fontFamily: 'Poppins_500Medium',
        opacity: 0.7,
    },
    preferenceContainer: {
        padding: 24,
        borderTopWidth: 1,
    },
    preference: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    preferenceLabel: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    versionText: {
        fontSize: 11,
        fontFamily: 'Poppins_400Regular',
        textAlign: 'center',
        opacity: 0.5,
    },
});
