import { Stack } from 'expo-router';

export default function Layout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: '#0d0608' },
                headerTintColor: '#f5e6e8',
                headerTitleStyle: { fontWeight: '600' },
                contentStyle: { backgroundColor: '#0d0608' },
                headerShadowVisible: false,
            }}
        >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="about" options={{ title: 'Sobre o Projeto' }} />
        </Stack>
    );
}
