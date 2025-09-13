"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"

// Mock live crypto prices
const tickerPrices = [
  { symbol: "BTC", name: "Bitcoin", price: "61,248.50", change: "+2.34%" },
  { symbol: "ETH", name: "Ethereum", price: "3,875.20", change: "+1.87%" },
  { symbol: "MATIC", name: "Polygon", price: "0.8143", change: "-0.45%" },
  { symbol: "BNB", name: "Binance Coin", price: "532.18", change: "+0.98%" },
  { symbol: "ADA", name: "Cardano", price: "0.6842", change: "+3.21%" },
  { symbol: "SOL", name: "Solana", price: "147.23", change: "+5.67%" },
  { symbol: "DOT", name: "Polkadot", price: "6.84", change: "+1.23%" },
  { symbol: "LINK", name: "Chainlink", price: "14.56", change: "+4.12%" }
]

export function CryptoTicker() {
  const [currentItems, setCurrentItems] = useState(tickerPrices.slice(0, 4))
  const [startIndex, setStartIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStartIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % tickerPrices.length
        const visibleItems = 4
        const endIndex = nextIndex + visibleItems

        if (endIndex <= tickerPrices.length) {
          setCurrentItems(tickerPrices.slice(nextIndex, endIndex))
        } else {
          const firstPart = tickerPrices.slice(nextIndex, tickerPrices.length)
          const secondPart = tickerPrices.slice(0, endIndex - tickerPrices.length)
          setCurrentItems([...firstPart, ...secondPart])
        }

        return nextIndex
      })
    }, 3000) // Change items every 3 seconds

    return () => clearInterval(interval)
  }, [])

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

          <div className="flex space-x-8 overflow-hidden">
            {currentItems.map((crypto, index) => (
              <div key={`${crypto.symbol}-${index}`} className="flex items-center space-x-3 whitespace-nowrap">
                <span className="text-sm font-medium text-gray-400">{crypto.symbol}:</span>
                <span className="text-sm font-medium">{crypto.price}</span>
                <div className={`flex items-center text-sm font-medium ${
                  crypto.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                }`}>
                  {crypto.change.startsWith('+') ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {crypto.change}
                </div>
              </div>
            ))}
          </div>

          <div className="flex-shrink-0 ml-8">
            <span className="text-sm text-gray-400">
              Prices shown in USD • Updates every 3 seconds
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
