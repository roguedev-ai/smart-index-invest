"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SmartIndex, SmartIndexTypes } from '@/types/smart-index'

interface MarketIndex extends SmartIndex {
  price: number
  volume_24h: string
  change_24h: number
  market_cap: string
  buys: number
  sells: number
}

export default function Marketplace() {
  const [marketIndexes, setMarketIndexes] = useState<MarketIndex[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'price' | 'volume' | 'change' | 'market_cap'>('market_cap')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // Fetch market data for indexes
  useEffect(() => {
    fetchMarketIndexes()
  }, [])

  const fetchMarketIndexes = async () => {
    try {
      // Fetch indexes and enrich with market data
      const response = await fetch('/api/indexes?status=active&sortBy=tvl')

      if (response.ok) {
        const result = await response.json() // Get the API response { success, data, timestamp, requestId }
        const paginatedData: SmartIndexTypes.PaginatedResponseType<SmartIndex> = result.data // The actual PaginatedResponse

        // Transform indexes into market data with simulated prices
        const marketData: MarketIndex[] = paginatedData.items.map((index: SmartIndex, idx: number) => ({
          ...index,
          price: parseFloat((Math.random() * 20 + 1).toFixed(6)), // Random price $1-21
          volume_24h: parseFloat((Math.random() * 100000 + 5000).toFixed(0)).toString(), // Random volume $5000-105000
          change_24h: (Math.random() * 20 - 10), // -10% to +10% change
          market_cap: parseFloat((Math.random() * 5000000 + 100000).toFixed(0)).toString(), // Random market cap $100k-$5M
          buys: Math.floor(Math.random() * 50),
          sells: Math.floor(Math.random() * 50)
        }))

        setMarketIndexes(marketData)
      }
    } catch (error) {
      console.error('Error fetching market data:', error)
    } finally {
      setLoading(false)
    }
  }

  const sortedIndexes = [...marketIndexes].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return parseFloat(b.price) - parseFloat(a.price)
      case 'volume':
        return parseFloat(b.volume_24h) - parseFloat(a.volume_24h)
      case 'change':
        return b.change_24h - a.change_24h
      case 'market_cap':
      default:
        return parseFloat(b.market_cap) - parseFloat(a.market_cap)
    }
  })

  const formatPrice = (price: string | number) => {
    return typeof price === 'string' ? parseFloat(price) : price
  }

  const formatNumber = (num: string | number) => {
    const n = typeof num === 'string' ? parseFloat(num) : num
    if (n >= 1000000) {
      return (n / 1000000).toFixed(1) + 'M'
    } else if (n >= 1000) {
      return (n / 1000).toFixed(1) + 'K'
    }
    return n.toString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            🌐 Smart Index Marketplace
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
            Discover, trade, and invest in personalized cryptocurrency indexes.
            Buy into successful strategies or sell your own custom index creations.
          </p>

          {/* Market Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-green-200">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatNumber(marketIndexes.length)}
              </div>
              <div className="text-sm text-gray-600">Active Indexes</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                ${formatNumber(marketIndexes.reduce((sum: number, idx) => sum + parseFloat(idx.volume_24h), 0))}
              </div>
              <div className="text-sm text-gray-600">24h Volume</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-200">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                ${formatNumber(marketIndexes.reduce((sum: number, idx) => sum + parseFloat(idx.market_cap), 0))}
              </div>
              <div className="text-sm text-gray-600">Total Market Cap</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-200">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                +{((marketIndexes.reduce((sum, idx) => sum + idx.change_24h, 0) / Math.max(marketIndexes.length, 1)) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Avg 24h Change</div>
            </div>
          </div>

          {/* Sorting & Filtering */}
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="market_cap">Market Cap</option>
                <option value="volume">24h Volume</option>
                <option value="price">Price</option>
                <option value="change">24h Change</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Category:</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="defi">DeFi</option>
                <option value="layer1">Layer 1</option>
                <option value="tech">Tech</option>
                <option value="privacy">Privacy</option>
                <option value="infrastructure">Infrastructure</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-lg text-gray-600">Loading marketplace...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Index Name & Creator
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assets
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    24h Change
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    24h Volume
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Market Cap
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedIndexes.map((index) => (
                  <tr key={index.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {index.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {index.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Creator: {index.creator.slice(0, 6)}...{index.creator.slice(-4)}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="flex flex-wrap gap-1">
                          {index.tokens.slice(0, 3).map((token, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {token.symbol}
                            </span>
                          ))}
                          {index.tokens.length > 3 && (
                            <span className="text-xs text-gray-500">+{index.tokens.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ${formatPrice(index.price).toFixed(4)}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className={`text-sm font-medium ${index.change_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {index.change_24h >= 0 ? '+' : ''}{index.change_24h.toFixed(2)}%
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ${formatNumber(index.volume_24h)}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ${formatNumber(index.market_cap)}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                          Buy
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                          Trade
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!loading && sortedIndexes.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">📊</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              No Indexes Listed Yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Be the first to create a Smart Index and start trading it here!
              Our platform supports automated index tokenization and instant marketplace listing.
            </p>
            <Link href="/index/create">
              <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-blue-700 transition-all duration-300">
                🎯 Create First Smart Index
              </button>
            </Link>
          </div>
        )}

        {/* CTA Section */}
        {sortedIndexes.length > 0 && (
          <div className="mt-16 text-center bg-white rounded-xl shadow-lg p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              🎯 Ready to Trade Your Smart Index?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Turn your personalized portfolio into a tradable asset. Create an index today
              and let other users buy into your investment strategy.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/index/create">
                <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-blue-700 transition-all duration-300">
                  🧠 Create Index
                </button>
              </Link>
              <Link href="/dashboard/user-dashboard">
                <button className="px-8 py-4 border-2 border-purple-500 text-purple-600 font-semibold rounded-xl hover:bg-purple-50 transition-all duration-300">
                  📊 View Dashboard
                </button>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
