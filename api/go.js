// api/go.js — gwad.ink Redirect & Rotation Engine
// Проксирует к Supabase напрямую (отдельный проект от CardGift)

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') return res.status(200).end();

    var SB = process.env.SUPABASE_URL;
    var SK = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!SB || !SK) return res.redirect(302, 'https://cgift.club');

    var h = { 'apikey': SK, 'Authorization': 'Bearer ' + SK, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };

    var type = req.query.type || 'campaign';
    var slug = req.query.slug || '';
    var code = req.query.code || '';
    var gwId = req.query.id || '';
    var project = req.query.project || '';

    // Короткая ссылка
    if (type === 'short' && code) {
        try {
            var r = await fetch(SB + '/rest/v1/adp_short_urls?code=eq.' + code + '&select=target_url', { headers: h });
            var urls = r.ok ? await r.json() : [];
            if (urls.length > 0 && urls[0].target_url) return res.redirect(302, urls[0].target_url);
        } catch(e) {}
        return res.redirect(302, 'https://cgift.club');
    }

    // Прямая ссылка — с OG-превью для мессенджеров
    if (type === 'ref' && gwId) {
        var id = gwId.replace(/^GW/i, '');
        var u = {
            cardgift: 'https://cgift.club/registration.html?ref=' + id,
            diamond_club: 'https://gws.ink/invite/gems?ref=' + id,
            metr: 'https://gwm.ink/invite/house?ref=' + id
        };
        var target = (u[project] || u.cardgift) + '&utm_source=gwads';

        // OG-мета для красивого превью в Telegram/WhatsApp
        var og = {
            cardgift: {
                title: 'GlobalWay — Рекламная платформа',
                desc: 'Бесплатные инструменты для бизнеса — CRM, лендинг, реклама. 9 уровней партнёрской программы. Присоединяйся!',
                img: 'https://gwad.ink/img/hero-banner.png',
            },
            diamond_club: {
                title: '💎 Diamond Club — Инвестиции в бриллианты',
                desc: 'Бриллианты со скидкой до 70%. Стейкинг от 50% годовых. Бесплатный старт в Diamond Club!',
                img: 'https://gws.ink/og-diamond.png',
            },
            metr: {
                title: '🏠 Метр Квадратный — Свой дом под 0%',
                desc: 'Заработай 35% депозит через клуб — мы добавим 65% под 0% годовых. Дом в любой стране мира.',
                img: 'https://gwm.ink/og-metr.png',
            }
        };
        var o = og[project] || og.cardgift;

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send('<!DOCTYPE html><html><head>' +
            '<meta charset="utf-8">' +
            '<meta property="og:title" content="' + o.title + '">' +
            '<meta property="og:description" content="' + o.desc + '">' +
            '<meta property="og:image" content="' + o.img + '">' +
            '<meta property="og:url" content="https://gwad.ink/' + (project === 'diamond_club' ? 'd' : project === 'metr' ? 'm' : 'r') + '/' + id + '">' +
            '<meta property="og:type" content="website">' +
            '<meta property="og:site_name" content="GlobalWay AdPlatform">' +
            '<meta name="twitter:card" content="summary_large_image">' +
            '<meta name="twitter:title" content="' + o.title + '">' +
            '<meta name="twitter:description" content="' + o.desc + '">' +
            '<meta name="twitter:image" content="' + o.img + '">' +
            '<meta http-equiv="refresh" content="0;url=' + target + '">' +
            '</head><body style="background:#0a0a1a;color:#fff;font-family:sans-serif;text-align:center;padding:40px">' +
            '<p>Переход...</p><script>window.location.href="' + target + '";</script>' +
            '</body></html>');
    }

    // Ротация кампании
    if (!slug) return res.redirect(302, '/');
    try {
        var cr = await fetch(SB + '/rest/v1/adp_campaigns?slug=eq.' + slug + '&select=id,target_url', { headers: h });
        var camps = cr.ok ? await cr.json() : [];
        var camp = camps[0];
        var baseUrl = camp ? camp.target_url : 'https://cgift.club/registration.html';
        var campId = camp ? camp.id : null;

        var now = new Date().toISOString();
        var f = 'status=eq.active&start_date=lte.' + now + '&end_date=gte.' + now;
        if (campId) f += '&campaign_id=eq.' + campId;
        f += '&select=id,gw_id,weight,clicks_total';

        var or = await fetch(SB + '/rest/v1/adp_orders?' + f + '&order=clicks_total.asc', { headers: h });
        var orders = or.ok ? await or.json() : [];

        if (orders.length === 0) return res.redirect(302, baseUrl);
        if (req.query.preview === '1') return res.json({ ok: true, slug: slug, pool: orders.length });

        var tw = 0;
        for (var w = 0; w < orders.length; w++) tw += parseFloat(orders[w].weight) || 1;
        var best = orders[0], bs = Infinity;
        for (var i = 0; i < orders.length; i++) {
            var s = (orders[i].clicks_total || 0) / ((parseFloat(orders[i].weight) || 1) / tw);
            if (s < bs) { bs = s; best = orders[i]; }
        }

        fetch(SB + '/rest/v1/adp_orders?id=eq.' + best.id, {
            method: 'PATCH', headers: h,
            body: JSON.stringify({ clicks_total: (best.clicks_total || 0) + 1, updated_at: now })
        }).catch(function() {});

        var refId = (best.gw_id || '').replace(/^GW/i, '');
        var sep = baseUrl.includes('?') ? '&' : '?';
        return res.redirect(302, baseUrl + sep + 'ref=' + refId + '&utm_source=gwads&utm_campaign=' + slug);
    } catch(e) {
        return res.redirect(302, 'https://cgift.club');
    }
};
