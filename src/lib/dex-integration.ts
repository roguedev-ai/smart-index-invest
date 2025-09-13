// DEX Integration for TokenMarket - Uniswap, SushiSwap, PancakeSwap
// Enables token trading directly within the platform

import { ethers } from 'ethers'

// DEX Contract Addresses
export const DEX_CONTRACTS = {
  ethereum: {
    uniswapV3Factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    uniswapV3Router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    sushiSwapFactory: '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac',
    sushiSwapRouter: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F'
  },
  polygon: {
    quickSwapFactory: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
    quickSwapRouter: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
    sushiSwapFactory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
    sushiSwapRouter: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506'
  },
  bsc: {
    pancakeSwapFactory: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
    pancakeSwapRouter: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    babySwapFactory: '0x86407bEa2078ea5f5EB5A52B2caA963bC7F59dB4'
  }
}

// ERC20 ABI for token interactions
export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint amount) returns (bool)",
  "function transferFrom(address from, address to, uint amount) returns (bool)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)"
]

// Uniswap V3 Pool ABI
export const UNISWAP_V3_POOL_ABI = [
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
  "function fee() external view returns (uint24)",
  "function tickSpacing() external view returns (int24)",
  "function liquidity() external view returns (uint128)",
  "function slot0() external view returns (uint160,int24,uint16,uint16,uint16,uint8,bool)"
]

// DEX Router Interface
export interface DEXRouter {
  id: string
  name: string
  chainId: number
  routerAddress: string
  factoryAddress: string
  wethAddress: string
}

// Supported DEX Routers
export const DEX_ROUTERS: DEXRouter[] = [
  {
    id: 'uniswap-v3-eth',
    name: 'Uniswap V3',
    chainId: 1,
    routerAddress: DEX_CONTRACTS.ethereum.uniswapV3Router,
    factoryAddress: DEX_CONTRACTS.ethereum.uniswapV3Factory,
    wethAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
  },
  {
    id: 'sushiswap-eth',
    name: 'SushiSwap',
    chainId: 1,
    routerAddress: DEX_CONTRACTS.ethereum.sushiSwapRouter,
    factoryAddress: DEX_CONTRACTS.ethereum.sushiSwapFactory,
    wethAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
  },
  {
    id: 'quickswap-polygon',
    name: 'QuickSwap',
    chainId: 137,
    routerAddress: DEX_CONTRACTS.polygon.quickSwapRouter,
    factoryAddress: DEX_CONTRACTS.polygon.quickSwapFactory,
    wethAddress: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'
  },
  {
    id: 'pancakeswap-bsc',
    name: 'PancakeSwap',
    chainId: 56,
    routerAddress: DEX_CONTRACTS.bsc.pancakeSwapRouter,
    factoryAddress: DEX_CONTRACTS.bsc.pancakeSwapFactory,
    wethAddress: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
  }
]

// Swap Quote Interface
export interface SwapQuote {
  fromToken: {
    address: string
    symbol: string
    decimals: number
  }
  toToken: {
    address: string
    symbol: string
    decimals: number
  }
  amountIn: string
  amountOut: string
  expectedOutput: string
  slippage: number
  impact: number
  route: string[]
  fee: string
  dexName: string
  gasEstimate: string
}

// SDK Instance for different chains
export class DEXManager {
  private provider: ethers.JsonRpcProvider
  private signer: ethers.JsonRpcSigner | null = null

  constructor(chainId: number) {
    this.provider = new ethers.JsonRpcProvider(
      this.getChainRPC(chainId)
    )
  }

  private getChainRPC(chainId: number): string {
    const rpcUrls: { [key: number]: string } = {
      1: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
      137: 'https://polygon-mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
      56: 'https://bsc-dataseed1.binance.org/'
    }
    return rpcUrls[chainId] || rpcUrls[1]
  }

  async connectWallet(privateKey?: string): Promise<void> {
    if (privateKey) {
      this.signer = new ethers.Wallet(privateKey, this.provider)
    } else {
      // Browser wallet connection (MetaMask, etc.)
      const { BrowserProvider } = ethers
      const browserProvider = new BrowserProvider((window as any).ethereum)
      this.signer = await browserProvider.getSigner()
    }
  }

