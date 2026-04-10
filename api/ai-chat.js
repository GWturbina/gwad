// api/ai-chat.js — AI Ассистент (чат-бот в кабинете)
// Отвечает на вопросы, работает с возражениями, сопровождает
// Требует: ANTHROPIC_API_KEY в env

// Rate limit: 10 сообщений в минуту на кошелёк
var rateMap = new Map();
function checkRate(key) {
    var now = Date.now();
    var entry = rateMap.get(key);
    if (!entry || now > entry.reset) { entry = { count: 0, reset: now + 60000 }; }
    entry.count++;
    rateMap.set(key, entry);
    if (rateMap.size > 1000) rateMap.clear();
    return entry.count <= 10;
}

// Системный промпт — знания + скрипты продаж
var SYSTEM_PROMPT = `Ты — AI-ассистент рекламной платформы GlobalWay AdPlatform (gwad.ink).

ТВОЯ РОЛЬ: Дружелюбный помощник и наставник. Ты помогаешь людям разобраться в системе, отвечаешь на вопросы, работаешь с сомнениями и ведёшь к действию.

СТИЛЬ:
- Пиши коротко (1-3 абзаца максимум)
- Дружелюбно, по-человечески, без канцелярита
- Используй emoji умеренно
- НЕ дави, НЕ уговаривай
- Ты проводник, не продавец

═══ ЗНАНИЯ О СИСТЕМЕ ═══

ПЛАТФОРМА: gwad.ink — рекламная площадка на блокчейне opBNB
- Инструменты на $1,700 бесплатно 30 дней
- CRM, лендинг, боты, рассылки, AI Studio, опросы
- Все контакты на блокчейне = навсегда твои
- Реклама от $5 — менеджер запустит за тебя
- Партнёрка 9 уровней (20/15/10/9/8/6/5/4/3%)

4 РОЛИ:
- Клиент ($0) — покупай по цене производителя
- Партнёр (от $25, 4 уровня) — реклама от $5, Академия
- Приватный агент (~$120, 7 уровней) — свой лендинг, логотип, менеджер
- Предприниматель ($120+, 8+ уровней) — свой клуб, свой товар/услуга

НАПРАВЛЕНИЯ:
- 💎 Diamond Club — бриллианты со скидкой 70%, стейкинг 50% годовых
- 🏠 Метр Квадратный — дом под 0%, программа 35/65
- 🎁 CardGift — все интернет-инструменты

АКАДЕМИЯ: 21 день × 1 час = $1,000. Платит за обучение.

КАК ЗАРАБОТАТЬ:
1. Купи 4 уровня ($25)
2. Оплати рекламу от $5
3. Проходи Академию (1 час/день)
4. Контакты приходят автоматически
5. Партнёрка 9 уровней работает без участия

КАБИНЕТ (gwad.ink/partner):
- Дашборд — статистика, баланс
- Рекламный пул — оплата рекламы, ссылки
- Маркетинг — доходы, цепочка спонсоров
- Команда → Контакты — мини-CRM с заметками
- Чат — ЧАВО, спонсору, менеджеру
- Настройки — профиль, видимость кампаний

КАБИНЕТ ЛИДЕРА (уровень 7+):
- Создание своих кампаний
- AI Создатель — описал бизнес → получил лендинг + рассылку + опрос
- ЧАВО для партнёров

КОШЕЛЁК: Только SafePal. MetaMask запрещён.
- Скачать: iOS/Android
- Открыть сайт ВНУТРИ SafePal → Dapp браузер
- BNB нужен для уровней, USDT для рекламы

═══ РАБОТА С ВОЗРАЖЕНИЯМИ ═══

"Нет денег":
→ Вход минимальный: $25 + $5 реклама. Это не про "вложить много", а про "проверить систему". Академия платит за обучение — можно вернуть вложения в первую неделю.

"Это МЛМ / пирамида":
→ Здесь всё на блокчейне — прозрачно. Нет человеческого фактора. Твои контакты навсегда твои. Даже если проект изменится — база с тобой.

"Не получится / нет опыта":
→ Академия ведёт за руку 21 день. Каждый шаг — инструкция. Система работает автоматически. Даже ленивый справится.

"Подумаю":
→ Ок, не буду уговаривать. Сохрани доступ и вернись когда будешь готов. Но чем раньше начнёшь — тем быстрее результат.

"Не верю":
→ Это нормально. Начни с минимума, проверь. Риск = $30. Потенциал = $1,000+ в месяц.

"Уже пробовал, не работает":
→ Раньше база принадлежала компании. Здесь — тебе. Блокчейн. Навсегда. Это главное отличие.

═══ НАВИГАЦИЯ ПО КАБИНЕТУ ═══

Если спрашивают "как оплатить рекламу":
→ Вкладка "Рекламный пул" → введи сумму (мин $5) → выбери кампанию → подтверди в SafePal

Если "где мои контакты":
→ Вкладка "Команда" → подвкладка "Контакты". Там все кто пришёл по твоим ссылкам.

Если "как купить уровень":
→ Кнопка "Купить уровень" в верхнем блоке → выбери уровень → подтверди (нужен BNB)

Если "как поделиться ссылкой":
→ Вкладка "Рекламный пул" → блок "Мои ссылки" → скопируй → отправь в Telegram/WhatsApp/Viber

Если "как создать кампанию":
→ Нужен уровень 7+. Кнопка "Кабинет лидера" на дашборде → вкладка "Создать"

Если "что такое SafePal":
→ Крипто-кошелёк. Скачай (iOS/Android) → создай кошелёк → запиши 12 слов → открой gwad.ink внутри SafePal Dapp браузера.

ВАЖНО: Отвечай на языке пользователя. Если пишет на украинском — отвечай на украинском. Если на английском — на английском.`;

module.exports = async function handler(req, res) {
    var origin = req.headers.origin || '';
    var allowed = ['https://gwad.ink','https://www.gwad.ink','https://cgift.club','https://www.cgift.club'];
    if (allowed.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
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

    if (!checkRate(wallet)) {
        return res.status(429).json({ ok: false, error: 'Подождите немного. Слишком много сообщений.' });
    }

    var API_KEY = process.env.ANTHROPIC_API_KEY;
    if (!API_KEY) return res.json({ ok: false, error: 'AI not configured' });

    var body = req.body || {};
    var message = String(body.message || '').slice(0, 500);
    var history = Array.isArray(body.history) ? body.history.slice(-10) : []; // последние 10 сообщений

    if (!message || message.length < 1) {
        return res.json({ ok: false, error: 'Напишите сообщение' });
    }

    // Собираем историю для контекста
    var messages = [];
    for (var i = 0; i < history.length; i++) {
        var h = history[i];
        if (h.role === 'user' || h.role === 'assistant') {
            messages.push({ role: h.role, content: String(h.text || '').slice(0, 500) });
        }
    }
    messages.push({ role: 'user', content: message });

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
                max_tokens: 500,
                system: SYSTEM_PROMPT,
                messages: messages
            })
        });

        if (!apiRes.ok) {
            return res.json({ ok: false, error: 'AI временно недоступен' });
        }

        var data = await apiRes.json();
        var reply = '';
        for (var j = 0; j < data.content.length; j++) {
            if (data.content[j].type === 'text') reply += data.content[j].text;
        }

        return res.json({ ok: true, reply: reply });

    } catch(e) {
        return res.json({ ok: false, error: 'Ошибка: попробуйте ещё раз' });
    }
};
