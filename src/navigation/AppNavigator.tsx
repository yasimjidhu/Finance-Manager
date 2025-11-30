import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DrawerNavigator from "./DrawerNavigator";
import AuthScreen from "../screens/Auth/AuthScreen";
import OnboardingScreen from "../screens/Onboarding/OnboardingScreen";
import FestivalPlannerScreen from "../screens/Festival/FestivalPlannerScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator id="" screenOptions={{ headerShown: false }} initialRouteName="Onboarding">
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="Auth" component={AuthScreen} />
                <Stack.Screen name="Main" component={DrawerNavigator} />
                <Stack.Screen name="FestivalPlanner" component={FestivalPlannerScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
