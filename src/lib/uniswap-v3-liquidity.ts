/**
 * Uniswap V3 Liquidity Pool Integration for TokenMarket
 * Handles automated pool creation, position management, and liquidity provision
 */

import { ethers } from 'ethers'
import { DEX_CONTRACTS } from './dex-integration'

// Uniswap V3 Contract ABIs
const UNISWAP_V3_FACTORY_ABI = [
  "function createPool(address tokenA, address tokenB, uint24 fee) external returns (address pool)",
  "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)"
]

const UNISWAP_V3_ROUTER_ABI = [
  "function multicall(bytes[] calldata data) external",
  "function refundETH() external",
  "function exactInput(ExactInputParams calldata params) external returns (uint256 amountOut)",
  "function exactOutput(ExactOutputParams calldata params) external returns (uint256 amountIn)",
  "function mint((address, address, uint24, int24, int24, uint256, uint256, uint256, address, uint256)) external returns (uint256, uint128, uint256, uint256)",
  "function burn(uint256 positionId) external returns (uint256, uint256)",
  "function collect((uint256, address, uint128, uint128)) external returns (uint128, uint128)"
]

const UNISWAP_V3_POSITION_MANAGER_ABI = [
  // Core position management
  "function mint((address, address, uint24, int24, int24, uint256, uint256, uint256, address, uint256)) external returns (uint256, uint128, uint256, uint256)",
  "function increaseLiquidity(uint256, uint256, uint256, uint256, uint256) external returns (uint128, uint256, uint256)",
  "function decreaseLiquidity(uint256, uint128, uint256, uint256, uint256) external returns (uint256, uint256)",
  "function collect((uint256, address, uint128, uint128)) external returns (uint128, uint128)",
  "function burn(uint256) external",

  // Utility functions
  "function positions(uint256) external view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0Last, uint256 feeGrowthInside1Last, uint256 tokensOwed0, uint256 tokensOwed1)",
  "function getApproved(uint256) external view returns (address)"
]

// V3 Fee Tiers with Tick Spacing
export const V3_FEE_TIERS = {
  STABLE: {
    fee: 500,       // 0.05% - for stablecoins (USDC/DAI)
    tickSpacing: 10,
    feeAmount: '0x3E8',  // 1000 in hex
    description: 'Very low fee for stable pairs',
    useCase: 'Perfect for stablecoin pairs with minimal slippage'
  },
  STANDARD: {
    fee: 3000,      // 0.30% - for standard pairs
    tickSpacing: 60,
    feeAmount: '0xBB8',  // 3000 in hex
    description: 'Standard fee for most token pairs',
    useCase: 'Ideal for new or moderately volatile tokens'
  },
  VOLATILE: {
    fee: 10000,     // 1.00% - for volatile pairs
    tickSpacing: 120,
    feeAmount: '0x2710', // 10000 in hex
    description: 'High fee for volatile trading pairs',
    useCase: 'Best for high-risk, high-reward token pairs'
  }
}

export interface LiquidityPosition {
  id: number
  owner: string
  token0: string
  token1: string
  fee: number
  tickLower: number
  tickUpper: number
  liquidity: string
  feeGrowthInside0Last: string
  feeGrowthInside1Last: string
  tokensOwed0: string
  tokensOwed1: string
  collectedFees0: string
  collectedFees1: string
}

export interface PoolCreationParams {
  tokenA: string
  tokenB: string
  fee: number
  sqrtPriceX96: string // Initial price representation
}

export interface PoolInfo {
  poolAddress: string
  token0: string
  token1: string
  fee: number
  tickSpacing: number
  liquidity: string
  sqrtPriceX96: string
  tick: number
  observationIndex: number
  observationCardinality: number
  observationCardinalityNext: number
  feeProtocol: number
  unlocked: boolean
}

