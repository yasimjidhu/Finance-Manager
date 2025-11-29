import React from 'react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/Home/HomeScreen";
import BudgetScreen from "../screens/Budget/BudgetScreen";
import EMITrackerScreen from "../screens/EMI/EMITrackerScreen";
import GoalsScreen from "../screens/Goals/GoalsScreen";
import FestivalPlannerScreen from "../screens/Festival/FestivalPlannerScreen";
import KuriScreen from "../screens/Kuri/KuriScreen";
import { RootTabParamList } from "../types";
import { LightColors } from "../theme/colors";
import Ionicons from '@expo/vector-icons/Ionicons';

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function BottomTabs() {
    return (
        <Tab.Navigator id=''
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: LightColors.primary,
                tabBarInactiveTintColor: LightColors.textMuted,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'help-circle-outline';

                    if (route.name === 'Home') {
                        iconName = focused ? 'grid' : 'grid-outline'; // Changed icon to grid for dashboard
                    } else if (route.name === 'Kuri') {
                        iconName = focused ? 'wallet' : 'wallet-outline';
                    } else if (route.name === 'EMI') {
                        iconName = focused ? 'calculator' : 'calculator-outline';
                    } else if (route.name === 'Goals') {
                        iconName = focused ? 'flag' : 'flag-outline';
                    } else if (route.name === 'Budget') {
                        iconName = focused ? 'pie-chart' : 'pie-chart-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
            <Tab.Screen name="Kuri" component={KuriScreen} />
            <Tab.Screen name="EMI" component={EMITrackerScreen} />
            <Tab.Screen name="Goals" component={GoalsScreen} />
            <Tab.Screen
                name="Budget"
                component={BudgetScreen}
                options={{ title: 'Budget' }}
            />
        </Tab.Navigator>
    );
}
