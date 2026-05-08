import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { StatusBar } from 'expo-status-bar';

const THEME = {
    bg: '#0A0F1C',
    surface: '#0D1425',
    card: '#111827',
    border: '#1E2D45',
    primary: '#22D3EE',
    primaryGlow: '#67E8F9',
    accent: '#A78BFA',
    text: '#F1F5F9',
    muted: '#64748B',
    success: '#22D3EE',
};

const PIX_PAYLOAD = '00020101021126580014br.gov.bcb.pix0136650bbde7-3708-4da9-8cc5-54121b47a2235204000053039865802BR5920HIGOR DE J FRANCISCO6011LARANJEIRAS62070503***6304F261';

export default function AboutScreen() {
    const [copied, setCopied] = useState(false);

    const copyPix = async () => {
        await Clipboard.setStringAsync(PIX_PAYLOAD);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    return (
        <View style={s.root}>
            <StatusBar style="light" />
            <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

                {/* ESSÊNCIA */}
                <View style={s.section}>
                    <Text style={s.sectionTag}>A ESSÊNCIA</Text>
                    <Text style={s.headline}>
                        "Um espaço sonoro projetado para você entrar em estado de fluxo."
                    </Text>
                    <Text style={s.paragraph}>
                        O <Text style={s.highlight}>KiraWave</Text> nasceu do desejo de ajudar pessoas a encontrarem foco profundo num mundo cheio de distrações. Com batidas binaurais e sons ambientes, ele ajuda cérebros neurodivergentes — como no TDAH — e qualquer pessoa que busque fluir melhor em suas tarefas e estudos.
                    </Text>
                </View>

                <View style={s.divider} />

                {/* ROADMAP */}
                <View style={s.section}>
                    <Text style={s.sectionTag}>O QUE VEM POR AÍ</Text>
                    <View style={s.roadmapCard}>
                        {[
                            { icon: '✨', text: 'Temas premium e imersivos' },
                            { icon: '🚫', text: 'Experiência 100% livre de anúncios, sempre' },
                            { icon: '🍏', text: 'Lançamento na Apple App Store' },
                            { icon: '🤖', text: 'Lançamento na Google Play Store' },
                            { icon: '🪟', text: 'Lançamento na Microsoft Store' },
                        ].map((item, index, arr) => (
                            <View key={item.icon}>
                                <View style={s.roadItem}>
                                    <Text style={s.roadIcon}>{item.icon}</Text>
                                    <Text style={s.roadText}>{item.text}</Text>
                                </View>
                                {index < arr.length - 1 && <View style={s.roadDivider} />}
                            </View>
                        ))}
                    </View>
                </View>

                <View style={s.divider} />

                {/* PIX COLABORATIVO */}
                <View style={s.section}>
                    <Text style={[s.sectionTag, { color: THEME.accent }]}>❤️ APOIE ESTE PROJETO</Text>
                    <View style={s.pixCard}>
                        <Text style={s.pixTitle}>Um gesto de apoio</Text>
                        <Text style={s.pixDesc}>
                            Se o KiraWave fez diferença no seu foco, considere contribuir voluntariamente para que o projeto continue crescendo e chegando a mais pessoas.
                        </Text>

                        <Image
                            source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=000000&bgcolor=ffffff&data=${encodeURIComponent(PIX_PAYLOAD)}` }}
                            style={s.qrCode}
                        />

                        <TouchableOpacity style={s.btnGradientWrapper} onPress={copyPix} activeOpacity={0.85}>
                            <LinearGradient
                                colors={copied ? ['#22D3EE', '#22D3EE'] : ['#7C3AED', '#22D3EE']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={s.btnGradient}
                            >
                                <Text style={s.btnGradientTx}>
                                    {copied ? '✅ Chave Copiada!' : '📋 Copiar Chave Pix'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <Text style={s.pixSub}>Higor de Jesus Francisco</Text>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: THEME.bg },
    body: { padding: 24, paddingBottom: 48 },

    section: { marginBottom: 8 },
    sectionTag: {
        color: THEME.primary,
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 14,
        opacity: 0.8,
    },
    headline: {
        color: THEME.text,
        fontSize: 20,
        fontWeight: '300',
        lineHeight: 30,
        fontStyle: 'italic',
        marginBottom: 16,
    },
    paragraph: { color: THEME.muted, fontSize: 15, lineHeight: 24 },
    highlight: { color: THEME.primary, fontWeight: '600' },

    divider: {
        height: 1,
        backgroundColor: THEME.border,
        opacity: 0.5,
        marginVertical: 28,
    },

    roadmapCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    roadItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 14,
    },
    roadIcon: { fontSize: 18, width: 26, textAlign: 'center' },
    roadText: { color: THEME.text, fontSize: 15, flex: 1, fontWeight: '300' },
    roadDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },

    pixCard: {
        backgroundColor: 'rgba(167,139,250,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(167,139,250,0.3)',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        gap: 16,
    },
    pixTitle: { color: THEME.text, fontWeight: '600', fontSize: 18 },
    pixDesc: { color: THEME.muted, fontSize: 14, textAlign: 'center', lineHeight: 22 },
    qrCode: {
        width: 150,
        height: 150,
        borderRadius: 12,
        marginVertical: 4,
    },

    btnGradientWrapper: { width: '100%', borderRadius: 14, overflow: 'hidden' },
    btnGradient: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnGradientTx: { color: '#fff', fontWeight: '700', fontSize: 15 },

    pixSub: { color: THEME.muted, fontSize: 12 },
});
