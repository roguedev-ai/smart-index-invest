"use client"

import { useState, useEffect } from 'react'
import AutomatedLiquidityProvisioner from '@/lib/automated-liquidity'

interface LiquidityPosition {
  id: number
  token0: string
  token1: string
  fee: number
  tickLower: number
  tickUpper: number
  liquidity: string
  unclaimedFees0: string
  unclaimedFees1: string
  positionValue: string
  pnl: string // Profit/loss
}

interface PoolStats {
  address: string
  tvl: string
  volume24h: string
  fees24h: string
  price: string
  feeTier: string
}

export default function LiquidityDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [liquidityManager] = useState(() => new AutomatedLiquidityProvisioner())
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [positions, setPositions] = useState<LiquidityPosition[]>([])
  const [pools, setPools] = useState<PoolStats[]>([])
  const [loading, setLoading] = useState(true)
  const [collectingFees, setCollectingFees] = useState(false)

  // Load dashboard data on mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)

        // Get comprehensive dashboard data
        const data = await liquidityManager.getLiquidityDashboard()

        // Mock position and pool data
        const mockPositions: LiquidityPosition[] = Array.from({length: 5}, (_, i) => ({
          id: Math.floor(Math.random() * 10000),
          token0: 'TOKEN',
          token1: 'WETH',
          fee: 3000,
          tickLower: -18400,
          tickUpper: 57600,
          liquidity: (Math.random() * 1000).toFixed(2),
          unclaimedFees0: (Math.random() * 0.01).toFixed(6),
          unclaimedFees1: (Math.random() * 0.002).toFixed(6),
          positionValue: (Math.random() * 50).toFixed(2),
          pnl: `+${(Math.random() * 5).toFixed(2)}`
        }))

        const mockPools: PoolStats[] = [
          {
            address: '0x7a056ad3fffffff',
            tvl: '$2.1M',
            volume24h: '$125K',
            fees24h: '$375',
            price: '$0.000042',
            feeTier: '0.30%'
          },
          {
            address: '0x8b056ad3fffffff',
            tvl: '$890K',
            volume24h: '$67K',
            fees24h: '$201',
            price: '$0.000031',
            feeTier: '0.30%'
          },
          {
            address: '0x9c056ad3fffffff',
            tvl: '$1.4M',
            volume24h: '$89K',
            fees24h: '$267',
            price: '$0.000038',
            feeTier: '1.00%'
          }
        ]

        setDashboardData(data)
        setPositions(mockPositions)
        setPools(mockPools)

      } catch (error) {
        console.error('Failed to load dashboard data:', error)
        // Set empty data for demo
        setDashboardData({
          activePools: 0,
          totalLiquidityProvided: '0',
          totalFeesEarned: '0',
          impermanentLoss: '0',
          topPerformingPool: null,
          recentTransactions: []
        })
        setPositions([])
        setPools([])
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  // Collect fees for all positions
  const collectAllFees = async () => {
    try {
      setCollectingFees(true)
      const result = await liquidityManager.collectAccumulatedFees('0x0000...0000')

      if (result.positionsProcessed > 0) {
        alert(`✅ Collected fees from ${result.positionsProcessed} positions!`)
        // Refresh data
        window.location.reload()
      }
    } catch (error) {
      console.error('Fee collection failed:', error)
      alert('Failed to collect fees. Please try again.')
    } finally {
      setCollectingFees(false)
    }
  }

  // Rebalance positions
  const rebalancePositions = async () => {
    try {
      setCollectingFees(true)
      const result = await liquidityManager.monitorAndRebalancePositions()

      alert(`✅ Rebalanced ${result.rebalancesPerformed} positions! PnL captured: ${result.totalPnlCaptured} ETH`)
      // Refresh data
      window.location.reload()
    } catch (error) {
      console.error('Rebalancing failed:', error)
      alert('Failed to rebalance positions. Please try again.')
    } finally {
      setCollectingFees(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your liquidity dashboard...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Liquidity Dashboard 💧</h1>
            <p className="text-gray-600">Manage your Uniswap V3 positions and earn trading fees</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={collectAllFees}
              disabled={collectingFees}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
            >
              {collectingFees ? 'Collecting...' : '💰 Collect Fees'}
            </button>
            <button
              onClick={rebalancePositions}
              disabled={collectingFees}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
            >
              {collectingFees ? 'Rebalancing...' : '🔄 Rebalance'}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        {dashboardData && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg p-4 shadow text-center">
              <div className="text-2xl mb-1">🏊‍♂️</div>
              <div className="text-lg font-bold">{dashboardData.activePools}</div>
              <div className="text-sm text-gray-600">Active Pools</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow text-center">
              <div className="text-2xl mb-1">💰</div>
              <div className="text-lg font-bold">{dashboardData.totalLiquidityProvided}</div>
              <div className="text-sm text-gray-600">Liquidity Provided</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow text-center">
              <div className="text-2xl mb-1">💵</div>
              <div className="text-lg font-bold text-green-600">{dashboardData.totalFeesEarned}</div>
              <div className="text-sm text-gray-600">Fees Earned</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow text-center">
              <div className="text-2xl mb-1">📊</div>
              <div className="text-lg font-bold text-red-600">{dashboardData.impermanentLoss}</div>
              <div className="text-sm text-gray-600">Impermanent Loss</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow text-center">
              <div className="text-2xl mb-1">⭐</div>
              <div className="text-lg font-bold">
                {dashboardData.topPerformingPool ?
                  `${(dashboardData.topPerformingPool.apy || 0).toFixed(1)}%` :
                  'N/A'
                }
              </div>
              <div className="text-sm text-gray-600">Top APY</div>
            </div>
          </div>
        )}
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="px-6">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: '📊 Overview', description: 'Dashboard Summary' },
              { id: 'positions', label: '🎯 My Positions', description: 'Active Liquidity' },
              { id: 'pools', label: '🏊‍♂️ My Pools', description: 'Pool Performance' },
              { id: 'analytics', label: '📈 Analytics', description: 'Performance Data' },
              { id: 'strategies', label: '🎯 Strategies', description: 'Optimization Tools' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center px-4 py-4 border-b-2 text-center min-w-0 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="text-lg mb-1">{tab.label}</span>
                <span className="text-xs text-gray-500">{tab.description}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-blue-900 mb-4">🎯 Liquidity Management Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">💱</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Automated Pool Creation</h3>
                  <p className="text-sm text-gray-700">
                    Every token we create gets an automatic Uniswap V3 pool with optimized liquidity
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">⚡</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Concentrated Liquidity</h3>
                  <p className="text-sm text-gray-700">
                    V3's concentrated ranges provide up to 4000x capital efficiency
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3">💸</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Passive Fee Income</h3>
                  <p className="text-sm text-gray-700">
                    Earn trading fees automatically from every token swap in your pools
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">➕</div>
                  <div className="font-medium">Add Liquidity</div>
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">💰</div>
                  <div className="font-medium">Collect Fees</div>
                </button>
                <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">🔄</div>
                  <div className="font-medium">Rebalance</div>
                </button>
                <button className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="font-medium">Analytics</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* My Positions Tab */}
        {activeTab === 'positions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">🎯 My Liquidity Positions</h2>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {positions.length} Active Positions
              </span>
            </div>

            <div className="space-y-4">
              {positions.map(position => (
                <div key={position.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-lg">🎯</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {position.token0}/{position.token1}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Position #{position.id} • {position.fee / 10000}% Fee Tier
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${position.pnl.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {position.pnl}
                      </div>
                      <div className="text-sm text-gray-600">
                        ${position.positionValue} value
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="font-semibold text-blue-600">$${position.liquidity}</div>
                      <div className="text-sm text-gray-600">Liquidity</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="font-semibold text-green-600">${position.unclaimedFees0}</div>
                      <div className="text-sm text-gray-600">{position.token0} Fees</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded">
                      <div className="font-semibold text-yellow-600">${position.unclaimedFees1}</div>
                      <div className="text-sm text-gray-600">{position.token1} Fees</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded">
                      <div className="font-semibold text-purple-600">
                        {position.tickLower.toLocaleString()}-{position.tickUpper.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Tick Range</div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium">
                      Collect Fees
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium">
                      Add Liquidity
                    </button>
                    <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded font-medium">
                      Rebalance
                    </button>
                    <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-medium">
                      Settings
                    </button>
                  </div>
                </div>
              ))}

              {positions.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Positions</h3>
                  <p className="text-gray-600 mb-4">
                    You haven't provided liquidity to any pools yet. Create a token to automatically set up a liquidity pool!
                  </p>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold">
                    Create Your First Token
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* My Pools Tab */}
        {activeTab === 'pools' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">🏊‍♂️ My Liquidity Pools</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {pools.map(pool => (
                <div key={pool.address} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        TokenMarket Pool
                      </h4>
                      <p className="text-sm text-gray-600">
                        {pool.feeTier} Fee • {pool.address.slice(0, 8)}..{pool.address.slice(-6)}
                      </p>
                    </div>
                    <div className="text-2xl">🏊‍♂️</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">TVL:</span>
                      <span className="font-semibold text-green-600">{pool.tvl}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">24h Volume:</span>
                      <span className="font-semibold text-blue-600">{pool.volume24h}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">24h Fees:</span>
                      <span className="font-semibold text-yellow-600">{pool.fees24h}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-semibold text-purple-600">{pool.price}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-medium">
                        Add Liquidity
                      </button>
                      <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded font-medium">
                        Swap
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pools.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-5xl mb-4">🏊‍♂️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pools Yet</h3>
                <p className="text-gray-600">
                  Create your first token to automatically generate a Uniswap V3 liquidity pool!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">📈 Liquidity Analytics</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Chart Placeholder */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Fee Earnings Over Time</h3>
                <div className="h-64 bg-gradient-to-t from-green-100 to-green-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-green-700">
                    <div className="text-4xl mb-2">📊</div>
                    <p className="font-semibold">7-Day Earnings Chart</p>
                    <p className="text-sm">Real-time fee collection data</p>
                    <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-bold">$2.45</div>
                        <div className="text-gray-500">Today</div>
                      </div>
                      <div>
                        <div className="font-bold">$12.67</div>
                        <div className="text-gray-500">This Week</div>
                      </div>
                      <div>
                        <div className="font-bold">$45.23</div>
                        <div className="text-gray-500">This Month</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🔄 Recent Activity</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {dashboardData?.recentTransactions?.slice(0, 8).map((tx: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          tx.type === 'add' ? 'bg-green-100 text-green-700' :
                          tx.type === 'remove' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {tx.type === 'add' ? '➕' : tx.type === 'remove' ? '➖' : '💰'}
                        </div>
                        <div>
                          <div className="font-medium capitalize">{tx.type} ${tx.amount}</div>
                          <div className="text-sm text-gray-600">
                            {tx.pool} • {new Date(tx.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        #{i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Strategies Tab */}
        {activeTab === 'strategies' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">🎯 Liquidity Strategies</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-4xl mb-4">🛡️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Conservative</h3>
                <p className="text-gray-600 mb-4">
                  Narrow ranges around current price. Lower risk, lower returns.
                </p>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>APY: 12-18%</div>
                  <div>Risk: Low</div>
                  <div>Suitable: Volatile tokens</div>
                </div>
                <button className="mt-4 w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded font-medium">
                  Learn More
                </button>
              </div>

              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Balanced</h3>
                <p className="text-gray-600 mb-4">
                  Moderate range for balanced risk-reward tradeoff.
                </p>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>APY: 18-25%</div>
                  <div>Risk: Medium</div>
                  <div>Suitable: Most tokens</div>
                </div>
                <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium">
                  Recommended
                </button>
              </div>

              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aggressive</h3>
                <p className="text-gray-600 mb-4">
                  Wide ranges to capture volatility and large price movements.
                </p>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>APY: 25-40%</div>
                  <div>Risk: High</div>
                  <div>Suitable: Low volume pairs</div>
                </div>
                <button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-medium">
                  Learn More
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Strategy Optimization</h3>
              <p className="text-blue-800 mb-4">
                Our AI analyzes your liquidity positions and market conditions to automatically
                recommend the optimal fee tier and range for your capital.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl mb-2">🧠</div>
                  <div className="font-semibold text-blue-900">Smart Analysis</div>
                  <div className="text-sm text-blue-700">Volatility, volume, liquidity</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="font-semibold text-blue-900">Range Optimization</div>
                  <div className="text-sm text-blue-700">Mathematical tick calculations</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">💸</div>
                  <div className="font-semibold text-blue-900">Fee Tier Selection</div>
                  <div className="text-sm text-blue-700">0.05%, 0.30%, 1.00% tiers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🔄</div>
                  <div className="font-semibold text-blue-900">Auto Rebalancing</div>
                  <div className="text-sm text-blue-700">Maintain optimal ranges</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
