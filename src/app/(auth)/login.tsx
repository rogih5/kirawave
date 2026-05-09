// src/app/(auth)/login.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);

        await new Promise(resolve => setTimeout(resolve, 800));

        await AsyncStorage.setItem('isLoggedIn', 'true');

        // Redireciona para a tela principal (sem (tabs))
        router.replace('/index');

        setLoading(false);
    };
    return (
        <View style={{ flex: 1 }}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <LinearGradient
                colors={['#0a0a0a', '#1a0033', '#2a0055']}
                style={{ flex: 1 }}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 32 }}>
                        {/* Logo */}
                        <View style={{ alignItems: 'center', marginBottom: 48 }}>
                            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: 24, borderRadius: 24, marginBottom: 24 }}>
                                <Ionicons name="pulse" size={72} color="#a855f7" />
                            </View>

                            <Text style={{ fontSize: 48, fontWeight: 'bold', color: 'white', letterSpacing: -2 }}>
                                KiraWave
                            </Text>
                            <Text style={{ color: '#d8b4fe', fontSize: 18, marginTop: 4 }}>frequência para sua mente</Text>
                        </View>

                        {/* Card */}
                        <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: 32, borderRadius: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
                            <Text style={{ color: 'white', fontSize: 24, fontWeight: '600', marginBottom: 32, textAlign: 'center' }}>
                                Entre para começar
                            </Text>

                            <TextInput
                                style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 16, color: 'white', fontSize: 16, marginBottom: 16 }}
                                placeholder="Seu email"
                                placeholderTextColor="#aaaaaa"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            <TextInput
                                style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 16, color: 'white', fontSize: 16, marginBottom: 32 }}
                                placeholder="Senha"
                                placeholderTextColor="#aaaaaa"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />

                            <TouchableOpacity
                                onPress={handleLogin}
                                disabled={loading}
                                style={{ backgroundColor: '#9333ea', paddingVertical: 16, borderRadius: 16 }}
                                activeOpacity={0.7}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 18 }}>
                                        Entrar no KiraWave
                                    </Text>
                                )}
                            </TouchableOpacity>

                            {/* Aviso de Teste */}
                            <View style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', borderWidth: 1, borderColor: 'rgba(234, 179, 8, 0.3)', padding: 16, borderRadius: 16, marginTop: 24 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                    <Ionicons name="sparkles" size={20} color="#eab308" />
                                    <Text style={{ color: '#eab308', fontWeight: '500', marginLeft: 8 }}>Modo de Teste</Text>
                                </View>
                                <Text style={{ color: '#fde047', fontSize: 14 }}>
                                    Estamos testando um novo sistema de autenticação.
                                    Qualquer email e senha que você digitar irá funcionar.
                                </Text>
                            </View>
                        </View>

                        <Text style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', marginTop: 40, fontSize: 14 }}>
                            Versão Alpha • Teste Interno
                        </Text>
                    </View>
                </KeyboardAvoidingView>
            </LinearGradient>
        </View>
    );
}