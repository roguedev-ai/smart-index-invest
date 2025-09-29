/**
 * Index Template Data Structure
 * Pre-built smart index templates for common investment strategies
 */

export interface IndexAsset {
  symbol: string;
  name: string;
  coinGeckoId: string;
  address: string; // ERC20 contract address (Ethereum mainnet)
  weight: number; // Basis points (10000 = 100%)
}

export interface IndexTemplate {
  id: string;
  name: string;
  description: string;
  category: 'conservative' | 'moderate' | 'aggressive';
  icon: string; // Emoji
  assets: IndexAsset[];
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  rebalanceFrequency: 'daily' | 'weekly' | 'monthly';
  minInvestment: number; // In ETH
  expectedReturn: string; // e.g., "8-12% APY"
  volatility: 'low' | 'medium' | 'high';
}

/**
 * Pre-built index templates with real Ethereum mainnet token addresses
 */
export const INDEX_TEMPLATES: IndexTemplate[] = [
  // Conservative Templates
  {
    id: 'blue-chip-crypto',
    name: 'Blue Chip Crypto',
    description: 'Established, large-cap cryptocurrencies for stable growth',
    category: 'conservative',
    icon: '💎',
    riskProfile: 'conservative',
    rebalanceFrequency: 'monthly',
    minInvestment: 0.1,
    expectedReturn: '6-10% APY',
    volatility: 'medium',
    assets: [
      { symbol: 'WBTC', name: 'Wrapped Bitcoin', coinGeckoId: 'wrapped-bitcoin', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', weight: 4000 },
      { symbol: 'WETH', name: 'Wrapped Ethereum', coinGeckoId: 'weth', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', weight: 3500 },
      { symbol: 'BNB', name: 'Binance Coin', coinGeckoId: 'binancecoin', address: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52', weight: 1500 },
      { symbol: 'ADA', name: 'Cardano', coinGeckoId: 'cardano', address: '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47', weight: 1000 }
    ]
  },

  {
    id: 'stablecoin-safety',
    name: 'Stablecoin Safety',
    description: 'Low-risk stablecoins and USD-pegged assets',
    category: 'conservative',
    icon: '🛡️',
    riskProfile: 'conservative',
    rebalanceFrequency: 'monthly',
    minInvestment: 0.05,
    expectedReturn: '2-5% APY',
    volatility: 'low',
    assets: [
      { symbol: 'USDC', name: 'USD Coin', coinGeckoId: 'usd-coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', weight: 4000 },
      { symbol: 'USDT', name: 'Tether', coinGeckoId: 'tether', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', weight: 3000 },
      { symbol: 'DAI', name: 'Dai', coinGeckoId: 'dai', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', weight: 2000 },
      { symbol: 'FRAX', name: 'Frax', coinGeckoId: 'frax', address: '0x853d955aCEf822Db058eb8505911ED77F175b99e', weight: 1000 }
    ]
  },

  // Moderate Templates
  {
    id: 'defi-leaders',
    name: 'DeFi Leaders',
    description: 'Top decentralized finance protocols and applications',
    category: 'moderate',
    icon: '🏛️',
    riskProfile: 'moderate',
    rebalanceFrequency: 'weekly',
    minInvestment: 0.2,
    expectedReturn: '10-18% APY',
    volatility: 'medium',
    assets: [
      { symbol: 'UNI', name: 'Uniswap', coinGeckoId: 'uniswap', address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', weight: 2500 },
      { symbol: 'AAVE', name: 'Aave', coinGeckoId: 'aave', address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', weight: 2500 },
      { symbol: 'LINK', name: 'Chainlink', coinGeckoId: 'chainlink', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', weight: 2000 },
      { symbol: 'MKR', name: 'Maker', coinGeckoId: 'maker', address: '0x9f8F72AA9304c8B593d555F12eF6589cC3A579A2', weight: 1500 },
      { symbol: 'CRV', name: 'Curve DAO', coinGeckoId: 'curve-dao-token', address: '0xD533a949740bb3306d119CC777fa900bA034cd52', weight: 1500 }
    ]
  },

  {
    id: 'layer1-basket',
    name: 'Layer 1 Basket',
    description: 'Major blockchain infrastructure networks',
    category: 'moderate',
    icon: '🌐',
    riskProfile: 'moderate',
    rebalanceFrequency: 'weekly',
    minInvestment: 0.15,
    expectedReturn: '8-15% APY',
    volatility: 'medium',
    assets: [
      { symbol: 'WETH', name: 'Wrapped Ethereum', coinGeckoId: 'weth', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', weight: 3000 },
      { symbol: 'MATIC', name: 'Polygon', coinGeckoId: 'matic-network', address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', weight: 2500 },
      { symbol: 'AVAX', name: 'Avalanche', coinGeckoId: 'avalanche-2', address: '0x85f138bfee4ef8e540890cfb48f620571d67ed54', weight: 2000 },
      { symbol: 'LINK', name: 'Chainlink', coinGeckoId: 'chainlink', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', weight: 1500 },
      { symbol: 'OP', name: 'Optimism', coinGeckoId: 'optimism', address: '0x4200000000000000000000000000000000000042', weight: 1000 }
    ]
  },

  {
    id: 'balanced-portfolio',
    name: 'Balanced Portfolio',
    description: 'Diversified mix of crypto assets for steady growth',
    category: 'moderate',
    icon: '⚖️',
    riskProfile: 'moderate',
    rebalanceFrequency: 'weekly',
    minInvestment: 0.1,
    expectedReturn: '7-12% APY',
    volatility: 'medium',
    assets: [
      { symbol: 'WBTC', name: 'Wrapped Bitcoin', coinGeckoId: 'wrapped-bitcoin', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', weight: 3000 },
      { symbol: 'ETH', name: 'Ethereum', coinGeckoId: 'ethereum', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', weight: 2500 },
      { symbol: 'USDC', name: 'USD Coin', coinGeckoId: 'usd-coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', weight: 2000 },
      { symbol: 'LINK', name: 'Chainlink', coinGeckoId: 'chainlink', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', weight: 1500 },
      { symbol: 'AAVE', name: 'Aave', coinGeckoId: 'aave', address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', weight: 1000 }
    ]
  },

  // Aggressive Templates
  {
    id: 'metaverse-index',
    name: 'Metaverse Index',
    description: 'Virtual worlds, gaming, and digital real estate',
    category: 'aggressive',
    icon: '🌈',
    riskProfile: 'aggressive',
    rebalanceFrequency: 'weekly',
    minInvestment: 0.25,
    expectedReturn: '15-25% APY',
    volatility: 'high',
    assets: [
      { symbol: 'MANA', name: 'Decentraland', coinGeckoId: 'decentraland', address: '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942', weight: 3000 },
      { symbol: 'SAND', name: 'The Sandbox', coinGeckoId: 'the-sandbox', address: '0x3845badAde8e6dFF049820680d1F14bD3903A5d0', weight: 3000 },
      { symbol: 'AXS', name: 'Axie Infinity', coinGeckoId: 'axie-infinity', address: '0xBB0E17EF65F82d506D253ecd78d89b91C4026bcb', weight: 2500 },
      { symbol: 'ENJ', name: 'Enjin Coin', coinGeckoId: 'enjincoin', address: '0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c', weight: 1500 }
    ]
  },

  {
    id: 'high-growth-altcoins',
    name: 'High Growth Altcoins',
    description: 'Emerging protocols with significant upside potential',
    category: 'aggressive',
    icon: '🚀',
    riskProfile: 'aggressive',
    rebalanceFrequency: 'daily',
    minInvestment: 0.3,
    expectedReturn: '20-40% APY',
    volatility: 'high',
    assets: [
      { symbol: 'INJ', name: 'Injective', coinGeckoId: 'injective-protocol', address: '0x84b249099Fa4a4a4F2b8dcBC1eC7e70aD4654C75', weight: 2000 },
      { symbol: 'ARB', name: 'Arbitrum', coinGeckoId: 'arbitrum', address: '0x912CE59144191C1204E64559FE8253a0e49E6548', weight: 2000 },
      { symbol: 'OP', name: 'Optimism', coinGeckoId: 'optimism', address: '0x4200000000000000000000000000000000000042', weight: 2000 },
      { symbol: 'MATIC', name: 'Polygon', coinGeckoId: 'matic-network', address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', weight: 2000 },
      { symbol: 'APT', name: 'Aptos', coinGeckoId: 'aptos', address: '0x01FbdC2BfBC3f4df6f9b137a7D8b8CFAe3Ac6E48', weight: 2000 }
    ]
  },

  {
    id: 'yield-farming',
    name: 'Yield Farming',
    description: 'DeFi yield optimization and farming protocols',
    category: 'aggressive',
    icon: '🌾',
    riskProfile: 'aggressive',
    rebalanceFrequency: 'daily',
    minInvestment: 0.2,
    expectedReturn: '12-30% APY',
    volatility: 'high',
    assets: [
      { symbol: 'CRV', name: 'Curve DAO', coinGeckoId: 'curve-dao-token', address: '0xD533a949740bb3306d119CC777fa900bA034cd52', weight: 2500 },
      { symbol: 'CVX', name: 'Convex Finance', coinGeckoId: 'convex-finance', address: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B', weight: 2500 },
      { symbol: 'LDO', name: 'Lido DAO', coinGeckoId: 'lido-dao', address: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32', weight: 2500 },
      { symbol: 'RPL', name: 'Rocket Pool', coinGeckoId: 'rocket-pool', address: '0xD33526068D116cE69F19A9ee5739153CB1BAD43c', weight: 2500 }
    ]
  }
];

/**
 * Helper function to get templates by category
 */
export function getTemplatesByCategory(category: 'conservative' | 'moderate' | 'aggressive'): IndexTemplate[] {
  return INDEX_TEMPLATES.filter(template => template.category === category);
}

/**
 * Helper function to get template by ID
 */
export function getTemplateById(id: string): IndexTemplate | undefined {
  return INDEX_TEMPLATES.find(template => template.id === id);
}

/**
 * Helper function to calculate total weight (should always be 10000 = 100%)
 */
export function validateTemplateWeights(template: IndexTemplate): boolean {
  const totalWeight = template.assets.reduce((sum, asset) => sum + asset.weight, 0);
  return totalWeight === 10000;
}

/**
 * Helper function to get popular templates (top 3 from each category)
 */
export function getPopularTemplates(): IndexTemplate[] {
  const conservative = INDEX_TEMPLATES.filter(t => t.category === 'conservative').slice(0, 1);
  const moderate = INDEX_TEMPLATES.filter(t => t.category === 'moderate').slice(0, 1);
  const aggressive = INDEX_TEMPLATES.filter(t => t.category === 'aggressive').slice(0, 1);

  return [...conservative, ...moderate, ...aggressive];
}

/**
 * Validation: All templates should have valid weights
 */
INDEX_TEMPLATES.forEach(template => {
  if (!validateTemplateWeights(template)) {
    console.warn(`Template "${template.name}" has invalid weight distribution (${template.assets.reduce((sum, asset) => sum + asset.weight, 0)}) should be 10000`);
  }
});
