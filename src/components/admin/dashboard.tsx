"use client"

import { useState, useEffect } from "react"
import { config } from "@/lib/config"
import { defaultPricingConfig } from "@/lib/pricing"

// Fallback icon components in case lucide-react fails
const DollarIcon = () => (
  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
)

const UserIcon = () => (
  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3-8a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
)

const TokenIcon = () => (
  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
)

const UptrendIcon = () => (
  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const SettingIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066 1.758 1.758 0 001.053 2.643c1.646.366 1.646 2.688 0 3.054-.483 1.036-1.683 1.036-2.166 0a1.724 1.724 0 00-2.573 1.066c1.244.749 1.244 2.684 0 3.433a1.724 1.724 0 00-2.573-1.066c-1.646-.366-1.646-2.688 0-3.054.483-1.036 1.683-1.036 2.166 0a1.724 1.724 0 002.573-1.066c-.427-1.756-2.925-1.756-3.35 0zM12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" />
  </svg>
)

const ChartIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const RotateIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

// Real data structure for production (initially empty)
// In production, this would be populated by API calls to backend
const liveData = {
  totalRevenue: 0, // Real ETH collected
  totalTokensCreated: 0, // Actual deployments
  totalUsers: 0, // Real wallet connections
  monthlyGrowth: 0, // Real growth calculations
  recentTransactions: [], // Array of real blockchain transactions
  tokenStatistics: {
    "Standard ERC20": 0,
    "Flexible ERC20": 0,
    "Commercial ERC20": 0,
    "Security ERC20": 0
  },
  revenueTrends: [], // Array of actual monthly revenue
  recentActivity: [], // Real user activities
}

