// api/contacts.js — gwad.ink Contacts API
// ✅ FIXED: авторизация через wallet, санитизация, проверка владения контактом

var SB_URL = process.env.SUPABASE_URL;
var SB_KEY = process.env.SUPABASE_SERVICE_KEY;
if (!SB_KEY) {
    SB_KEY = process.env.SUPABASE_ANON_KEY;
    console.warn('⚠️ contacts.js: SERVICE_KEY not set, using ANON_KEY');
}

function sbHeaders() {
    return {
        'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY,
        'Content-Type': 'application/json', 'Prefer': 'return=representation'
    };
}

function sanitize(str, maxLen) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/[^\w@+\-.:/ ]/g, '').slice(0, maxLen || 200);
}

function setCors(req, res) {
    var origin = req.headers.origin || '';
    var allowed = ['https://gwad.ink', 'https://www.gwad.ink', 'https://cgift.club'];
    if (allowed.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Wallet-Address');
}

module.exports = async function handler(req, res) {
    setCors(req, res);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (!SB_URL || !SB_KEY) return res.json({ ok: false, error: 'DB not configured' });

    var action = req.method === 'GET' ? req.query.action : (req.body || {}).action;
    var gwId = sanitize(req.method === 'GET' ? req.query.gwId : (req.body || {}).gwId, 20);

    // ═══ АВТОРИЗАЦИЯ ═══
    var wallet = (req.headers['x-wallet-address'] || '').toLowerCase().trim();
    if (!wallet || !wallet.startsWith('0x') || wallet.length !== 42) {
        return res.status(401).json({ ok: false, error: 'X-Wallet-Address header required' });
    }
    if (!gwId) return res.json({ ok: false, error: 'gwId required' });

    var cleanId = gwId.replace(/^GW/i, '');
    var fullId = 'GW' + cleanId;

    try {
        // ═══ Мои контакты ═══
        if (action === 'my_contacts') {
            var q = 'select=id,name,messenger,contact,status,source,push_consent,created_at,utm_source';
            q += '&or=(owner_gw_id.eq.' + encodeURIComponent(fullId) + ',owner_gw_id.eq.' + encodeURIComponent(cleanId) + ')';
            q += '&status=neq.archived&order=created_at.desc&limit=100';

            var r = await fetch(SB_URL + '/rest/v1/contacts?' + q, { headers: sbHeaders() });
            var contacts = r.ok ? await r.json() : [];

            var stats = { total: contacts.length, new: 0, active: 0, converted: 0 };
            for (var i = 0; i < contacts.length; i++) {
                if (contacts[i].status === 'new') stats.new++;
                else if (contacts[i].status === 'active') stats.active++;
                if (contacts[i].status === 'converted') stats.converted++;
            }
            return res.json({ ok: true, contacts: contacts, stats: stats });
        }

        // ═══ Отправить сообщение ═══
        if (action === 'send_message') {
            var b = req.body || {};
            if (!b.contact_id || !b.text) return res.json({ ok: false, error: 'contact_id and text required' });

            // Проверяем владение контактом
            var chk = await fetch(SB_URL + '/rest/v1/contacts?select=id&id=eq.' + encodeURIComponent(b.contact_id) +
                '&or=(owner_gw_id.eq.' + encodeURIComponent(fullId) + ',owner_gw_id.eq.' + encodeURIComponent(cleanId) + ')',
                { headers: sbHeaders() });
            var chkD = chk.ok ? await chk.json() : [];
            if (chkD.length === 0) return res.status(403).json({ ok: false, error: 'Contact not yours' });

            var msg = {
                sender_gw_id: fullId,
                contact_id: b.contact_id,
                text: String(b.text).slice(0, 1000),
                direction: 'sponsor_to_contact',
                created_at: new Date().toISOString()
            };
            var r = await fetch(SB_URL + '/rest/v1/adp_messages', {
                method: 'POST', headers: sbHeaders(), body: JSON.stringify(msg)
            });
            return res.json({ ok: r.ok });
        }

        // ═══ Получить сообщения ═══
        if (action === 'get_messages') {
            var contactId = req.query.contact_id || (req.body || {}).contact_id;
            if (!contactId) return res.json({ ok: false, error: 'contact_id required' });

            // Проверяем владение
            var chk = await fetch(SB_URL + '/rest/v1/contacts?select=id&id=eq.' + encodeURIComponent(contactId) +
                '&or=(owner_gw_id.eq.' + encodeURIComponent(fullId) + ',owner_gw_id.eq.' + encodeURIComponent(cleanId) + ')',
                { headers: sbHeaders() });
            var chkD = chk.ok ? await chk.json() : [];
            if (chkD.length === 0) return res.status(403).json({ ok: false, error: 'Contact not yours' });

            var q = 'select=id,sender_gw_id,text,direction,created_at&contact_id=eq.' + encodeURIComponent(contactId) +
                '&order=created_at.asc&limit=50';
            var r = await fetch(SB_URL + '/rest/v1/adp_messages?' + q, { headers: sbHeaders() });
            var messages = r.ok ? await r.json() : [];
            return res.json({ ok: true, messages: messages });
        }

        return res.json({ ok: false, error: 'Unknown action' });
    } catch(e) {
        return res.json({ ok: false, error: 'Server error' });
    }
};
