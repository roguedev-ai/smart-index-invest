'use client';

import { useQuery } from '@tanstack/react-query';
import { useGasPrice, useEstimateGas, useContractWrite } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { useMemo } from 'react';

interface GasEstimate {
  gasUnits: bigint;
  costInEth: string;
  costInUsd: string;
  speed: 'slow' | 'standard' | 'fast';
}

/// Gas estimation hook for blockchain transactions
/// Estimates gas costs for different transaction types on Ethereum
export function useGasEstimate(
  action: 'createIndex' | 'invest' | 'rebalance' | 'withdraw' | 'reinvest' | null,
  params?: any
) {
  // Get current gas price from network
  const { data: currentGasPrice, isLoading: gasPriceLoading } = useGasPrice();

  // Fetch ETH price for USD conversion
  const { data: ethPriceData } = useQuery({
    queryKey: ['eth-price'],
    queryFn: async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
          {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
          }
        );

        if (!response.ok) {
          throw new Error(`CoinGecko API error: ${response.status}`);
        }

        const data = await response.json();
        return data.ethereum?.usd || 0;
      } catch (error) {
        console.warn('Failed to fetch ETH price for gas estimation:', error);
        return 0; // Fallback price
      }
    },
    staleTime: 30000, // 30 seconds - ETH price doesn't change too quickly
    gcTime: 300000, // Keep in cache for 5 minutes
  });

  const ethPriceUsd = ethPriceData || 0;

  // Calculate gas estimates based on action type
  const gasEstimates = useMemo(() => {
    if (!action || gasPriceLoading) return null;

    const speedMultipliers = {
      slow: 1,
      standard: 1.1,
      fast: 1.3,
    };

    // Base gas prices - these are estimates that would need calibration
    const baseGasUnits = {
      createIndex: BigInt(1200000),      // Complex contract deployment ~1.2M gas
      invest: BigInt(150000),            // ERC20 transfer + contract call ~150K gas
      rebalance: BigInt(800000),         // Complex rebalancing operation ~800K gas
      withdraw: BigInt(100000),           // Simple withdrawal operation ~100K gas
      reinvest: BigInt(200000),           // Re-investment operation ~200K gas
    };

    if (!baseGasUnits[action]) {
      console.warn(`Unknown action type: ${action}`);
      return null;
    }

    let estimatedGasUnits = baseGasUnits[action];

    // Adjust based on parameters if provided
    if (params) {
      if (params.assetCount && action === 'createIndex') {
        // Additional gas for each asset beyond the first
        estimatedGasUnits += BigInt(params.assetCount - 1) * BigInt(100000);
      }

      if (params.isRebalance && action === 'invest') {
        // Additional gas for rebalancing
        estimatedGasUnits += BigInt(50000);
      }
    }

    return ['slow', 'standard', 'fast'].map(speed => {
      const multiplier = speedMultipliers[speed as keyof typeof speedMultipliers];
      const gasPrice = currentGasPrice
        ? BigInt(Math.floor(Number(currentGasPrice) * multiplier))
        : BigInt(20000000000); // Fallback gas price (20 gwei)

      const costInWei = estimatedGasUnits * gasPrice;
      const costInEth = formatEther(costInWei);

      // Add 20% buffer for gas estimation uncertainty
      const bufferedCost = Number(costInEth) * 1.2;
      const costInEthBuffered = String(bufferedCost);
      const costInUsd = String((bufferedCost * ethPriceUsd).toFixed(2));

      return {
        gasUnits: BigInt(Math.ceil(Number(estimatedGasUnits) * 1.2)),
        costInEth: costInEthBuffered,
        costInUsd: costInUsd,
        speed: speed as 'slow' | 'standard' | 'fast',
      };
    });
  }, [action, params, currentGasPrice, gasPriceLoading, ethPriceUsd]);

  return {
    estimates: gasEstimates,
    isLoading: gasPriceLoading,
    currentGasPrice,
    ethPriceUsd,
  };
}

/// Helper hook for specific transaction types
export function useGasEstimateForIndexCreation(assetCount?: number) {
  return useGasEstimate('createIndex', { assetCount });
}

export function useGasEstimateForInvestment(isRebalance?: boolean) {
  return useGasEstimate('invest', { isRebalance });
}

export function useGasEstimateForRebalance() {
  return useGasEstimate('rebalance');
}

/// Utility function to format gas cost display
export function formatGasDisplay(gasEstimate: GasEstimate): {
  gasUnits: string;
  ethCost: string;
  usdCost: string;
  speed: string;
} {
  return {
    gasUnits: new Intl.NumberFormat('en-US').format(Number(gasEstimate.gasUnits)),
    ethCost: `${Number(gasEstimate.costInEth).toFixed(6)} ETH`,
    usdCost: `$${gasEstimate.costInUsd}`,
    speed: gasEstimate.speed.charAt(0).toUpperCase() + gasEstimate.speed.slice(1),
  };
}

/// Utility function to check if gas cost is high (>50 USD)
export function isHighGasCost(costInUsd: string): boolean {
  return parseFloat(costInUsd) > 50;
}

/// Utility function to get recommended gas speed based on urgency
export function getRecommendedGasSpeed(isUrgent: boolean = false): 'slow' | 'standard' | 'fast' {
  return isUrgent ? 'fast' : 'standard';
}
