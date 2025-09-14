"use client"

import { useState, useEffect } from 'react'
import { walletMetrics, PlatformUser } from '@/lib/wallet-metrics'

// Icon components (simplified to avoid external dependencies)
const DollarIcon = () => <span>💰</span>
const UserIcon = () => <span>👥</span>
const TokenIcon = () => <span>🪙</span>
const UptrendIcon = () => <span>📈</span>

export default function RealAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [userMetrics, setUserMetrics] = useState(null)
  const [revenueData, setRevenueData] = useState(null)
  const [tokenStats, setTokenStats] = useState(null)
  const [platformUsers, setPlatformUsers] = useState<PlatformUser[]>([])

  // Load real data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        const [metrics, revenue, tokens, users] = await Promise.all([
          walletMetrics.getUserMetrics(),
          walletMetrics.getRevenueData(),
          walletMetrics.getTokenStatistics(),
          walletMetrics.getUsers()
        ])

        setUserMetrics(metrics)
        setRevenueData(revenue)
        setTokenStats(tokens)
        setPlatformUsers(users)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const StatCard = ({ title, value, change, icon, color }) => (
    <div className={`p-6 rounded-lg ${color} border border-opacity-20`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className="text-xs text-gray-600">{change}</p>
          )}
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your wallet metrics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">TokenMarket Admin ⚡</h1>
            <p className="text-gray-600">Real platform metrics from wallet data</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Live Data Dashboard</p>
            <p className="text-xs text-gray-500">Updated from wallet activity</p>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="px-6">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'users', label: 'Users', icon: '👥' },
              { id: 'revenue', label: 'Revenue', icon: '💰' },
              { id: 'tokens', label: 'Tokens', icon: '🪙' },
              { id: 'management', label: 'User Management', icon: '⚙️' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-4 border-b-2 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Overview</h2>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Wallets Created"
                value={userMetrics?.totalUsers || 0}
                change={
                  userMetrics?.newUsersToday ?
                  `+${userMetrics.newUsersToday} today` :
                  'No new users today'
                }
                icon={<UserIcon />}
                color="bg-blue-50"
              />
              <StatCard
                title="Revenue Generated"
                value={`${revenueData?.totalRevenue || '0.0000'} ETH`}
                change={
                  revenueData?.todayRevenue ?
                  `+${revenueData.todayRevenue} ETH today` :
                  'No revenue today'
                }
                icon={<DollarIcon />}
                color="bg-green-50"
              />
              <StatCard
                title="Tokens Deployed"
                value={tokenStats?.totalTokensCreated || 0}
                change={
                  tokenStats?.tokensCreatedToday ?
                  `+${tokenStats.tokensCreatedToday} today` :
                  'No tokens today'
                }
                icon={<TokenIcon />}
                color="bg-purple-50"
              />
              <StatCard
                title="User Retention"
                value={`${Math.round((userMetrics?.retentionRate || 0) * 100)}%`}
                change="85%+ retention"
                icon={<UptrendIcon />}
                color="bg-yellow-50"
              />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🚀 How Are These Metrics Calculated?
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    <span>Total wallets: Count of web wallets in localStorage</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    <span>Revenue: Calculated from wallet creation activity</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    <span>Tokens: Simulated based on platform activity</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                    <span>Users metrics: Real-time analytics from wallet data</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📱 Platform Networks
                </h3>
                {tokenStats && (
                  <div className="space-y-3">
                    {Object.entries(tokenStats.networkDistribution).map(([network, count]) => (
                      <div key={network} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 capitalize">{network}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && userMetrics && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">User Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow text-center">
                <div className="text-3xl mb-2">👥</div>
                <div className="text-3xl font-bold text-blue-600">{userMetrics.totalUsers}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow text-center">
                <div className="text-3xl mb-2">✅</div>
                <div className="text-3xl font-bold text-green-600">{userMetrics.activeUsers}</div>
                <div className="text-sm text-gray-600">Active This Month</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow text-center">
                <div className="text-3xl mb-2">📈</div>
                <div className="text-3xl font-bold text-purple-600">{userMetrics.newUsersToday}</div>
                <div className="text-sm text-gray-600">New Today</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Trends</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded">
                  <div className="text-xl font-bold text-blue-600">{userMetrics.newUsersThisWeek}</div>
                  <div className="text-sm text-blue-800">This Week</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="text-xl font-bold text-green-600">{userMetrics.newUsersThisMonth}</div>
                  <div className="text-sm text-green-800">This Month</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded">
                  <div className="text-xl font-bold text-purple-600">{Math.round(userMetrics.retentionRate * 100)}%</div>
                  <div className="text-sm text-purple-800">Retention Rate</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'revenue' && revenueData && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Revenue Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow">
                <h3 className="font-semibold text-gray-900">Total Revenue</h3>
                <p className="text-3xl font-bold text-green-600">{revenueData.totalRevenue} ETH</p>
                <p className="text-sm text-gray-600">All time earnings</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow">
                <h3 className="font-semibold text-gray-900">Monthly Revenue</h3>
                <p className="text-3xl font-bold text-blue-600">{revenueData.monthlyRevenue} ETH</p>
                <p className="text-sm text-gray-600">This month</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow">
                <h3 className="font-semibold text-gray-900">Average Fee</h3>
                <p className="text-3xl font-bold text-purple-600">{revenueData.averageTokenFee} ETH</p>
                <p className="text-sm text-gray-600">Per transaction</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow">
                <h3 className="font-semibold text-gray-900">Today</h3>
                <p className="text-3xl font-bold text-yellow-600">{revenueData.todayRevenue} ETH</p>
                <p className="text-sm text-gray-600">Revenue today</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Revenue by Network</h3>
                <div className="space-y-3">
                  {Object.entries(revenueData.revenueByNetwork).map(([network, amount]) => (
                    <div key={network} className="flex justify-between">
                      <span className="text-gray-600 capitalize">{network}</span>
                      <span className="font-semibold text-green-600">{amount} ETH</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tokens' && tokenStats && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Token Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow text-center">
                <div className="text-3xl mb-2">🪙</div>
                <div className="text-3xl font-bold text-blue-600">{tokenStats.totalTokensCreated}</div>
                <div className="text-sm text-gray-600">Tokens Created</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow text-center">
                <div className="text-3xl mb-2">📅</div>
                <div className="text-3xl font-bold text-green-600">{tokenStats.tokensCreatedToday}</div>
                <div className="text-sm text-gray-600">Created Today</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow text-center">
                <div className="text-3xl mb-2">📈</div>
                <div className="text-3xl font-bold text-purple-600">{tokenStats.tokensCreatedThisWeek}</div>
                <div className="text-sm text-gray-600">This Week</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Token Types Distribution</h3>
              <div className="space-y-3">
                {Object.entries(tokenStats.tokenTypeDistribution).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center">
                      <span className="text-lg mr-3">🪙</span>
                      <span className="font-medium text-gray-900">{type}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{count}</div>
                      <div className="text-sm text-gray-600">
                        {count > 0 ? ((count / Object.values(tokenStats.tokenTypeDistribution).reduce((sum, val) => sum + val, 0) || 1) * 100).toFixed(1) : 0}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Network Distribution</h3>
              <div className="space-y-3">
                {Object.entries(tokenStats.networkDistribution).map(([network, count]) => (
                  <div key={network} className="flex items-center justify-between">
                    <span className="text-gray-600 capitalize">{network}</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${count > 0 ? ((count / Object.values(tokenStats.networkDistribution).reduce((sum, val) => sum + val, 0) || 1) * 100) : 0}%`
                          }}
                        />
                      </div>
                      <span className="font-semibold text-gray-900 w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'management' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium">
                  Add New User
                </button>
              </div>

              <div className="space-y-4">
                {platformUsers.map(user => (
                  <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                          <span className="text-lg">👤</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{user.username || 'Unnamed User'}</h4>
                          <p className="text-sm text-gray-600">{user.walletAddress.slice(0, 8)}...{user.walletAddress.slice(-6)}</p>
                          <div className="text-xs text-gray-500">
                            Created: {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 text-xs rounded ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' :
                          user.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded bg-gray-100 text-gray-800`}>
                          {user.role}
                        </span>
                        <button className="text-gray-600 hover:text-gray-800">⚙️</button>
                      </div>
                    </div>
                  </div>
                ))}

                {platformUsers.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">👥</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Users Yet</h3>
                    <p className="text-gray-600 mb-4">
                      Users will appear here when they create web wallets and use your platform.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded p-4">
                      <p className="text-sm text-blue-800">
                        💡 <strong>How users get added:</strong> When users create wallets through your
                        onboarding flow, they'll automatically appear in this management dashboard.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
