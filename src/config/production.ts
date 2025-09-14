/**
 * Production Configuration for TokenMarket
 *
 * This file contains all production settings and configurations needed for:
 * - Blockchain network deployments
 * - Gas pricing and limits
 * - API keys and service integrations
 * - Security settings and policies
 * - Deployment parameters and constraints
 */

export interface ProductionConfig {
  // Blockchain Networks
  networks: {
    ethereum: NetworkConfig
    polygon: NetworkConfig
    bsc: NetworkConfig
    arbitrum?: NetworkConfig
    optimism?: NetworkConfig
  }

  // API Service Keys
  apis: {
    infura: { projectId: string, secret: string }
    alchemy: { apiKey: string, apiSecret: string }
    moralis: { apiKey: string, apiSecret: string }
    coingecko: { apiKey: string }
    polygonRpc?: string
    bscRpc?: string
  }

  // Gas & Transaction Settings
  gas: {
    maxGasPriceGwei: number
    maxGasLimit: number
    priorityFeeGwei: number
    defaultGasMultiplier: number
  }

  // Token Deployment Settings
  deployment: {
    maxSupply: string
    defaultSupply: string
    maxNameLength: number
    maxSymbolLength: number
    supportedStandards: ('ERC20' | 'ERC721' | 'ERC1155')[]
  }

  // Security Settings
  security: {
    require2FA: boolean
    maxFailedAttempts: number
    sessionTimeout: number // minutes
    ipWhitelist: boolean
    allowedOrigins: string[]
  }

  // Fee Structure
  fees: {
    platformFee: number // basis points
    deploymentFee: number // basis points
    networkFees: { [networkId: string]: number } // basis points per network
  }

  // Database (when backend is ready)
  database?: {
    type: 'postgresql' | 'mongodb'
    connectionString: string
    poolSize: number
  }

  //redis (for caching and sessions)
  redis?: {
    url: string
    password: string
    maxRetriesPerRequest: number
  }

  // Email service
  email?: {
    provider: 'sendgrid' | 'aws-ses' | 'smtp'
    apiKey: string
    fromAddress: string
  }
}

interface NetworkConfig {
  chainId: number
  rpcUrls: string[]
  fallbackRpcUrls: string[]
  blockExplorerUrls: string[]
  nativeCurrency: {
    name: string
    symbol: string
    decimals: 18
  }
  gasSettings: {
    maxFeePerGas: string // gwei
    maxPriorityFeePerGas: string // gwei
    gasLimitMultiplier: number
  }
}