  async getTokenBalance(tokenAddress: string, walletAddress: string): Promise<string> {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider)
    const balance = await tokenContract.balanceOf(walletAddress)
    const decimals = await tokenContract.decimals()
    return ethers.formatUnits(balance, decimals)
  }

  async getTokenAllowance(tokenAddress: string, owner: string, spender: string): Promise<string> {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider)
    const allowance = await tokenContract.allowance(owner, spender)
    const decimals = await tokenContract.decimals()
    return ethers.formatUnits(allowance, decimals)
  }

  async approveToken(tokenAddress: string, spender: string, amount: string): Promise<string> {
    if (!this.signer) throw new Error('No signer available')

    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.signer)
    const decimals = await tokenContract.decimals()
    const amountInWei = ethers.parseUnits(amount, decimals)

    const tx = await tokenContract.approve(spender, amountInWei)
    return tx.hash
  }

  // Basic swap calculations (simplified - production would use Quoter contract)
  async getSwapQuote(
    fromToken: string,
    toToken: string,
    amountIn: string,
    chainId: number
  ): Promise<SwapQuote> {
    // Simplified quote calculation
    // In production, this would use the DEX's Quoter contract

    // Mock calculation for demonstration
    const mockOutput = (parseFloat(amountIn) * 0.997).toString() // 0.3% DEX fee

    return {
      fromToken: {
        address: fromToken,
        symbol: fromToken === DEX_ROUTERS.find(r => r.chainId === chainId)?.wethAddress ? 'WETH' : 'TOKEN',
        decimals: 18
      },
      toToken: {
        address: toToken,
        symbol: toToken === DEX_ROUTERS.find(r => r.chainId === chainId)?.wethAddress ? 'WETH' : 'TOKEN',
        decimals: 18
      },
      amountIn,
      amountOut: mockOutput,
      expectedOutput: mockOutput,
      slippage: 0.5,
      impact: 0.05,
      route: ['FROM_TOKEN', 'WETH', 'TO_TOKEN'],
      fee: (parseFloat(amountIn) * 0.003).toString(), // 0.3% fee
      dexName: 'Uniswap V3', // Default
      gasEstimate: '250000'
    }
  }

  // Execute swap transaction
  async executeSwap(
    quote: SwapQuote,
    deadline: number = Date.now() + 600000 // 10 minutes
  ): Promise<string> {
    if (!this.signer) throw new Error('No signer available')

    // Find DEX router for this chain
    const router = DEX_ROUTERS.find(r => r.chainId === parseInt(quote.fromToken.address.slice(0, 2), 16))
    if (!router) throw new Error('No DEX router found for this chain')

    // In production, this would:
    // 1. Check if WETH conversion is needed
    // 2. Use the appropriate DEX router contract
    // 3. Execute the swap transaction
    // 4. Handle slippage protection

    // For demonstration, return mock transaction hash
    return `0x${Math.random().toString(16).substr(2, 64)}${Math.random().toString(16).substr(2, 64)}`
  }

  // Get user's transaction history from blockchain
  async getTransactionHistory(walletAddress: string, chainId: number): Promise<any[]> {
    // In production, this would query blockchain explorers
    // For demonstration, return mock data
    return [
      {
        hash: '0xhash123',
        timestamp: Date.now() - 3600000,
        type: 'swap',
        fromToken: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        toToken: '0x6b175474e89094c44da98b954eedeac495271d0f',
        amountIn: '0.01',
        amountOut: '10.50',
        status: 'success'
      }
    ]
  }

  // Get liquidity information for a trading pair
  async getPairLiquidity(tokenA: string, tokenB: string, chainId: number): Promise<string> {
    // In production, query DEX factory/pair contracts
    return '5000000' // Mock liquidity in USD
  }
}

// Token Discovery and Search
export class TokenDiscovery {
  static async searchTokens(query: string): Promise<any[]> {
    const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${query}`)
    const data = await response.json()

    return data.coins.slice(0, 10).map((coin: any) => ({
      contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`, // Mock address
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      logoURI: coin.thumb,
      chainId: 1, // Default to ETH
      priceUSD: coin.price_btc || 0
    }))
  }

  static async getTrendingTokens(chainId: number = 1): Promise<any[]> {
    const response = await fetch(`https://api.coingecko.com/api/v3/search/trending`)
    const data = await response.json()

    return data.coins.slice(0, 8).map((coin: any) => ({
      contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`, // Mock address
      symbol: coin.item.symbol.toUpperCase(),
      name: coin.item.name,
      logoURI: coin.item.thumb,
      chainId,
      priceUSD: 0, // Would require additional API call
      marketCapRank: coin.item.market_cap_rank
    }))
  }

  static async getTokenMetadata(tokenAddress: string, chainId: number): Promise<any> {
    // Mock token metadata - in production, query blockchain
    return {
      symbol: 'UNKNOWN',
      name: 'Unknown Token',
      decimals: 18,
      totalSupply: '1000000000',
      logoURI: '/tokens/default.svg'
    }
  }
}

// Price Feed Integration
export class PriceFeed {
  // Real price data from CoinGecko (free API)
  static async getTokenPrice(tokenAddress: string): Promise<{
    price: number
    change24h: number
    marketCap: number
    volume24h: number
  } | null> {
    try {
      // Create a mock symbol from contract address for demo
      const mockSymbol = tokenAddress.slice(-4).toLowerCase()
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${mockSymbol}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
      )

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      const symbol = Object.keys(data)[0]

      if (!symbol) return null

      return {
        price: data[symbol].usd || 0,
        change24h: data[symbol].usd_24h_change || 0,
        marketCap: data[symbol].usd_market_cap || 0,
        volume24h: data[symbol].usd_24h_vol || 0
      }
    } catch (error) {
      console.warn('Failed to fetch token price:', error)
      return null
    }
  }

  static async getMultipleTokenPrices(addresses: string[]): Promise<Map<string, any>> {
    const prices = new Map()

    for (const address of addresses) {
      const price = await this.getTokenPrice(address)
      if (price) {
        prices.set(address, price)
      }
    }

    return prices
  }
}

// Liquidity Analysis
export class LiquidityAnalyzer {
  static async analyzePair(tokenA: string, tokenB: string, chainId: number): Promise<{
    liquidity: string
    volume24h: string
    volatility: string
    risk: 'low' | 'medium' | 'high'
  }> {
    // In production, query DEX smart contracts
    return {
      liquidity: '5000000', // $5M in USD
      volume24h: '250000',  // $250K daily volume
      volatility: 'medium',
      risk: 'medium'
    }
  }

  static async getPoolInfo(pairAddress: string): Promise<{
    reservesA: string
    reservesB: string
    fee: number
    sqrtPrice: string
  }> {
    // In production, query Uniswap V3 pool contract
    return {
      reservesA: '1000000',
      reservesB: '500000',
      fee: 500, // 0.05%
      sqrtPrice: '123456789'
    }
  }
}

// Export utilities
export const dexUtils = {
  formatSwapRoute: (route: string[]) => route.join(' → '),
  estimateGasForSwap: (chainId: number) => '250000',
  getSlippageOptions: () => [0.1, 0.5, 1.0, 2.0],
  validateTokenAddress: (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address)
}

export default DEXManager