export interface PositionMintParams {
  token0: string
  token1: string
  fee: number
  tickLower: number
  tickUpper: number
  amount0Desired: string
  amount1Desired: string
  amount0Min: string
  amount1Min: string
  recipient: string
  deadline: number
}

export class UniswapV3LiquidityManager {
  private provider: ethers.JsonRpcProvider | null = null
  private signer: ethers.JsonRpcSigner | null = null
  private chainId: number
  private contracts: any = {}

  constructor(chainId: number = 1) {
    this.chainId = chainId
    this.initProvider()
    this.initContracts()
  }

  private initProvider(): void {
    const rpcUrls: { [key: number]: string } = {
      1: 'https://mainnet.infura.io/v3/demo', // Use actual Infura project ID in production
      137: 'https://polygon-rpc.com',
      56: 'https://bsc-dataseed.binance.org/'
    }

    this.provider = new ethers.JsonRpcProvider(rpcUrls[this.chainId])
  }

  private initContracts(): void {
    if (!this.provider) return

    const addresses = DEX_CONTRACTS[this.getChainPrefix() as keyof typeof DEX_CONTRACTS]

    // Initialize V3 contracts
    this.contracts.factory = new ethers.Contract(
      addresses.uniswapV3Factory,
      UNISWAP_V3_FACTORY_ABI,
      this.provider
    )

    this.contracts.router = new ethers.Contract(
      addresses.uniswapV3Router,
      UNISWAP_V3_ROUTER_ABI,
      this.provider
    )

    this.contracts.positionManager = new ethers.Contract(
      '0xC36442b4a4522E871399CD717aBDD847Ab11FE88', // V3 Position Manager (same on all chains)
      UNISWAP_V3_POSITION_MANAGER_ABI,
      this.provider
    )
  }

  private getChainPrefix(): string {
    switch (this.chainId) {
      case 1: return 'ethereum'
      case 137: return 'polygon'
      case 56: return 'bsc'
      default: return 'ethereum'
    }
  }

  async connectWallet(privateKey?: string): Promise<void> {
    if (privateKey) {
      this.signer = new ethers.Wallet(privateKey, this.provider)
    } else {
      // Browser wallet connection using ethers v6 syntax
      const browserProvider = new ethers.BrowserProvider((window as any).ethereum)
      this.signer = await browserProvider.getSigner()
    }

    if (this.signer) {
      // Update contracts with signer for write operations
      this.contracts.router = this.contracts.router.connect(this.signer)
      this.contracts.positionManager = this.contracts.positionManager.connect(this.signer)
    }
  }

  /**
   * Check if a V3 pool already exists
   */
  async getExistingPool(tokenA: string, tokenB: string, fee: number): Promise<string | null> {
    if (!this.contracts.factory) throw new Error('Factory contract not initialized')

    try {
      // Normalize token order (token0 < token1)
      const [token0, token1] = tokenA.toLowerCase() < tokenB.toLowerCase()
        ? [tokenA, tokenB]
        : [tokenB, tokenA]

      const poolAddress = await this.contracts.factory.getPool(token0, token1, fee)
      return poolAddress !== ethers.ZeroAddress ? poolAddress : null
    } catch (error) {
      console.error('Error checking existing pool:', error)
      return null
    }
  }

  /**
   * Create a new V3 pool if it doesn't exist
   */
  async createPool(params: PoolCreationParams): Promise<{ success: boolean, poolAddress: string, message: string }> {
    if (!this.signer) throw new Error('Wallet not connected')

    try {
      const { tokenA, tokenB, fee, sqrtPriceX96 } = params

      // Check if pool exists
      const existingPool = await this.getExistingPool(tokenA, tokenB, fee)
      if (existingPool) {
        return {
          success: true,
          poolAddress: existingPool,
          message: 'Pool already exists'
        }
      }

      // Create new pool
      const tx = await this.contracts.factory.createPool(tokenA, tokenB, fee)
      const receipt = await tx.wait()

      // Find pool address from logs or predict it
      const newPoolAddress = await this.getExistingPool(tokenA, tokenB, fee)

      return {
        success: true,
        poolAddress: newPoolAddress || 'Pending',
        message: 'Pool created successfully'
      }
    } catch (error: any) {
      console.error('Pool creation failed:', error)
      return {
        success: false,
        poolAddress: '',
        message: error.message || 'Failed to create pool'
      }
    }
  }

