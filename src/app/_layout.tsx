import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator, StatusBar, Text } from 'react-native';
import { ThemeProvider } from '../themes/ThemeProvider';
import { useUserStore } from '../store/useUserStore';

export default function RootLayout() {
    const { uid, setUser } = useUserStore();
    const [isChecking, setIsChecking] = useState(true);
    const segments = useSegments();
    const router = useRouter();

    // 1. Verifica persistência ao abrir
    useEffect(() => {
        async function initAuth() {
            try {
                const logged = await AsyncStorage.getItem('isLoggedIn');
                console.log('[AUTH] Persistência encontrada:', logged);
                if (logged === 'true' && !uid) {
                    setUser({ uid: 'stored-user', email: 'user@test.com', displayName: 'Membro' });
                }
            } catch (e) {
                console.error('[AUTH] Erro ao ler storage', e);
            } finally {
                setIsChecking(false);
            }
        }
        initAuth();
    }, []);

    // 2. Gerencia Navegação (Guarda de Rota)
    useEffect(() => {
        if (isChecking) return;
        if (!segments) return;

        const isLoggedIn = !!uid;
        const inAuthGroup = segments[0] === '(auth)';
        
        console.log('[AUTH] Estado:', { isLoggedIn, inAuthGroup, segment0: segments[0] });

        if (!isLoggedIn && !inAuthGroup) {
            console.log('[AUTH] Redirecionando para LOGIN');
            router.replace('/(auth)/login');
        } else if (isLoggedIn && inAuthGroup) {
            console.log('[AUTH] Redirecionando para HOME');
            router.replace('/');
        }
    }, [uid, isChecking, segments]);

    if (isChecking) {
        return (
            <View style={{ flex: 1, backgroundColor: '#0A0F1C', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#a855f7" />
                <Text style={{ color: 'white', marginTop: 10 }}>Carregando KiraWave...</Text>
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
