/* ═══════════════════════════════════════════════════════
   GWAD.INK — i18n (Мультиязычность)
   
   Как добавить язык:
   1. Добавить блок T.xx = { ... } (скопировать T.en и перевести)
   2. Добавить кнопку в HTML: <button class="lang-btn" onclick="setLang('xx')">XX</button>
   
   Подключение: <script src="/js/i18n.js"></script>
   ═══════════════════════════════════════════════════════ */

window.T = {};
window.currentLang = 'ru';

// ═══ РУССКИЙ ═══
T.ru = {
    // Topbar
    topTitle:'Мой кабинет',

    // Tabs
    tabDash:'📊 Дашборд', tabPool:'📢 Рекламный пул', tabMkt:'💰 Маркетинг',
    tabTeam:'👥 Команда', tabChat:'💬 Чат', tabSet:'⚙️ Настройки',

    // Dashboard stats
    lblSpent:'Вложено', lblActive:'Активных', lblClicks:'Кликов',
    lblRegs:'Регистраций', lblConv:'Конверсия', lblTeam:'В команде',

    // Balance
    hdrBalance:'💰 Баланс',
    balUsdt:'USDT (маркетинг)', balUsdtSub:'Доход от рекламной программы',
    balAcad:'Академия CardGift', balAcadSub:'За обучение + рост команды',

    // TG bot
    tgBotTitle:'Активируй образовательный бот',
    tgBotDesc:'Ежедневное обучение — как управлять системой и выйти на доход от нескольких тысяч $ в месяц',

    // Role / Cards
    hdrRole:'🎯 Мой выбор', btnChange:'Изменить',
    hdrCampStats:'📈 Статистика кампаний',
    hdrCardGift:'🎁 Перейти в CardGift',
    cgiftDesc:'Генератор, CRM, блог, AI Studio, опросы, рассылки — все инструменты экосистемы',

    // Pool tab
    hdrLinks:'🔗 Мои ссылки',
    hdrPay:'💳 Оплатить рекламу (USDT)',
    lblPayAmount:'Сумма (USDT): мин. <span style="color:var(--orange)">$5</span>',
    lblCampaign:'Кампания:',
    btnPay:'🚀 Оплатить рекламу',
    hdrOrders:'📋 Мои заказы',

    // Marketing
    mktTotal:'Общий доход', mktMonth:'За месяц', mktRefs:'Рефералов в пуле',

    // Team / Chat / Settings
    hdrTeam:'👥 Партнёрская программа', hdrTeamSub:'9 уровней GlobalWay',
    hdrChat:'💬 Чат с менеджером',
    hdrSettings:'⚙️ Настройки профиля',
    setGwId:'GW ID', setWallet:'Адрес кошелька', setRoleLbl:'Роль', setLevelLbl:'Уровень доступа',

    // Wallet connect
    wcTitle:'Подключите кошелёк SafePal',
    wcDescShort:'Откройте в SafePal → Dapp браузер',
    wcBtn:'🔗 Подключить',
    wcLinks:'💡 Ещё нет SafePal? <a href="https://apps.apple.com/app/safepal-wallet/id1548297139" target="_blank">📱 iOS</a> <a href="https://play.google.com/store/apps/details?id=io.safepal.wallet" target="_blank">📱 Android</a>',

    // Wallet info
    wiWallet:'✅ Кошелёк', wiUsdt:'💰 Баланс USDT', wiBnb:'⛽ Баланс BNB', wiLevel:'📊 Уровень | GW ID',

    // Role modal
    roleWho:'🎯 Кто вы?',
    roleSub:'Выберите — это определит доступные инструменты. Можно изменить позже.',
    rClient:'Клиент', rClientD:'Хочу посмотреть. Ознакомиться с товарами и услугами. Ничего покупать не планирую.',
    rPartner:'Партнёр', rPartnerD:'Нужны деньги. 4 уровня + реклама от $5. Контакты приходят автоматически.',
    rLeader:'Приватный', rLeaderD:'Полный доступ (7 уровней) + управление видимостью кампаний. Первая $1,000 за 21 день.',
    rBusiness:'Предприниматель', rBusinessD:'У меня есть товар/услуга. Свой лендинг + CRM + рассылки. Система приводит клиентов.',

    // Guide modal
    guideTitle:'📖 Руководство',
    g1t:'📊 Дашборд', g1d:'Статистика, баланс, кампании. Переключайте вкладки для разных разделов.',
    g2t:'📢 Рекламный пул', g2d:'Ваши ссылки, оплата рекламы, заказы. Оплатите от $5 — контакты начнут приходить.',
    g3t:'👥 Команда', g3d:'Партнёры по GlobalWay (9 уровней). ID, спонсор, уровень доступа, кошелёк.',
    g4t:'💬 Чат', g4d:'Связь с менеджером. Задавайте вопросы — поможем настроить всё.',
    g5t:'🤖 Telegram бот', g5d:'Ежедневное обучение. Первый месяц — выход на доход от нескольких тысяч $.',
    g6t:'🎁 CardGift', g6d:'Центральная платформа — генератор, CRM, блог, AI Studio, опросы, академия.',
    guideClose:'Закрыть',

    // Levels modal
    levTitle:'📊 Мои уровни',
    levSub:'Покупка уровней открывает доступ к партнёрской программе.<br>Оплата в BNB через смарт-контракт NSSPlatform.',
    levClose:'Закрыть',
    levActive:'Активен', levBuy:'Купить', levLocked:'Заблокирован', levLevel:'Уровень',

    // Register modal
    regTitle:'Регистрация в GlobalWay',
    regSub:'Бесплатная регистрация привязывает кошелёк к экосистеме.<br>Оплачивается только газ (~0.001 BNB).',
    regConnected:'Кошелёк подключён',
    regSponsorLabel:'ID того, кто вас пригласил:',
    regSponsorFixed:'Привязан из реферальной ссылки',
    regSponsorHint:'💡 Спросите у того, кто дал вам ссылку',
    regBtn:'✅ Зарегистрироваться бесплатно', regLater:'Позже',
    regBenefits:'Что даёт регистрация:',
    regB1:'⚡ Участие в рекламном пуле AdPlatform',
    regB2:'💰 9 уровней партнёрской программы',
    regB3:'👥 Своя команда и реферальные ссылки',
    regB4:'🎁 Доступ ко всем продуктам экосистемы',

    // Team + Contacts
    teamDirect:'Прямых партнёров', teamTotal:'Всего в структуре',
    teamLine:'Линия', teamPeople:'чел.', teamEmpty:'Пусто', teamLoading:'Подключите кошелёк для просмотра команды',
    teamContacts:'📋 Контакты',
    ctTotal:'Всего', ctNew:'Новых', ctConverted:'Конвертировано',
    hdrContacts:'📋 Мои контакты', ctLoading:'Загрузка контактов...',

    // Visibility settings
    hdrVisibility:'👁️ Видимость кампаний для команды',
    visDesc:'Скрытые кампании не будут видны партнёрам, которые регистрируются по вашей реферальной ссылке. Параметр <code>?show=</code> добавляется к ссылкам автоматически.',
    visDiamond:'Diamond Club', visMetr:'Метр²', visCardgift:'CardGift',
    visShow:'показывать', visHide:'скрыто',
    visTip:'💡 Пример: если вы ведёте Diamond Club и не хотите показывать Метр² своей команде — снимите галочку. Ссылки обновятся автоматически.',

    // Cabinet-leader
    clTopTitle:'Кабинет лидера', clTopSub:'Создание и управление кампаниями',
    clLoading:'Подключение кошелька...',
    clAccessTitle:'🔗 Подключите кошелёк', clAccessDesc:'Нужна регистрация в GlobalWay', clAccessBtn:'Подключить кошелёк',
    clCreateTitle:'➕ Создать кампанию', clCreateSub:'Заполните форму — лендинг создастся автоматически',
    clCreateTip:'💡 <b>Подсказка:</b> После создания кампании появится лендинг gwad.ink/c/ваш-slug. Партнёры смогут оплачивать рекламу и получать рефералов.',
    clName:'Название кампании *',
    clSlug:'Slug (для URL) * <span style="color:var(--muted)">— только латиница, цифры, дефис</span>',
    clCreateBtn:'🚀 Создать кампанию', clMyCamps:'📋 Мои кампании',
    clDomains:'🌐 Варианты размещения лендинга',
};

