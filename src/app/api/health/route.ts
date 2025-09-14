import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Health check types
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  version: string
  nodeVersion: string
  memory: {
    used: number
    total: number
    percentage: number
  }
  database: {
    status: 'connected' | 'disconnected' | 'error'
    responseTime: number
  }
  services: {
    [serviceId: string]: {
      status: 'operational' | 'degraded' | 'outage'
      responseTime: number
      lastChecked: string
    }
  }
}

// Start time tracking for uptime
const serverStartTime = Date.now()
const version = process.env.npm_package_version || '1.0.0'

// Mock service checks (in production, these would check real services)
async function checkService(serviceName: string, url: string): Promise<{ status: string, responseTime: number }> {
  const startTime = Date.now()

  try {
    // Simulate service check
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100))

    const responseTime = Date.now() - startTime

    // Simulate occasional failures for demo
    if (Math.random() > 0.95) {
      return { status: 'degraded', responseTime }
    }

    return { status: 'operational', responseTime }
  } catch (error) {
    return { status: 'outage', responseTime: Date.now() - startTime }
  }
}

// Get memory usage (server-side only)
function getMemoryUsage() {
  if (typeof process === 'undefined') {
    return { used: 0, total: 0, percentage: 0 }
  }

  const memUsage = process.memoryUsage()
  const used = Math.round((memUsage.rss + memUsage.heapUsed + memUsage.external) / 1024 / 1024)
  const total = Math.round(memUsage.heapTotal / 1024 / 1024 / 1000)

  return {
    used,
    total: total * 1000, // Convert back for display
    percentage: Math.min(100, Math.round((used / (total * 1000)) * 100))
  }
}

// Check blockchain connectivity
async function checkBlockchainServices(): Promise<{ [key: string]: any }> {
  const services: { [key: string]: any } = {}

  // Check Ethereum mainnet
  const ethereumCheck = await checkService('infura', 'https://mainnet.infura.io/v3/test')
  services.ethereum = {
    status: ethereumCheck.status,
    responseTime: ethereumCheck.responseTime,
    lastChecked: new Date().toISOString()
  }

  // Check Polygon
  const polygonCheck = await checkService('polygon', 'https://polygon-rpc.com/')
  services.polygon = {
    status: polygonCheck.status,
    responseTime: polygonCheck.responseTime,
    lastChecked: new Date().toISOString()
  }

  // Check BSC
  const bscCheck = await checkService('bsc', 'https://bsc-dataseed.binance.org/')
  services.bsc = {
    status: bscCheck.status,
    responseTime: bscCheck.responseTime,
    lastChecked: new Date().toISOString()
  }

  return services
}

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers()

    // Check for detailed request
    const url = new URL(request.url)
    const detailed = url.searchParams.get('detailed') === 'true'

    // Get current memory usage
    const memory = getMemoryUsage()

    // Calculate uptime
    const uptime = Math.floor((Date.now() - serverStartTime) / 1000)

    // Basic health status
    const basicHealth: HealthStatus = {
      status: memory.percentage < 80 ? 'healthy' : memory.percentage < 95 ? 'degraded' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime,
      version,
      nodeVersion: process.version || 'N/A',
      memory,
      database: {
        status: 'connected', // Mock - would check real database
        responseTime: Math.floor(Math.random() * 10) + 5
      },
      services: {}
    }

    // Add detailed service checks if requested
    if (detailed) {
      basicHealth.services = await checkBlockchainServices()
    }

    // Analyze overall health based on services
    if (detailed && Object.values(basicHealth.services).some(service => service.status === 'outage')) {
      basicHealth.status = 'degraded'
    }

    // Add HTTP status codes based on health
    const httpStatus = basicHealth.status === 'healthy' ? 200 : basicHealth.status === 'degraded' ? 206 : 503

    return NextResponse.json(basicHealth, { status: httpStatus })

  } catch (error) {
    console.error('Health check failed:', error)

    const errorResponse: Partial<HealthStatus> = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - serverStartTime) / 1000),
      version,
      nodeVersion: process.version || 'N/A'
    }

    return NextResponse.json(errorResponse, { status: 503 })
  }
}