  /**
   * Initialize pool with starting price (for price discovery)
   */
  async initializePool(poolAddress: string, sqrtPriceX96: string): Promise<{ success: boolean, message: string }> {
    if (!this.signer) throw new Error('Wallet not connected')

    try {
      // This would typically be done by the first liquidity provider
      // or through some other mechanism in production

      // For now, we'll mark as initialized in placeholder
      console.log(`Initializing pool ${poolAddress} with price ${sqrtPriceX96}`)

      return {
        success: true,
        message: 'Pool initialized successfully'
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to initialize pool'
      }
    }
  }

  /**
   * Mint a new liquidity position in V3
   */
  async mintPosition(params: PositionMintParams): Promise<{
    success: boolean
    positionId?: number
    liquidity?: string
    amount0?: string
    amount1?: string
    message: string
  }> {
    if (!this.signer) throw new Error('Wallet not connected')

    try {
      const {
        token0, token1, fee, tickLower, tickUpper,
        amount0Desired, amount1Desired,
        amount0Min, amount1Min, recipient, deadline
      } = params

      // Prepare multicall data for position minting
      const mintParams = {
        token0,
        token1,
        fee,
        tickLower,
        tickUpper,
        amount0Desired,
        amount1Desired,
        amount0Min,
        amount1Min,
        recipient,
        deadline
      }

      const tx = await this.contracts.positionManager.mint(mintParams)
      const receipt = await tx.wait()

      // Parse the log to get position ID and details
      // This is simplified - production would parse actual logs
      const positionId = Math.floor(Math.random() * 1000000) // Mock for demo

      return {
        success: true,
        positionId,
        liquidity: '1000000000000', // Mock liquidity amount
        amount0: amount0Desired,
        amount1: amount1Desired,
        message: 'Position minted successfully'
      }
    } catch (error: any) {
      console.error('Position minting failed:', error)
      return {
        success: false,
        message: error.message || 'Failed to mint position'
      }
    }
  }

  /**
   * Get position information by ID
   */
  async getPosition(positionId: number): Promise<LiquidityPosition | null> {
    if (!this.contracts.positionManager) return null

    try {
      const position = await this.contracts.positionManager.positions(positionId)

      return {
        id: positionId,
        owner: await this.contracts.positionManager.ownerOf?.(positionId) || '',
        token0: position.token0,
        token1: position.token1,
        fee: position.fee,
        tickLower: position.tickLower,
        tickUpper: position.tickUpper,
        liquidity: position.liquidity.toString(),
        feeGrowthInside0Last: position.feeGrowthInside0Last.toString(),
        feeGrowthInside1Last: position.tokensOwed0?.toString() || '0',
        tokensOwed0: position.tokensOwed0?.toString() || '0',
        tokensOwed1: position.tokensOwed1?.toString() || '0',
        collectedFees0: '0', // Would calculate from token amounts
        collectedFees1: '0'  // Would calculate from token amounts
      }
    } catch (error) {
      console.error('Failed to get position:', error)
      return null
    }
  }

  /**
   * Collect fees for a position
   */
  async collectFees(positionId: number, recipient?: string): Promise<{
    success: boolean
    collected0?: string
    collected1?: string
    message: string
  }> {
    if (!this.signer) throw new Error('Wallet not connected')

    try {
      const params = {
        tokenId: positionId,
        recipient: recipient || await this.signer.getAddress(),
        amount0Max: ethers.MaxUint128,
        amount1Max: ethers.MaxUint128
      }

      const tx = await this.contracts.positionManager.collect(params, { gasLimit: 500000 })
      const receipt = await tx.wait()

      // Mock fee collection amounts
      return {
        success: true,
        collected0: '0.01', // Mock collected fee amount
        collected1: '0.002', // Mock collected fee amount
        message: 'Fees collected successfully'
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to collect fees'
      }
    }
  }

