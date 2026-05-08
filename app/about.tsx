import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { StatusBar } from 'expo-status-bar';

const THEME = {
    bg: '#0d0608', surface: '#160a0c', card: '#1e0d10',
    border: '#3a1520', primary: '#c0392b', primaryGlow: '#e74c3c',
    text: '#f5e6e8', muted: '#a08090', success: '#2ecc71',
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
                
                {/* CONTEXTO */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>A Essência</Text>
                    <Text style={s.paragraph}>
                        O <Text style={s.highlight}>KiraWave</Text> nasceu do desejo de ajudar pessoas a encontrarem foco profundo num mundo cheio de distrações. Especialmente desenhado com base em batidas binaurais e sons ambientes, ele ajuda cérebros neurodivergentes (como no TDAH) ou qualquer pessoa que busque fluir melhor em suas tarefas e estudos.
                    </Text>
                </View>

                {/* ROADMAP / O FUTURO */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>O que vem por aí</Text>
                    <View style={s.roadmapCard}>
                        <View style={s.roadItem}>
                            <Text style={s.roadIcon}>✨</Text>
                            <Text style={s.roadText}>Novos temas premium e imersivos</Text>
                        </View>
                        <View style={s.roadItem}>
                            <Text style={s.roadIcon}>🚫</Text>
                            <Text style={s.roadText}>Experiência 100% livre de anúncios, sempre!</Text>
                        </View>
                        <View style={s.roadItem}>
                            <Text style={s.roadIcon}>🍏</Text>
                            <Text style={s.roadText}>Em breve na Apple App Store</Text>
                        </View>
                        <View style={s.roadItem}>
                            <Text style={s.roadIcon}>🤖</Text>
                            <Text style={s.roadText}>Em breve na Google Play Store</Text>
                        </View>
                        <View style={s.roadItem}>
                            <Text style={s.roadIcon}>🪟</Text>
                            <Text style={s.roadText}>Em breve na Microsoft Store</Text>
                        </View>
                    </View>
                </View>

                {/* PIX COLABORATIVO */}
                <View style={s.pixCard}>
                    <Text style={s.pixTitle}>❤️ Um gesto de apoio</Text>
                    <Text style={s.pixDesc}>
                        Se esta ferramenta fez diferença no seu dia e você deseja contribuir para que todas as novidades do futuro se tornem realidade, considere apoiar o desenvolvimento com uma contribuição voluntária.
                    </Text>
                    
                    <Image 
                        source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(PIX_PAYLOAD)}` }}
                        style={s.qrCode}
                    />

                    <TouchableOpacity style={[s.btnPrimary, copied && s.btnSuccess]} onPress={copyPix}>
                        <Text style={s.btnPrimaryTx}>{copied ? '✅ Chave Copiada!' : 'Copiar Pix (Copia e Cola)'}</Text>
                    </TouchableOpacity>
                    <Text style={s.pixSub}>Higor de Jesus Francisco</Text>
                </View>

            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: THEME.bg },
    body: { padding: 20, paddingBottom: 40 },
    
    section: { marginBottom: 30 },
    sectionTitle: { color: THEME.text, fontSize: 20, fontWeight: '600', marginBottom: 12 },
    paragraph: { color: THEME.muted, fontSize: 15, lineHeight: 24 },
    highlight: { color: THEME.primary, fontWeight: '600' },
    
    roadmapCard: { backgroundColor: THEME.card, borderWidth: 0.5, borderColor: THEME.border, borderRadius: 12, padding: 16, gap: 14 },
    roadItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    roadIcon: { fontSize: 18 },
    roadText: { color: THEME.text, fontSize: 14, flex: 1 },

    pixCard: { backgroundColor: '#1a0a0d', borderWidth: 1, borderColor: '#a82c20', borderRadius: 16, padding: 20, marginTop: 10, alignItems: 'center', gap: 14 },
    pixTitle: { color: '#e74c3c', fontWeight: '700', fontSize: 16 },
    pixDesc: { color: THEME.muted, fontSize: 14, textAlign: 'center', lineHeight: 22 },
    qrCode: { width: 160, height: 160, borderRadius: 10, marginTop: 4, marginBottom: 4 },
    btnPrimary: { backgroundColor: THEME.primary, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 12, width: '100%', alignItems: 'center' },
    btnPrimaryTx: { color: '#fff', fontWeight: '500', fontSize: 14 },
    btnSuccess: { backgroundColor: THEME.success },
    pixSub: { color: THEME.muted, fontSize: 12, marginTop: 2 },
});
