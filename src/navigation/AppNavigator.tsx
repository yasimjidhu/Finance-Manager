import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";

import DrawerNavigator from "./DrawerNavigator";
import AuthScreen from "../screens/Auth/AuthScreen";
import OnboardingScreen from "../screens/Onboarding/OnboardingScreen";
import FestivalPlannerScreen from "../screens/Festival/FestivalPlannerScreen";
import ReceiptScannerScreen from "../screens/ReceiptScanner/ReceiptScannerScreen";
import AllTransactionsScreen from '../screens/Expenses/AllTransactionsScreen';
import AddExpenseScreen from '../screens/Expenses/AddExpenseScreen';
import SendMoneyScreen from '../screens/Expenses/SendMoneyScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Check for initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // 2. Listen for auth changes (login, logout, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A1128' }}>
                <ActivityIndicator size="large" color="#FCA311" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                id="RootStack"
                screenOptions={{ headerShown: false }}
            >
                {session ? (
                    // Authenticated Stack
                    <>
                        <Stack.Screen name="Main" component={DrawerNavigator} />
                        <Stack.Screen name="FestivalPlanner" component={FestivalPlannerScreen} />
                        <Stack.Screen name="ReceiptScanner" component={ReceiptScannerScreen} />
                        <Stack.Screen name="AllTransactions" component={AllTransactionsScreen} />
                        <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
                        <Stack.Screen name="SendMoney" component={SendMoneyScreen} />
                    </>
                ) : (
                    // Non-Authenticated Stack
                    <>
                        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                        <Stack.Screen name="Auth" component={AuthScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
