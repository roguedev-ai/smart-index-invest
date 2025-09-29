'use client'

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useWallet } from "@/components/providers/wallet-provider"
import Link from "next/link"
import { SmartIndex, SmartIndexTypes } from "@/types/smart-index"

// Inherit from WalletToken interface
interface WalletToken {
  address: string
  symbol: string
  name: string
  balance: string
  value: string
  change24h: number
  decimals: number
}

interface Contract {
  name: string
  symbol: string
  address: string
  type: 'ERC20' | 'ERC721' | 'SmartIndex' | 'UniswapV3'
  network: string
  created: Date
  status: 'deployed' | 'pending' | 'failed'
}

interface Trade {
  id: string
  type: 'buy' | 'sell' | 'swap'
  asset: string
  amount: string
  price: string
  total: string
  status: 'pending' | 'completed' | 'failed'
  timestamp: number
  txHash?: string
}

// All icon components as inline SVGs
const PlusIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
)

const CoinIcon = ({ className }: { className?: string }) => (
  <svg className={`h-8 w-8 ${className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <circle cx="12" cy="12" r="10" strokeWidth={1} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
)

const WalletIcon = () => (
  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
)

const TrendingUpBig = ({ className }: { className?: string }) => (
  <svg className={`h-8 w-8 ${className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const CoinSmallIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <circle cx="12" cy="12" r="10" strokeWidth={1} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
)

const Eye = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const ExternalLink = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
)

const SimpleSwapIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
  </svg>
)

const PortfolioIconComponent = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const TrendUpIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const TrendDownIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
)

const TokenIconUser = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
)

const HistoryIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const SettingIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066 1.758 1.758 0 001.053 2.643c1.646.366 1.646 2.688 0 3.054-.483 1.036-1.683 1.036-2.166 0a1.724 1.724 0 00-2.573 1.066c1.244.749 1.244 2.684 0 3.433a1.724 1.724 0 00-2.573-1.066c-1.646-.366-1.646-2.688 0-3.054.483-1.036 1.683-1.036 2.166 0a1.724 1.724 0 002.573-1.066c-.427-1.756-2.925-1.756-3.35 0zM12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" />
  </svg>
)

const TrendingUp = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const TrendingDown = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
)

