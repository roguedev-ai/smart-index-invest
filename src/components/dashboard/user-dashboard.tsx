"use client"

import { useState } from "react"
import { useWallet } from "@/components/providers/wallet-provider"
import { mockPortfolio } from "@/lib/trading"

// Fallback icons
const SwapIcon = () => (
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

// Mock user data
const userData = {
  totalTokens: 12,
  totalValue: 0.834,
  recentActivity: [
    { action: "Created", token: "MyAwesomeToken", date: "2025-09-13", value: 0.01, status: "success" },
    { action: "Created", token: "SuperDuperCoin", date: "2025-09-12", value: 0.01, status: "success" },
    { action: "Created", token: "EpicToken", date: "2025-09-10", value: 0.01, status: "success" }
  ],
  portfolio: [
    { name: "MyAwesomeToken", symbol: "MAT", supply: 1000000, type: "Standard ERC20", created: "2025-09-13", network: "ethereum" },
    { name: "SuperDuperCoin", symbol: "SDC", supply: 5000000, type: "Flexible ERC20", created: "2025-09-12", network: "polygon" },
    { name: "EpicToken", symbol: "ETK", supply: 10000000, type: "Commercial ERC20", created: "2025-09-10", network: "bsc" }
  ]
}

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
  const { address, isConnected } = useWallet()
  const [selectedTab, setSelectedTab] = useState("portfolio")
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <SwapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">View your token portfolio and track performance</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
              <p className="text-gray-600 mt-1">Track your tokens and portfolio performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                <PlusIcon className="h-5 w-5 mr-2" />
                Create New Token
              </button>
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
              { id: 'trading', label: 'Trading', icon: SwapIcon },
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

        {/* Portfolio Tab */}
        {selectedTab === 'portfolio' && (
          <div>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Tokens</p>
                    <p className="text-2xl font-bold text-gray-900">{userData.totalTokens}</p>
                  </div>
                  <Tokens className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Portfolio Value</p>
                    <p className="text-2xl font-bold text-gray-900">{userData.totalValue} ETH</p>
                  </div>
                  <Wallet className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-blue-600">+3</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Token Portfolio */}
            <div className="bg-white rounded-lg border">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">My Tokens</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {userData.portfolio.map((token, index) => (
                  <div key={index} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                          <Tokens className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{token.name}</h4>
                          <p className="text-sm text-gray-600">{token.symbol} • {token.network}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{token.type}</div>
                        <div className="text-sm text-gray-600">{token.supply.toLocaleString()} supply</div>
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
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {selectedTab === 'activity' && (
          <div className="bg-white rounded-lg border">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {userData.recentActivity.map((activity, index) => (
                <div key={index} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4">
                        <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.action} {activity.token}</p>
                        <p className="text-sm text-gray-600">{activity.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">+{activity.value} ETH</p>
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Success
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Markets Tab */}
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

        {/* Settings Tab */}
        {selectedTab === 'settings' && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Dashboard Settings</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Preferences
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-3" />
                    <label className="text-sm text-gray-700">New token deployments</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-3" />
                    <label className="text-sm text-gray-700">Market price alerts</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-3" />
                    <label className="text-sm text-gray-700">Weekly reports</label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Connected Wallet
                </label>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                  <span className="text-sm text-green-600">Connected</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-md font-medium text-gray-900 mb-3">Export Data</h4>
                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 mr-3">
                  Download Portfolio
                </button>
                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700">
                  Download Activity
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
