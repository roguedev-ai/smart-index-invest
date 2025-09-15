/**
 * SMART INDEX PLATFORM - Core Data Models
 * Defines the fundamental types for TokenMarket's revolutionary Smart Index ecosystem
 */

import { ethers } from 'ethers'

// ============================================================================
// CORE ENTITY TYPES
// ============================================================================

export interface SmartIndex {
  /** Unique identifier for the index */
  id: string

  /** Human-readable name */
  name: string

  /** Creator of the index */
  creator: string

  /** Brief description */
  description: string

  /** Array of token allocations */
  tokens: AssetAllocation[]

  /** Index configuration rules */
  rules: IndexRules

  /** ERC-4626 vault address for the index */
  vaultAddress?: string

  /** PIT token contract address */
  pitAddress?: string

  /** Total value locked in the index */
  tvl: number

  /** Historical performance data */
  performance: PerformanceSnapshot[]

  /** Social metrics and engagement */
  social: SocialMetrics

  /** Administrative and compliance metadata */
  metadata: IndexMetadata

  /** Index status and lifecycle state */
  status: 'draft' | 'active' | 'paused' | 'terminated'
}

export interface AssetAllocation {
  /** ERC20 token address */
  address: string

  /** Human-readable symbol */
  symbol: string

  /** Token name */
  name: string

  /** Weight as percentage (0-100, normalized to total 100%) */
  weight: number

  /** Current price in USD */
  currentPrice?: number

  /** Current value in USD */
  currentValue?: number
}

export interface IndexRules {
  /** Rebalancing frequency */
  rebalanceFrequency: 'none' | 'daily' | 'weekly' | 'monthly' | 'quarterly'

  /** Maximum single token exposure (0-100%) */
  maxSingleAssetExposure: number

  /** Maximum drawdown threshold before rebalancing (-100 to 0) */
  maxDrawdownTrigger?: number

  /** Minimum liquidity score (0-100) */
  minLiquidityScore: number

  /** Volatility tolerance (0-100) */
  maxVolatilityThreshold: number

  /** Risk parameters */
  riskProfile: RiskProfile
}

export interface PerformanceSnapshot {
  /** Timestamp of the snapshot */
  timestamp: number

  /** Total index value in USD */
  totalValue: number

  /** Price of 1 PIT token */
  pitPrice: number

  /** 24h price change percentage */
  priceChange24h: number

  /** Total return since inception */
  totalReturn: number

  /** Sharpe ratio */
  sharpeRatio?: number

  /** Maximum drawdown */
  maxDrawdown: number

  /** Volatility (annualized) */
  volatility: number
}

// ============================================================================
// SOCIAL & COMMUNITY TYPES
// ============================================================================

export interface SocialMetrics {
  /** Total followers */
  followers: number

  /** Total copies (users copying this index) */
  copies: number

  /** Total subscribers with auto-tracking */
  subscribers: number

  /** Users who invested in the index */
  investors: number

  /** Array of follower relationships */
  followerList: Follower[]

  /** Total fees earned by creator */
  totalCreatorFees: number

  /** Average rating (1-5 stars) */
  rating: number

  /** Number of reviews */
  reviews: number
}

export interface Follower {
  /** User address */
  address: string

  /** When they started following */
  followedSince: number

  /** Investment amount in PIT tokens */
  investedAmount: number

  /** Subscription tier */
  subscriptionTier: 'free' | 'premium' | 'vip'
}

export interface IndexReview {
  /** Review ID */
  id: string

  /** Reviewer address */
  reviewer: string

  /** Rating (1-5 stars) */
  rating: number

  /** Review text */
  comment: string

  /** Timestamp */
  timestamp: number
}

// ============================================================================
// TRADING & LIQUIDITY TYPES
// ============================================================================

export interface IndexPool {
  /** Uniswap V3 pool address */
  poolAddress: string

  /** PIT token address */
  pitToken: string

  /** Pairing token address (usually stablecoin) */
  pairToken: string

  /** Current price of the index */
  currentPrice: number

