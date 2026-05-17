import { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Platform, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePremiumStore } from '../store/usePremiumStore';
import { PREMIUM_PLANS, PREMIUM_FEATURES } from '../features/premium/premiumConfig';
import { THEME } from '../../services/themes/tokens';

export default function PremiumScreen() {
    const { status, plan: paidPlan } = useLocalSearchParams<{ status?: string; plan?: string }>();
    const { isPremium, plan: currentPlan, expiresAt, setPremium } = usePremiumStore();
    const router = useRouter();
    const [loading, setLoading] = useState<'monthly' | 'annual' | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'approved' && paidPlan && !isPremium) {
            const expiry = new Date();
            if (paidPlan === 'annual') expiry.setFullYear(expiry.getFullYear() + 1);
            else expiry.setMonth(expiry.getMonth() + 1);
            setPremium(paidPlan as 'monthly' | 'annual', expiry.toISOString());
        }
    }, []);

    const handleSubscribe = async (planType: 'monthly' | 'annual') => {
        setLoading(planType);
        setError(null);
        try {
            const response = await fetch('/api/mp-preference', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: planType }),
            });
            if (!response.ok) throw new Error('API error');
            const data = await response.json();
            if (data.checkoutUrl) {
                if (Platform.OS === 'web') {
                    (window as any).location.href = data.checkoutUrl;
                } else {
                    await Linking.openURL(data.checkoutUrl);
                }
            } else {
                setError('Erro ao iniciar pagamento. Tente novamente.');
            }
        } catch {
            setError('Erro de conexão. Verifique sua internet e tente novamente.');
        } finally {
            setLoading(null);
        }
    };

    // Pagamento aprovado (callback do MP)
    if (status === 'approved') {
        return (
            <View style={s.root}>
                <StatusBar style="light" />
                <LinearGradient colors={['#0F172A', '#020617', '#1E1B4B']} style={StyleSheet.absoluteFill} />
                <View style={s.centeredContainer}>
                    <Ionicons name="sparkles" size={72} color="#A78BFA" />
                    <Text style={s.bigTitle}>Premium Ativado! 🎉</Text>
                    <Text style={s.bigSub}>
                        Bem-vindo ao KiraWave completo.{'\n'}Todas as funcionalidades desbloqueadas.
                    </Text>
                    <TouchableOpacity style={s.ctaBtn} onPress={() => router.replace('/')}>
                        <LinearGradient
                            colors={[THEME.primary, '#0891B2']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={s.ctaBtnGradient}
                        >
                            <Text style={s.ctaBtnTx}>Começar a Focar</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Pagamento falhou
    if (status === 'failed') {
        return (
            <View style={s.root}>
                <StatusBar style="light" />
                <LinearGradient colors={['#0F172A', '#020617', '#1E1B4B']} style={StyleSheet.absoluteFill} />
                <View style={s.centeredContainer}>
                    <Ionicons name="close-circle" size={72} color="#FB7185" />
                    <Text style={s.bigTitle}>Pagamento não concluído</Text>
                    <Text style={s.bigSub}>
                        Tudo bem! Você pode tentar novamente{'\n'}a qualquer momento.
                    </Text>
                    <TouchableOpacity style={s.ctaBtn} onPress={() => router.replace('/premium')}>
                        <LinearGradient
                            colors={['#FB7185', '#E11D48']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={s.ctaBtnGradient}
                        >
                            <Text style={s.ctaBtnTx}>Tentar Novamente</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.back()} style={s.skipLink}>
                        <Text style={s.skipLinkTx}>Voltar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Já é premium — tela de status
    if (isPremium) {
        const expiry = expiresAt ? new Date(expiresAt) : null;
        return (
            <View style={s.root}>
                <StatusBar style="light" />
                <LinearGradient colors={['#0F172A', '#020617', '#1E1B4B']} style={StyleSheet.absoluteFill} />
                <View style={s.header}>
                    <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                        <Ionicons name="chevron-back" size={24} color={THEME.text} />
                    </TouchableOpacity>
                    <Text style={s.headerTitle}>Meu Premium</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={s.centeredContainer}>
                    <View style={s.premiumBadge}>
                        <Ionicons name="checkmark-circle" size={64} color={THEME.primary} />
                    </View>
                    <Text style={s.bigTitle}>Você é Premium ✨</Text>
                    <Text style={s.planLabel}>
                        Plano {currentPlan === 'annual' ? 'Anual' : 'Mensal'}
                    </Text>
                    {expiry && (
                        <Text style={s.expiryTx}>
                            Válido até {expiry.toLocaleDateString('pt-BR')}
                        </Text>
                    )}
                    <TouchableOpacity style={s.ctaBtn} onPress={() => router.replace('/')}>
                        <LinearGradient
                            colors={[THEME.primary, '#0891B2']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={s.ctaBtnGradient}
                        >
                            <Text style={s.ctaBtnTx}>Voltar e Focar</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Tela de upgrade (padrão)
    return (
        <View style={s.root}>
            <StatusBar style="light" />
            <LinearGradient colors={['#0F172A', '#020617', '#1E1B4B']} style={StyleSheet.absoluteFill} />

            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={THEME.text} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>KiraWave Premium</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

                {/* Hero */}
                <View style={s.hero}>
                    <LinearGradient
                        colors={['rgba(167, 139, 250, 0.2)', 'rgba(34, 211, 238, 0.1)']}
                        style={StyleSheet.absoluteFill}
                    />
                    <Ionicons name="sparkles" size={44} color="#A78BFA" />
                    <Text style={s.heroTitle}>Desbloqueie o Foco Total</Text>
                    <Text style={s.heroSub}>
                        Acesso completo a todas as ferramentas de foco do KiraWave
                    </Text>
                </View>

                {/* Features */}
                <Text style={s.sectionLabel}>O QUE VOCÊ DESBLOQUEIA</Text>
                <View style={s.featuresCard}>
                    {PREMIUM_FEATURES.map((f, i) => (
                        <View key={i} style={[s.featureRow, i < PREMIUM_FEATURES.length - 1 && s.featureRowBorder]}>
                            <Text style={s.featureIcon}>{f.icon}</Text>
                            <Text style={s.featureTx}>{f.label}</Text>
                            <Ionicons name="checkmark-circle" size={18} color={THEME.primary} />
                        </View>
                    ))}
                </View>

                {/* Plano Anual (destaque) */}
                <Text style={s.sectionLabel}>ESCOLHA SEU PLANO</Text>

                <TouchableOpacity
                    style={s.planCardFeatured}
                    onPress={() => handleSubscribe('annual')}
                    disabled={loading !== null}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={['rgba(167, 139, 250, 0.25)', 'rgba(124, 58, 237, 0.15)']}
                        style={StyleSheet.absoluteFill}
                    />
                    <View style={s.bestBadge}>
                        <Text style={s.bestBadgeTx}>MELHOR VALOR</Text>
                    </View>
                    <View style={s.planTopRow}>
                        <View>
                            <Text style={s.planName}>{PREMIUM_PLANS.annual.label}</Text>
                            <Text style={s.planSavings}>{PREMIUM_PLANS.annual.description}</Text>
                        </View>
                        <View style={s.planPriceBlock}>
                            <Text style={s.planPrice}>{PREMIUM_PLANS.annual.price}</Text>
                            <Text style={s.planPeriod}>{PREMIUM_PLANS.annual.period}</Text>
                        </View>
                    </View>
                    <View style={s.planBtnFeatured}>
                        {loading === 'annual' ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={s.planBtnTx}>Assinar Plano Anual →</Text>
                        )}
                    </View>
                </TouchableOpacity>

                {/* Plano Mensal */}
                <TouchableOpacity
                    style={s.planCard}
                    onPress={() => handleSubscribe('monthly')}
                    disabled={loading !== null}
                    activeOpacity={0.85}
                >
                    <View style={s.planTopRow}>
                        <View>
                            <Text style={s.planName}>{PREMIUM_PLANS.monthly.label}</Text>
                            <Text style={s.planSavingsMuted}>{PREMIUM_PLANS.monthly.description}</Text>
                        </View>
                        <View style={s.planPriceBlock}>
                            <Text style={s.planPrice}>{PREMIUM_PLANS.monthly.price}</Text>
                            <Text style={s.planPeriod}>{PREMIUM_PLANS.monthly.period}</Text>
                        </View>
                    </View>
                    <View style={s.planBtnOutline}>
                        {loading === 'monthly' ? (
                            <ActivityIndicator color={THEME.primary} />
                        ) : (
                            <Text style={s.planBtnOutlineTx}>Assinar Mensal</Text>
                        )}
                    </View>
                </TouchableOpacity>

                {error ? <Text style={s.errorTx}>{error}</Text> : null}

                <Text style={s.legal}>
                    Pagamento seguro via MercadoPago. Ao assinar, você concorda com os Termos de Uso.
                    Renovação automática — cancele a qualquer momento.
                </Text>

                <Text style={s.footer}>KiraWave Beta • Feito com ❤️ para você.</Text>
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#020617' },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 20,
        backgroundColor: 'rgba(2, 6, 23, 0.8)',
        zIndex: 10,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: '700' },

    body: { padding: 20, paddingBottom: 80 },

    centeredContainer: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
        padding: 40, gap: 16,
    },
    premiumBadge: {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: 'rgba(34,211,238,0.1)',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 8,
    },
    bigTitle: { color: 'white', fontSize: 28, fontWeight: '800', textAlign: 'center' },
    bigSub: { color: 'rgba(255,255,255,0.6)', fontSize: 16, textAlign: 'center', lineHeight: 24 },
    planLabel: { color: THEME.primary, fontSize: 16, fontWeight: '700' },
    expiryTx: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 },
    ctaBtn: { marginTop: 16, borderRadius: 20, overflow: 'hidden', width: '100%' },
    ctaBtnGradient: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
    ctaBtnTx: { color: 'white', fontWeight: '800', fontSize: 17 },
    skipLink: { marginTop: 16 },
    skipLinkTx: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },

    hero: {
        borderRadius: 32, padding: 36, alignItems: 'center', overflow: 'hidden',
        borderWidth: 1, borderColor: 'rgba(167, 139, 250, 0.3)',
        marginBottom: 32, gap: 12,
    },
    heroTitle: { color: 'white', fontSize: 24, fontWeight: '800', textAlign: 'center' },
    heroSub: { color: 'rgba(255,255,255,0.6)', fontSize: 15, textAlign: 'center', lineHeight: 22 },

    sectionLabel: {
        color: 'white', fontSize: 12, fontWeight: '800', letterSpacing: 1.5,
        textTransform: 'uppercase', marginBottom: 16, opacity: 0.5,
    },

    featuresCard: {
        backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
        marginBottom: 32, overflow: 'hidden',
    },
    featureRow: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        paddingHorizontal: 20, paddingVertical: 16,
    },
    featureRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    featureIcon: { fontSize: 22, width: 28 },
    featureTx: { flex: 1, color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '500' },

    planCardFeatured: {
        borderRadius: 28, padding: 24, overflow: 'hidden',
        borderWidth: 1.5, borderColor: 'rgba(167, 139, 250, 0.5)',
        marginBottom: 14,
        boxShadow: '0px 15px 40px rgba(167, 139, 250, 0.2)',
    } as any,
    bestBadge: {
        alignSelf: 'flex-start', backgroundColor: '#A78BFA',
        borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 16,
    },
    bestBadgeTx: { color: 'white', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
    planTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    planName: { color: 'white', fontSize: 20, fontWeight: '800' },
    planSavings: { color: '#A78BFA', fontSize: 13, fontWeight: '600', marginTop: 4 },
    planSavingsMuted: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 },
    planPriceBlock: { alignItems: 'flex-end' },
    planPrice: { color: 'white', fontSize: 28, fontWeight: '800' },
    planPeriod: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '600' },
    planBtnFeatured: {
        backgroundColor: '#7C3AED', borderRadius: 18, height: 54,
        alignItems: 'center', justifyContent: 'center',
    },
    planBtnTx: { color: 'white', fontWeight: '800', fontSize: 16 },

    planCard: {
        backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 28, padding: 24,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 20,
    },
    planBtnOutline: {
        borderWidth: 1.5, borderColor: THEME.primary, borderRadius: 18, height: 54,
        alignItems: 'center', justifyContent: 'center', marginTop: 4,
    },
    planBtnOutlineTx: { color: THEME.primary, fontWeight: '700', fontSize: 16 },

    errorTx: {
        color: '#FB7185', textAlign: 'center', fontSize: 14,
        backgroundColor: 'rgba(251,113,133,0.1)', padding: 12,
        borderRadius: 12, marginBottom: 16,
    },
    legal: {
        color: 'rgba(255,255,255,0.3)', fontSize: 12, textAlign: 'center',
        lineHeight: 18, marginBottom: 20,
    },
    footer: { color: 'rgba(255,255,255,0.2)', fontSize: 12, textAlign: 'center' },
});
