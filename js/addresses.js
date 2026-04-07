/* ═══════════════════════════════════════
   GWAD.INK — Contract Addresses (opBNB mainnet)
   ═══════════════════════════════════════ */

window.GWAD_ADDRESSES = {
    // ═══ AdPlatform (Рекламный пул) ═══
    AdPoolContract:  '0x2D80EDB21B06Ec08399c39eb4a281736d8Aaa9EF',

    // ═══ Токены ═══
    USDT:            '0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3',  // opBNB USDT (18 decimals!)
    GWTToken:        '0xcfefcd8080b3109314aa0a211b7ba00f9cc8e380',
    CGTToken:        '0xfe9fc8ac296675cecc345e38e283f5cc86d22c01',

    // ═══ GlobalWay (регистрация + матрица) ═══
    GlobalWay:       '0xe8e2af46AEEec1B51B335f10C5912620B1a2707F',
    MatrixRegistry:  '0xD62945edFF7605dFc77A4bF607c96Da72E03cd0C',
    NSSPlatform:     '0xFb1ddFa8A7EAB0081EAe24ec3d24B0ED4Dd84f2B',

    // ═══ RPC ═══
    RPC_URL:         'https://opbnb-mainnet-rpc.bnbchain.org',
    CHAIN_ID:        204,
    EXPLORER:        'https://opbnb.bscscan.com',
};

// ═══ API endpoints ═══
window.GWAD_API = {
    adPlatform: 'https://cgift.club/api/ad-platform',  // API на CardGift
    localApi:   '/api',                                  // Локальное API gwad.ink
};

console.log('📍 GWAD Addresses loaded | AdPool:', window.GWAD_ADDRESSES.AdPoolContract.slice(0,10) + '...');
