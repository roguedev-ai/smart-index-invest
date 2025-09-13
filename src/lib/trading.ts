// Token trading and portfolio management for TokenMarket platform

export interface TokenBalance {
  contractAddress: string
  symbol: string
  name: string
  balance: string
  decimals: number
  priceUSD?: number
  marketCap?: number
  priceChange24h?: number
  logoURI?: string
  chainId: number
  totalValue?: number
}

export interface TradeOrder {
  id: string
  userAddress: string
  fromToken: TokenBalance
  toToken: TokenBalance
  amount: string
  amountUSD: number
  slippage: number
  deadline: number
  txHash?: string
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled'
  timestamp: string
  platform: 'uniswap' | 'pancakeswap' | 'sushiswap'
}

export interface TradingPair {
  baseToken: TokenBalance
  quoteToken: TokenBalance
  exchangeRate: number
  volume24h: number
  liquidity: number
  platform: 'uniswap' | 'pancakeswap' | 'sushiswap'
}

export interface PortfolioAnalytics {
  totalValue: number
  change24h: number
  change7d: number
  change30d: number
  bestPerformer: TokenBalance | null
  worstPerformer: TokenBalance | null
  assets: TokenBalance[]
  tradeHistory: TradeOrder[]
}

// Default popular trading pairs
export const tradingPairs: TradingPair[] = [
  {
    baseToken: {
      contractAddress: '0xA0b86a33E6441d9283Ea03AE498F3BfEE5E3A1d14',
      symbol: 'EDG',
      name: 'Edge',
      balance: '0',
      decimals: 18,
      priceUSD: 0.00004123,
      chainId: 1
    },
    quoteToken: {
      contractAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      balance: '0',
      decimals: 18,
      priceUSD: 2713.45,
      chainId: 1
    },
    exchangeRate: 65857.32,
    volume24h: 123456.78,
    liquidity: 500000,
    platform: 'uniswap'
  }
]

// Popular tokens on different chains
export const popularTokens: TokenBalance[] = [
  // Ethereum tokens
  {
    contractAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    symbol: 'WETH',
    name: 'Wrapped Ether',
    balance: '0',
    decimals: 18,
    priceUSD: 2713.45,
    marketCap: 32524789456,
    priceChange24h: 2.45,
    logoURI: '/tokens/weth.svg',
    chainId: 1
  },
  {
    contractAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    balance: '0',
    decimals: 18,
    priceUSD: 1.00,
    marketCap: 7854753290,
    priceChange24h: -0.05,
    logoURI: '/tokens/dai.svg',
    chainId: 1
  },
  {
    contractAddress: '0xa0b86a33e6441d9283ea03ae498f3bfee5e3a1d14',
    symbol: 'EDG',
    name: 'Edge',
    balance: '0',
    decimals: 18,
    priceUSD: 0.00004123,
    marketCap: 4123,
    priceChange24h: 5.67,
    logoURI: '/tokens/edg.svg',
    chainId: 1
  },

  // Polygon tokens
  {
    contractAddress: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
    symbol: 'USDC.e',
    name: 'USD Coin (PoS)',
    balance: '0',
    decimals: 6,
    priceUSD: 1.00,
    marketCap: 5000000000,
    priceChange24h: 0.02,
    logoURI: '/tokens/usdc.svg',
    chainId: 137
  },
  {
    contractAddress: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
    symbol: 'MATIC',
    name: 'Matic Token',
    balance: '0',
    decimals: 18,
    priceUSD: 0.8143,
    marketCap: 7654321890,
    priceChange24h: -0.45,
    logoURI: '/tokens/matic.svg',
    chainId: 137
  },

  // BSC tokens
  {
    contractAddress: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
    symbol: 'BUSD',
    name: 'Binance USD',
    balance: '0',
    decimals: 18,
    priceUSD: 1.00,
    marketCap: 3894567890,
    priceChange24h: 0.01,
    logoURI: '/tokens/busd.svg',
    chainId: 56
  }
]

