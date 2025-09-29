'use client';

import { useQuery } from '@tanstack/react-query';

/**
 * Price data structure from CoinGecko API
 */
interface CoinGeckoPriceData {
  usd: number;
  usd_24h_change: number;
}

/**
 * Clean TypeScript interface for price data
 */
interface PriceData {
  usd: number;
  usd_24h_change: number;
}

/**
 * React hook for fetching real-time cryptocurrency prices
 *
 * @param tokenIds - Array of CoinGecko token IDs (e.g., ['bitcoin', 'ethereum'])
 * @returns Object with prices data, loading state, and error handling
 *
 * @example
 * ```typescript
 * const { prices, isLoading, error } = useRealtimePricing(['bitcoin', 'ethereum']);
 *
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 *
 * // Access prices
 * const btcPrice = prices?.bitcoin?.usd;
 * const ethChange = prices?.ethereum?.usd_24h_change;
 * ```
 */
export function useRealtimePricing(tokenIds: string[]) {
  return useQuery({
    queryKey: ['crypto-prices', tokenIds.sort()], // Sort for consistent caching
    queryFn: async (): Promise<Record<string, PriceData>> => {
      // Return empty object for empty tokenIds to avoid invalid API calls
      if (!tokenIds || tokenIds.length === 0) {
        return {};
      }

      // Validate tokenIds
      const validTokenIds = tokenIds.filter(id => id && typeof id === 'string' && id.trim().length > 0);
      if (validTokenIds.length === 0) {
        return {};
      }

      try {
        // CoinGecko API: Free tier allows 30 requests/minute, 10,000/day
        const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${validTokenIds.join(',')}&vs_currencies=usd&include_24hr_change=true`;

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            // CoinGecko doesn't require API key for basic price queries
          },
        });

        // Handle rate limiting (429) gracefully
        if (response.status === 429) {
          throw new Error('Rate limit exceeded - please wait before retrying');
        }

        // Handle other API errors
        if (!response.ok) {
          throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
        }

        const data: Record<string, CoinGeckoPriceData> = await response.json();

        // Validate response structure
        const validatedData: Record<string, PriceData> = {};
        validTokenIds.forEach(tokenId => {
          if (data[tokenId]) {
            validatedData[tokenId] = {
              usd: Number(data[tokenId].usd) || 0,
              usd_24h_change: Number(data[tokenId].usd_24h_change) || 0,
            };
          }
        });

        return validatedData;

      } catch (error) {
        // Log error for debugging but don't expose sensitive details
        console.error('CoinGecko price fetch failed:', error);

        // Re-throw with user-friendly message
        if (error instanceof Error) {
          throw new Error(`Failed to fetch price data: ${error.message}`);
        } else {
          throw new Error('Failed to fetch price data - please check your connection');
        }
      }
    },

    // Refresh every 30 seconds for real-time feel
    refetchInterval: 30000,

    // Consider data fresh for 25 seconds (faster than refetch interval)
    staleTime: 25000,

    // Garbage collect after 5 minutes of inactivity
    gcTime: 300000,

    // Retry failed requests 3 times with exponential backoff
    retry: (failureCount, error) => {
      // Don't retry rate limiting errors
      if (error?.message?.includes('Rate limit')) {
        return false;
      }
      // Retry other errors up to 3 times
      return failureCount < 3;
    },

    // Delay between retries (1s, 2s, 4s...)
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    // Don't run query if tokenIds array is empty
    enabled: tokenIds && tokenIds.length > 0,

    // Provide placeholder data during loading
    placeholderData: {},
  });
}
