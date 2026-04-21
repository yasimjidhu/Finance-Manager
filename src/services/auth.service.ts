import { supabase } from '../lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as QueryParams from 'expo-auth-session/build/QueryParams';

WebBrowser.maybeCompleteAuthSession(); // Required for web

export const AuthService = {
    async signUp(email: string, password: string, fullName: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });
        return { data, error };
    },

    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    },

    async signInWithGoogle() {
        try {
            // 1. Create a redirect URL using expo-linking
            // This handles Expo Go (exp://) and standalone (financetracker://) automatically
            const redirectUrl = Linking.createURL('google-auth');

            console.log('------------------------------------------------');
            console.log('Generated Redirect URL:', redirectUrl);
            console.log('PLEASE ENSURE THIS EXACT URL IS IN SUPABASE!');
            console.log('------------------------------------------------'); 

            // 2. Start the OAuth flow with Supabase
            // We use skipBrowserRedirect: true to get the URL instead of auto-redirecting
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: true,
                },
            });

            if (error) throw error;
            if (!data?.url) throw new Error('No auth URL returned');

            console.log('Supabase Auth URL:', data.url); // <--- CHECK THIS LOG

            // 3. Open the browser for the user to sign in
            const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

            // 4. Handle the result
            if (result.type === 'success' && result.url) {
                // Extract the access_token and refresh_token from the URL
                // Supabase returns them in the hash fragment: #access_token=...&refresh_token=...
                const { params, errorCode } = QueryParams.getQueryParams(result.url);

                if (errorCode) throw new Error(errorCode);

                const { access_token, refresh_token } = params;

                if (!access_token) throw new Error('No access token found');

                // 5. Set the session in Supabase
                const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                    access_token,
                    refresh_token,
                });

                if (sessionError) throw sessionError;

                return { data: sessionData, error: null };
            } else {
                return { error: { message: 'Sign in cancelled' } };
            }

        } catch (error: any) {
            console.error('Google Sign-In Error:', error);
            return { error };
        }
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        return { error };
    },

    async getCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },
};