// Mock portfolio data for demonstration
export const mockPortfolio: PortfolioAnalytics = {
  totalValue: 45.67,
  change24h: 3.24,
  change7d: 12.8,
  change30d: -8.45,
  bestPerformer: {
    contractAddress: '',
    symbol: 'EDG',
    name: 'Edge',
    balance: '1000000',
    decimals: 18,
    priceUSD: 0.00004123,
    priceChange24h: 5.67,
    chainId: 1,
    totalValue: 41.23
  },
  worstPerformer: {
    contractAddress: '',
    symbol: 'WETH',
    name: 'Wrapped Ether',
    balance: '0.01',
    decimals: 18,
    priceUSD: 2713.45,
    priceChange24h: -2.1,
    chainId: 1,
    totalValue: 27.13
  },
  assets: [
    {
      contractAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      balance: '0.01',
      decimals: 18,
      priceUSD: 2713.45,
      marketCap: 32524789456,
      priceChange24h: -2.1,
      logoURI: '/tokens/weth.svg',
      chainId: 1,
      totalValue: 27.13
    },
    {
      contractAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      balance: '10.45',
      decimals: 18,
      priceUSD: 1.00,
      marketCap: 7854753290,
      priceChange24h: 0.02,
      logoURI: '/tokens/dai.svg',
      chainId: 1,
      totalValue: 10.45
    },
    {
      contractAddress: '0xa0b86a33e6441d9283ea03ae498f3bfee5e3a1d14',
      symbol: 'EDG',
      name: 'Edge',
      balance: '1000000',
      decimals: 18,
      priceUSD: 0.00004123,
      marketCap: 4123,
      priceChange24h: 5.67,
      logoURI: '/tokens/edg.svg',
      chainId: 1,
      totalValue: 41.23
    }
  ],
  tradeHistory: [
    {
      id: 'trade-001',
      userAddress: '0x1234567890123456789012345678901234567890',
      fromToken: {
        contractAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
        symbol: 'DAI',
        name: 'Dai Stablecoin',
        balance: '100',
        decimals: 18,
        priceUSD: 1.00,
        chainId: 1
      },
      toToken: {
        contractAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        symbol: 'WETH',
        name: 'Wrapped Ether',
        balance: '0.036',
        decimals: 18,
        priceUSD: 2713.45,
        chainId: 1
      },
      amount: '100',
      amountUSD: 100,
      slippage: 0.5,
      deadline: Date.now() + 600000,
      txHash: '0xabc123def456ghi789jkl012mno345pqr678stu901vwx',
      status: 'confirmed',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      platform: 'uniswap'
    },
    {
      id: 'trade-002',
      userAddress: '0x1234567890123456789012345678901234567890',
      fromToken: {
        contractAddress: '0xa0b86a33e6441d9283ea03ae498f3bfee5e3a1d14',
        symbol: 'EDG',
        name: 'Edge',
        balance: '500000',
        decimals: 18,
        priceUSD: 0.00004123,
        chainId: 1
      },
      toToken: {
        contractAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
        symbol: 'DAI',
        name: 'Dai Stablecoin',
        balance: '20.62',
        decimals: 18,
        priceUSD: 1.00,
        chainId: 1
      },
      amount: '500000',
      amountUSD: 20.62,
      slippage: 0.5,
      deadline: Date.now() + 600000,
      status: 'confirmed',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      platform: 'uniswap'
    }
  ]
}

// Utility functions
export function calculatePortfolioValue(portfolio: PortfolioAnalytics): number {
  return portfolio.assets.reduce((total, asset) => total + (asset.totalValue || 0), 0)
}

export function formatTokenAmount(amount: string, decimals: number = 18): string {
  const value = parseFloat(amount) / Math.pow(10, decimals)
  return value.toFixed(decimals < 6 ? decimals : 4)
}

