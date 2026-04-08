/* ═══════════════════════════════════════════════════════════
   GWAD.INK — AdPool Contract Service Layer v1.0
   
   Функции:
   - connectWallet()      — подключение SafePal/MetaMask
   - payForAd()           — оплата рекламы (approve → pay → record)
   - createCampaign()     — создание кампании (для лидера)
   - getMyStats()         — статистика партнёра
   - getMarketingEarnings() — доходы от маркетинга
   - getUSDTBalance()     — баланс USDT
   - getCampaigns()       — список кампаний
   
   Зависимости: ethers.js, ad-pool-abi.js, addresses.js
   ═══════════════════════════════════════════════════════════ */

var GwadContract = {

    provider: null,
    signer: null,
    walletAddress: '',
    gwId: '',
    gwIdNumeric: 0,
    connected: false,

    ADDR: window.GWAD_ADDRESSES || {},
    API: (window.GWAD_API && window.GWAD_API.adPlatform) || 'https://cgift.club/api/ad-platform',
    AD_POOL_ABI: window.AD_POOL_ABI || [],
    USDT_ABI: window.USDT_ABI || [],

    // ═══════════════════════════════════════════════════════════
    // WALLET CONNECTION
    // ═══════════════════════════════════════════════════════════

    async connectWallet() {
        var eth = window.ethereum || (window.safepal && window.safepal.ethereum);
        if (!eth) {
            this.showError('Установите SafePal или MetaMask');
            return false;
        }

        try {
            var accounts = await eth.request({ method: 'eth_requestAccounts' });
            if (!accounts || !accounts.length) return false;

            this.provider = new ethers.providers.Web3Provider(eth);
            this.signer = this.provider.getSigner();
            this.walletAddress = accounts[0].toLowerCase();
            this.connected = true;

            // Проверяем сеть (opBNB = 204)
            var network = await this.provider.getNetwork();
            if (network.chainId !== this.ADDR.CHAIN_ID) {
                try {
                    await eth.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0x' + (this.ADDR.CHAIN_ID).toString(16) }]
                    });
                    this.provider = new ethers.providers.Web3Provider(eth);
                    this.signer = this.provider.getSigner();
                } catch(e) {
                    this.showError('Переключите сеть на opBNB (Chain ID: 204)');
                }
            }

            console.log('✅ Wallet connected:', this.walletAddress);
            return true;
        } catch(e) {
            console.error('Wallet connect error:', e);
            this.showError('Ошибка подключения: ' + (e.message || e));
            return false;
        }
    },

    // Тихое подключение (без popup если уже подключён)
    async silentConnect() {
        var eth = window.ethereum || (window.safepal && window.safepal.ethereum);
        if (!eth) return false;
        try {
            var accounts = await eth.request({ method: 'eth_accounts' });
            if (accounts && accounts.length) {
                this.provider = new ethers.providers.Web3Provider(eth);
                this.signer = this.provider.getSigner();
                this.walletAddress = accounts[0].toLowerCase();
                this.connected = true;
                return true;
            }
        } catch(e) {}
        return false;
    },

    // ═══════════════════════════════════════════════════════════
    // CONTRACTS
    // ═══════════════════════════════════════════════════════════

    getAdPoolContract() {
        if (!this.signer) throw new Error('Кошелёк не подключён');
        return new ethers.Contract(this.ADDR.AdPoolContract, this.AD_POOL_ABI, this.signer);
    },

    getAdPoolRead() {
        var rpc = new ethers.providers.JsonRpcProvider(this.ADDR.RPC_URL);
        return new ethers.Contract(this.ADDR.AdPoolContract, this.AD_POOL_ABI, rpc);
    },

    getUSDTContract() {
        if (!this.signer) throw new Error('Кошелёк не подключён');
        return new ethers.Contract(this.ADDR.USDT, this.USDT_ABI, this.signer);
    },

    getUSDTRead() {
        var rpc = new ethers.providers.JsonRpcProvider(this.ADDR.RPC_URL);
        return new ethers.Contract(this.ADDR.USDT, this.USDT_ABI, rpc);
    },

    // ═══════════════════════════════════════════════════════════
    // PAY FOR AD — Главная функция оплаты
    // ═══════════════════════════════════════════════════════════

    /**
     * Полный цикл оплаты рекламы:
     * 1. Проверка баланса USDT
     * 2. Approve USDT → AdPoolContract
     * 3. payForAd() в контракте
     * 4. Запись в Supabase через API
     * 
     * @param {number} campaignId — ID кампании в контракте (1, 2, 3...)
     * @param {number} amountUSD — сумма в долларах ($5, $10, $50...)
     * @param {function} onStatus — callback для обновления UI
     * @returns {object} {ok, txHash, error}
     */
    async payForAd(campaignId, amountUSD, onStatus) {
        if (!this.connected) { return { ok: false, error: 'Кошелёк не подключён' }; }
        if (!this.gwIdNumeric) { return { ok: false, error: 'Нет GW ID' }; }
        if (amountUSD < 5) { return { ok: false, error: 'Минимум $5' }; }

        var status = onStatus || function() {};
        console.log('📢 payForAd:', { campaignId: campaignId, amount: amountUSD, gwId: this.gwIdNumeric, wallet: this.walletAddress });

        try {
            var amount = ethers.utils.parseEther(amountUSD.toString());
            var usdt = this.getUSDTContract();
            var adPool = this.getAdPoolContract();

            // 1. Баланс
            status('💰 Проверка баланса...');
            console.log('📢 balanceOf...');
            var balance = await usdt.balanceOf(this.walletAddress);
            console.log('📢 Balance:', ethers.utils.formatEther(balance));
            if (balance.lt(amount)) {
                return { ok: false, error: 'Недостаточно USDT. Баланс: $' + ethers.utils.formatEther(balance) };
            }

            // 2. Allowance
            console.log('📢 allowance...');
            var allowance = await usdt.allowance(this.walletAddress, this.ADDR.AdPoolContract);
            console.log('📢 Allowance:', ethers.utils.formatEther(allowance));
            if (allowance.lt(amount)) {
                status('🔐 Подтвердите APPROVE в кошельке...');
                var approveTx = await usdt.approve(this.ADDR.AdPoolContract, ethers.constants.MaxUint256, { gasLimit: 100000 });
                status('⏳ Ожидание approve...');
                await approveTx.wait();
                console.log('✅ Approve TX:', approveTx.hash);
            }

            // 3. payForAd
            status('💳 Подтвердите ОПЛАТУ в кошельке...');
            console.log('📢 payForAd tx...');
            var payTx = await adPool.payForAd(campaignId, this.gwIdNumeric, amount, { gasLimit: 3500000 });
            status('⏳ Ожидание подтверждения...');
            await payTx.wait();
            console.log('✅ PayForAd TX:', payTx.hash);

            // 4. Supabase
            status('📝 Сохранение...');
            try {
                await this.apiPost('record_payment', {
                    gw_id: this.gwId, gwId: this.gwIdNumeric,
                    wallet_address: this.walletAddress,
                    campaign_id: campaignId, campaignId: campaignId,
                    amount_usdt: amountUSD, amount: amountUSD,
                    tx_hash: payTx.hash, txHash: payTx.hash,
                    days_total: Math.max(7, Math.floor(amountUSD / 5) * 7),
                    weight: amountUSD,
                });
            } catch(e) { console.warn('Supabase record failed:', e); }

            status('✅ Оплата прошла!');
            return { ok: true, txHash: payTx.hash };

        } catch(e) {
            console.error('❌ PayForAd error:', e);
            var msg = e.reason || e.message || 'Неизвестная ошибка';
            if (msg.includes('user rejected')) msg = 'Вы отменили транзакцию';
            if (msg.includes('Not registered')) msg = 'Кошелёк не зарегистрирован в GlobalWay';
            if (msg.includes('insufficient')) msg = 'Недостаточно средств (USDT или BNB на газ)';
            status('❌ ' + msg);
            return { ok: false, error: msg };
        }
    },

    // ═══════════════════════════════════════════════════════════
    // CREATE CAMPAIGN — Для лидеров
    // ═══════════════════════════════════════════════════════════

    async createCampaign(name, budgetWallet, managerWallet, onStatus) {
        if (!this.connected) return { ok: false, error: 'Кошелёк не подключён' };
        var status = onStatus || function() {};

        try {
            var adPool = this.getAdPoolContract();
            status('📝 Подтвердите создание кампании...');
            var tx = await adPool.createCampaign(name, budgetWallet, managerWallet, { gasLimit: 500000 });
            status('⏳ Ожидание...');
            var receipt = await tx.wait();

            // Ищем событие CampaignCreated
            var campId = null;
            if (receipt.events) {
                for (var i = 0; i < receipt.events.length; i++) {
                    if (receipt.events[i].event === 'CampaignCreated') {
                        campId = receipt.events[i].args.campaignId.toNumber();
                        break;
                    }
                }
            }

            status('✅ Кампания создана! ID: ' + campId);
            return { ok: true, txHash: tx.hash, campaignId: campId };
        } catch(e) {
            var msg = e.reason || e.message || 'Ошибка';
            if (msg.includes('Not registered')) msg = 'Зарегистрируйтесь в GlobalWay';
            status('❌ ' + msg);
            return { ok: false, error: msg };
        }
    },

    // ═══════════════════════════════════════════════════════════
    // READ — Чтение данных из контракта
    // ═══════════════════════════════════════════════════════════

    async getUSDTBalance(address) {
        try {
            var usdt = this.getUSDTRead();
            var bal = await usdt.balanceOf(address || this.walletAddress);
            return parseFloat(ethers.utils.formatEther(bal));  // 18 decimals!
        } catch(e) { return 0; }
    },

    async getMyContractStats() {
        try {
            if (!this.gwIdNumeric) return { totalPaid: 0, totalOrders: 0 };
            var pool = this.getAdPoolRead();
            var stats = await pool.getUserStats(this.gwIdNumeric);
            return {
                totalPaid: parseFloat(ethers.utils.formatEther(stats[0])),
                totalOrders: stats[1].toNumber()
            };
        } catch(e) { return { totalPaid: 0, totalOrders: 0 }; }
    },

    async getCampaignInfo(campaignId) {
        try {
            var pool = this.getAdPoolRead();
            var c = await pool.getCampaign(campaignId);
            return {
                id: c[0].toNumber(),
                budgetWallet: c[1],
                managerWallet: c[2],
                name: c[3],
                active: c[4],
                totalPaid: parseFloat(ethers.utils.formatEther(c[5])),
                totalOrders: c[6].toNumber()
            };
        } catch(e) { return null; }
    },

    async getSponsorChain() {
        try {
            if (!this.gwIdNumeric) return [];
            var pool = this.getAdPoolRead();
            var result = await pool.getSponsorChain(this.gwIdNumeric);
            var chain = [];
            for (var i = 0; i < 9; i++) {
                if (result[0][i] !== ethers.constants.AddressZero) {
                    chain.push({
                        level: i + 1,
                        address: result[0][i],
                        gwId: result[1][i].toNumber()
                    });
                }
            }
            return chain;
        } catch(e) { return []; }
    },

    async getPreviewSplit(amountUSD) {
        try {
            var pool = this.getAdPoolRead();
            var amount = ethers.utils.parseEther(amountUSD.toString());
            var s = await pool.previewSplit(amount);
            return {
                budget: parseFloat(ethers.utils.formatEther(s[0])),
                manager: parseFloat(ethers.utils.formatEther(s[1])),
                levels: s[2].map(function(v) { return parseFloat(ethers.utils.formatEther(v)); }),
                club: parseFloat(ethers.utils.formatEther(s[3])),
                author: parseFloat(ethers.utils.formatEther(s[4])),
                gwt: parseFloat(ethers.utils.formatEther(s[5])),
                cgt: parseFloat(ethers.utils.formatEther(s[6])),
                total: parseFloat(ethers.utils.formatEther(s[7]))
            };
        } catch(e) { return null; }
    },

    // ═══════════════════════════════════════════════════════════
    // MARKETING EARNINGS — Читаем события из блокчейна
    // ═══════════════════════════════════════════════════════════

    async getMarketingEarnings(address) {
        try {
            var pool = this.getAdPoolRead();
            // Фильтр: MarketingPaid events где recipient = наш адрес
            var filter = pool.filters.MarketingPaid(null, address || this.walletAddress);
            // Последние 10000 блоков (~1 день на opBNB)
            var currentBlock = await pool.provider.getBlockNumber();
            var fromBlock = Math.max(0, currentBlock - 45000);  // ~2-3 дня на opBNB
            var events = await pool.queryFilter(filter, fromBlock);

            var total = 0;
            var earnings = [];
            for (var i = 0; i < events.length; i++) {
                var e = events[i];
                var amt = parseFloat(ethers.utils.formatEther(e.args.amount));
                total += amt;
                earnings.push({
                    gwId: e.args.gwId.toNumber(),
                    amount: amt,
                    level: e.args.level,
                    txHash: e.transactionHash,
                    blockNumber: e.blockNumber
                });
            }

            return { total: total, earnings: earnings };
        } catch(e) {
            console.warn('getMarketingEarnings error:', e);
            return { total: 0, earnings: [] };
        }
    },

    // ═══════════════════════════════════════════════════════════
    // API — Supabase через CardGift API
    // ═══════════════════════════════════════════════════════════

    async apiGet(action) {
        try {
            var h = { 'Content-Type': 'application/json' };
            if (this.walletAddress) h['X-Wallet-Address'] = this.walletAddress;
            var r = await fetch(this.API + '?action=' + action, { headers: h });
            return await r.json();
        } catch(e) { return { ok: false, error: e.message }; }
    },

    async apiPost(action, body) {
        try {
            var h = { 'Content-Type': 'application/json' };
            if (this.walletAddress) h['X-Wallet-Address'] = this.walletAddress;
            var r = await fetch(this.API, {
                method: 'POST',
                headers: h,
                body: JSON.stringify(Object.assign({ action: action }, body || {}))
            });
            return await r.json();
        } catch(e) { return { ok: false, error: e.message }; }
    },

    async getCampaigns() {
        return await this.apiGet('campaigns');
    },

    // ═══════════════════════════════════════════════════════════
    // GLOBALWAY BRIDGE — Регистрация, уровни, статус
    // ═══════════════════════════════════════════════════════════

    BRIDGE_ABI: [
        'function isUserRegistered(address user) external view returns (bool)',
        'function getUserStatus(address user) external view returns (tuple(bool isRegistered, uint256 odixId, uint8 maxPackage, uint8 rank, bool quarterlyActive, address sponsor, bool[12] activeLevels))',
        'function getUserOdixId(address user) external view returns (uint256)',
        'function getLevelPrice(uint8 level) external view returns (uint256)',
        'function getMultipleLevelsPrice(address user, uint8 fromLevel, uint8 toLevel) external view returns (uint256)',
    ],

    NSS_ABI: [
        'function bridge() external view returns (address)',
        'function register(uint256 sponsorId) external',
        'function buyLevel(uint8 level) external payable',
        'function buyMultipleLevels(uint8 fromLevel, uint8 toLevel) external payable',
        'function isNSSUser(address user) external view returns (bool)',
    ],

    _bridgeAddr: null,

    async getBridgeAddress() {
        if (this._bridgeAddr) return this._bridgeAddr;
        try {
            var rpc = new ethers.providers.JsonRpcProvider(this.ADDR.RPC_URL);
            var nss = new ethers.Contract(this.ADDR.NSSPlatform, this.NSS_ABI, rpc);
            this._bridgeAddr = await nss.bridge();
            return this._bridgeAddr;
        } catch(e) { console.warn('getBridgeAddress error:', e); return null; }
    },

    async getBridgeRead() {
        var addr = await this.getBridgeAddress();
        if (!addr) return null;
        var rpc = new ethers.providers.JsonRpcProvider(this.ADDR.RPC_URL);
        return new ethers.Contract(addr, this.BRIDGE_ABI, rpc);
    },

    getNSSContract() {
        if (!this.signer) throw new Error('Кошелёк не подключён');
        return new ethers.Contract(this.ADDR.NSSPlatform, this.NSS_ABI, this.signer);
    },

    /**
     * Полный статус пользователя в GlobalWay
     * @returns {object|null} { isRegistered, odixId, maxPackage, rank, quarterlyActive, sponsor, activeLevels }
     */
    async getGWUserStatus(address) {
        try {
            var bridge = await this.getBridgeRead();
            if (!bridge) return null;
            var s = await bridge.getUserStatus(address || this.walletAddress);
            return {
                isRegistered: s.isRegistered,
                odixId: s.odixId.toNumber ? s.odixId.toNumber() : Number(s.odixId),
                maxPackage: Number(s.maxPackage),
                rank: Number(s.rank),
                quarterlyActive: s.quarterlyActive,
                sponsor: s.sponsor,
                activeLevels: Array.from(s.activeLevels),
            };
        } catch(e) { console.warn('getGWUserStatus error:', e); return null; }
    },

    async isRegistered(address) {
        try {
            var bridge = await this.getBridgeRead();
            if (!bridge) return false;
            return await bridge.isUserRegistered(address || this.walletAddress);
        } catch(e) { return false; }
    },

    async getUserLevel(address) {
        var status = await this.getGWUserStatus(address);
        return status ? status.maxPackage : 0;
    },

    async getGwId(address) {
        var status = await this.getGWUserStatus(address);
        return status ? status.odixId : 0;
    },

    async getBNBBalance(address) {
        try {
            var rpc = new ethers.providers.JsonRpcProvider(this.ADDR.RPC_URL);
            var bal = await rpc.getBalance(address || this.walletAddress);
            return parseFloat(ethers.utils.formatEther(bal));
        } catch(e) { return 0; }
    },

    async getLevelPrice(level) {
        try {
            var bridge = await this.getBridgeRead();
            if (!bridge) return null;
            return await bridge.getLevelPrice(level);
        } catch(e) { return null; }
    },

    /**
     * Покупка уровня в GlobalWay через NSSPlatform
     * @param {number} level — номер уровня (1-9)
     * @param {function} onStatus — callback
     * @returns {object} {ok, txHash, error}
     */
    async buyLevelGW(level, onStatus) {
        if (!this.connected) return { ok: false, error: 'Кошелёк не подключён' };
        var status = onStatus || function(){};

        try {
            // 1. Получаем цену уровня из Bridge
            status('⏳ Получение цены уровня ' + level + '...');
            var bridge = await this.getBridgeRead();
            if (!bridge) return { ok: false, error: 'Bridge контракт недоступен' };
            var price = await bridge.getLevelPrice(level);

            // 2. Покупаем
            status('💳 Подтвердите покупку в кошельке...');
            var nss = this.getNSSContract();
            var tx = await nss.buyLevel(level, { value: price, gasLimit: 3500000 });
            status('⏳ Ожидание подтверждения...');
            await tx.wait();
            console.log('✅ BuyLevel TX:', tx.hash);

            status('✅ Уровень ' + level + ' активирован!');
            return { ok: true, txHash: tx.hash };
        } catch(e) {
            var msg = e.reason || e.message || 'Ошибка';
            if (msg.includes('user rejected')) msg = 'Транзакция отклонена';
            if (msg.includes('Not registered')) msg = 'Сначала зарегистрируйтесь в GlobalWay';
            if (msg.includes('insufficient funds') || msg.includes('INSUFFICIENT')) msg = 'Недостаточно BNB';
            if (msg.includes('Already bought') || msg.includes('already active')) msg = 'Этот уровень уже активирован';
            if (msg.includes('Buy previous')) msg = 'Сначала купите предыдущий уровень';
            status('❌ ' + msg);
            return { ok: false, error: msg };
        }
    },

    /**
     * Получить цены всех уровней 1-9
     * @returns {Array} [{level, priceBN, priceBNB}]
     */
    async getAllLevelPrices() {
        try {
            var bridge = await this.getBridgeRead();
            if (!bridge) return [];
            var promises = [];
            for (var i = 1; i <= 9; i++) {
                promises.push(bridge.getLevelPrice(i));
            }
            var prices = await Promise.all(promises);
            var result = [];
            for (var i = 0; i < 9; i++) {
                result.push({
                    level: i + 1,
                    priceBN: prices[i],
                    priceBNB: parseFloat(ethers.utils.formatEther(prices[i]))
                });
            }
            return result;
        } catch(e) { console.warn('getAllLevelPrices error:', e); return []; }
    },

    /**
     * Регистрация в GlobalWay через NSSPlatform
     * @param {number} sponsorId — GW ID спонсора (числовой)
     * @param {function} onStatus — callback
     * @returns {object} {ok, error}
     */
    async registerGW(sponsorId, onStatus) {
        if (!this.connected) return { ok: false, error: 'Кошелёк не подключён' };
        var status = onStatus || function(){};

        try {
            status('⏳ Подтвердите регистрацию в кошельке...');
            var nss = this.getNSSContract();
            var tx = await nss.register(sponsorId, { gasLimit: 3500000 });
            status('⏳ Ожидание подтверждения...');
            await tx.wait();
            console.log('✅ Register TX:', tx.hash);

            // Ждём появления в блокчейне
            status('⏳ Проверка регистрации...');
            for (var i = 0; i < 5; i++) {
                await new Promise(function(r){ setTimeout(r, 3000); });
                var reg = await this.isRegistered(this.walletAddress);
                if (reg) break;
            }

            status('✅ Регистрация прошла!');
            return { ok: true, txHash: tx.hash };
        } catch(e) {
            var msg = e.reason || e.message || 'Ошибка';
            if (msg.includes('Already registered')) return { ok: true, error: 'Уже зарегистрирован' };
            if (msg.includes('user rejected')) msg = 'Транзакция отклонена';
            if (msg.includes('Sponsor not found') || msg.includes('Invalid sponsor')) msg = 'Спонсор не найден. Проверьте ID.';
            if (msg.includes('insufficient funds')) msg = 'Недостаточно BNB для газа (~0.001 BNB)';
            status('❌ ' + msg);
            return { ok: false, error: msg };
        }
    },

    GLOBALWAY_ABI: [
        'function getDirectReferrals(address user) view returns (address[])',
    ],

    getGlobalWayRead() {
        var rpc = new ethers.providers.JsonRpcProvider(this.ADDR.RPC_URL);
        return new ethers.Contract(this.ADDR.GlobalWay, this.GLOBALWAY_ABI, rpc);
    },

    /**
     * Прямые рефералы (линия 1) из GlobalWay
     */
    async getDirectReferrals(address) {
        try {
            var gw = this.getGlobalWayRead();
            var refs = await gw.getDirectReferrals(address || this.walletAddress);
            return Array.from(refs);
        } catch(e) { console.warn('getDirectReferrals error:', e); return []; }
    },

    /**
     * Детали партнёра через Bridge.getUserStatus
     */
    async getPartnerDetails(address) {
        try {
            var bridge = await this.getBridgeRead();
            if (!bridge) return { address: address, odixId: 0, maxPackage: 0, rank: 0, quarterlyActive: false };
            var s = await bridge.getUserStatus(address);
            return {
                address: address,
                odixId: s.odixId.toNumber ? s.odixId.toNumber() : Number(s.odixId),
                maxPackage: Number(s.maxPackage),
                rank: Number(s.rank),
                quarterlyActive: s.quarterlyActive,
            };
        } catch(e) { return { address: address, odixId: 0, maxPackage: 0, rank: 0, quarterlyActive: false }; }
    },

    /**
     * Загрузить детали для массива адресов (параллельно, batch по 5)
     */
    async loadLineDetails(addresses) {
        if (!addresses || !addresses.length) return [];
        var self = this;
        var results = [];
        var batchSize = 5;
        for (var i = 0; i < addresses.length; i += batchSize) {
            var batch = addresses.slice(i, i + batchSize);
            var batchResults = await Promise.all(batch.map(function(addr) {
                return self.getPartnerDetails(addr);
            }));
            results = results.concat(batchResults);
        }
        return results;
    },

    /**
     * Рефералы следующей линии (по массиву адресов предыдущей линии)
     */
    async getNextLineAddresses(prevLineAddresses) {
        if (!prevLineAddresses || !prevLineAddresses.length) return [];
        var self = this;
        var all = [];
        for (var i = 0; i < prevLineAddresses.length; i++) {
            var refs = await self.getDirectReferrals(prevLineAddresses[i]);
            all = all.concat(refs);
        }
        return all;
    },

    // ═══════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════

    showError(msg) {
        if (typeof showToast === 'function') showToast(msg, 'error');
        else alert(msg);
    },

    formatUSD(n) {
        return '$' + (parseFloat(n) || 0).toFixed(2);
    },

    shortAddr(addr) {
        if (!addr) return '—';
        return addr.slice(0, 6) + '...' + addr.slice(-4);
    }
};

console.log('📢 GwadContract service loaded');
