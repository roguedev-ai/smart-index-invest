'use client';

import { useMemo } from 'react';
import { useRealtimePricing } from '@/lib/hooks/useRealtimePricing';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PortfolioAsset {
  symbol: string;
  coinGeckoId: string; // e.g., 'bitcoin', 'ethereum'
  amount: number; // Amount held
}

interface PortfolioValueCardProps {
  assets: PortfolioAsset[];
  className?: string;
}

/**
 * Portfolio Value Card Component
 *
 * Displays the total portfolio value with real-time price updates
 * Shows 24-hour change with green/red indicators and trending arrows
 */
export function PortfolioValueCard({ assets, className = "" }: PortfolioValueCardProps) {
  // Extract CoinGecko IDs for the API call
  const tokenIds = useMemo(() =>
    assets.map(asset => asset.coinGeckoId).filter(id => id && typeof id === 'string'),
    [assets]
  );

  // Fetch real-time prices
  const {
    data: prices,
    isLoading,
    error
  } = useRealtimePricing(tokenIds);

  // Calculate total portfolio value and 24h change
  const { totalValue, totalChange24h } = useMemo(() => {
    if (!prices || Object.keys(prices).length === 0) {
      return { totalValue: 0, totalChange24h: 0 };
    }

    let value = 0;
    let change24hValue = 0;

    assets.forEach(asset => {
      const priceData = prices[asset.coinGeckoId];
      if (priceData && asset.amount > 0) {
        const assetValue = asset.amount * priceData.usd;
        value += assetValue;

        // Calculate 24h change in USD based on current asset value
        const assetChange24h = (priceData.usd_24h_change / 100) * assetValue;
        change24hValue += assetChange24h;
      }
    });

    return { totalValue: value, totalChange24h: change24hValue };
  }, [prices, assets]);

  // Format currency display
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Loading state with skeleton animation
  if (isLoading) {
    return (
      <div className={`bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-40"></div>
            </div>
            <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
          </div>
          <div className="h-6 bg-gray-300 rounded w-24"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-lg p-6 border border-red-200 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-red-900">Portfolio Value</h3>
            <p className="text-red-700">Unable to load price data</p>
            <p className="text-sm text-red-600">Check your connection and try again</p>
          </div>
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">❌</span>
          </div>
        </div>
      </div>
    );
  }

  const isPositive = totalChange24h >= 0;

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Portfolio Value</h3>
          <div className="text-4xl font-bold text-gray-900 mb-1">
            {formatCurrency(totalValue)}
          </div>

          {/* 24-hour change indicator */}
          <div className={`flex items-center text-sm font-medium ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            <span>
              {formatCurrency(totalChange24h)} ({totalChange24h >= 0 ? '+' : ''}{(totalChange24h / (totalValue - totalChange24h) * 100).toFixed(2)}%)
            </span>
            <span className="text-gray-500 ml-1">24h</span>
          </div>
        </div>

        {/* Icon container with background */}
        <div className="ml-6">
          <div className="w-16 h-16 bg-white/70 backdrop-blur rounded-full flex items-center justify-center shadow-sm">
            {isPositive ? (
              <TrendingUp className="w-8 h-8 text-green-600" />
            ) : (
              <TrendingDown className="w-8 h-8 text-red-600" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