export function formatPriceChange(change: number): string {
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(2)}%`
}

export function getTokenByAddress(contractAddress: string): TokenBalance | undefined {
  return popularTokens.find(token =>
    token.contractAddress.toLowerCase() === contractAddress.toLowerCase()
  )
}

export function getTradingPair(baseAddress: string, quoteAddress: string): TradingPair | undefined {
  return tradingPairs.find(pair =>
    pair.baseToken.contractAddress.toLowerCase() === baseAddress.toLowerCase() &&
    pair.quoteToken.contractAddress.toLowerCase() === quoteAddress.toLowerCase()
  )
}

// Swap calculation functions (simplified for demonstration)
export function calculateSwapOutput(
  inputAmount: string,
  fromToken: TokenBalance,
  toToken: TokenBalance,
  slippage: number = 0.5
): { output: string; outputUSD: number; impact: number; route: string[] } {
  // Simplified calculation - in production, this would use AMM math
  const inputValue = parseFloat(inputAmount) * (fromToken.priceUSD || 0)
  const outputUSD = inputValue * 0.997 // 0.3% DEX fee
  const output = (outputUSD / (toToken.priceUSD || 1)).toString()
  const impact = 0.05 // Price impact

  return {
    output,
    outputUSD,
    impact,
    route: [fromToken.symbol, toToken.symbol]
  }
}

// Quote functions for price discovery
export function getTokenPriceUSD(contractAddress: string): number {
  const token = getTokenByAddress(contractAddress)
  return token?.priceUSD || 0
}

export function getTokenPriceChange24h(contractAddress: string): number {
  const token = getTokenByAddress(contractAddress)
  return token?.priceChange24h || 0
}

// Popular trading pairs for the platform
export function getPopularPairs(): TradingPair[] {
  return tradingPairs.slice(0, 5)
}

export function getTrendingTokens(): TokenBalance[] {
  return popularTokens.filter(token => Math.abs(token.priceChange24h || 0) > 5)
}

// Search and filter functions
export function searchTokens(query: string): TokenBalance[] {
  const lowerQuery = query.toLowerCase()
  return popularTokens.filter(token =>
    token.symbol.toLowerCase().includes(lowerQuery) ||
    token.name.toLowerCase().includes(lowerQuery) ||
    token.contractAddress.toLowerCase().includes(lowerQuery)
  )
}

export function filterTokensByChain(chainId: number): TokenBalance[] {
  return popularTokens.filter(token => token.chainId === chainId)
}

// Portfolio performance calculations
export function calculatePortfolioPerformance(portfolio: PortfolioAnalytics): {
  totalValue: number
  change24h: number
  change7d: number
  change30d: number
  bestPerformer: TokenBalance
  worstPerformer: TokenBalance
} {
  const totalValue = calculatePortfolioValue(portfolio)

  // Calculate weighted average changes
  const weighted24h = portfolio.assets.reduce((sum, asset) => {
    const weight = (asset.totalValue || 0) / totalValue
    return sum + (weight * (asset.priceChange24h || 0))
  }, 0)

  return {
    totalValue,
    change24h: weighted24h,
    change7d: portfolio.change7d,
    change30d: portfolio.change30d,
    bestPerformer: portfolio.bestPerformer || portfolio.assets[0],
    worstPerformer: portfolio.worstPerformer || portfolio.assets[0]
  }
}

// Export trade history formatting
export function formatTradeHistory(trades: TradeOrder[]): Array<{
  id: string
  type: string
  from: string
  to: string
  amount: string
  value: string
  status: string
  time: string
  hash: string
}> {
  return trades.map(trade => ({
    id: trade.id,
    type: 'Swap',
    from: `${trade.amount} ${trade.fromToken.symbol}`,
    to: `≈${trade.toToken.balance} ${trade.toToken.symbol}`,
    amount: trade.amount,
    value: `$${trade.amountUSD.toFixed(2)}`,
    status: trade.status,
    time: new Date(trade.timestamp).toLocaleDateString(),
    hash: trade.txHash || 'Pending'
  }))
}
