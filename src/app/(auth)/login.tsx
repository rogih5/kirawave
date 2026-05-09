// src/app/(auth)/login.tsx
import { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../../../services/themes/tokens';
import { useUserStore } from '../../store/useUserStore';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const setUser = useUserStore(s => s.setUser);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            setError('Preencha e-mail e senha.');
            return;
        }
        setLoading(true);
        setError(null);

        // Simulação de login (Bypass Firebase)
        setTimeout(() => {
            setUser({
                uid: 'mock-user-123',
                email: email.trim(),
                displayName: email.split('@')[0],
            });
            setLoading(false);
        }, 1200);
    };

    return (
        <KeyboardAvoidingView
            style={s.root}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar style="light" />
            
            <LinearGradient
                colors={['#0F172A', '#020617']}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
            />

            {/* Test Mode Badge */}
            <View style={s.testBadge}>
                <Text style={s.testBadgeTx}>MODO DE TESTE ATIVO</Text>
            </View>

            {/* Logo Area */}
            <View style={s.logoArea}>
                <View style={s.logoContainer}>
                    <LinearGradient
                        colors={[THEME.primary, '#06B6D4']}
                        style={s.logoDot}
                    />
                </View>
                <Text style={s.logoText}>KiraWave</Text>
                <Text style={s.tagline}>Sua mente em alta performance</Text>
            </View>

            {/* Premium Form Card */}
            <View style={s.card}>
                <View style={s.glassOverlay} pointerEvents="none" />
                
                <Text style={s.title}>Bem-vindo</Text>
                <Text style={s.subtitle}>Entre com qualquer dado para testar</Text>

                <View style={s.inputContainer}>
                    <Text style={s.inputLabel}>E-mail</Text>
                    <TextInput
                        style={s.input}
                        placeholder="exemplo@kira.com"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                <View style={s.inputContainer}>
                    <Text style={s.inputLabel}>Senha</Text>
                    <TextInput
                        style={s.input}
                        placeholder="••••••••"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>

                {error && <Text style={s.errorText}>{error}</Text>}

                <TouchableOpacity 
                    style={s.btnPrimary} 
                    onPress={handleLogin} 
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={[THEME.primary, '#06B6D4']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={s.btnGradient}
                    >
                        {loading
                            ? <ActivityIndicator color="#020617" />
                            : <Text style={s.btnPrimaryTx}>Entrar Agora</Text>
                        }
                    </LinearGradient>
                </TouchableOpacity>

                <Link href={'/(auth)/register' as any} asChild>
                    <TouchableOpacity style={s.linkBtn}>
                        <Text style={s.linkTx}>
                            Ainda não tem conta? <Text style={s.linkHighlight}>Criar conta</Text>
                        </Text>
                    </TouchableOpacity>
                </Link>
            </View>

            <Text style={s.footerNote}>
                Recursos premium em desenvolvimento • v1.0.0
            </Text>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    root: { 
        flex: 1, 
        justifyContent: 'center', 
        padding: 24,
    },
    testBadge: {
        position: 'absolute',
        top: 60,
        alignSelf: 'center',
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(34, 211, 238, 0.3)',
    },
    testBadgeTx: {
        color: THEME.primary,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.2,
    },
    logoArea: { 
        alignItems: 'center', 
        marginBottom: 40 
    },
    logoContainer: {
        shadowColor: THEME.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 10,
    },
    logoDot: { 
        width: 16, 
        height: 16, 
        borderRadius: 8, 
        marginBottom: 16 
    },
    logoText: { 
        color: '#FFFFFF', 
        fontSize: 32, 
        fontWeight: '800', 
        letterSpacing: -1 
    },
    tagline: { 
        color: 'rgba(255,255,255,0.5)', 
        fontSize: 14, 
        marginTop: 4,
        fontWeight: '500'
    },

    card: {
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 28,
        padding: 28,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
    },
    glassOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
    },
    title: { 
        color: '#FFFFFF', 
        fontSize: 24, 
        fontWeight: '700', 
        marginBottom: 6 
    },
    subtitle: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        marginBottom: 24,
    },
    inputContainer: {
        marginBottom: 18,
    },
    inputLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        color: '#FFFFFF',
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },

    errorText: { 
        color: '#FB7185', 
        fontSize: 13, 
        textAlign: 'center',
        marginBottom: 12 
    },

    btnPrimary: {
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 10,
        height: 56,
    },
    btnGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnPrimaryTx: { 
        color: '#020617', 
        fontWeight: '800', 
        fontSize: 16,
        letterSpacing: 0.5
    },

    linkBtn: { 
        alignItems: 'center', 
        marginTop: 20 
    },
    linkTx: { 
        color: 'rgba(255,255,255,0.4)', 
        fontSize: 14 
    },
    linkHighlight: { 
        color: THEME.primary, 
        fontWeight: '700' 
    },
    footerNote: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        color: 'rgba(255,255,255,0.2)',
        fontSize: 12,
        fontWeight: '500',
    }
});
