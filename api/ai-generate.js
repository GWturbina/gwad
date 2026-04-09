// api/ai-generate.js — gwad.ink AI Campaign Generator
// Принимает описание бизнеса → Claude создаёт полную кампанию
// Требует: ANTHROPIC_API_KEY в env

module.exports = async function handler(req, res) {
    var origin = req.headers.origin || '';
    if (['gwad.ink','cgift.club'].some(function(d){return origin.includes(d)}) || origin.includes('vercel.app')) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Wallet-Address');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'POST only' });

    var wallet = (req.headers['x-wallet-address'] || '').toLowerCase().trim();
    if (!wallet || wallet.length !== 42) {
        return res.status(401).json({ ok: false, error: 'Wallet required' });
    }

    var API_KEY = process.env.ANTHROPIC_API_KEY;
    if (!API_KEY) return res.json({ ok: false, error: 'AI not configured. Add ANTHROPIC_API_KEY.' });

    var body = req.body || {};
    var description = String(body.description || '').slice(0, 3000);
    var lang = body.lang || 'ru';

    if (!description || description.length < 20) {
        return res.json({ ok: false, error: 'Опишите бизнес подробнее (минимум 20 символов)' });
    }

    var langMap = { ru: 'русском', ua: 'украинском', en: 'английском' };
    var langName = langMap[lang] || 'русском';

    var systemPrompt = `Ты — маркетолог-копирайтер для рекламной платформы GlobalWay AdPlatform (gwad.ink).

Твоя задача: на основе описания бизнеса создать ПОЛНУЮ рекламную кампанию.

ВАЖНО:
- Пиши на ${langName} языке
- Тон: вдохновляющий но не агрессивный
- Акцент на "Лень — двигатель прогресса" (система работает за тебя)
- Подчеркивай: блокчейн, контакты навсегда твои, автоматика
- Не упоминай конкурентов
- Все суммы в $

Ответь ТОЛЬКО валидным JSON (без markdown, без \`\`\`, без пояснений) в следующей структуре:

{
  "name": "Название кампании (2-4 слова)",
  "slug": "url-slug-latin-only",
  "description": "Описание для лендинга (2-3 абзаца, 150-200 слов)",
  "features": "emoji|текст\\nemoji|текст\\nemoji|текст\\nemoji|текст\\nemoji|текст\\nemoji|текст",
  "cta_text": "Текст кнопки CTA",
  "primary_color": "#hex цвет темы",
  "push_sequence": [
    {"day":0,"title":"Заголовок push","body":"Текст push (до 60 символов)"},
    {"day":1,"title":"...","body":"..."},
    {"day":2,"title":"...","body":"..."},
    {"day":3,"title":"...","body":"..."},
    {"day":4,"title":"...","body":"..."},
    {"day":5,"title":"...","body":"..."},
    {"day":6,"title":"...","body":"..."}
  ],
  "telegram_sequence": [
    {"day":0,"text":"Сообщение день 0 (100-150 слов, markdown *bold*, ссылки [текст](url))"},
    {"day":1,"text":"..."},
    {"day":2,"text":"..."},
    {"day":3,"text":"..."},
    {"day":4,"text":"..."},
    {"day":5,"text":"..."},
    {"day":6,"text":"..."}
  ],
  "survey": {
    "title": "Название опроса",
    "questions": [
      {"text":"Вопрос 1","options":["Вариант A","Вариант B","Вариант C","Вариант D"]},
      {"text":"Вопрос 2","options":["...","...","...","..."]},
      {"text":"Вопрос 3","options":["...","...","...","..."]},
      {"text":"Вопрос 4","options":["...","...","...","..."]},
      {"text":"Вопрос 5","options":["...","...","...","..."]}
    ]
  },
  "blog_posts": [
    {"title":"Заголовок статьи 1","summary":"Краткое описание","aiPrompt":"Промпт для генерации полной статьи (50-80 слов)"},
    {"title":"Заголовок 2","summary":"...","aiPrompt":"..."},
    {"title":"Заголовок 3","summary":"...","aiPrompt":"..."},
    {"title":"Заголовок 4","summary":"...","aiPrompt":"..."}
  ]
}`;

    try {
        var apiRes = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 4000,
                system: systemPrompt,
                messages: [
                    { role: 'user', content: 'Вот описание бизнеса:\n\n' + description + '\n\nСоздай полную кампанию. Ответь ТОЛЬКО JSON.' }
                ]
            })
        });

        if (!apiRes.ok) {
            var errText = await apiRes.text();
            console.error('Anthropic API error:', apiRes.status, errText);
            return res.json({ ok: false, error: 'AI error: ' + apiRes.status });
        }

        var data = await apiRes.json();
        var text = '';
        for (var i = 0; i < data.content.length; i++) {
            if (data.content[i].type === 'text') text += data.content[i].text;
        }

        // Очистка от markdown если AI вдруг добавил
        text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

        var campaign;
        try {
            campaign = JSON.parse(text);
        } catch(e) {
            console.error('JSON parse error:', e.message, 'Raw:', text.slice(0, 200));
            return res.json({ ok: false, error: 'AI вернул некорректный ответ. Попробуйте ещё раз.', raw: text.slice(0, 500) });
        }

        return res.json({ ok: true, campaign: campaign });

    } catch(e) {
        console.error('AI generate error:', e);
        return res.json({ ok: false, error: 'Ошибка генерации: ' + e.message });
    }
};
