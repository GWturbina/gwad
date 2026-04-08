// api/faq.js — gwad.ink ЧАВО API
// CRUD для FAQ: list, add, delete
// Привязка к wallet + campaign_slug

module.exports = async function handler(req, res) {
    var origin = req.headers.origin || '';
    if (['gwad.ink','cgift.club'].some(function(d){return origin.includes(d)}) || origin.includes('vercel.app')) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Wallet-Address');
    if (req.method === 'OPTIONS') return res.status(200).end();

    var SB = process.env.SUPABASE_URL;
    var SK = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!SB || !SK) return res.json({ ok: false, error: 'DB not configured' });

    var h = { 'apikey': SK, 'Authorization': 'Bearer ' + SK, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };

    var wallet = (req.headers['x-wallet-address'] || '').toLowerCase().trim();
    if (!wallet || wallet.length !== 42) {
        return res.status(401).json({ ok: false, error: 'X-Wallet-Address required' });
    }

    var action = req.method === 'GET' ? (req.query.action || 'list') : (req.body || {}).action || 'add';

    try {
        // ═══ LIST — получить FAQ для владельца ═══
        if (action === 'list') {
            var campaign = req.query.campaign || '';
            var q = 'select=*&owner_wallet=eq.' + encodeURIComponent(wallet) + '&is_active=eq.true&order=sort_order.asc,created_at.asc';
            if (campaign && campaign !== 'all') {
                q += '&or=(campaign_slug.eq.' + encodeURIComponent(campaign) + ',campaign_slug.eq.all)';
            }
            var r = await fetch(SB + '/rest/v1/adp_faq?' + q, { headers: h });
            var items = r.ok ? await r.json() : [];
            return res.json({ ok: true, items: items });
        }

        // ═══ LIST_PUBLIC — FAQ для партнёров (без wallet проверки) ═══
        if (action === 'list_public') {
            var ownerWallet = req.query.owner || '';
            var campaign = req.query.campaign || '';
            if (!ownerWallet) return res.json({ ok: true, items: [] });
            var q = 'select=id,question,answer,campaign_slug&owner_wallet=eq.' + encodeURIComponent(ownerWallet.toLowerCase()) + '&is_active=eq.true&order=sort_order.asc';
            if (campaign && campaign !== 'all') {
                q += '&or=(campaign_slug.eq.' + encodeURIComponent(campaign) + ',campaign_slug.eq.all)';
            }
            var r = await fetch(SB + '/rest/v1/adp_faq?' + q + '&limit=50', { headers: h });
            var items = r.ok ? await r.json() : [];
            return res.json({ ok: true, items: items });
        }

        // ═══ ADD ═══
        if (req.method === 'POST' && action === 'add') {
            var b = req.body || {};
            if (!b.question || !b.answer) return res.json({ ok: false, error: 'question and answer required' });

            var data = {
                question: String(b.question).slice(0, 500),
                answer: String(b.answer).slice(0, 2000),
                campaign_slug: String(b.campaign || 'all').slice(0, 100),
                owner_wallet: wallet,
                owner_gw_id: b.gwId || null,
                sort_order: parseInt(b.sort_order) || 0,
                created_at: new Date().toISOString()
            };

            var r = await fetch(SB + '/rest/v1/adp_faq', {
                method: 'POST', headers: h, body: JSON.stringify(data)
            });
            var result = r.ok ? await r.json() : null;
            return res.json({ ok: r.ok, item: result && result[0] || null });
        }

        // ═══ DELETE ═══
        if (req.method === 'POST' && action === 'delete') {
            var id = (req.body || {}).id;
            if (!id) return res.json({ ok: false, error: 'id required' });

            // Проверяем владение
            var r = await fetch(SB + '/rest/v1/adp_faq?id=eq.' + id + '&owner_wallet=eq.' + encodeURIComponent(wallet), {
                method: 'PATCH', headers: h,
                body: JSON.stringify({ is_active: false, updated_at: new Date().toISOString() })
            });
            return res.json({ ok: r.ok });
        }

        return res.json({ ok: false, error: 'Unknown action' });
    } catch(e) {
        return res.json({ ok: false, error: 'Server error' });
    }
};