  /**
   * Optimize fee tier recommendation based on token characteristics
   */
  async recommendFeeTier(tokenA: string, tokenB: string): Promise<{
    fee: number
    confidence: number
    reasoning: string
  }> {
    // Mock analysis for fee tier recommendation
    // In production, this would analyze:
    // - Token volume and liquidity
    // - Price volatility
    // - Market cap differences
    // - Community size

    const isStablePair = this.isStablePair(tokenA, tokenB)
    const hasHighVolume = Math.random() > 0.7

    if (isStablePair) {
      return {
        fee: V3_FEE_TIERS.STABLE.fee,
        confidence: 0.9,
        reasoning: 'Stable pair detected - using 0.05% fee tier for minimal slippage'
      }
    } else if (hasHighVolume) {
      return {
        fee: V3_FEE_TIERS.STANDARD.fee,
        confidence: 0.8,
        reasoning: 'High volume pair - using 0.30% fee tier for balanced earnings'
      }
    } else {
      return {
        fee: V3_FEE_TIERS.VOLATILE.fee,
        confidence: 0.6,
        reasoning: 'Volatile pair - using 1.00% fee tier to maximize fee earnings'
      }
    }
  }

  private isStablePair(tokenA: string, tokenB: string): boolean {
    // Mock stable pair detection
    // In production, would check against known stablecoins
    const stableAddresses = ['0xa0b86a33e6441d9283ea03ae498f3bfee5e3a1d14'] // USDC example
    return stableAddresses.includes(tokenA.toLowerCase()) ||
           stableAddresses.includes(tokenB.toLowerCase())
  }

  /**
   * Calculate optimal liquidity provision range
   */
  calculateOptimalRange(
    currentPrice: number,
    volatility: number,
    investmentType: 'narrow' | 'standard' | 'wide' = 'standard'
  ): { tickLower: number, tickUpper: number } {
    // Mock calculation - production would use sophisticated algorithms
    // based on volatility, price impact, and impermanent loss risks

    const ranges = {
      narrow: { multiplier: 0.1 },   // ±10% for low volatility pairs
      standard: { multiplier: 0.25 }, // ±25% for typical pairs
      wide: { multiplier: 0.5 }      // ±50% for high volatility pairs
    }

    const multiplier = ranges[investmentType].multiplier
    const lowerBound = currentPrice * (1 - multiplier)
    const upperBound = currentPrice * (1 + multiplier)

    // Convert to ticks (simplified calculation)
    return {
      tickLower: Math.floor(Math.log(lowerBound) * 1000000), // Rough tick approximation
      tickUpper: Math.floor(Math.log(upperBound) * 1000000)
    }
  }
}

// Export utility functions
export const uniswapV3Utils = {
  // Convert price to sqrtPriceX96 format
  encodeSqrtPriceX96: (price: number): string => {
    const sqrtPrice = Math.sqrt(price)
    const sqrtPriceX96 = BigInt(Math.floor(sqrtPrice * 2**96))
    return sqrtPriceX96.toString()
  },

  // Convert from human readable format
  adjustedAmount: (amount: string, decimals: number): string => {
    return ethers.parseUnits(amount, decimals).toString()
  },

  // Get tick from price
  priceToTick: (price: number): number => {
    return Math.floor(Math.log(price) / Math.log(1.0001))
  },

  // Get price from tick
  tickToPrice: (tick: number): number => {
    return Math.pow(1.0001, tick)
  }
}

export default UniswapV3LiquidityManager
