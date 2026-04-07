/* AdPoolContract v2.0 — ABI для фронтенда */
window.AD_POOL_ABI = [
    "function createCampaign(string _name, address _budgetWallet, address _managerWallet) external returns (uint256)",
    "function setCampaignBudgetWallet(uint256 cid, address _w) external",
    "function setCampaignManager(uint256 cid, address _m) external",
    "function setCampaignActive(uint256 cid, bool _a) external",
    "function payForAd(uint256 campaignId, uint256 ordererGwId, uint256 amount) external",
    "function previewSplit(uint256 amount) external view returns (uint256,uint256,uint256[9],uint256,uint256,uint256,uint256,uint256)",
    "function getSponsorChain(uint256 gwId) external view returns (address[9],uint256[9])",
    "function getCampaign(uint256 cid) external view returns (uint256,address,address,string,bool,uint256,uint256)",
    "function getUserStats(uint256 gwId) external view returns (uint256,uint256)",
    "function minOrderAmount() external view returns (uint256)",
    "function totalOrders() external view returns (uint256)",
    "function campaignCount() external view returns (uint256)",
    "function paused() external view returns (bool)",
    "event CampaignCreated(uint256 indexed campaignId, uint256 indexed leaderGwId, string name)",
    "event AdPaid(uint256 indexed campaignId, uint256 indexed gwId, address indexed payer, uint256 amount, uint256 orderId)",
    "event MarketingPaid(uint256 indexed gwId, address indexed recipient, uint256 amount, uint8 level)"
];
window.USDT_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)"
];
console.log('📢 AdPool ABI loaded');