const BarChart3 = ({ className }: { className?: string }) => (
  <svg className={`h-12 w-12 ${className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const SocialIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h-8a3 3 0 01-3-3V8a3 3 0 013-3h8a3 3 0 013 3v9a3 3 0 01-3 3z" />
    <circle cx="9" cy="10" r="2" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

const RefreshIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 0015.418 7a8.001 8.001 0 00-7.749 8.026L9 15l6-6-6-6-1.395 1.394A8.002 8.002 0 0122.762 12H19v1z" />
  </svg>
)

// Mock crypto market data
const cryptoPrices = [
  { symbol: "BTC", name: "Bitcoin", price: 61248.50, change: +2.34, volume: "24.3B", icon: "₿" },
  { symbol: "ETH", name: "Ethereum", price: 3875.20, change: +1.87, volume: "12.1B", icon: "Ξ" },
  { symbol: "MATIC", name: "Polygon", price: 0.8143, change: -0.45, volume: "2.8B", icon: "🟣" },
  { symbol: "BNB", name: "Binance Coin", price: 532.18, change: +0.98, volume: "1.9B", icon: "🟡" },
  { symbol: "USDT", name: "Tether", price: 1.000, change: +0.01, volume: "68.2B", icon: "$" },
  { symbol: "USDC", name: "USD Coin", price: 0.9999, change: -0.01, volume: "45.8B", icon: "💰" }
]

export function UserDashboard() {
  // ALL hooks must be called at the top level - in the same order every render
  const { user, isAuthenticated, logout } = useAuth()
  const {
    address,
    isConnected,
    network,
    balance,
    tokens,
    transactions,
    socialEnabled,
    socialProfiles,
    refreshData,
    activateSocialFeatures
  } = useWallet()

  const [isMounted, setIsMounted] = useState(false)
  const [selectedTab, setSelectedTab] = useState("portfolio")
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // User data arrays now use real wallet data
  const [userIndexes, setUserIndexes] = useState<SmartIndex[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshData()
    setRefreshing(false)
  }

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserData()
    }
  }, [isAuthenticated, user])

  const fetchUserData = async () => {
    try {
      setLoading(true)

      // Fetch user's smart indexes
      if (user?.address) {
        const indexesResponse = await fetch(`/api/user/${user.address}/indexes`)
        if (indexesResponse.ok) {
          const data = await indexesResponse.json()
          setUserIndexes(data.indexes || [])
        }

        // Fetch user's contracts
        const contractsResponse = await fetch(`/api/user/${user.address}/contracts`)
        if (contractsResponse.ok) {
          const data = await contractsResponse.json()
          setContracts(data.contracts || [])
        }
      }

    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate portfolio value from real wallet tokens
  const totalWalletValue = tokens.reduce((total, token) => {
    const tokenValue = parseFloat(token.value.replace(/[$,]/g, ''))
    return total + (isNaN(tokenValue) ? 0 : tokenValue)
  }, 0)

  const walletChange24h = tokens.reduce((total, token) => {
    const tokenValue = parseFloat(token.value.replace(/[$,]/g, ''))
    const changeValue = isNaN(tokenValue) ? 0 : (tokenValue * (token.change24h / 100))
    return total + changeValue
  }, 0)

  // Format wallet address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* CONDITIONAL CONTENT BASED ON CONNECTION STATUS */}
      {!isConnected || !address ? (
        /* NOT CONNECTED STATE */
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-6xl mb-6">🔐</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Connect Your Wallet
            </h1>
            <p className="text-gray-600 mb-8">
              Access your personal dashboard to view wallet contents, track trading performance,
              monitor your smart indexes, and manage deployed contracts.
            </p>
            <div className="space-y-4">
              <Link href="/wallet/onboard">
                <button className="block w-full px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-blue-700 transition-all duration-300">
                  Connect to MetaMask →
                </button>
              </Link>
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Supported: MetaMask • WalletConnect (coming soon)
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* CONNECTED STATE - DASHBOARD */
        /* DASHBOARD STATE - Exact same container structure */
        <>
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-gray-600">Network: {network || 'Unknown'}</span>
                    <span className="text-sm text-gray-600">Address: {formatAddress(address)}</span>
                    {socialEnabled && (
                      <div className="flex items-center gap-1">
                        <SocialIcon />
                        <span className="text-sm text-green-600">Social</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshIcon className="h-5 w-5 mr-2" />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </button>
                  {/* Creation Options Dropdown */}
                  <div className="relative">
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center"
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Create
                      <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {mobileMenuOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border">
                        <div className="py-1">
                          <Link href="/create" onClick={() => setMobileMenuOpen(false)}>
                            <div className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                <CoinIcon className="text-green-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">Create Token</div>
                                <div className="text-sm text-gray-600">Launch a single ERC-20 token</div>
                              </div>
                            </div>
                          </Link>

                          <Link href="/index/create" onClick={() => setMobileMenuOpen(false)}>
                            <div className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                <TrendingUpBig className="text-purple-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">Create Smart Index</div>
                                <div className="text-sm text-gray-600">Build a multi-token portfolio</div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Navigation */}
          <nav className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex space-x-8">
                {[
                  { id: 'portfolio', label: 'Portfolio', icon: TokenIconUser },
                  { id: 'liquidity', label: 'Liquidity', icon: SimpleSwapIcon },
                  { id: 'trading', label: 'Trading', icon: SimpleSwapIcon },
                  { id: 'activity', label: 'Activity', icon: HistoryIcon },
                  { id: 'market', label: 'Markets', icon: TrendUpIcon },
                  { id: 'settings', label: 'Settings', icon: SettingIcon }
                ].map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedTab(tab.id)}
                      className={`flex items-center px-1 py-4 border-b-2 text-sm font-medium ${
                        selectedTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-2" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">

        {/* Portfolio Tab - Now using real wallet data */}
        {selectedTab === 'portfolio' && (
          <div>
            {/* Overview Stats - Real wallet data */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Wallet Balance</p>
                    <p className="text-2xl font-bold text-gray-900">{balance ? `${parseFloat(balance).toFixed(4)} ETH` : 'Loading...'}</p>
                    <p className="text-xs text-gray-500">Network: {network}</p>
                  </div>
                  <WalletIcon />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Portfolio Value</p>
                    <p className="text-2xl font-bold text-gray-900">${totalWalletValue.toFixed(2)}</p>
                    <p className={`text-sm ${walletChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {walletChange24h >= 0 ? '+' : ''}{walletChange24h.toFixed(2)} (24h)
                    </p>
                  </div>
                  <TrendingUpBig className={walletChange24h >= 0 ? 'text-green-500' : 'text-red-500'} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Token Holdings</p>
                    <p className="text-2xl font-bold text-gray-900">{tokens.length}</p>
                    <p className="text-xs text-gray-500">All networks</p>
                  </div>
                  <CoinIcon />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Social Status</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {socialEnabled ? 'Active' : 'Setup Required'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {socialEnabled ? 'Discord/Twitter' : 'Connect social'}
                    </p>
                  </div>
                  <SocialIcon />
                </div>
              </div>
            </div>

            {/* Real Token Portfolio from Wallet */}
            <div className="bg-white rounded-lg border">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Your Wallet Tokens</h3>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="text-blue-600 hover:text-blue-700 text-sm disabled:opacity-50"
                >
                  <RefreshIcon className="h-4 w-4 mr-1" />
                  {refreshing ? 'Refreshing...' : 'Refresh Data'}
                </button>
              </div>
              <div className="divide-y divide-gray-200">
                {tokens.map((token, index) => (
                  <div key={index} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                          <CoinSmallIcon />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{token.name}</h4>
                          <p className="text-sm text-gray-600">{token.symbol} • {token.address.slice(0, 6)}...{token.address.slice(-4)}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{token.balance} {token.symbol}</div>
                        <div className={`text-sm ${token.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {token.value} ({token.change24h >= 0 ? '+' : ''}{token.change24h}%)
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedAsset(token.symbol)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <ExternalLink className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {tokens.length === 0 && (
                <div className="px-6 py-8 text-center">
                  <WalletIcon />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No tokens found</h3>
                  <p className="mt-1 text-sm text-gray-500">Your wallet doesn't have any tokens yet, or they may take a moment to load.</p>
                  <button
                    onClick={handleRefresh}
                    className="mt-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <RefreshIcon className="h-4 w-4 mr-2" />
                    Refresh Data
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Activity Tab - Real transaction history */}
        {selectedTab === 'activity' && (
          <div className="bg-white rounded-lg border">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Transaction History</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {transactions.map((tx, index) => (
                <div key={index} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <SimpleSwapIcon />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Wallet Transaction
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(tx.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {tx.value} ETH
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        tx.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {transactions.length === 0 && (
              <div className="px-6 py-8 text-center">
                <HistoryIcon />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions yet</h3>
                <p className="mt-1 text-sm text-gray-500">Start trading or deploying smart contracts to see your transaction history.</p>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {selectedTab === 'settings' && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Dashboard Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Connected Wallet */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Connected Wallet
                </label>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm bg-gray-100 px-3 py-2 rounded">
                    {address ? formatAddress(address) : 'Not connected'}
                  </span>
                  <span className="text-sm text-green-600 px-2 py-1 bg-green-100 rounded">
                    ✓ Connected
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">Network: {network}</p>
              </div>

              {/* Social Connections */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Social Connections
                </label>
                {!socialEnabled ? (
                  <>
                    <span className="text-sm text-orange-600">Not connected</span>
                    <button
                      onClick={activateSocialFeatures}
                      className="ml-3inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Connect
                    </button>
                  </>
                ) : (
                  <div className="space-y-1">
                    {socialProfiles.discord && (
                      <div className="flex items-center">
                        <SocialIcon />
                        <span className="ml-2 text-sm text-green-600">Discord connected</span>
                      </div>
                    )}
                    {socialProfiles.twitter && (
                      <div className="flex items-center">
                        <SocialIcon />
                        <span className="ml-2 text-sm text-green-600">Twitter connected</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Auto-refresh settings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auto-refresh
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-3" />
                    <label className="text-sm text-gray-700">Enable auto-refresh (30s)</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-3" />
                    <label className="text-sm text-gray-700">Show gas price alerts</label>
                  </div>
                </div>
              </div>

              {/* Data export */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Data
                </label>
                <div className="space-x-2">
                  <button className="px-3 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700">
                    Portfolio
                  </button>
                  <button className="px-3 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700">
                    Transactions
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Markets Tab - Keep as-is for market data */}
        {selectedTab === 'market' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Crypto Market</h3>
            </div>

            <div className="space-y-4">
              {cryptoPrices.map((crypto, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-lg">{crypto.icon}</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{crypto.name}</h4>
                        <p className="text-sm text-gray-600">{crypto.symbol}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center mb-1">
                        <span className="text-lg font-medium text-gray-900 mr-2">
                          ${crypto.price.toLocaleString()}
                        </span>
                        <span className={`text-sm font-medium flex items-center ${
                          crypto.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {crypto.change >= 0 ? (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 mr-1" />
                          )}
                          {crypto.change >= 0 ? '+' : ''}{crypto.change}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Vol: {crypto.volume}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Market Chart Placeholder */}
            <div className="mt-8 bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">Market Overview</h4>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View Full Chart
                </button>
              </div>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Interactive price charts would display here</p>
                </div>
              </div>
            </div>
          </div>
        )}
          </main>
        </>
      )}
    </div>
  )
}
