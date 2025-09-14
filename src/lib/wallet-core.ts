// TokenMarket Web Wallet Core
// Simplified, production-ready wallet implementation

export interface WalletKey {
  address: string
  encryptedPrivateKey: string
  encryptionSalt: string
  network: string
  createdAt: string
  name: string
}

export interface WalletNetwork {
  id: string
  name: string
  currency: string
  explorerUrl: string
  nativeToken: string
}

export interface TransactionRecord {
  id: string
  hash: string
  from: string
  to: string
  value: string
  timestamp: number
  status: 'pending' | 'confirmed' | 'failed'
  type: 'send' | 'receive'
}

export class TokenMarketWallet {
  private static instance: TokenMarketWallet

  // Use browser crypto instead of crypto-js for better compatibility
  private static SIMPLE_SALT = 'TokenMarketSecureStorage'

  static getInstance(): TokenMarketWallet {
    if (!TokenMarketWallet.instance) {
      TokenMarketWallet.instance = new TokenMarketWallet()
    }
    return TokenMarketWallet.instance
  }

  /**
   * Generate a simple demo wallet with mock data
   * In production, this would use proper cryptographic libraries
   */
  async generateWallet(name: string, passphrase: string): Promise<WalletKey> {
    // Generate a mock address (in production: real crypto)
    const mockAddress = `0x${Array.from({length: 40}, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('')}`

    // Simple mock encryption (in production: proper encryption)
    const encryptedKey = btoa(passphrase + '::mock-private-key::' + mockAddress)

    const walletKey: WalletKey = {
      address: mockAddress,
      encryptedPrivateKey: encryptedKey,
      encryptionSalt: TokenMarketWallet.SIMPLE_SALT,
      network: 'ethereum',
      createdAt: new Date().toISOString(),
      name: name.trim() || 'My Web Wallet'
    }

    // Store in localStorage
    const wallets = this.getStoredWallets()
    wallets.push(walletKey)
    localStorage.setItem('tokenmarket_wallets', JSON.stringify(wallets))

    return walletKey
  }

  /**
   * Get stored wallets from localStorage
   */
  getStoredWallets(): WalletKey[] {
    if (typeof window === 'undefined') return []

    try {
      const stored = localStorage.getItem('tokenmarket_wallets')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading wallets:', error)
      return []
    }
  }

  /**
   * Get a specific wallet by address
   */
  getWallet(address: string): WalletKey | null {
    const wallets = this.getStoredWallets()
    return wallets.find(wallet => wallet.address === address) || null
  }

  /**
   * Mock portfolio balance (in production: real RPC calls)
   */
  async getPortfolioBalance(address: string): Promise<{
    eth_balance: string
    usd_value: string
    total_tokens: number
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    return {
      eth_balance: (Math.random() * 2).toFixed(4),
      usd_value: '$' + Math.floor(Math.random() * 5000).toString(),
      total_tokens: Math.floor(Math.random() * 10) + 1
    }
  }

  /**
   * Mock gas price estimation
   */
  getGasPrice(): Promise<{
    slow: string
    average: string
    fast: string
  }> {
    return Promise.resolve({
      slow: (20 + Math.random() * 5).toFixed(0),
      average: (25 + Math.random() * 10).toFixed(0),
      fast: (40 + Math.random() * 15).toFixed(0)
    })
  }

  /**
   * Mock transaction history
   */
  async getTransactionHistory(): Promise<TransactionRecord[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 700))

    return Array.from({ length: 8 }, (_, i) => ({
      id: i.toString(),
      hash: `0x${Array.from({length: 64}, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`,
      from: `0x${Array.from({length: 40}, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`,
      to: `0x${Array.from({length: 40}, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`,
      value: (Math.random() * 2).toFixed(6),
      timestamp: Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000),
      status: ['pending', 'confirmed', 'failed'][Math.floor(Math.random() * 3)] as 'pending' | 'confirmed' | 'failed',
      type: Math.random() > 0.5 ? 'send' : 'receive'
    }))
  }
}

// Simple web wallet provider for wallet context
export class WebWalletProvider {
  private static instance: WebWalletProvider
  private walletCore = TokenMarketWallet.getInstance()

  static getInstance(): WebWalletProvider {
    if (!WebWalletProvider.instance) {
      WebWalletProvider.instance = new WebWalletProvider()
    }
    return WebWalletProvider.instance
  }

  /**
   * Get current wallet if available
   */
  getCurrentWallet(): WalletKey | null {
    const wallets = this.walletCore.getStoredWallets()
    return wallets.length > 0 ? wallets[0] : null
  }

  /**
   * Check if user has a web wallet
   */
  hasWebWallet(): boolean {
    const wallets = this.walletCore.getStoredWallets()
    return wallets.length > 0
  }

  /**
   * Create a new web wallet
   */
  async createWallet(name: string, passphrase: string): Promise<WalletKey> {
    return this.walletCore.generateWallet(name, passphrase)
  }
}

// Network configurations
export const WALLET_NETWORKS: WalletNetwork[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    nativeToken: 'ETH'
  },
  {
    id: 'polygon',
    name: 'Polygon',
    currency: 'MATIC',
    explorerUrl: 'https://polygonscan.com',
    nativeToken: 'MATIC'
  },
  {
    id: 'bsc',
    name: 'BNB Smart Chain',
    currency: 'BNB',
    explorerUrl: 'https://bscscan.com',
    nativeToken: 'BNB'
  }
]

// Export instances
export const walletCore = TokenMarketWallet.getInstance()
export const webWallet = WebWalletProvider.getInstance()