export const productionConfig: ProductionConfig = {
  networks: {
    ethereum: {
      chainId: 1,
      rpcUrls: [
        'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID',
        'https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY'
      ],
      fallbackRpcUrls: [
        'https://cloudflare-eth.com',
        'https://rpc.microsoft.rs/'
      ],
      blockExplorerUrls: ['https://etherscan.io'],
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      },
      gasSettings: {
        maxFeePerGas: '100',
        maxPriorityFeePerGas: '5',
        gasLimitMultiplier: 1.2
      }
    },

    polygon: {
      chainId: 137,
      rpcUrls: [
        'https://polygon-rpc.com/',
        'https://rpc-mainnet.matic.network',
        'https://matic-mainnet.chainstacklabs.com'
      ],
      fallbackRpcUrls: [
        'https://polygon-rpc.com/',
        'https://rpc-mainnet.maticvigil.com'
      ],
      blockExplorerUrls: ['https://polygonscan.com'],
      nativeCurrency: {
        name: 'Polygon Matic',
        symbol: 'MATIC',
        decimals: 18
      },
      gasSettings: {
        maxFeePerGas: '300',
        maxPriorityFeePerGas: '35',
        gasLimitMultiplier: 1.3
      }
    },

    bsc: {
      chainId: 56,
      rpcUrls: [
        'https://bsc-dataseed1.binance.org/',
        'https://bsc-dataseed2.binance.org/',
        'https://bsc-dataseed3.binance.org/'
      ],
      fallbackRpcUrls: [
        'https://bsc-dataseed4.binance.org/',
        'https://bscrpc.com/'
      ],
      blockExplorerUrls: ['https://bscscan.com'],
      nativeCurrency: {
        name: 'Binance Chain Native Token',
        symbol: 'BNB',
        decimals: 18
      },
      gasSettings: {
        maxFeePerGas: '25',
        maxPriorityFeePerGas: '3.5',
        gasLimitMultiplier: 1.1
      }
    }
  },

  apis: {
    infura: {
      projectId: process.env.INFURA_PROJECT_ID || '',
      secret: process.env.INFURA_PROJECT_SECRET || ''
    },
    alchemy: {
      apiKey: process.env.ALCHEMY_API_KEY || '',
      apiSecret: process.env.ALCHEMY_API_SECRET || ''
    },
    moralis: {
      apiKey: process.env.MORALIS_API_KEY || '',
      apiSecret: process.env.MORALIS_API_SECRET || ''
    },
    coingecko: {
      apiKey: process.env.COINGECKO_API_KEY || ''
    }
  },

  gas: {
    maxGasPriceGwei: 200,
    maxGasLimit: 3000000,
    priorityFeeGwei: 5,
    defaultGasMultiplier: 1.2
  },

  deployment: {
    maxSupply: '1000000000000000000000000', // 10^24
    defaultSupply: '1000000000', // 1B
    maxNameLength: 30,
    maxSymbolLength: 10,
    supportedStandards: ['ERC20']
  },

  security: {
    require2FA: true,
    maxFailedAttempts: 5,
    sessionTimeout: 1440, // 24 hours
    ipWhitelist: false,
    allowedOrigins: [
      'https://tokenmarket.com',
      'https://admin.tokenmarket.com',
      'http://localhost:3000' // for development
    ]
  },

  fees: {
    platformFee: 500, // 5%
    deploymentFee: 250, // 2.5%
    networkFees: {
      ethereum: 100, // 1% for ETH
      polygon: 50,  // 0.5% for MATIC
      bsc: 75       // 0.75% for BNB
    }
  }
}

// Production validation
export const validateProductionConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  // Check if required environment variables are set
  if (!productionConfig.apis.infura.projectId) {
    errors.push('INFURA_PROJECT_ID is required for Ethereum/Polygon support')
  }

  if (!productionConfig.apis.alchemy.apiKey) {
    errors.push('ALCHEMY_API_KEY recommended for high-reliability RPC')
  }

  // Check network configurations
  Object.entries(productionConfig.networks).forEach(([networkName, config]) => {
    if (!config.rpcUrls.some(url => !url.includes('YOUR'))) {
      errors.push(`${networkName}: Production RPC URLs must be configured`)
    }
  })

  // Check gas limits
  if (productionConfig.gas.maxGasPriceGwei < 20 || productionConfig.gas.maxGasPriceGwei > 500) {
    errors.push('Gas price limits appear incorrect for current network conditions')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// Export various utility functions
export const getNetworkConfig = (chainId: number) => {
  return Object.values(productionConfig.networks).find(net => net.chainId === chainId)
}

export const calculateDeploymentFee = (supply: string, networkName: string): number => {
  const networkFee = productionConfig.fees.networkFees[networkName] || 100
  const platformFee = productionConfig.fees.platformFee
  const deploymentFee = productionConfig.fees.deploymentFee

  // Calculate fee based on token supply size
  const supplyNum = parseInt(supply) || 0
  let tierMultiplier = 1

  if (supplyNum > 1000000000) tierMultiplier = 1.5 // Large supply
  if (supplyNum > 100000000000) tierMultiplier = 2 // Huge supply

  const totalFeeBP = platformFee + deploymentFee + networkFee
  return totalFeeBP * tierMultiplier
}

export const getGasEstimate = (networkName: string, operation: 'deploy' | 'mint' | 'transfer' = 'deploy'): number => {
  const multipliers = {
    deploy: 2000000,
    mint: 150000,
    transfer: 65000
  }

  return multipliers[operation] * productionConfig.networks[networkName as keyof typeof productionConfig.networks]?.gasSettings.gasLimitMultiplier || 1
}

// Feature flags for gradual rollout
export const featureFlags = {
  multiAdmin: true,
  revenueSharing: false,
  tierPricing: false,
  advancedAnalytics: false,
  automatedBackup: true
}
