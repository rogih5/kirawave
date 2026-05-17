// api/mp-preference.ts — Vercel Serverless Function
//
// SETUP NECESSÁRIO no painel do Vercel (Environment Variables):
//   MP_ACCESS_TOKEN  → Seu Access Token do MercadoPago
//                      Obtenha em: https://www.mercadopago.com.br/settings/account/credentials
//   APP_URL          → URL do seu app (ex: https://kirawave.vercel.app)
//
// IMPORTANTE: Nunca coloque o MP_ACCESS_TOKEN no código frontend.

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { plan } = req.body as { plan?: string };

    if (!plan || !['monthly', 'annual'].includes(plan)) {
        return res.status(400).json({ error: 'Plano inválido. Use "monthly" ou "annual".' });
    }

    const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
    const APP_URL = process.env.APP_URL || 'https://kirawave.vercel.app';

    if (!MP_ACCESS_TOKEN) {
        console.error('[MP] MP_ACCESS_TOKEN não configurado nas variáveis de ambiente.');
        return res.status(500).json({ error: 'Serviço de pagamento não configurado.' });
    }

    const items =
        plan === 'annual'
            ? [{ title: 'KiraWave Premium — Plano Anual', quantity: 1, unit_price: 149.9, currency_id: 'BRL' }]
            : [{ title: 'KiraWave Premium — Plano Mensal', quantity: 1, unit_price: 19.9, currency_id: 'BRL' }];

    const preference = {
        items,
        back_urls: {
            success: `${APP_URL}/premium?status=approved&plan=${plan}`,
            failure: `${APP_URL}/premium?status=failed`,
            pending: `${APP_URL}/premium?status=pending`,
        },
        auto_return: 'approved',
        statement_descriptor: 'KIRAWAVE',
        metadata: { plan },
    };

    try {
        const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(preference),
        });

        if (!mpRes.ok) {
            const err = await mpRes.json().catch(() => ({}));
            console.error('[MP] Erro na API:', err);
            return res.status(502).json({ error: 'Erro no provedor de pagamento.' });
        }

        const data = await mpRes.json();
        const isProduction = process.env.NODE_ENV === 'production';

        return res.json({
            checkoutUrl: isProduction ? data.init_point : data.sandbox_init_point,
            preferenceId: data.id,
        });
    } catch (err) {
        console.error('[MP] Erro de conexão:', err);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}
