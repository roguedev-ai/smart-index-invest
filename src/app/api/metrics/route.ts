import { NextRequest, NextResponse } from 'next/server'

// Metrics types
interface SystemMetrics {
  timestamp: string
  server_info: {
    uptime: number
    version: string
    node_version: string
    platform: string
    environment: string
  }
  memory: {
    heap_used: number
    heap_total: number
    rss: number
    external: number
    used_percentage: number
  }
  cpu?: {
    user: number
    system: number
    total: number
  }
  network?: {
    connections: number
    incoming_requests: number
    response_time_avg: number
  }
  app_metrics: {
    wallet_creations_today: number
    wallet_creations_this_week: number
    total_wallet_count: number
    admin_logins: number
    failed_login_attempts: number
  }
  errors: {
    total_count: number
    recent_errors: Array<{
      timestamp: string
      message: string
      type: string
      endpoint?: string
    }>
  }
  blockchain_status: {
    ethereum: {
      status: 'operational' | 'degraded' | 'outage'
      last_block: number
      gas_price_gwei: number
      response_time: number
    }
    polygon: {
      status: 'operational' | 'degraded' | 'outage'
      last_block: number
      gas_price_gwei: number
      response_time: number
    }
    bsc: {
      status: 'operational' | 'degraded' | 'outage'
      last_block: number
      gas_price_gwei: number
      response_time: number
    }
  }
}

// Global metrics store (in production, use Redis or database)
let metricsHistory: SystemMetrics[] = []
let errorLog: Array<{ timestamp: string, message: string, type: string, endpoint?: string }> = []

// Error tracking function
function logError(message: string, type: string = 'unknown', endpoint?: string) {
  const error = {
    timestamp: new Date().toISOString(),
    message,
    type,
    endpoint
  }

  errorLog.push(error)

  // Keep only last 100 errors
  if (errorLog.length > 100) {
    errorLog = errorLog.slice(-100)
  }
}

// Global error handler
function setupGlobalErrorHandler() {
  process.on('uncaughtException', (error) => {
    logError(error.message, 'uncaught_exception')
  })

  process.on('unhandledRejection', (reason: any) => {
    const message = reason instanceof Error ? reason.message : String(reason)
    logError(message, 'unhandled_rejection')
  })
}

// Initialize error handler
if (typeof process !== 'undefined') {
  setupGlobalErrorHandler()
}

// Get app metrics (in production, track with database)
function getAppMetrics() {
  // Mock data - in production, pull from actual metrics system
  const today = new Date().toISOString().split('T')[0]
  const walletCount = JSON.parse(localStorage.getItem('tokenmarket_wallets') || '[]').length

  return {
    wallet_creations_today: Math.floor(walletCount * 0.1), // Mock today creations
    wallet_creations_this_week: Math.floor(walletCount * 0.3), // Mock week creations
    total_wallet_count: walletCount,
    admin_logins: 12, // Mock admin logins
    failed_login_attempts: 3 // Mock failed attempts
  }
}

// Get blockchain status (mock data for demo)
function getBlockchainStatus() {
  const now = Date.now()

  return {
    ethereum: {
      status: 'operational' as const,
      last_block: 18400000 + Math.floor(Math.random() * 1000),
      gas_price_gwei: 15 + Math.random() * 10,
      response_time: 120 + Math.random() * 80
    },
    polygon: {
      status: 'operational' as const,
      last_block: 49000000 + Math.floor(Math.random() * 5000),
      gas_price_gwei: 35 + Math.random() * 20,
      response_time: 80 + Math.random() * 40
    },
    bsc: {
      status: 'operational' as const,
      last_block: 35000000 + Math.floor(Math.random() * 2000),
      gas_price_gwei: 5 + Math.random() * 3,
      response_time: 60 + Math.random() * 30
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const format = url.searchParams.get('format') || 'json'
    const window = parseInt(url.searchParams.get('window') || '60') // minutes

    // Collect system metrics
    const memory = process.memoryUsage ? process.memoryUsage() : { heapUsed: 0, heapTotal: 0, rss: 0, external: 0 }

    const metrics: SystemMetrics = {
      timestamp: new Date().toISOString(),
      server_info: {
        uptime: process.uptime ? Math.floor(process.uptime()) : 0,
        version: '1.0.0',
        node_version: process.version || 'N/A',
        platform: process.platform || 'N/A',
        environment: process.env.NODE_ENV || 'development'
      },
      memory: {
        heap_used: Math.round(memory.heapUsed / 1024 / 1024), // MB
        heap_total: Math.round(memory.heapTotal / 1024 / 1024), // MB
        rss: Math.round(memory.rss / 1024 / 1024), // MB
        external: Math.round(memory.external / 1024 / 1024), // MB
        used_percentage: Math.round((memory.heapUsed / memory.heapTotal) * 100)
      },
      app_metrics: getAppMetrics(),
      errors: {
        total_count: errorLog.length,
        recent_errors: errorLog.slice(-5) // Last 5 errors
      },
      blockchain_status: getBlockchainStatus()
    }

    // Add CPU info if available
    if (process.cpuUsage) {
      const cpuUsage = process.cpuUsage()
      metrics.cpu = {
        user: Math.round(cpuUsage.user / 1000), // milliseconds
        system: Math.round(cpuUsage.system / 1000), // milliseconds
        total: Math.round((cpuUsage.user + cpuUsage.system) / 1000) // milliseconds
      }
    }

    // Store metrics history (keep last 24 hours)
    metricsHistory.push(metrics)
    if (metricsHistory.length > 1440) { // 1440 minutes = 24 hours at 1/min
      metricsHistory = metricsHistory.slice(-1440)
    }

    // Return based on requested format
    if (format === 'prometheus') {
      const prometheusOutput = `
# HELP nextjs_server_info Server information
# TYPE nextjs_server_info gauge
nextjs_server_info{version="${metrics.server_info.version}"} 1

# HELP process_memory_usage_bytes Memory usage in bytes
# TYPE process_memory_usage_bytes gauge
process_memory_usage_heap_used ${memory.heapUsed}
process_memory_usage_heap_total ${memory.heapTotal}
process_memory_usage_rss ${memory.rss}

# HELP app_wallet_creations_total Total wallet creations
# TYPE app_wallet_creations_total counter
app_wallet_creations_total ${metrics.app_metrics.total_wallet_count}

# HELP blockchain_response_time_ms Blockchain response times
# TYPE blockchain_response_time_ms gauge
blockchain_response_time_ethereum_ms ${metrics.blockchain_status.ethereum.response_time}
blockchain_response_time_polygon_ms ${metrics.blockchain_status.polygon.response_time}
blockchain_response_time_bsc_ms ${metrics.blockchain_status.bsc.response_time}
`

      return new Response(prometheusOutput, {
        headers: { 'Content-Type': 'text/plain' }
      })
    }

    // Default JSON response
    return NextResponse.json(metrics)

  } catch (error) {
    console.error('Metrics collection failed:', error)
    logError(`Metrics collection failed: ${error}`, 'metrics_error')

    const errorMetrics = {
      timestamp: new Date().toISOString(),
      error: 'Failed to collect metrics',
      status: 'error'
    }

    return NextResponse.json(errorMetrics, { status: 503 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Accept error reports from client
    const body = await request.json()

    if (body.error) {
      logError(
        body.error.message,
        body.error.type || 'client_error',
        body.error.endpoint
      )
    }

    return NextResponse.json({ status: 'error logged' })
  } catch (error) {
    console.error('Error logging failed:', error)
    return NextResponse.json({ status: 'error', message: 'Failed to log error' }, { status: 500 })
  }
}
