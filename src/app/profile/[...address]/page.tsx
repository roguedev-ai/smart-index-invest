"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { SmartIndex, SmartIndexTypes } from '@/types/smart-index'
import { useAuth } from '@/contexts/auth-context'

// Creator profile data interface
interface CreatorProfile {
  address: string
  displayName: string
  followerCount: number
  createdIndexes: number
  totalFundsManaged: number
  winRate: number
  bio: string
  avatar?: string
  stats: CreatorStats
}

// Statistics for creator performance
interface CreatorStats {
  totalReturn: number
  bestMonth: number
  averageIndexReturn: number
  highestPerformingIndex: string
  earliestIndexDate: number
  totalIndexes: number
  followerCount: number
}

export default function CreatorProfile() {
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null)
  const [creatorIndexes, setCreatorIndexes] = useState<SmartIndex[]>([])
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  const address = Array.isArray(params.address) ? params.address[0] : params.address

  useEffect(() => {
    if (address) {
      fetchCreatorProfile()
      checkIfFollowing()
    }
  }, [address])

  const fetchCreatorProfile = async () => {
    try {
      setLoading(true)

      // Fetch indexes by creator
      const response = await fetch(`/api/creator/${address}/indexes`)

      if (!response.ok) {
        throw new Error('Failed to fetch creator data')
      }

      const data = await response.json()
      const indexes: SmartIndex[] = data.indexes || []

      // Generate creator profile from indexes
      const profile: CreatorProfile = {
        address,
        displayName: `${address.slice(0, 6)}...${address.slice(-4)}`,
        followerCount: Math.floor(Math.random() * 500) + 10, // Simulate followers
        createdIndexes: indexes.length,
        totalFundsManaged: indexes.reduce((sum, idx) => sum + idx.tvl, 0),
        winRate: Math.random() * 40 + 60, // 60-100% win rate
        bio: `Index creator with ${indexes.length} successful portfolios. Focus on DeFi protocols and emerging Layer 1s.`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`,
        stats: generateStatsFromIndexes(indexes)
      }

      setCreatorProfile(profile)
      setCreatorIndexes(indexes)

    } catch (error) {
      console.error('Error fetching creator profile:', error)
      // Handle error state
    } finally {
      setLoading(false)
    }
  }

  const checkIfFollowing = () => {
    // Check if current user follows this creator
    if (isAuthenticated && user) {
      // Mock following check - in production this would check user's following list
      // const following = localStorage.getItem('user_following') || '[]'
      // const followingList = JSON.parse(following)
      // setIsFollowing(followingList.includes(address))

      setIsFollowing(Math.random() > 0.7) // Random following status for demo
    }
  }

  const handleFollowToggle = () => {
    if (!isAuthenticated) {
      alert('Please connect your wallet to follow creators!')
      return
    }

    // Toggle following status
    const newFollowingStatus = !isFollowing
    setIsFollowing(newFollowingStatus)

    if (newFollowingStatus && creatorProfile) {
      setCreatorProfile(prev => prev ? {
        ...prev,
        followerCount: prev.followerCount + 1
      } : null)
    } else if (!newFollowingStatus && creatorProfile) {
      setCreatorProfile(prev => prev ? {
        ...prev,
        followerCount: Math.max(0, prev.followerCount - 1)
      } : null)
    }

    // Persist following in localStorage (production: sync with backend)
    if (user?.address) {
      const followingKey = `following_${user.address}`
      const following = JSON.parse(localStorage.getItem(followingKey) || '[]')

      if (newFollowingStatus) {
        if (!following.includes(address)) {
          following.push(address)
        }
      } else {
        const index = following.indexOf(address)
        if (index > -1) {
          following.splice(index, 1)
        }
      }

      localStorage.setItem(followingKey, JSON.stringify(following))
    }
  }

  const generateStatsFromIndexes = (indexes: SmartIndex[]): CreatorStats => {
    if (indexes.length === 0) {
      return {
        totalReturn: 0,
        bestMonth: 0,
        averageIndexReturn: 0,
        highestPerformingIndex: '',
        earliestIndexDate: Date.now(),
        totalIndexes: 0,
        followerCount: 0
      }
    }

    // Calculate performance metrics
    const performanceSnapshots = indexes.flatMap(idx => idx.performance)
    const totalReturn = performanceSnapshots.length > 0
      ? performanceSnapshots[performanceSnapshots.length - 1].totalReturn * 100
      : 0

    const bestMonth = performanceSnapshots.length > 0
      ? Math.max(...performanceSnapshots.map(p => p.priceChange24h || 0)) * 100
      : 0

    const averageIndexReturn = indexes.reduce((sum, idx) => {
      const latest = idx.performance[idx.performance.length - 1]
      return sum + (latest?.totalReturn || 0)
    }, 0) / Math.max(indexes.length, 1) * 100

    const highestPerformingIndex = indexes.length > 0
      ? indexes.reduce((best, current) =>
          (current.performance[current.performance.length - 1]?.totalReturn || 0) >
          (best.performance[best.performance.length - 1]?.totalReturn || 0)
          ? current : best
        ).name
      : ''

    const earliestIndexDate = indexes.length > 0
      ? Math.min(...indexes.map(idx => idx.metadata.createdAt))
      : Date.now()

    return {
      totalReturn: totalReturn,
      bestMonth: bestMonth,
      averageIndexReturn: averageIndexReturn,
      highestPerformingIndex: highestPerformingIndex,
      earliestIndexDate: earliestIndexDate,
      totalIndexes: indexes.length,
      followerCount: creatorProfile?.followerCount || 0
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-lg text-gray-600">Loading creator profile...</span>
      </div>
    )
  }

  if (!creatorProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">👤</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Creator Not Found</h1>
          <p className="text-gray-600 mb-6">
            The creator profile you're looking for doesn't exist or hasn't created any indexes yet.
          </p>
          <Link href="/marketplace">
            <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
              Browse Marketplace →
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-6 mb-6 md:mb-0">
              <div className="relative">
                <img
                  src={creatorProfile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creatorProfile.address}`}
                  alt={creatorProfile.displayName}
                  className="w-24 h-24 rounded-full"
                />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {creatorProfile.displayName || `Creator ${creatorProfile.address.slice(0, 8)}`}
                </h1>
                <p className="text-gray-600 mb-3">{creatorProfile.bio}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span>🏆 {creatorProfile.followerCount.toLocaleString()} followers</span>
                  <span>📊 {creatorProfile.createdIndexes} indexes</span>
                  <span>💰 ${formatNumber(creatorProfile.totalFundsManaged)} managed</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleFollowToggle}
                disabled={!isAuthenticated}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  isFollowing
                    ? 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isFollowing ? '✓ Following' : '+ Follow Creator'}
              </button>

              <Link href="/index/create">
                <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-blue-700 transition-all duration-300">
                  🧠 Create Index Like This
                </button>
              </Link>
            </div>
          </div>

          {/* Wallet Address (click to copy) */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Wallet Address:</span>
              <div className="flex items-center space-x-2">
                <code className="text-sm font-mono bg-white px-2 py-1 rounded">
                  {creatorProfile.address.slice(0, 6)}...{creatorProfile.address.slice(-4)}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(creatorProfile.address)}
                  className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {(creatorProfile.stats.totalReturn).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Total Portfolio Return</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {(creatorProfile.stats.bestMonth).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Best Month Performance</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {creatorProfile.winRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Strategy Win Rate</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {creatorProfile.stats.totalIndexes}
            </div>
            <div className="text-sm text-gray-600">Active Indexes</div>
          </div>
        </div>

        {/* Creator Indexes */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Portfolio of Indexes
            </h2>
            {creatorIndexes.length > 0 && (
              <span className="text-sm text-gray-600">
                {creatorIndexes.length} indexes created since {new Date(creatorProfile.stats.earliestIndexDate).toLocaleDateString()}
              </span>
            )}
          </div>

          {creatorIndexes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Index Portfolios Yet
              </h3>
              <p className="text-gray-600 mb-6">
                This creator hasn't created any Smart Indexes yet.
                They might be preparing their first portfolio!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {creatorIndexes.map((index, idx) => (
                <div key={index.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {index.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{index.name}</h4>
                        <span className="text-xs text-gray-500">
                          {index.tokens.length} assets
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      {index.performance.length > 0 && (
                        <div className={`text-sm font-semibold ${
                          (index.performance[index.performance.length - 1].totalReturn) > 0
                            ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {((index.performance[index.performance.length - 1].totalReturn) * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1 mb-3">
                      {index.tokens.slice(0, 3).map((token) => (
                        <span
                          key={token.symbol}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {token.symbol}: {token.weight}%
                        </span>
                      ))}
                    </div>

                    <div className="text-sm text-gray-600 mb-4">
                      {index.description.slice(0, 100)}...
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">TVL:</span>
                        <span className="ml-2 font-semibold">${formatNumber(index.tvl)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Rebalancing:</span>
                        <span className="ml-2 font-semibold capitalize">{index.rules.rebalanceFrequency}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link href="/marketplace">
                      <button className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                        View in Marketplace
                      </button>
                    </Link>

                    <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors">
                      📊 Copy Strategy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Ready to Follow This Creator?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Get notified when they create new indexes, share their strategy updates,
              and automatically follow their portfolio performance.
            </p>
            <div className="flex justify-center space-x-4">
              {!isAuthenticated ? (
                <Link href="/web-wallet/create">
                  <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-blue-700 transition-all duration-300">
                    Connect Wallet to Follow
                  </button>
                </Link>
              ) : !isFollowing ? (
                <button
                  onClick={handleFollowToggle}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
                >
                  🔔 Follow Creator & Get Updates
                </button>
              ) : (
                <button className="px-8 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl border-2 border-gray-300">
                  ✓ You're Following This Creator
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
