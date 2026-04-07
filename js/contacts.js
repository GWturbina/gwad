// api/contacts.js — gwad.ink Contacts API
// Читает контакты из Supabase таблицы contacts по owner_gw_id

var SB_URL = process.env.SUPABASE_URL;
var SB_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

function sbHeaders() {
    return {
        'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY,
        'Content-Type': 'application/json', 'Prefer': 'return=representation'
    };
}

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Wallet-Address');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (!SB_URL || !SB_KEY) return res.json({ ok: false, error: 'DB not configured' });

    var action = req.method === 'GET' ? req.query.action : (req.body || {}).action;
    var gwId = req.method === 'GET' ? req.query.gwId : (req.body || {}).gwId;

    if (!gwId) return res.json({ ok: false, error: 'gwId required' });

    // Нормализуем GW ID
    var cleanId = gwId.replace(/^GW/i, '');
    var fullId = 'GW' + cleanId;

    try {
        // ═══ Мои контакты ═══
        if (action === 'my_contacts') {
            var q = 'select=id,name,messenger,contact,status,source,push_consent,is_converted,created_at,updated_at';
            q += '&or=(owner_gw_id.eq.' + fullId + ',owner_gw_id.eq.' + cleanId + ')';
            q += '&status=neq.archived';
            q += '&order=created_at.desc';
            q += '&limit=100';

            var r = await fetch(SB_URL + '/rest/v1/contacts?' + q, { headers: sbHeaders() });
            var contacts = r.ok ? await r.json() : [];

            // Статистика
            var stats = { total: contacts.length, new: 0, active: 0, converted: 0 };
            for (var i = 0; i < contacts.length; i++) {
                if (contacts[i].status === 'new') stats.new++;
                else if (contacts[i].status === 'active') stats.active++;
                if (contacts[i].is_converted) stats.converted++;
            }

            return res.json({ ok: true, contacts: contacts, stats: stats });
        }

        // ═══ Отправить сообщение контакту ═══
        if (action === 'send_message') {
            var b = req.body || {};
            if (!b.contact_id || !b.text) return res.json({ ok: false, error: 'contact_id and text required' });

            var msg = {
                sender_gw_id: fullId,
                contact_id: b.contact_id,
                text: b.text.slice(0, 1000),
                direction: 'sponsor_to_contact',
                created_at: new Date().toISOString()
            };

            var r = await fetch(SB_URL + '/rest/v1/adp_messages', {
                method: 'POST', headers: sbHeaders(), body: JSON.stringify(msg)
            });

            return res.json({ ok: r.ok });
        }

        // ═══ Получить сообщения для контакта ═══
        if (action === 'get_messages') {
            var contactId = req.query.contact_id || (req.body || {}).contact_id;
            if (!contactId) return res.json({ ok: false, error: 'contact_id required' });

            var q = 'select=id,sender_gw_id,text,direction,created_at';
            q += '&contact_id=eq.' + contactId;
            q += '&order=created_at.asc';
            q += '&limit=50';

            var r = await fetch(SB_URL + '/rest/v1/adp_messages?' + q, { headers: sbHeaders() });
            var messages = r.ok ? await r.json() : [];

            return res.json({ ok: true, messages: messages });
        }

        return res.json({ ok: false, error: 'Unknown action' });
    } catch(e) {
        return res.json({ ok: false, error: e.message });
    }
};
