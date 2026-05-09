import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../services/themes/tokens';

const PIX_PAYLOAD =
    '00020101021126580014br.gov.bcb.pix0136650bbde7-3708-4da9-8cc5-54121b47a2235204000053039865802BR5920HIGOR DE J FRANCISCO6011LARANJEIRAS62070503***6304F261';

export default function AboutScreen() {
    const [copied, setCopied] = useState(false);
    const router = useRouter();

    const copyPix = async () => {
        await Clipboard.setStringAsync(PIX_PAYLOAD);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    return (
        <View style={s.root}>
            <StatusBar style="light" />

            {/* Background fixo para manter a imersão */}
            <LinearGradient
                colors={['#0F172A', '#020617', '#1E1B4B']}
                style={StyleSheet.absoluteFill}
            />

            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={THEME.text} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>Sobre o Projeto</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

                {/* Manifesto Section */}
                <View style={s.manifestoCard}>
                    <View style={s.iconCircle}>
                        <Ionicons name="flash" size={32} color={THEME.primary} />
                    </View>
                    <Text style={s.manifestoTitle}>Nossa Missão</Text>
                    <Text style={s.manifestoText}>
                        O <Text style={{ color: THEME.primary, fontWeight: '700' }}>KiraWave</Text> foi criado para ser o seu santuário digital.
                        Acreditamos que o foco não é apenas produtividade, mas sim uma forma de paz mental.
                    </Text>
                    <Text style={s.manifestoSub}>
                        Especialmente desenhado para mentes que buscam silenciar o ruído externo e fluir em seus objetivos.
                    </Text>
                </View>

                {/* Roadmap Section */}
                <View style={s.section}>
                    <View style={s.sectionHeader}>
                        <Ionicons name="map-outline" size={20} color={THEME.primary} />
                        <Text style={s.sectionTitle}>ROADMAP 2026</Text>
                    </View>

                    <View style={s.roadmapList}>
                        {[
                            { icon: 'color-palette', text: 'Temas Imersivos (Nebulosa, Oceano)', status: 'Próximo' },
                            { icon: 'stats-chart', text: 'Histórico de Foco com Gráficos', status: 'Em breve' },
                            { icon: 'logo-apple', text: 'App Nativo iOS & macOS', status: 'Desenvolvimento' },
                            { icon: 'logo-android', text: 'App Nativo Android', status: 'Planejamento' },
                        ].map((item, i) => (
                            <View key={i} style={s.roadItem}>
                                <View style={s.roadIconContainer}>
                                    <Ionicons name={item.icon as any} size={20} color={THEME.text} />
                                </View>
                                <View style={s.roadContent}>
                                    <Text style={s.roadText}>{item.text}</Text>
                                    <Text style={s.roadStatus}>{item.status}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Donation Section */}
                <View style={s.donationCard}>
                    <LinearGradient
                        colors={['rgba(124, 58, 237, 0.2)', 'rgba(34, 211, 238, 0.1)']}
                        style={StyleSheet.absoluteFill}
                    />
                    <View style={s.donationHeader}>
                        <Ionicons name="heart" size={28} color="#FB7185" />
                        <Text style={s.donationTitle}>Apoie a Evolução</Text>
                    </View>

                    <Text style={s.donationDesc}>
                        O KiraWave é e sempre será <Text style={{ fontWeight: '700' }}>livre de anúncios</Text>.
                        Seu apoio voluntário ajuda a custear os servidores e o tempo de desenvolvimento desta ferramenta.
                    </Text>

                    <View style={s.qrArea}>
                        <View style={s.qrWrapper}>
                            <Image
                                source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(PIX_PAYLOAD)}` }}
                                style={s.qrCode}
                            />
                        </View>
                        <View style={s.qrInstruction}>
                            <Text style={s.qrStep}>1. Escaneie o QR Code</Text>
                            <Text style={s.qrStep}>2. Ou copie a chave abaixo</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={s.copyBtn} onPress={copyPix} activeOpacity={0.8}>
                        <LinearGradient
                            colors={copied ? ['#10B981', '#059669'] : [THEME.primary, '#0891B2']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={s.copyBtnGradient}
                        >
                            <Ionicons name={copied ? "checkmark-circle" : "copy-outline"} size={20} color="white" />
                            <Text style={s.copyBtnText}>
                                {copied ? 'Copiado com Sucesso!' : 'Copiar Chave PIX'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <Text style={s.pixOwner}>Favorecido: Higor de J. Francisco</Text>
                </View>

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
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: '700' },

    body: { padding: 20, paddingBottom: 60 },

    manifestoCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 30,
        padding: 30,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        marginBottom: 30,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    manifestoTitle: { color: 'white', fontSize: 22, fontWeight: '800', marginBottom: 12 },
    manifestoText: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 16, textAlign: 'center', lineHeight: 26, marginBottom: 16 },
    manifestoSub: { color: 'rgba(255, 255, 255, 0.4)', fontSize: 13, textAlign: 'center', fontStyle: 'italic' },

    section: { marginBottom: 30 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20, paddingLeft: 10 },
    sectionTitle: { color: THEME.primary, fontSize: 13, fontWeight: '800', letterSpacing: 2 },

    roadmapList: { gap: 12 },
    roadItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    roadIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    roadContent: { flex: 1 },
    roadText: { color: 'white', fontSize: 15, fontWeight: '600' },
    roadStatus: { color: THEME.muted, fontSize: 12, marginTop: 2 },

    donationCard: {
        borderRadius: 32,
        padding: 30,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(124, 58, 237, 0.3)',
        alignItems: 'center',
    },
    donationHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    donationTitle: { color: 'white', fontSize: 24, fontWeight: '800' },
    donationDesc: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 15, textAlign: 'center', lineHeight: 24, marginBottom: 24 },

    qrArea: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 24 },
    qrWrapper: {
        padding: 12,
        backgroundColor: 'white',
        borderRadius: 20,
        boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.5)',
    },
    qrCode: { width: 140, height: 140 },
    qrInstruction: { flex: 1, gap: 8 },
    qrStep: { color: 'white', fontSize: 14, fontWeight: '500' },

    copyBtn: { width: '100%', height: 60, borderRadius: 18, overflow: 'hidden' },
    copyBtnGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    copyBtnText: { color: 'white', fontWeight: '800', fontSize: 16 },
    pixOwner: { color: 'rgba(255, 255, 255, 0.4)', fontSize: 12, marginTop: 16 },

    footer: { color: 'rgba(255, 255, 255, 0.2)', fontSize: 12, textAlign: 'center', marginTop: 20, marginBottom: 40 },
});