  /** 24h volume */
  volume24h: number

  /** Total liquidity */
  totalLiquidity: number

  /** Fee tier (500 for 0.05%) */
  feeTier: number
}

export interface TradingOrder {
  /** Order ID */
  id: string

  /** Order type */
  type: 'limit' | 'market' | 'stop'

  /** Buy or sell */
  side: 'buy' | 'sell'

  /** Index ID */
  indexId: string

  /** Amount of PIT tokens */
  amount: number

  /** Price per PIT token (set to 0 for market orders) */
  price: number

  /** Stop price (for stop orders) */
  stopPrice?: number

  /** Order status */
  status: 'open' | 'filled' | 'cancelled' | 'partially_filled'

  /** Timestamp of order creation */
  createdAt: number

  /** Fill history */
  fills: OrderFill[]
}

export interface OrderFill {
  /** Fill ID */
  id: string

  /** Amount filled */
  amount: number

  /** Price per unit */
  price: number

  /** Timestamp */
  timestamp: number

  /** Trader who matched with this order */
  counterparty: string
}

// ============================================================================
// ANALYTICS & PERFORMANCE TYPES
// ============================================================================

export interface BenchmarkComparison {
  /** Benchmark name */
  name: string

  /** Type of benchmark */
  type: 'crypto_asset' | 'index' | 'traditional_asset'

  /** Asset symbol or identifier */
  symbol: string

  /** Current value */
  value: number

  /** 1D change */
  change1d: number

  /** 7D change */
  change7d: number

  /** 30D change */
  change30d: number

  /** Correlation with the index (-1 to 1) */
  correlation?: number

  /** Benchmark color for charts */
  color: string
}

export interface RiskMetrics {
  /** Value at Risk (95% confidence, 30-day) */
  vaR95_30d: number

  /** Expected shortfall (95% confidence, 30-day) */
  es95_30d: number

  /** Current sharpe ratio */
  sharpeRatio: number

  /** Current max drawdown */
  maxDrawdown: number

  /** Current volatility (annualized) */
  volatility: number

  /** Beta relative to market */
  beta: number

  /** Sortino ratio (focuses on downside volatility) */
  sortinoRatio: number
}

export interface PortfolioAnalytics {
  /** Total portfolio value */
  totalValue: number

  /** Total invested amount */
  totalInvested: number

  /** Unrealized gains/losses */
  unrealizedPnL: number

  /** Percentage gain/loss */
  totalReturn: number

  /** Best performing index */
  bestPerformer: {
    indexId: string
    return: number
  }

  /** Worst performing index */
  worstPerformer: {
    indexId: string
    return: number
  }

  /** Diversification score (0-100) */
  diversificationScore: number

  /** Risk-adjusted returns */
  sharpeRatio: number
}

// ============================================================================
// USER & ACCOUNT TYPES
// ============================================================================

export interface User {
  /** Ethereum address */
  address: string

  /** Display name (optional) */
  displayName?: string

  /** User profile avatar */
  avatar?: string

  /** Accreditation/kyc status */
  kycStatus: 'none' | 'pending' | 'verified' | 'rejected'

  /** Portfolio information */
  portfolio: PortfolioAnalytics

  /** Social following relationships */
  following: Following[]

  /** Created indexes */
  createdIndexes: string[]

  /** Favorited indexes */
  favoriteIndexes: string[]

  /** Trading statistics */
  stats: UserStats
}

export interface Following {
  /** Index ID being followed */
  indexId: string

  /** Follow type */
  type: 'social_follow' | 'copy_strategy' | 'subscribe_alerts'

  /** When the follow started */
  followedSince: number

  /** Notification preferences */
  notifications: NotificationPreferences
}

export interface UserStats {
  /** Total trading volume */
  totalVolume: number

  /** Total trades executed */
  totalTrades: number

  /** Win rate percentage */
  winRate: number

  /** Average trade size */
  avgTradeSize: number

  /** Current portfolio allocation */
  portfolioDistribution: { [symbol: string]: number }

  /** Risk score (0-100, 100 being most conservative) */
  riskScore: number