// Data loading state
const dataLoadingStates = {
  revenue: false,
  transactions: false,
  users: false,
  tokens: false
}

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(false)

  const refreshData = () => {
    setIsLoading(true)
    // In a real app, this would fetch fresh data from the backend
    setTimeout(() => setIsLoading(false), 2000)
  }

  const StatCard = ({ title, value, change, icon: Icon, color, suffix }: any) => (
    <div className={`p-6 rounded-lg border ${color} transition-all hover:shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {value}{suffix}
          </p>
          {change && (
            <p className={`text-sm mt-1 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </p>
          )}
        </div>
        <div className="text-blue-600">
          <Icon />
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">TokenMarket Admin</h1>
              <p className="text-gray-600 mt-1">Platform management and analytics</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshData}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isLoading
                    ? 'bg-gray-100 text-gray-500'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                disabled={isLoading}
              >
                <RotateIcon />
                <span className={`ml-2 ${isLoading ? 'hidden' : ''}`}>Refresh Data</span>
                {isLoading && <span className="ml-2">Refreshing...</span>}
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-600">Admin Wallet</p>
                <p className="text-xs text-gray-500 font-mono">{config.adminWallet.slice(0, 8)}...{config.adminWallet.slice(-6)}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: ChartIcon },
              { id: 'revenue', label: 'Revenue', icon: DollarIcon },
              { id: 'users', label: 'Users', icon: UserIcon },
              { id: 'tokens', label: 'Tokens', icon: TokenIcon },
              { id: 'pricing', label: 'Pricing', icon: DollarIcon },
              { id: 'admins', label: 'Admins', icon: UserIcon },
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

      {/* Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Revenue"
                value={liveData.totalRevenue}
                change={liveData.totalRevenue > 0 ? "+0% vs last month" : "No revenue yet"}
                icon={DollarIcon}
                color="bg-green-50 border-green-200"
                suffix=" ETH"
              />
              <StatCard
                title="Tokens Created"
                value={liveData.totalTokensCreated}
                change={liveData.totalTokensCreated > 0 ? "+0" : "No tokens yet"}
                icon={TokenIcon}
                color="bg-blue-50 border-blue-200"
              />
              <StatCard
                title="Active Users"
                value={liveData.totalUsers}
                change={liveData.totalUsers > 0 ? "+0" : "No users yet"}
                icon={UserIcon}
                color="bg-purple-50 border-purple-200"
              />
              <StatCard
                title="Monthly Growth"
                value={liveData.monthlyGrowth}
                icon={UptrendIcon}
                color="bg-yellow-50 border-yellow-200"
                suffix="%"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Transactions */}
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
                <div className="space-y-4">
                  {liveData.recentTransactions.length > 0 ? (
                    liveData.recentTransactions.map((tx: any, index: number) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div>
                          <p className="font-medium text-gray-900">{tx.token}</p>
                          <p className="text-sm text-gray-500">{tx.user}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">+{tx.amount} ETH</p>
                          <p className="text-sm text-gray-500">{tx.date}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-gray-500">No transactions yet</p>
                      <p className="text-sm text-gray-400 mt-1">Revenue will appear here once users create tokens</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Token Distribution */}
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Token Type Distribution</h3>
                <div className="space-y-3">
                  {Object.entries(liveData.tokenStatistics).map(([type, count]: [string, number], index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                        <span className="text-sm font-medium text-gray-900">{type}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-3">{count > 0 ? ((count / Object.values(liveData.tokenStatistics).reduce((sum, val) => sum + val, 0) || 1) * 100).toFixed(1) : 0}%</span>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {selectedTab === 'revenue' && (
          <div>
            <div className="bg-white rounded-lg border p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Revenue Analytics</h3>
                  <p className="text-gray-600">Monthly revenue trends and statistics</p>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Export Data →
                </button>
              </div>

              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Monthly Revenue</h4>
                <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                  <div className="text-center">
                    <ChartIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Chart visualization would be here</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{config.creationFee} ETH</div>
                  <div className="text-sm text-gray-600">Current Fee</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{liveData.totalTokensCreated}</div>
                  <div className="text-sm text-gray-600">This Month</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{liveData.totalRevenue} ETH</div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {selectedTab === 'users' && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{liveData.totalUsers}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{liveData.totalUsers}</div>
                <div className="text-sm text-gray-600">Active This Month</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">0%</div>
                <div className="text-sm text-gray-600">Retention Rate</div>
              </div>
            </div>
          </div>
        )}

        {/* Tokens Tab */}
        {selectedTab === 'tokens' && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Token Creation Statistics</h3>
            <div className="space-y-4">
              {Object.entries(liveData.tokenStatistics).map(([type, count]: [string, number], index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <TokenIcon />
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">{type}</div>
                      <div className="text-sm text-gray-600">{count > 0 ? ((count / Object.values(liveData.tokenStatistics).reduce((sum, val) => sum + val, 0) || 1) * 100).toFixed(1) : 0}% of total</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Tab */}
        {selectedTab === 'pricing' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Dynamic Pricing Management</h3>
                  <p className="text-gray-600">Control pricing tiers, services, and discount rules</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Add Pricing Tier
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Pricing Tiers */}
              <div className="mb-8">
                <h4 className="text-md font-medium text-gray-900 mb-4">Pricing Tiers</h4>
                <div className="space-y-4">
                  {defaultPricingConfig.tiers.map((tier) => (
                    <div key={tier.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <h5 className="font-medium text-gray-900">{tier.name}</h5>
                          {tier.featured && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-green-600">{tier.baseFee} ETH</span>
                          <button className="text-gray-600 hover:text-gray-800">✏️</button>
                          <button className={`text-sm ${tier.enabled ? 'text-green-600' : 'text-red-600'}`}>
                            {tier.enabled ? 'Enabled' : 'Disabled'}
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{tier.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {tier.features.map((feature, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Token Type Multipliers */}
              <div className="mb-8">
                <h4 className="text-md font-medium text-gray-900 mb-4">Token Type Multipliers</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(defaultPricingConfig.tokenTypes).map(([type, multiplier]) => (
                    <div key={type} className="text-center border rounded-lg p-4">
                      <div className="font-medium text-gray-900">{type}</div>
                      <div className="text-lg font-bold text-blue-600">{multiplier}x</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add-on Services */}
              <div className="mb-8">
                <h4 className="text-md font-medium text-gray-900 mb-4">Add-on Services</h4>
                <div className="space-y-4">
                  {Object.entries(defaultPricingConfig.services).map(([service, price]) => (
                    <div key={service} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="font-medium text-gray-900 capitalize">{service}</div>
                      <div className="text-lg font-bold text-green-600">
                        {service.toLowerCase().includes('usd') ? `$${price}` : `${price} ETH`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discount Rules */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bulk Discounts */}
                <div className="border rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Bulk Discount Rules</h4>
                  <div className="space-y-2">
                    {defaultPricingConfig.discounts.bulkDiscounts.map((bulk, idx) => (
                      <div key={idx} className="text-sm text-gray-600">
                        {bulk.min}+ tokens: <span className="font-medium text-green-600">-{bulk.discount * 100}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Loyalty Discounts */}
                <div className="border rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Loyalty Discounts</h4>
                  <div className="space-y-2">
                    {defaultPricingConfig.discounts.loyaltyDiscounts.map((loyalty, idx) => (
                      <div key={idx} className="text-sm text-gray-600">
                        {loyalty.tokensCreated}+ tokens: <span className="font-medium text-green-600">-{loyalty.discount * 100}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Referral Code Management */}
              <div className="mt-8 border rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 mb-4">Referral Codes</h4>
                <div className="space-y-2">
                  {defaultPricingConfig.discounts.referralDiscounts.map((referral, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="font-mono bg-gray-100 px-3 py-1 rounded text-sm">
                        {referral.code}
                      </div>
                      <span className="font-medium text-green-600">-{referral.discount * 100}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admins Tab */}
        {selectedTab === 'admins' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Multi-Admin Management</h3>
                  <p className="text-gray-600">Manage administrators and fee distribution</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Invite Admin
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Process Payments
                  </button>
                </div>
              </div>

              {/* Admin Hierarchy Overview */}
              <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-3xl font-bold text-red-600">1</div>
                  <div className="text-sm text-red-700 font-medium">Master Admin</div>
                </div>
                <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">2</div>
                  <div className="text-sm text-blue-700 font-medium">Admin Users</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-3xl font-bold text-yellow-600">1</div>
                  <div className="text-sm text-yellow-700 font-medium">Moderator</div>
                </div>
                <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="text-3xl font-bold text-gray-600">0</div>
                  <div className="text-sm text-gray-700 font-medium">Support Staff</div>
                </div>
              </div>

              {/* Current Admins List */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-gray-900">Active Administrators</h4>
                  <div className="text-sm text-gray-600">Total Earnings: 44.8 ETH</div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      id: 'master-admin-001',
                      username: 'MasterAdmin',
                      role: 'Master',
                      feeShare: '65%',
                      totalEarned: '25.3 ETH',
                      status: 'active',
                      lastActive: 'Now',
                      permissions: 'Full Access'
                    },
                    {
                      id: 'admin-001',
                      username: 'RyanAdmin',
                      role: 'Admin',
                      feeShare: '15%',
                      totalEarned: '12.5 ETH',
                      status: 'active',
                      lastActive: '2 days ago',
                      permissions: 'Management'
                    },
                    {
                      id: 'admin-002',
                      username: 'SarahAdmin',
                      role: 'Admin',
                      feeShare: '8%',
                      totalEarned: '6.8 ETH',
                      status: 'active',
                      lastActive: '1 day ago',
                      permissions: 'Management'
                    },
                    {
                      id: 'moderator-001',
                      username: 'JohnMod',
                      role: 'Moderator',
                      feeShare: '0%',
                      totalEarned: '0.2 ETH',
                      status: 'active',
                      lastActive: '4 hours ago',
                      permissions: 'Support'
                    }
                  ].map((admin) => (
                    <div key={admin.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                            <UserIcon />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">{admin.username}</h5>
                            <p className="text-sm text-gray-600">{admin.role} • {admin.permissions}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">{admin.feeShare}</div>
                            <div className="text-sm text-gray-600">Fee Share</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-green-600">{admin.totalEarned}</div>
                            <div className="text-sm text-gray-600">Total Earned</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded ${
                              admin.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {admin.status}
                            </span>
                            <button className="text-gray-600 hover:text-gray-800">⚙️</button>
                          </div>
                        </div>
                      </div>

                      {admin.role !== 'Moderator' && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-sm text-gray-600">
                            Last Active: {admin.lastActive}
                            <span className="ml-4">
                              Pending Payment: {admin.totalEarned === '25.3 ETH' ? '0.25 ETH' : '0.0 ETH'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Fee Distribution Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Distribution */}
                <div className="border rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Fee Distribution Structure</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Platform Maintenance</span>
                      <span className="font-medium text-red-600">10%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Master Admin</span>
                      <span className="font-medium text-green-600">65%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Admin Users</span>
                      <span className="font-medium text-blue-600">20%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Referrals</span>
                      <span className="font-medium text-purple-600">5%</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex items-center justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-green-600">100%</span>
                    </div>
                  </div>
                </div>

                {/* Payment History */}
                <div className="border rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Recent Payments</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium text-gray-900">MasterAdmin</p>
                        <p className="text-sm text-gray-600">Token creation fees</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">+0.01625 ETH</p>
                        <p className="text-sm text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium text-gray-900">SarahAdmin</p>
                        <p className="text-sm text-gray-600">Performance share</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">+0.002 ETH</p>
                        <p className="text-sm text-gray-500">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium text-gray-900">RyanAdmin</p>
                        <p className="text-sm text-gray-600">Month-end payout</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-orange-600">Pending 0.00375 ETH</p>
                        <p className="text-sm text-gray-500">Processing</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Admin Creation */}
              <div className="mt-8 border rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 mb-4">Create New Administrator</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <input
                      type="text"
                      placeholder="AdminUser123"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
                    <input
                      type="text"
                      placeholder="0x..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                    <input
                      type="email"
                      placeholder="admin@tokenmarket.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="admin">Admin</option>
                      <option value="moderator">Moderator</option>
                      <option value="support">Support</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fee Share % (Admin only)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="8"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                    Create Admin Account
                  </button>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors">
                    Reset Form
                  </button>
                </div>
              </div>

              {/* Alternative: Send Invite */}
              <div className="mt-6 border-l-4 border-blue-400 bg-blue-50 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 8.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 13.14 2 8.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Invitation System Available
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Alternatively, send email invitations that expire after 48 hours for security.</p>
                      <button className="mt-2 font-medium underline hover:text-blue-800">
                        Switch to Invitation Mode →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {selectedTab === 'settings' && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Platform Settings</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token Creation Fee (ETH)
                </label>
                <input
                  type="number"
                  step="0.01"
                  defaultValue={config.creationFee}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Wallet Address
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    defaultValue={config.adminWallet}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Edit
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supported Networks
                </label>
                <div className="flex flex-wrap gap-2">
                  {config.supportedNetworks.map((network, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {network}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