// ═══ УКРАЇНСЬКА ═══
T.ua = {
    topTitle:'Мій кабінет',
    tabDash:'📊 Дашборд', tabPool:'📢 Рекламний пул', tabMkt:'💰 Маркетинг',
    tabTeam:'👥 Команда', tabChat:'💬 Чат', tabSet:'⚙️ Налаштування',
    lblSpent:'Вкладено', lblActive:'Активних', lblClicks:'Кліків',
    lblRegs:'Реєстрацій', lblConv:'Конверсія', lblTeam:'В команді',
    hdrBalance:'💰 Баланс',
    balUsdt:'USDT (маркетинг)', balUsdtSub:'Дохід від рекламної програми',
    balAcad:'Академія CardGift', balAcadSub:'За навчання + зростання команди',
    tgBotTitle:'Активуй освітнього бота',
    tgBotDesc:'Щоденне навчання — як керувати системою і вийти на дохід від кількох тисяч $ на місяць',
    hdrRole:'🎯 Мій вибір', btnChange:'Змінити',
    hdrCampStats:'📈 Статистика кампаній',
    hdrCardGift:'🎁 Перейти в CardGift',
    cgiftDesc:'Генератор, CRM, блог, AI Studio, опитування, розсилки — усі інструменти екосистеми',
    hdrLinks:'🔗 Мої посилання',
    hdrPay:'💳 Оплатити рекламу (USDT)',
    lblPayAmount:'Сума (USDT): мін. <span style="color:var(--orange)">$5</span>',
    lblCampaign:'Кампанія:', btnPay:'🚀 Оплатити рекламу',
    hdrOrders:'📋 Мої замовлення',
    mktTotal:'Загальний дохід', mktMonth:'За місяць', mktRefs:'Рефералів у пулі',
    hdrTeam:'👥 Партнерська програма', hdrTeamSub:'9 рівнів GlobalWay',
    hdrChat:'💬 Чат з менеджером', hdrSettings:'⚙️ Налаштування профілю',
    setGwId:'GW ID', setWallet:'Адреса гаманця', setRoleLbl:'Роль', setLevelLbl:'Рівень доступу',
    wcTitle:'Підключіть гаманець SafePal',
    wcDescShort:'Відкрийте в SafePal → Dapp браузер',
    wcBtn:'🔗 Підключити',
    wcLinks:'💡 Ще немає SafePal? <a href="https://apps.apple.com/app/safepal-wallet/id1548297139" target="_blank">📱 iOS</a> <a href="https://play.google.com/store/apps/details?id=io.safepal.wallet" target="_blank">📱 Android</a>',
    wiWallet:'✅ Гаманець', wiUsdt:'💰 Баланс USDT', wiBnb:'⛽ Баланс BNB', wiLevel:'📊 Рівень | GW ID',
    roleWho:'🎯 Хто ви?', roleSub:'Оберіть — це визначить доступні інструменти. Можна змінити пізніше.',
    rClient:'Клієнт', rClientD:'Хочу подивитися. Ознайомитися з товарами та послугами.',
    rPartner:'Партнер', rPartnerD:'Потрібні гроші. 4 рівні + реклама від $5. Контакти надходять автоматично.',
    rLeader:'Приватний', rLeaderD:'Повний доступ (7 рівнів) + управління видимістю кампаній. Перші $1,000 за 21 день.',
    rBusiness:'Підприємець', rBusinessD:'У мене є товар/послуга. Свій лендінг + CRM + розсилки. Система приводить клієнтів.',
    guideTitle:'📖 Посібник',
    g1t:'📊 Дашборд', g1d:'Статистика, баланс, кампанії. Перемикайте вкладки для різних розділів.',
    g2t:'📢 Рекламний пул', g2d:'Ваші посилання, оплата реклами, замовлення. Оплатіть від $5 — контакти почнуть надходити.',
    g3t:'👥 Команда', g3d:'Партнери по GlobalWay (9 рівнів). ID, спонсор, рівень доступу, гаманець.',
    g4t:'💬 Чат', g4d:'Зв\'язок з менеджером. Задавайте питання — допоможемо налаштувати все.',
    g5t:'🤖 Telegram бот', g5d:'Щоденне навчання. Перший місяць — вихід на дохід від кількох тисяч $.',
    g6t:'🎁 CardGift', g6d:'Центральна платформа — генератор, CRM, блог, AI Studio, опитування, академія.',
    guideClose:'Закрити',
    levTitle:'📊 Мої рівні',
    levSub:'Купівля рівнів відкриває доступ до партнерської програми.<br>Оплата в BNB через смарт-контракт NSSPlatform.',
    levClose:'Закрити',
    levActive:'Активний', levBuy:'Купити', levLocked:'Заблоковано', levLevel:'Рівень',
    regTitle:'Реєстрація в GlobalWay',
    regSub:'Безкоштовна реєстрація прив\'язує гаманець до екосистеми.<br>Оплачується лише газ (~0.001 BNB).',
    regConnected:'Гаманець підключено',
    regSponsorLabel:'ID того, хто вас запросив:', regSponsorFixed:'Прив\'язано з реферального посилання',
    regSponsorHint:'💡 Запитайте у того, хто дав вам посилання',
    regBtn:'✅ Зареєструватися безкоштовно', regLater:'Пізніше',
    regBenefits:'Що дає реєстрація:',
    regB1:'⚡ Участь у рекламному пулі AdPlatform',
    regB2:'💰 9 рівнів партнерської програми',
    regB3:'👥 Своя команда та реферальні посилання',
    regB4:'🎁 Доступ до всіх продуктів екосистеми',
    teamDirect:'Прямих партнерів', teamTotal:'Всього в структурі',
    teamLine:'Лінія', teamPeople:'осіб', teamEmpty:'Порожньо', teamLoading:'Підключіть гаманець для перегляду команди',
    teamContacts:'📋 Контакти',
    ctTotal:'Всього', ctNew:'Нових', ctConverted:'Конвертовано',
    hdrContacts:'📋 Мої контакти', ctLoading:'Завантаження контактів...',
    hdrVisibility:'👁️ Видимість кампаній для команди',
    visDesc:'Приховані кампанії не будуть видні партнерам, які реєструються за вашим реферальним посиланням. Параметр <code>?show=</code> додається до посилань автоматично.',
    visDiamond:'Diamond Club', visMetr:'Метр²', visCardgift:'CardGift',
    visShow:'показувати', visHide:'приховано',
    visTip:'💡 Приклад: якщо ви ведете Diamond Club і не хочете показувати Метр² своїй команді — зніміть галочку. Посилання оновляться автоматично.',
    clTopTitle:'Кабінет лідера', clTopSub:'Створення та управління кампаніями',
    clLoading:'Підключення гаманця...',
    clAccessTitle:'🔗 Підключіть гаманець', clAccessDesc:'Потрібна реєстрація в GlobalWay', clAccessBtn:'Підключити гаманець',
    clCreateTitle:'➕ Створити кампанію', clCreateSub:'Заповніть форму — лендінг створится автоматично',
    clCreateTip:'💡 <b>Підказка:</b> Після створення кампанії з\'явиться лендінг gwad.ink/c/ваш-slug. Партнери зможуть оплачувати рекламу та отримувати рефералів.',
    clName:'Назва кампанії *',
    clSlug:'Slug (для URL) * <span style="color:var(--muted)">— лише латиниця, цифри, дефіс</span>',
    clCreateBtn:'🚀 Створити кампанію', clMyCamps:'📋 Мої кампанії',
    clDomains:'🌐 Варіанти розміщення лендінгу',
};

