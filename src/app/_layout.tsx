import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import { ThemeProvider } from '../themes/ThemeProvider';

export default function RootLayout() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const logged = await AsyncStorage.getItem('isLoggedIn');
                setIsLoggedIn(logged === 'true');
            } catch (e) {
                setIsLoggedIn(false);
            }
        };
        checkAuth();
    }, []);

    useEffect(() => {
        if (isLoggedIn === null) return;
        if (!segments) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!isLoggedIn && !inAuthGroup) {
            router.replace('/login');
        } else if (isLoggedIn && inAuthGroup) {
            router.replace('/');
        }
    }, [isLoggedIn, segments]);

    if (isLoggedIn === null) {
        return (
            <View style={{ flex: 1, backgroundColor: '#0A0F1C', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#a855f7" />
            </View>
        );
    }

    return (
        <ThemeProvider>
            <StatusBar barStyle="light-content" />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="index" options={{ headerShown: false }} />
            </Stack>
        </ThemeProvider>
    );
}
