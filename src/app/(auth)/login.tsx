import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../store/useUserStore';

export default function Login() {
    const router = useRouter();
    const setUser = useUserStore(s => s.setUser);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) return;
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
            await AsyncStorage.setItem('isLoggedIn', 'true');
            setUser({
                uid: 'beta-user-' + Date.now(),
                email: email.trim(),
                displayName: 'Pioneiro KiraWave'
            });
            router.replace('/');
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={s.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <LinearGradient
                colors={['#020617', '#0F172A', '#020617']}
                style={StyleSheet.absoluteFill}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView 
                    contentContainerStyle={s.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Beta Badge */}
                    <View style={s.betaBadge}>
                        <Ionicons name="sparkles" size={14} color="#eab308" />
                        <Text style={s.betaBadgeText}>ACESSO BETA ABERTO</Text>
                    </View>

                    {/* Logo Area */}
                    <View style={s.logoArea}>
                        <View style={s.logoCircle}>
                            <LinearGradient
                                colors={['#7C3AED', '#22D3EE']}
                                style={s.logoGradient}
                            >
                                <Ionicons name="pulse" size={38} color="white" />
                            </LinearGradient>
                        </View>
                        <Text style={s.logoText}>KiraWave</Text>
                        <Text style={s.logoSub}>Seu santuário de foco profundo.</Text>
                    </View>

                    {/* Form Card */}
                    <View style={s.card}>
                        <Text style={s.cardTitle}>Entrar na Experiência</Text>
                        
                        <View style={s.inputWrapper}>
                            <Text style={s.label}>E-MAIL</Text>
                            <TextInput
                                style={[s.input, focusedField === 'email' && s.inputFocused]}
                                placeholder="exemplo@kirawave.com"
                                placeholderTextColor="rgba(255,255,255,0.2)"
                                value={email}
                                onChangeText={setEmail}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={s.inputWrapper}>
                            <Text style={s.label}>SENHA</Text>
                            <TextInput
                                style={[s.input, focusedField === 'password' && s.inputFocused]}
                                placeholder="••••••••"
                                placeholderTextColor="rgba(255,255,255,0.2)"
                                value={password}
                                onChangeText={setPassword}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={loading || !email || !password}
                            style={[s.loginBtn, (!email || !password) && { opacity: 0.5 }]}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#7C3AED', '#22D3EE']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={s.loginBtnGradient}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={s.loginBtnText}>Desbloquear Acesso</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Note */}
                        <View style={s.noteArea}>
                            <Ionicons name="information-circle" size={16} color="#94A3B8" />
                            <Text style={s.noteText}>
                                Qualquer email e senha serão aceitos no momento.
                            </Text>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={s.footer}>
                        <Text style={s.footerText}>Ainda não é um pioneiro?</Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                            <Text style={s.footerLink}>Crie sua conta</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#020617' },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 30, paddingTop: 60, paddingBottom: 40 },
    
    betaBadge: {
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(234, 179, 8, 0.3)',
        marginBottom: 30,
    },
    betaBadgeText: { color: '#eab308', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },

    logoArea: { alignItems: 'center', marginBottom: 40 },
    logoCircle: { width: 72, height: 72, borderRadius: 36, padding: 3, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 15 },
    logoGradient: { flex: 1, borderRadius: 33, alignItems: 'center', justifyContent: 'center' },
    logoText: { color: 'white', fontSize: 38, fontWeight: '900', letterSpacing: -1.5 },
    logoSub: { color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 4 },

    card: {
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        borderRadius: 32,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    cardTitle: { color: 'white', fontSize: 18, fontWeight: '700', marginBottom: 25, textAlign: 'center', opacity: 0.9 },
    
    inputWrapper: { marginBottom: 16 },
    label: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
    input: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 14,
        padding: 16,
        color: 'white',
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    inputFocused: { borderColor: '#22D3EE', backgroundColor: 'rgba(34, 211, 238, 0.05)' },

    loginBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 10, height: 56 },
    loginBtnGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    loginBtnText: { color: 'white', fontWeight: '800', fontSize: 16 },

    noteArea: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 25, padding: 15, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16 },
    noteText: { color: '#94A3B8', fontSize: 12, flex: 1 },

    footer: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 30 },
    footerText: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
    footerLink: { color: '#22D3EE', fontSize: 13, fontWeight: '700' },
});