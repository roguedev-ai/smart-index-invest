"use client"

import { useState, useEffect } from "react"

// Custom trending icons to avoid lucide-react dependency
const TrendingUpIcon = () => (
  <svg className="h-3 w-3 stroke-green-400" fill="none" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const TrendingDownIcon = () => (
  <svg className="h-3 w-3 stroke-red-400" fill="none" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
)

// Types and interfaces for crypto data
interface CryptoPrice {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  total_volume: number
  image: string
  sparkline_in_7d?: { price: number[] }
}

interface TickerItem {
  symbol: string
  name: string
  price: string
  change: string
  volume?: string
  movement: 'up' | 'down' | 'unchanged'
}

// Crypto API configuration
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'
const API_PARAMS = 'ids=bitcoin,ethereum,matic-network,binancecoin,cardano,solana,polkadot,chainlink'
const PRICE_PARAMS = `${API_PARAMS}&vs_currency=usd&include_24hr_change=true&include_24hr_vol=true`

// Default fallback data in case API fails
const fallbackData: TickerItem[] = [
  { symbol: "BTC", name: "Bitcoin", price: "Loading...", change: "0.00%", volume: "", movement: 'unchanged' },
  { symbol: "ETH", name: "Ethereum", price: "Loading...", change: "0.00%", volume: "", movement: 'unchanged' },
  { symbol: "MATIC", name: "Polygon", price: "Loading...", change: "0.00%", volume: "", movement: 'unchanged' },
  { symbol: "BNB", name: "Binance Coin", price: "Loading...", change: "0.00%", volume: "", movement: 'unchanged' }
]

// Utility function to format large numbers
const formatVolume = (volume: number): string => {
  if (volume >= 1e9) return `$${(volume / 1e9).toFixed(1)}B`
  if (volume >= 1e6) return `$${(volume / 1e6).toFixed(1)}M`
  if (volume >= 1e3) return `$${(volume / 1e3).toFixed(1)}K`
  return `$${volume.toFixed(0)}`
}

// Transform CoinGecko API response to ticker format
const transformCrytoData = (cryptoData: CryptoPrice[]): TickerItem[] => {
  return cryptoData.slice(0, 8).map(coin => ({
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    price: coin.current_price < 1
      ? coin.current_price.toFixed(6)
      : coin.current_price.toLocaleString(undefined, { maximumFractionDigits: 2 }),
    change: coin.price_change_percentage_24h !== undefined
      ? `${coin.price_change_percentage_24h >= 0 ? '+' : ''}${coin.price_change_percentage_24h.toFixed(2)}%`
      : '0.00%',
    volume: formatVolume(coin.total_volume),
    movement: coin.price_change_percentage_24h > 0 ? 'up' : coin.price_change_percentage_24h < 0 ? 'down' : 'unchanged'
  }))
}

export function CryptoTicker() {
  const [currentItems, setCurrentItems] = useState<TickerItem[]>(fallbackData)
  const [startIndex, setStartIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch live crypto data from CoinGecko API
  const fetchCryptoPrices = async (): Promise<TickerItem[]> => {
    try {
      const response = await fetch(`${COINGECKO_API_BASE}/coins/markets?${PRICE_PARAMS}`)

      if (!response.ok) {
        console.warn('Failed to fetch crypto prices, using fallback data')
        return fallbackData
      }

      const data: CryptoPrice[] = await response.json()
      return transformCrytoData(data)

    } catch (error) {
      console.warn('Error fetching crypto prices:', error)
      return fallbackData
    }
  }

  // Initialize ticker with live data
  useEffect(() => {
    const initializeTicker = async () => {
      const liveData = await fetchCryptoPrices()
      setCurrentItems(liveData)
      setIsLoading(false)
    }

    initializeTicker()
  }, [])

  // Rotate through items every 30 seconds (longer interval for API calls)
  useEffect(() => {
    if (isLoading) return

    const interval = setInterval(() => {
      setStartIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % currentItems.length
        const visibleItems = 4
        const endIndex = nextIndex + visibleItems

        if (endIndex <= currentItems.length) {
          setCurrentItems(prev => prev.slice(nextIndex, endIndex))
        } else {
          const firstPart = currentItems.slice(nextIndex, currentItems.length)
          const secondPart = currentItems.slice(0, endIndex - currentItems.length)
          setCurrentItems(prev => [...firstPart, ...secondPart])
        }

        return nextIndex
      })
    }, 30000) // Change items every 30 seconds

    return () => clearInterval(interval)
  }, [currentItems.length, isLoading])

  // Periodic data refresh (every 5 minutes)
  useEffect(() => {
    if (isLoading) return

    const refreshInterval = setInterval(async () => {
      const freshData = await fetchCryptoPrices()
      const newVisibleItems = freshData.slice(startIndex, startIndex + 4)
      setCurrentItems(newVisibleItems)
    }, 300000) // Refresh every 5 minutes

    return () => clearInterval(refreshInterval)
  }, [startIndex, isLoading])

  return (
    <div className="bg-gray-900 text-white py-2 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-8">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm font-medium text-gray-300">LIVE MARKET</span>
            </div>
          </div>

          <div className="flex space-x-6 overflow-hidden">
            {currentItems.map((crypto: TickerItem, index: number) => (
              <div key={`${crypto.symbol}-${index}`} className="flex items-center space-x-3 whitespace-nowrap">
                <span className="text-xs font-bold text-gray-300">{crypto.symbol}</span>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-white">${crypto.price}</span>
                  <div className={`flex items-center text-xs font-medium ${
                    crypto.movement === 'up' ? 'text-green-400' :
                    crypto.movement === 'down' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {crypto.movement === 'up' ? (
                      <TrendingUpIcon />
                    ) : crypto.movement === 'down' ? (
                      <TrendingDownIcon />
                    ) : null}
                    <span className="ml-1">{crypto.change}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex-shrink-0 ml-8">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs text-gray-400">
                Live • CoinGecko • {isLoading ? 'Loading...' : 'Updated'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
