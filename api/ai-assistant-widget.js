/* =====================================================
   AI ASSISTANT WIDGET v1.0
   Плавающая кнопка + чат-панель
   
   Подключение: <script src="js/ai-assistant-widget.js"></script>
   Перед </body> на любой странице (partner.html, cabinet-leader.html)
   
   Требует: /api/ai-chat.js на сервере
   ===================================================== */

(function() {
    'use strict';

    var chatHistory = [];
    var isOpen = false;
    var isEnabled = localStorage.getItem('gwad-ai-chat') !== 'off';

    // ═══ СТИЛИ ═══
    var style = document.createElement('style');
    style.textContent = `
    .ai-chat-btn{position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#FFD700,#FFA000);border:none;cursor:pointer;box-shadow:0 4px 20px rgba(255,215,0,0.4);z-index:10000;transition:.3s;display:flex;align-items:center;justify-content:center;font-size:24px}
    .ai-chat-btn:hover{transform:scale(1.1);box-shadow:0 6px 25px rgba(255,215,0,0.6)}
    .ai-chat-btn.off{background:#333;box-shadow:none;opacity:.5}
    .ai-chat-btn.off:hover{opacity:.7}
    .ai-chat-panel{position:fixed;bottom:90px;right:16px;width:360px;max-width:calc(100vw - 32px);height:500px;max-height:calc(100vh - 120px);background:#141428;border:1px solid #2a2a4a;border-radius:20px;z-index:10001;display:none;flex-direction:column;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,.6);animation:chatUp .3s ease}
    .ai-chat-panel.show{display:flex}
    @keyframes chatUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    .ai-chat-head{padding:14px 16px;background:linear-gradient(135deg,#1a1040,#141428);border-bottom:1px solid #2a2a4a;display:flex;align-items:center;justify-content:space-between}
    .ai-chat-head-left{display:flex;align-items:center;gap:10px}
    .ai-chat-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#FFD700,#FFA000);display:flex;align-items:center;justify-content:center;font-size:18px}
    .ai-chat-name{font-size:14px;font-weight:700;color:#fff}
    .ai-chat-status{font-size:10px;color:#10b981}
    .ai-chat-close{width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,0.05);border:none;color:#888;font-size:14px;cursor:pointer}
    .ai-chat-body{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}
    .ai-msg{max-width:85%;padding:10px 14px;border-radius:16px;font-size:13px;line-height:1.6;word-wrap:break-word}
    .ai-msg.bot{background:#1e1e3a;color:#e0e0e0;border-bottom-left-radius:4px;align-self:flex-start}
    .ai-msg.user{background:rgba(255,215,0,0.12);color:#fff;border-bottom-right-radius:4px;align-self:flex-end}
    .ai-msg.typing{color:#888;font-style:italic}
    .ai-chat-input{padding:10px 12px;border-top:1px solid #2a2a4a;display:flex;gap:8px;background:#0e0e20}
    .ai-chat-input input{flex:1;padding:10px 14px;background:#1e1e3a;border:1px solid #2a2a4a;border-radius:12px;color:#fff;font-size:13px;outline:none}
    .ai-chat-input input:focus{border-color:#FFD700}
    .ai-chat-input button{width:40px;height:40px;border-radius:50%;background:#FFD700;border:none;color:#000;font-size:16px;cursor:pointer;flex-shrink:0;transition:.2s}
    .ai-chat-input button:hover{background:#FFA000}
    .ai-chat-input button:disabled{opacity:.4;cursor:not-allowed}
    .ai-chat-toggle{position:fixed;bottom:86px;right:28px;z-index:10000;font-size:9px;color:#555;cursor:pointer;background:rgba(0,0,0,.6);padding:2px 8px;border-radius:10px}
    .ai-chat-toggle:hover{color:#fff}
    .ai-quick{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
    .ai-quick-btn{padding:6px 12px;border-radius:20px;background:rgba(255,215,0,0.08);border:1px solid rgba(255,215,0,0.2);color:#FFD700;font-size:11px;cursor:pointer;transition:.2s}
    .ai-quick-btn:hover{background:rgba(255,215,0,0.15)}
    @media(max-width:480px){.ai-chat-panel{right:0;bottom:0;width:100%;height:100%;max-height:100vh;border-radius:0}.ai-chat-btn{bottom:16px;right:16px;width:48px;height:48px;font-size:20px}}
    `;
    document.head.appendChild(style);

    // ═══ HTML ═══
    function createUI() {
        // Кнопка
        var btn = document.createElement('button');
        btn.id = 'ai-chat-btn';
        btn.className = 'ai-chat-btn' + (isEnabled ? '' : ' off');
        btn.innerHTML = isEnabled ? '🤖' : '💤';
        btn.title = 'AI Ассистент';
        btn.onclick = toggleChat;
        document.body.appendChild(btn);

        // Toggle on/off
        var toggle = document.createElement('div');
        toggle.className = 'ai-chat-toggle';
        toggle.textContent = isEnabled ? 'вкл' : 'выкл';
        toggle.id = 'ai-chat-toggle';
        toggle.onclick = function(e) {
            e.stopPropagation();
            isEnabled = !isEnabled;
            localStorage.setItem('gwad-ai-chat', isEnabled ? 'on' : 'off');
            btn.className = 'ai-chat-btn' + (isEnabled ? '' : ' off');
            btn.innerHTML = isEnabled ? '🤖' : '💤';
            toggle.textContent = isEnabled ? 'вкл' : 'выкл';
            if (!isEnabled && isOpen) closeChat();
        };
        document.body.appendChild(toggle);

        // Панель
        var panel = document.createElement('div');
        panel.id = 'ai-chat-panel';
        panel.className = 'ai-chat-panel';
        panel.innerHTML = 
            '<div class="ai-chat-head">' +
                '<div class="ai-chat-head-left">' +
                    '<div class="ai-chat-avatar">🤖</div>' +
                    '<div><div class="ai-chat-name">AI Ассистент</div><div class="ai-chat-status">● Онлайн</div></div>' +
                '</div>' +
                '<button class="ai-chat-close" onclick="document.getElementById(\'ai-chat-panel\').classList.remove(\'show\')">&times;</button>' +
            '</div>' +
            '<div class="ai-chat-body" id="ai-chat-body"></div>' +
            '<div class="ai-chat-input">' +
                '<input id="ai-chat-input" placeholder="Напишите вопрос..." onkeydown="if(event.key===\'Enter\')document.getElementById(\'ai-chat-send\').click()">' +
                '<button id="ai-chat-send" onclick="window._aiSendMsg()">➤</button>' +
            '</div>';
        document.body.appendChild(panel);

        // Приветствие
        showWelcome();
    }

    function showWelcome() {
        var body = document.getElementById('ai-chat-body');
        if (!body) return;
        body.innerHTML = '';
        addBotMsg('Привет! 👋 Я AI-ассистент GlobalWay.\n\nМогу помочь разобраться в системе, ответить на вопросы или подсказать следующий шаг.\n\nО чём хочешь узнать?');
        
        // Quick buttons
        var quick = document.createElement('div');
        quick.className = 'ai-quick';
        var btns = ['Как начать?', 'Как заработать?', 'Что такое SafePal?', 'Как оплатить рекламу?', 'Где мои контакты?'];
        btns.forEach(function(text) {
            var b = document.createElement('button');
            b.className = 'ai-quick-btn';
            b.textContent = text;
            b.onclick = function() { sendMessage(text); };
            quick.appendChild(b);
        });
        body.appendChild(quick);
    }

    function toggleChat() {
        if (!isEnabled) return;
        var panel = document.getElementById('ai-chat-panel');
        isOpen = !isOpen;
        panel.classList.toggle('show', isOpen);
        if (isOpen) {
            setTimeout(function() { document.getElementById('ai-chat-input').focus(); }, 300);
        }
    }

    function closeChat() {
        isOpen = false;
        document.getElementById('ai-chat-panel').classList.remove('show');
    }

    function addBotMsg(text) {
        var body = document.getElementById('ai-chat-body');
        var div = document.createElement('div');
        div.className = 'ai-msg bot';
        div.textContent = text;
        body.appendChild(div);
        body.scrollTop = body.scrollHeight;
        return div;
    }

    function addUserMsg(text) {
        var body = document.getElementById('ai-chat-body');
        var div = document.createElement('div');
        div.className = 'ai-msg user';
        div.textContent = text;
        body.appendChild(div);
        body.scrollTop = body.scrollHeight;
    }

    async function sendMessage(text) {
        if (!text) {
            text = document.getElementById('ai-chat-input').value.trim();
        }
        if (!text) return;
        document.getElementById('ai-chat-input').value = '';

        // Убираем quick buttons
        var quicks = document.querySelectorAll('.ai-quick');
        quicks.forEach(function(q) { q.remove(); });

        addUserMsg(text);
        chatHistory.push({ role: 'user', text: text });

        var typing = addBotMsg('Думаю...');
        typing.classList.add('typing');

        var sendBtn = document.getElementById('ai-chat-send');
        sendBtn.disabled = true;

        try {
            var wallet = '';
            if (window.GwadContract && window.GwadContract.walletAddress) wallet = window.GwadContract.walletAddress;
            else if (window.walletAddress) wallet = window.walletAddress;
            else wallet = localStorage.getItem('gwad-wallet') || '0x0000000000000000000000000000000000000000';

            var r = await fetch('/api/ai-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Wallet-Address': wallet },
                body: JSON.stringify({ message: text, history: chatHistory.slice(-10) })
            });
            var d = await r.json();

            typing.remove();

            if (d.ok && d.reply) {
                addBotMsg(d.reply);
                chatHistory.push({ role: 'assistant', text: d.reply });
            } else {
                addBotMsg('Извините, не смог ответить. Попробуйте ещё раз.');
            }
        } catch(e) {
            typing.remove();
            addBotMsg('Ошибка соединения. Проверьте интернет.');
        }

        sendBtn.disabled = false;
        document.getElementById('ai-chat-input').focus();
    }

    window._aiSendMsg = sendMessage;

    // ═══ INIT ═══
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createUI);
    } else {
        createUI();
    }

    console.log('🤖 AI Assistant Widget loaded');
})();
