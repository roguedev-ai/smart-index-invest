export const config = {
  // App Configuration
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  // Admin Configuration
  adminWallet: process.env.ADMIN_WALLET_ADDRESS || '0x742d35Cc6634C0532925a3b844Bc454e4438f44f',
  creationFee: parseFloat(process.env.CREATION_FEE_ETH || '0.01'),

  // Network Configuration
  defaultNetwork: process.env.NEXT_PUBLIC_DEFAULT_NETWORK || 'ethereum',
  supportedNetworks: (process.env.NEXT_PUBLIC_SUPPORTED_NETWORKS || 'ethereum,polygon,bsc').split(','),

  // Token Limits
  tokenLimits: {
    maxSupply: parseInt(process.env.MAX_TOKEN_SUPPLY || '1000000000000'),
    minSupply: parseInt(process.env.MIN_TOKEN_SUPPLY || '1'),
    minNameLength: parseInt(process.env.MIN_TOKEN_NAME_LENGTH || '3'),
    maxNameLength: parseInt(process.env.MAX_TOKEN_NAME_LENGTH || '30'),
    minSymbolLength: parseInt(process.env.MIN_TOKEN_SYMBOL_LENGTH || '2'),
    maxSymbolLength: parseInt(process.env.MAX_TOKEN_SYMBOL_LENGTH || '10'),
  },

  // Wallet Configuration
  walletConnectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '56e1368dc3a2cb3e4d48a00ebd1e1da5',
}

// Validation helpers
export const validateTokenName = (name: string): { valid: boolean; message?: string } => {
  if (!name) return { valid: false, message: 'Token name is required' }
  if (name.length < config.tokenLimits.minNameLength) {
    return { valid: false, message: `Token name must be at least ${config.tokenLimits.minNameLength} characters` }
  }
  if (name.length > config.tokenLimits.maxNameLength) {
    return { valid: false, message: `Token name must be no more than ${config.tokenLimits.maxNameLength} characters` }
  }
  return { valid: true }
}

export const validateTokenSymbol = (symbol: string): { valid: boolean; message?: string } => {
  if (!symbol) return { valid: false, message: 'Token symbol is required' }
  if (symbol.length < config.tokenLimits.minSymbolLength) {
    return { valid: false, message: `Token symbol must be at least ${config.tokenLimits.minSymbolLength} characters` }
  }
  if (symbol.length > config.tokenLimits.maxSymbolLength) {
    return { valid: false, message: `Token symbol must be no more than ${config.tokenLimits.maxSymbolLength} characters` }
  }
  if (!/^[A-Z]+$/.test(symbol.toUpperCase())) {
    return { valid: false, message: 'Token symbol must contain only uppercase letters' }
  }
  return { valid: true }
}

export const validateTokenSupply = (supply: number): { valid: boolean; message?: string } => {
  if (isNaN(supply) || supply < config.tokenLimits.minSupply) {
    return { valid: false, message: `Token supply must be at least ${config.tokenLimits.minSupply}` }
  }
  if (supply > config.tokenLimits.maxSupply) {
    return { valid: false, message: `Token supply must be no more than ${config.tokenLimits.maxSupply}` }
  }
  return { valid: true }
}

// Fee calculation
export const calculateCreationFee = (): number => {
  return config.creationFee
}

export const formatEthValue = (value: number): string => {
  return `${value.toFixed(18).replace(/\.?0+$/, '')} ETH`
}

// Network helpers
export const getNetworkName = (networkId: string): string => {
  const networkMap: Record<string, string> = {
    ethereum: 'Ethereum',
    polygon: 'Polygon',
    bsc: 'Binance Smart Chain',
    arbitrum: 'Arbitrum',
    optimism: 'Optimism'
  }
  return networkMap[networkId] || networkId
}

export const getNetworkRpcUrl = (networkId: string): string => {
  const rpcMap: Record<string, string> = {
    ethereum: 'https://eth.llamarpc.com',
    polygon: 'https://polygon-bor.public.blastapi.io',
    bsc: 'https://bsc-dataseed.binance.org/',
    arbitrum: 'https://arbitrum.llamarpc.com',
    optimism: 'https://mainnet.optimism.io'
  }
  return rpcMap[networkId] || ''
}
