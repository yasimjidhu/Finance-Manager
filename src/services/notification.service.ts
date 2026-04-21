import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export const NotificationService = {
    registerForPushNotificationsAsync: async () => {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        // Check if running in Expo Go
        // Note: Local notifications still work in Expo Go, but push tokens might fail or warn.
        // We will try to get permissions but handle the error gracefully.

        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!');
                return false;
            }
            // We don't strictly need the token for local notifications, so we can return true here
            // even if getExpoPushTokenAsync fails (which it does in Expo Go for remote push)
            return true;
        } catch (error) {
            console.log('Error requesting notification permissions:', error);
            return false;
        }
    },

    getSmartMessage: (title: string, amount: string | number, type: 'reminder' | 'emi' | 'goal' = 'reminder') => {
        const messages = {
            reminder: [
                `Your ${title} is sneaking up on you 👀`,
                `Don't let ${title} catch you off guard! 🛡️`,
                `Hey! Just a heads up about ${title} 👋`,
                `Time to feed the ${title} monster 👾`,
                `Keep your streak alive! Pay ${title} on time 🚀`
            ],
            emi: [
                `Your EMI for ${title} is knocking 🚪`,
                `The bank remembers... ${title} is due 🏦`,
                `Be a hero, pay your ${title} EMI on time 🦸`,
                `Future you will thank you for paying ${title} today 😌`
            ],
            goal: [
                `Eye on the prize! 🎯 ${title} needs some love.`,
                `One step closer to ${title} 🪜`,
                `Don't give up on ${title}! You got this 💪`,
                `Feed your dream: ${title} 🌈`
            ]
        };

        const category = messages[type] || messages.reminder;
        const randomMsg = category[Math.floor(Math.random() * category.length)];
        return `${randomMsg} - Due: ${amount}`;
    },

    scheduleNotification: async (title: string, body: string, date: Date, id: string | number) => {
        const triggerDate = new Date(date);
        triggerDate.setHours(9, 0, 0, 0); // Default: 9 AM

        const now = new Date();

        // If the due date is today and 9 AM has passed, schedule for 5 seconds from now
        // so the user gets the notification immediately.
        if (triggerDate.toDateString() === now.toDateString() && now.getHours() >= 9) {
            triggerDate.setTime(now.getTime() + 5000); // 5 seconds from now
        }
        // If date is in the past (yesterday or before), don't schedule
        else if (triggerDate.getTime() < now.getTime()) {
            return;
        }

        await Notifications.scheduleNotificationAsync({
            content: {
                title: title,
                body: body,
                sound: true,
                data: { id },
            },
            trigger: triggerDate,
        });
    },

    cancelNotification: async (identifier: string) => {
        await Notifications.cancelScheduledNotificationAsync(identifier);
    },

    cancelNotificationByDataId: async (id: string | number) => {
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        for (const notification of scheduled) {
            if (notification.content.data?.id === id) {
                await Notifications.cancelScheduledNotificationAsync(notification.identifier);
            }
        }
    },

    cancelAllNotifications: async () => {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }
};
