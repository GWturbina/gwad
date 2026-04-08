// api/campaign-data.js — Данные кампании по slug
// ✅ FIXED: sanitization, CORS

module.exports = async function handler(req, res) {
    var origin = req.headers.origin || '';
    var allowed = ['https://gwad.ink', 'https://www.gwad.ink', 'https://cgift.club'];
    if (allowed.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    if (req.method === 'OPTIONS') return res.status(200).end();

    var SB = process.env.SUPABASE_URL;
    var SK = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!SB || !SK) return res.json({ ok: false, error: 'DB not configured' });

    var h = { 'apikey': SK, 'Authorization': 'Bearer ' + SK, 'Content-Type': 'application/json' };

    // ═══ Sanitize slug: только латиница, цифры, дефис ═══
    var slug = String(req.query.slug || '').replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 100);
    if (!slug) return res.json({ ok: false, error: 'slug required' });

    try {
        var r = await fetch(SB + '/rest/v1/adp_campaigns?slug=eq.' + encodeURIComponent(slug) + '&select=*', { headers: h });
        var camps = r.ok ? await r.json() : [];

        if (camps.length === 0) return res.json({ ok: false, error: 'Campaign not found' });

        var c = camps[0];

        var now = new Date().toISOString();
        var ar = await fetch(SB + '/rest/v1/adp_orders?campaign_id=eq.' + c.id + '&status=eq.active&end_date=gte.' + encodeURIComponent(now) + '&select=id', { headers: h });
        var active = ar.ok ? await ar.json() : [];

        return res.json({
            ok: true,
            campaign: {
                name: c.name,
                slug: c.slug,
                description: c.description || '',
                logo_url: c.logo_url || '',
                primary_color: c.primary_color || '#FFD700',
                target_project: c.target_project,
                target_url: c.target_url,
                channels: c.channels || [],
                video_url: c.video_url || '',
                hero_image_url: c.hero_image_url || '',
                features: c.features || '',
                cta_text: c.cta_text || 'Начать зарабатывать',
                template: c.template || 'cards',
                total_clicks: c.total_clicks || 0,
                total_registrations: c.total_registrations || 0,
                active_participants: active.length
            }
        });
    } catch(e) {
        return res.json({ ok: false, error: 'Server error' });
    }
};
