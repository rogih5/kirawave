import { Stack } from 'expo-router';

export default function Layout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: '#0A0F1C' },
                headerTintColor: '#F1F5F9',
                headerTitleStyle: { fontWeight: '600' },
                contentStyle: { backgroundColor: '#0A0F1C' },
                headerShadowVisible: false,
            }}
        >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="about" options={{ title: 'Sobre o Projeto' }} />
        </Stack>
    );
}
