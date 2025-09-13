// Dynamic pricing configuration for TokenMarket enterprise platform

export interface PricingTier {
  id: string
  name: string
  description: string
  baseFee: number // Base creation fee in ETH
  features: string[]
  multiplier: number // Revenue multiplier for this tier
  featured?: boolean
  enabled: boolean
}

export interface TokenConfiguration {
  standardERC20: number
  flexibleERC20: number
  commercialERC20: number
  securityERC20: number
}

export interface ServicePricing {
  audit: number
  branding: number
  marketing: number
  priority: number
  multisig: number
  staking: number
}

export interface DiscountRules {
  bulkDiscounts: { min: number; discount: number }[]
  volumeDiscounts: { threshold: number; discount: number }[]
  loyaltyDiscounts: { tokensCreated: number; discount: number }[]
  referralDiscounts: { code: string; discount: number }[]
}

// Default enterprise pricing configuration
export const defaultPricingConfig = {
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  currency: "ETH",

  // Tier-based pricing system
  tiers: [
    {
      id: "basic",
      name: "Basic",
      description: "Essential token creation with standard features",
      baseFee: 0.01,
      features: [
        "Standard ERC-20 contract",
        "Basic audit review",
        "Community support"
      ],
      multiplier: 1.0,
      enabled: true,
      featured: false
    },
    {
      id: "standard",
      name: "Standard",
      description: "Enhanced token creation with premium features",
      baseFee: 0.025,
      features: [
        "Advanced ERC-20 contract",
        "Security audit included",
        "Marketing template",
        "Priority deployment"
      ],
      multiplier: 2.75,
      enabled: true,
      featured: true
    },
    {
      id: "premium",
      name: "Premium",
      description: "Enterprise token creation with full service",
      baseFee: 0.05,
      features: [
        "Custom contract features",
        "Full security audit",
        "Branding & marketing",
        "Dedicated support",
        "Multi-chain deployment"
      ],
      multiplier: 6.25,
      enabled: true,
      featured: false
    }
  ] as PricingTier[],

  // Token type multipliers
  tokenTypes: {
    "Standard ERC20": 1.0,
    "Flexible ERC20": 1.2,
    "Commercial ERC20": 1.4,
    "Security ERC20": 1.8
  },

  // Add-on services pricing
  services: {
    audit: 10.0, // USDC for smart contract audit
    branding: 25.0, // USDC for custom branding
    marketing: 50.0, // USDC for marketing package
    priority: 5.0, // ETH for instant deployment
    multisig: 0.05, // ETH for multisig setup
    staking: 0.1 // ETH for staking contract
  } as ServicePricing,

  // Complex discount system
  discounts: {
    bulkDiscounts: [
      { min: 10, discount: 0.05 },
      { min: 25, discount: 0.10 },
      { min: 50, discount: 0.15 },
      { min: 100, discount: 0.25 }
    ],
    volumeDiscounts: [
      { threshold: 1000000, discount: 0.02 },
      { threshold: 5000000, discount: 0.05 },
      { threshold: 25000000, discount: 0.08 },
      { threshold: 50000000, discount: 0.12 }
    ],
    loyaltyDiscounts: [
      { tokensCreated: 5, discount: 0.03 },
      { tokensCreated: 25, discount: 0.08 },
      { tokensCreated: 100, discount: 0.15 }
    ],
    referralDiscounts: [
      { code: "TOKENMARKET10", discount: 0.10 },
      { code: "ENTERPRISE20", discount: 0.20 },
      { code: "CRYPTO50", discount: 0.50 }
    ]
  } as DiscountRules,

  // Seasonal promotions
  promotions: {
    active: [],
    available: [
      {
        id: "launch_discount",
        name: "Launch Special",
        description: "50% off first month",
        discount: 0.50,
        activeTimeframe: {
          start: "2025-01-01",
          end: "2025-03-31"
        },
        enabled: false
      },
      {
        id: "flash_sale",
        name: "Flash Sale",
        description: "1 week only discount",
        discount: 0.25,
        activeTimeframe: {
          start: "2025-01-01",
          end: "2025-01-01"
        },
        enabled: false
      }
    ]
  },

  // Admin fee distribution (for Phase C)
  adminFees: {
    platform: 0.1, // 10% goes to platform
    referrals: 0.05, // 5% to referral program
    masterAdmin: 0.85, // 85% to master admin
    subAdmins: 0 // Sub-admins distribution (for Phase C)
  }
}

// Pricing calculation functions
export function calculateTokenCreationFee(
  tier: PricingTier,
  tokenType: string,
  additionalServices: string[] = [],
  referralCode?: string,
  tokensCreated = 0
): number {
  let baseFee = tier.baseFee

  // Apply token type multiplier
  const tokenMultiplier = defaultPricingConfig.tokenTypes[tokenType as keyof typeof defaultPricingConfig.tokenTypes] || 1.0
  baseFee *= tokenMultiplier

  // Add service fees
  additionalServices.forEach(service => {
    const serviceKey = service.toLowerCase() as keyof ServicePricing
    if (defaultPricingConfig.services[serviceKey]) {
      baseFee += defaultPricingConfig.services[serviceKey]
    }
  })

  // Apply loyalty discount
  const loyaltyDiscount = defaultPricingConfig.discounts.loyaltyDiscounts
    .sort((a, b) => b.tokensCreated - a.tokensCreated)
    .find(discount => tokensCreated >= discount.tokensCreated)

  if (loyaltyDiscount) {
    baseFee *= (1 - loyaltyDiscount.discount)
  }

  // Apply referral code discount
  if (referralCode) {
    const referralDiscount = defaultPricingConfig.discounts.referralDiscounts
      .find(discount => discount.code === referralCode)

    if (referralDiscount) {
      baseFee *= (1 - referralDiscount.discount)
    }
  }

  return baseFee
}

export function calculateBulkDiscount(totalTokens: number, baseFee: number): number {
  const bulkDiscount = defaultPricingConfig.discounts.bulkDiscounts
    .sort((a, b) => b.min - a.min)
    .find(discount => totalTokens >= discount.min)

  if (bulkDiscount) {
    return baseFee * (1 - bulkDiscount.discount)
  }

  return baseFee
}

export function getTierById(tierId: string): PricingTier | undefined {
  return defaultPricingConfig.tiers.find(tier => tier.id === tierId)
}

export function getAllActiveTiers(): PricingTier[] {
  return defaultPricingConfig.tiers.filter(tier => tier.enabled)
}

// Fee distribution calculation (for Phase C setup)
export function calculateFeeDistribution(fee: number) {
  const adminFees = defaultPricingConfig.adminFees
  return {
    platform: fee * adminFees.platform,
    referrals: fee * adminFees.referrals,
    masterAdmin: fee * adminFees.masterAdmin,
    subAdmins: fee * adminFees.subAdmins
  }
}

// Price formatting utilities
export function formatPrice(price: number, currency = 'ETH'): string {
  if (price < 0.001) {
    return `${price.toFixed(6)} ${currency}`
  }
  return `${price.toFixed(4)} ${currency}`
}

export function formatUSDPrice(price: number, ethToUSD = 2713): string {
  const usdValue = price * ethToUSD
  if (usdValue < 1) {
    return `${usdValue.toFixed(4)} USD`
  }
  return `$${usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD`
}
