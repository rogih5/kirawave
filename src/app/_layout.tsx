import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { ThemeProvider } from '../themes/ThemeProvider';
import { useUserStore } from '../store/useUserStore';

function useAuthGuard() {
    const { uid, onboardingDone } = useUserStore();
    const segments = useSegments();
    const router = useRouter();
    const navigationState = useRootNavigationState();

    useEffect(() => {
        // Se o roteador ainda não carregou as rotas, esperamos
        if (!navigationState?.key) return;

        const inAuthGroup = segments.includes('(auth)');
        const inOnboarding = segments.includes('onboarding');

        console.log('[AuthGuard] Check:', { uid, inAuthGroup, segments });

        if (!uid) {
            if (!inAuthGroup) router.replace('/login');
        } else if (!onboardingDone) {
            if (!inOnboarding) router.replace('/onboarding');
        } else {
            if (inAuthGroup || inOnboarding) router.replace('/');
        }
    }, [uid, onboardingDone, segments, navigationState?.key]);

    return { loading: false }; // Não trava mais na tela de loading
}

export default function RootLayout() {
    const { loading } = useAuthGuard();

    // Mantemos o ThemeProvider e o Stack sempre visíveis
    return (
        <ThemeProvider>
            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: '#0A0F1C' },
                    headerTintColor: '#F1F5F9',
                    headerTitleStyle: { fontWeight: '600' },
                    contentStyle: { backgroundColor: '#0A0F1C' },
                    headerShadowVisible: false,
                }}
            >
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="about" options={{ title: 'Sobre o Projeto' }} />
            </Stack>
        </ThemeProvider>
    );
}
