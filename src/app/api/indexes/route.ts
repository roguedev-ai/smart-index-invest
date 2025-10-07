/**
 * SMART INDEX PLATFORM - API Routes
 * Backend API endpoints for Smart Index operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { SmartIndex, CreateIndexRequest, SmartIndexTypes } from '@/types/smart-index'
import { getDiscordClient } from '@/lib/discord'

// Mock data store (replace with real database in production)
const mockIndexes: SmartIndex[] = []

/**
 * GET /api/indexes
 * Retrieve paginated list of published indexes
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category') as any
    const sortBy = searchParams.get('sortBy') || 'tvl'

    // Filter active indexes
    let filteredIndexes = mockIndexes.filter(index => index.status === 'active')

    // Apply category filter
    if (category && category !== 'all') {
      filteredIndexes = filteredIndexes.filter(index => {
        // Mock categorization logic
        const tokens = index.tokens.map(t => t.symbol.toLowerCase())
        if (category === 'defi') {
          return tokens.some(t => ['uni', 'ldo', 'aave', 'comp'].includes(t))
        }
        if (category === 'layer1') {
          return tokens.some(t => ['eth', 'btc', 'sol', 'ada'].includes(t))
        }
        return true
      })
    }

    // Apply sorting
    if (sortBy === 'tvl') {
      filteredIndexes.sort((a, b) => b.tvl - a.tvl)
    } else if (sortBy === 'performance') {
      filteredIndexes.sort((a, b) => (b.performance.slice(-1)[0]?.totalReturn || 0) -
                                     (a.performance.slice(-1)[0]?.totalReturn || 0))
    }

    // Pagination
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedItems = filteredIndexes.slice(start, end)

    const response: SmartIndexTypes.PaginatedResponseType<SmartIndex> = {
      items: paginatedItems,
      total: filteredIndexes.length,
      page,
      pageSize: limit,
      hasNext: end < filteredIndexes.length,
      hasPrev: page > 1
    }

    return NextResponse.json({
      success: true,
      data: response,
      timestamp: Date.now(),
      requestId: crypto.randomUUID()
    })

  } catch (error) {
    console.error('GET /api/indexes error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve indexes',
      timestamp: Date.now(),
      requestId: crypto.randomUUID()
    }, { status: 500 })
  }
}

/**
 * POST /api/indexes
 * Create a new smart index
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Received POST /api/indexes request')

    const body = await request.json()
    console.log('Request body:', JSON.stringify(body, null, 2))

    // Validate required fields - be more flexible for debugging
    if (!body.name && !body.creator && !Array.isArray(body.tokens)) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields. Please provide name, creator, and tokens array.',
        timestamp: Date.now(),
        requestId: crypto.randomUUID()
      }, { status: 400 })
    }

    console.log('Basic validation passed, checking token weights...')

    // Validate token weights total to 100%
    const totalWeight = (body.tokens as any[]).reduce((sum: number, token: any) => sum + token.weight, 0)
    if (Math.abs(totalWeight - 100) > 0.01) { // Allow tiny floating point errors
      console.log(`Validation failed - total weight: ${totalWeight}`)
      return NextResponse.json({
        success: false,
        error: 'Token weights must total exactly 100%',
        timestamp: Date.now(),
        requestId: crypto.randomUUID()
      }, { status: 400 })
    }

    console.log(`Token weights validation passed - total: ${totalWeight}`)

    // Enhanced validation: Allow single asset strategies (100% one token)
    if ((body.tokens as any[]).length === 1) {
      // Single asset strategy - allow 100%
      const token = body.tokens[0]
      if (token.weight !== 100) {
        return NextResponse.json({
          success: false,
          error: `Single asset strategy must have 100% allocation. Got: ${token.symbol} (${token.weight}%)`,
          indexType: 'single-asset',
          timestamp: Date.now(),
          requestId: crypto.randomUUID()
        }, { status: 400 })
      }
      console.log(`Single asset strategy validation passed: ${token.symbol} (100%)`)
    } else {
      // Multi-asset index - validate individual weights (5-80% per token)
      const invalidWeight = (body.tokens as any[]).find((token: any) =>
        token.weight < 5 || token.weight > 80
      )
      if (invalidWeight) {
        return NextResponse.json({
          success: false,
          error: `Multi-asset index token weight must be 5-80% per asset. Got: ${invalidWeight.symbol} (${invalidWeight.weight}%)`,
          suggestion: 'For single asset strategies, use 100% allocation on one token',
          indexType: 'multi-asset',
          timestamp: Date.now(),
          requestId: crypto.randomUUID()
        }, { status: 400 })
      }
      console.log(`Multi-asset index validation passed - ${body.tokens.length} tokens in 5-80% range`)
    }

    // Determine index type based on tokens
    const indexType = (body.tokens as any[]).length === 1 ? 'single-asset' : 'multi-asset'

    // Create new index with default values
    const newIndex: SmartIndex = {
      id: crypto.randomUUID(),
      ...body,
      tvl: 0,
      performance: [],
      social: {
        followers: 0,
        copies: 0,
        subscribers: 0,
        investors: 0,
        followerList: [],
        totalCreatorFees: 0,
        rating: 0,
        reviews: 0
      },
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: '1.0',
        whitelistStatus: 'whitelisted',
        complianceFlags: [],
        indexType
      },
      status: 'draft'
    }

    // Add to mock store (replace with database in production)
    mockIndexes.push(newIndex)

    console.log(`Index created successfully: ${newIndex.name} (${indexType})`)

    // Send Discord notification for successful index creation
    if (process.env.NEXT_PUBLIC_ENABLE_DISCORD_INTEGRATION === 'true') {
      const discord = getDiscordClient();
      if (discord) {
        // Calculate total value if available
        const totalValue = newIndex.tvl ? `$${newIndex.tvl.toLocaleString()}` : undefined;

        discord.sendIndexAlert({
          indexName: newIndex.name,
          creator: newIndex.creator || 'Anonymous',
          action: 'created',
          timestamp: new Date(newIndex.metadata.createdAt),
          tokenCount: newIndex.tokens?.length || 0,
          totalValue,
        }).catch(console.error); // Non-blocking, log errors
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...newIndex,
        indexType,
        message: indexType === 'single-asset'
          ? `Single Asset Strategy created: ${body.tokens[0].symbol} (100%)`
          : `Multi-Asset Index created: ${body.tokens.length} tokens`
      },
      timestamp: Date.now(),
      requestId: crypto.randomUUID()
    })

  } catch (error) {
    console.error('POST /api/indexes error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create index',
      timestamp: Date.now(),
      requestId: crypto.randomUUID()
    }, { status: 500 })
  }
}
