"use client"

import { useState, useEffect } from 'react'

interface HealthData {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  memory: {
    used: number
    total: number
    percentage: number
  }
  database: {
    status: string
    responseTime: number
  }
  services?: Record<string, any>
}

interface MetricsData {
  timestamp: string
  server_info: {
    uptime: number
    version: string
    node_version: string
  }
  memory: {
    heap_used: number
    heap_total: number
    rss: number
    used_percentage: number
  }
  app_metrics: {
    wallet_creations_today: number
    total_wallet_count: number
  }
  errors: {
    total_count: number
    recent_errors: Array<{
      timestamp: string
      message: string
      type: string
    }>
  }
  blockchain_status: {
    ethereum: { status: string, response_time: number }
    polygon: { status: string, response_time: number }
    bsc: { status: string, response_time: number }
  }
}

export default function MonitoringDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [healthStatus, setHealthStatus] = useState<HealthData | null>(null)
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const [healthRes, metricsRes] = await Promise.all([
          fetch('/api/health?detailed=true'),
          fetch('/api/metrics')
        ])

        const healthData: HealthData = await healthRes.json()
        const metricsData: MetricsData = await metricsRes.json()

        setHealthStatus(healthData)
        setMetrics(metricsData)
        setLastUpdated(new Date())
      } catch (error) {
        console.error('Failed to fetch monitoring data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000) // 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const getStatusColor = (status: string, type: 'bg' | 'text' | 'border' = 'bg') => {
    const base = type === 'bg' ? type : type === 'border' ? 'border' : 'text'

    switch (status.toLowerCase()) {
      case 'healthy':
      case 'operational':
        return `${base}-green-500`
      case 'degraded':
        return `${base}-yellow-500`
      case 'unhealthy':
      case 'outage':
        return `${base}-red-500`
      default:
        return `${base}-gray-500`
    }
  }

  const HealthCard = ({ title, value, status, icon }: {
    title: string
    value: string | number
    status?: string
    icon: string
  }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      {status && (
        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(status)} text-white`}>
          • {status}
        </span>
      )}
    </div>
  )

  if (loading && !healthStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading system monitoring data...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">System Monitoring 🖥️</h1>
            <p className="text-gray-600">Real-time server health and performance metrics</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
              <div className="flex items-center mt-1">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`mr-3 px-3 py-1 text-xs rounded ${autoRefresh ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                >
                  Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={async () => {
                    setLoading(true)
                    try {
                      const [healthRes, metricsRes] = await Promise.all([
                        fetch('/api/health?detailed=true'),
                        fetch('/api/metrics')
                      ])

                      const healthData = await healthRes.json()
                      const metricsData = await metricsRes.json()

                      setHealthStatus(healthData)
                      setMetrics(metricsData)
                      setLastUpdated(new Date())
                    } catch (error) {
                      console.error('Refresh failed:', error)
                    } finally {
                      setLoading(false)
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"
                  disabled={loading}
                >
                  {loading ? 'Refreshing...' : 'Refresh Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="px-6">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: '📊 Overview', description: 'System Health Status' },
              { id: 'performance', label: '⚡ Performance', description: 'Server & App Metrics' },
              { id: 'blockchain', label: '🌐 Blockchain', description: 'Network Status' },
              { id: 'errors', label: '🚨 Errors', description: 'Error Logs & Alerts' }
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
            {/* System Health Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <HealthCard
                title="Server Status"
                value={healthStatus?.status || 'Unknown'}
                status={healthStatus?.status}
                icon="🖥️"
              />
              <HealthCard
                title="Uptime"
                value={formatUptime(healthStatus?.uptime || 0)}
                icon="⏱️"
              />
              <HealthCard
                title="Memory Usage"
                value={`${healthStatus?.memory.percentage || 0}%`}
                icon="🧠"
              />
              <HealthCard
                title="Wallets Created"
                value={metrics?.app_metrics.total_wallet_count || 0}
                icon="🛡️"
              />
            </div>

            {/* System Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Server Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Version:</span>
                    <span className="font-medium">{healthStatus?.version || '1.0.0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Node.js:</span>
                    <span className="font-medium">{healthStatus?.nodeVersion || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Database:</span>
                    <span className={`font-medium ${getStatusColor(healthStatus?.database.status || 'unknown', 'text')}`}>
                      {healthStatus?.database.status || 'Unknown'} • {healthStatus?.database.responseTime || 0}ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Memory Used:</span>
                    <span className="font-medium">
                      {healthStatus?.memory.used || 0}MB / {healthStatus?.memory.total || 0}MB
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">Database Connection</span>
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(healthStatus?.database.status || '', 'bg')} text-white`}>
                      {healthStatus?.database.status || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">API Response Time</span>
                    <span className="font-medium text-green-600">
                      {healthStatus?.services ?
                        Math.round(Object.values(healthStatus.services).reduce((sum: number, service: any) =>
                          sum + (service.responseTime || 0), 0) / Object.values(healthStatus.services).length) :
                        0
                      }ms avg
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">Service Health</span>
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(healthStatus?.status || '', 'bg')} text-white`}>
                      {healthStatus?.status || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && metrics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <HealthCard
                title="Memory Usage"
                value={`${metrics.memory.used_percentage}%`}
                icon="🧠"
              />
              <HealthCard
                title="Heap Used"
                value={`${metrics.memory.heap_used}MB`}
                icon="💾"
              />
              <HealthCard
                title="Total Heap"
                value={`${metrics.memory.heap_total}MB`}
                icon="📊"
              />
              <HealthCard
                title="Active Users"
                value={metrics.app_metrics.total_wallet_count}
                icon="👥"
              />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Memory Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl mb-2">💻</div>
                  <div className="text-lg font-bold text-green-600">{metrics.memory.heap_used}MB</div>
                  <div className="text-sm text-gray-600">Heap Used</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (metrics.memory.heap_used / metrics.memory.heap_total) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">💾</div>
                  <div className="text-lg font-bold text-blue-600">{metrics.memory.heap_total}MB</div>
                  <div className="text-sm text-gray-600">Heap Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">🔄</div>
                  <div className="text-lg font-bold text-purple-600">{metrics.memory.rss}MB</div>
                  <div className="text-sm text-gray-600">RSS</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">📦</div>
                  <div className="text-lg font-bold text-orange-600">{metrics.memory.external}MB</div>
                  <div className="text-sm text-gray-600">External</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blockchain Tab */}
        {activeTab === 'blockchain' && metrics && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Blockchain Status</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(metrics.blockchain_status).map(([network, data]) => (
                <div key={network} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">{network}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(data.status, 'bg')} text-white`}>
                      {data.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Response Time:</span>
                      <span className="font-medium text-green-600">{Math.round(data.response_time)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gas Price:</span>
                      <span className="font-medium">
                        {(data.gas_price_gwei || 0).toFixed(2)} gwei
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Block:</span>
                      <span className="font-medium">{(data.last_block || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(data.status)}`} />
                      <span className="text-sm capitalize">{data.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Errors Tab */}
        {activeTab === 'errors' && metrics && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Error Logs & Alerts</h2>
                <span className={`px-3 py-1 text-sm rounded ${metrics.errors.total_count > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {metrics.errors.total_count} total errors
                </span>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Errors</h3>

                {metrics.errors.recent_errors.length > 0 ? (
                  metrics.errors.recent_errors.map((error, index) => (
                    <div key={index} className="border border-red-200 bg-red-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="text-xs px-2 py-1 bg-red-200 text-red-800 rounded mr-2 uppercase font-medium">
                              {error.type}
                            </span>
                            <span className="text-xs text-gray-600">
                              {new Date(error.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-900">{error.message}</p>
                          {error.endpoint && (
                            <p className="text-sm text-gray-600 mt-1">Endpoint: {error.endpoint}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-4xl mb-3">✅</div>
                    <h4 className="text-lg font-semibold text-green-900 mb-2">No Recent Errors</h4>
                    <p className="text-green-700">
                      System is running smoothly without any recorded errors.
                    </p>
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