// ═══ ENGLISH ═══
T.en = {
    topTitle:'My Dashboard',
    tabDash:'📊 Dashboard', tabPool:'📢 Ad Pool', tabMkt:'💰 Marketing',
    tabTeam:'👥 Team', tabChat:'💬 Chat', tabSet:'⚙️ Settings',
    lblSpent:'Invested', lblActive:'Active', lblClicks:'Clicks',
    lblRegs:'Registrations', lblConv:'Conversion', lblTeam:'In Team',
    hdrBalance:'💰 Balance',
    balUsdt:'USDT (marketing)', balUsdtSub:'Income from ad program',
    balAcad:'CardGift Academy', balAcadSub:'For training + team growth',
    tgBotTitle:'Activate educational bot',
    tgBotDesc:'Daily training — how to manage the system and reach income of several thousand $ per month',
    hdrRole:'🎯 My Choice', btnChange:'Change',
    hdrCampStats:'📈 Campaign Stats',
    hdrCardGift:'🎁 Go to CardGift',
    cgiftDesc:'Generator, CRM, blog, AI Studio, surveys, mailings — all ecosystem tools',
    hdrLinks:'🔗 My Links',
    hdrPay:'💳 Pay for Ads (USDT)',
    lblPayAmount:'Amount (USDT): min. <span style="color:var(--orange)">$5</span>',
    lblCampaign:'Campaign:', btnPay:'🚀 Pay for Ads',
    hdrOrders:'📋 My Orders',
    mktTotal:'Total Income', mktMonth:'This Month', mktRefs:'Referrals in Pool',
    hdrTeam:'👥 Partner Program', hdrTeamSub:'9 levels GlobalWay',
    hdrChat:'💬 Chat with Manager', hdrSettings:'⚙️ Profile Settings',
    setGwId:'GW ID', setWallet:'Wallet Address', setRoleLbl:'Role', setLevelLbl:'Access Level',
    wcTitle:'Connect SafePal Wallet',
    wcDescShort:'Open in SafePal → Dapp browser',
    wcBtn:'🔗 Connect',
    wcLinks:'💡 Don\'t have SafePal yet? <a href="https://apps.apple.com/app/safepal-wallet/id1548297139" target="_blank">📱 iOS</a> <a href="https://play.google.com/store/apps/details?id=io.safepal.wallet" target="_blank">📱 Android</a>',
    wiWallet:'✅ Wallet', wiUsdt:'💰 USDT Balance', wiBnb:'⛽ BNB Balance', wiLevel:'📊 Level | GW ID',
    roleWho:'🎯 Who are you?', roleSub:'Choose — this determines available tools. Can be changed later.',
    rClient:'Client', rClientD:'Just looking. Browsing products and services.',
    rPartner:'Partner', rPartnerD:'Need money. 4 levels + ads from $5. Contacts come automatically.',
    rLeader:'Private', rLeaderD:'Full access (7 levels) + campaign visibility management. First $1,000 in 21 days.',
    rBusiness:'Entrepreneur', rBusinessD:'I have a product/service. Own landing + CRM + mailings. System brings clients.',
    guideTitle:'📖 Guide',
    g1t:'📊 Dashboard', g1d:'Stats, balance, campaigns. Switch tabs for different sections.',
    g2t:'📢 Ad Pool', g2d:'Your links, ad payments, orders. Pay from $5 — contacts will start coming.',
    g3t:'👥 Team', g3d:'GlobalWay partners (9 levels). ID, sponsor, access level, wallet.',
    g4t:'💬 Chat', g4d:'Contact your manager. Ask questions — we\'ll help set up everything.',
    g5t:'🤖 Telegram Bot', g5d:'Daily training. First month — reaching income of several thousand $.',
    g6t:'🎁 CardGift', g6d:'Central platform — generator, CRM, blog, AI Studio, surveys, academy.',
    guideClose:'Close',
    levTitle:'📊 My Levels',
    levSub:'Buying levels unlocks access to the partner program.<br>Payment in BNB via NSSPlatform smart contract.',
    levClose:'Close',
    levActive:'Active', levBuy:'Buy', levLocked:'Locked', levLevel:'Level',
    regTitle:'Register in GlobalWay',
    regSub:'Free registration links your wallet to the ecosystem.<br>Only gas is paid (~0.001 BNB).',
    regConnected:'Wallet connected',
    regSponsorLabel:'ID of the person who invited you:', regSponsorFixed:'Linked from referral link',
    regSponsorHint:'💡 Ask the person who gave you the link',
    regBtn:'✅ Register for Free', regLater:'Later',
    regBenefits:'What registration gives:',
    regB1:'⚡ Participation in AdPlatform ad pool',
    regB2:'💰 9-level partner program',
    regB3:'👥 Your own team and referral links',
    regB4:'🎁 Access to all ecosystem products',
    teamDirect:'Direct Partners', teamTotal:'Total in Structure',
    teamLine:'Line', teamPeople:'ppl', teamEmpty:'Empty', teamLoading:'Connect wallet to view team',
    teamContacts:'📋 Contacts',
    ctTotal:'Total', ctNew:'New', ctConverted:'Converted',
    hdrContacts:'📋 My Contacts', ctLoading:'Loading contacts...',
    hdrVisibility:'👁️ Campaign Visibility for Team',
    visDesc:'Hidden campaigns won\'t be visible to partners who register through your referral link. The <code>?show=</code> parameter is added to links automatically.',
    visDiamond:'Diamond Club', visMetr:'Metr²', visCardgift:'CardGift',
    visShow:'visible', visHide:'hidden',
    visTip:'💡 Example: if you run Diamond Club and don\'t want to show Metr² to your team — uncheck it. Links will update automatically.',
    clTopTitle:'Leader Dashboard', clTopSub:'Create and manage campaigns',
    clLoading:'Connecting wallet...',
    clAccessTitle:'🔗 Connect Wallet', clAccessDesc:'GlobalWay registration required', clAccessBtn:'Connect Wallet',
    clCreateTitle:'➕ Create Campaign', clCreateSub:'Fill the form — landing page will be created automatically',
    clCreateTip:'💡 <b>Tip:</b> After creating a campaign, a landing page gwad.ink/c/your-slug will appear. Partners can pay for ads and get referrals.',
    clName:'Campaign Name *',
    clSlug:'Slug (for URL) * <span style="color:var(--muted)">— latin letters, digits, hyphens only</span>',
    clCreateBtn:'🚀 Create Campaign', clMyCamps:'📋 My Campaigns',
    clDomains:'🌐 Landing Page Options',
};

// ═══ setLang — переключение языка ═══
function setLang(lang) {
    if (!T[lang]) return;
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(function(b){ b.classList.remove('active'); });
    var activeBtn = document.querySelector('.lang-btn[onclick*="\'' + lang + '\'"]');
    if (activeBtn) activeBtn.classList.add('active');
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
        var key = el.getAttribute('data-i18n');
        if (T[lang][key]) el.innerHTML = T[lang][key];
    });
    document.documentElement.lang = lang === 'ua' ? 'uk' : lang;
    localStorage.setItem('gwad-lang', lang);
}

// ═══ Автоопределение языка ═══
(function() {
    var saved = localStorage.getItem('gwad-lang');
    if (saved && T[saved]) { setLang(saved); return; }
    var nav = (navigator.language || '').toLowerCase();
    if (nav.startsWith('uk')) setLang('ua');
    else if (nav.startsWith('en')) setLang('en');
    else setLang('ru');
})();

console.log('🌐 i18n loaded | lang:', currentLang);