  /** Account creation date */
  accountAge: number

  /** Partner/pro affiliation status */
  isPartner: boolean
}

// ============================================================================
// ADMIN & COMPLIANCE TYPES
// ============================================================================

export interface IndexMetadata {
  /** Creation timestamp */
  createdAt: number

  /** Last update timestamp */
  updatedAt: number

  /** Last rebalancing timestamp */
  lastRebalance?: number

  /** Index version for contract upgrades */
  version: string

  /** Governance approvals (if required) */
  approvals?: ApprovalRecord[]

  /** Blacklist/whitelist status */
  whitelistStatus: 'whitelisted' | 'pending_review' | 'blacklisted'

  /** Regulatory compliance markers */
  complianceFlags: ComplianceFlag[]
}

export interface ApprovalRecord {
  /** Governance vote ID */
  voteId: string

  /** Approving address */
  approver: string

  /** Approval timestamp */
  timestamp: number

  /** Reason for approval/rejection */
  reason: string
}

export interface ComplianceFlag {
  /** Flag type */
  type: 'kyc_required' | 'volume_control' | 'geographic_restriction'

  /** Flag severity */
  severity: 'low' | 'medium' | 'high'

  /** Event that triggered the flag */
  triggerEvent: string

  /** Timestamp */
  timestamp: number

  /** Resolution status */
  resolved: boolean
}

// ============================================================================
// SMART CONTRACT INTEGRATION TYPES
// ============================================================================

export interface IndexContractState {
  /** Current total assets */
  totalAssets: bigint

  /** Current total supply of PIT tokens */
  totalSupply: bigint

  /** Current allocations */
  allocations: { [tokenAddress: string]: bigint }

  /** Fee data */
  fees: {
    performanceFee: number // PERCENT * 100
    managementFee: number // PERCENT * 100
    withdrawFee: number // PERCENT * 100
  }

  /** Emergency stop status */
  paused: boolean

  /** Governing address */
  governance: string
}

export interface RebalancingInstruction {
  /** Index ID */
  indexId: string

  /** Target allocations after rebalancing */
  targetAllocations: { [tokenAddress: string]: number }

  /** Estimated gas cost */
  estimatedGas: number

  /** Expected execution timestamp */
  executeAt: number

  /** Authorized signer */
  signer: string
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
  timestamp: number
  requestId: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasNext: boolean
  hasPrev: boolean
}

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export type RiskProfile = 'conservative' | 'balanced' | 'aggressive' | 'ultra_high_risk'

export type NotificationPreferences = {
  performanceUpdates: boolean
  rebalanceNotifications: boolean
  riskAlerts: boolean
  socialActivities: boolean
}

export type IndexCategory = 'tech' | 'defi' | 'layer1' | 'memecoins' | 'cross_chain' | 'privacy' | 'infrastructure'

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type PartialSmartIndex = Partial<SmartIndex>
export type CreateIndexRequest = Omit<SmartIndex, 'id' | 'vaultAddress' | 'pitAddress' | 'performance' | 'social' | 'metadata' | 'status'>
export type UpdateIndexRequest = Partial<CreateIndexRequest>

// Export all interfaces as namespace
export namespace SmartIndexTypes {
  export type Index = SmartIndex
  export type Allocation = AssetAllocation
  export type Rules = IndexRules
  export type Performance = PerformanceSnapshot[]
  export type Social = SocialMetrics
  export type FollowerData = Follower
  export type Review = IndexReview
  export type Pool = IndexPool
  export type Order = TradingOrder
  export type Benchmark = BenchmarkComparison
  export type Risk = RiskMetrics
  export type Portfolio = PortfolioAnalytics
  export type UserData = User
  export type FollowingData = Following
  export type Stats = UserStats
  export type Metadata = IndexMetadata
  export type ContractState = IndexContractState
  export type RebalanceInstruction = RebalancingInstruction
  export type ApiResponseType<T> = ApiResponse<T>
  export type PaginatedResponseType<T> = PaginatedResponse<T>
}
