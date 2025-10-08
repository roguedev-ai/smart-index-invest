// Swap Utilities - Smart Index Invest Platform
// Professional-grade token amount formatting and calculations

import { ethers } from 'ethers';

export function formatTokenAmount(
  amount: string,
  decimals: number,
  displayDecimals: number = 6
): string {
  try {
    const formatted = ethers.formatUnits(amount, decimals);
    const num = parseFloat(formatted);

    if (num === 0) return '0';
    if (num < 0.000001) return '< 0.000001';

    return num.toLocaleString('en-US', {
      maximumFractionDigits: displayDecimals,
      minimumFractionDigits: Math.min(2, displayDecimals),
    });
  } catch (error) {
    console.error('Format token amount error:', error);
    return '0.0';
  }
}

export function parseTokenAmount(amount: string, decimals: number): string {
  try {
    if (!amount || amount.trim() === '') {
      throw new Error('Amount is required');
    }

    const cleanAmount = amount.trim();
    if (cleanAmount === '0') {
      return '0';
    }

    return ethers.parseUnits(cleanAmount, decimals).toString();
  } catch (error: any) {
    throw new Error(`Invalid amount: ${error.message}`);
  }
}

export function shortenAddress(address: string): string {
  if (!address || address.length !== 42) return address;

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function calculatePriceImpact(
  inputAmount: string,
  outputAmount: string,
  price: string
): number {
  try {
    if (!inputAmount || !outputAmount || !price) return 0;

    const input = parseFloat(inputAmount);
    const output = parseFloat(outputAmount);
    const expectedRate = parseFloat(price);

    if (input <= 0 || expectedRate <= 0) return 0;

    const expectedOutput = input * expectedRate;
    const impact = ((expectedOutput - output) / expectedOutput) * 100;

    return Math.abs(impact);
  } catch (error) {
    console.error('Calculate price impact error:', error);
    return 0;
  }
}

// Convert slippage percentage to basis points (283 = 2.83%)
export function slippageToBps(slippage: number): number {
  return Math.floor(Math.max(0, Math.min(slippage, 5)) * 100);
}

// Convert basis points to percentage
export function bpsToSlippage(bps: number): number {
  return bps / 100;
}

// Validate decimal places for token amounts
export function validateDecimalPlaces(amount: string, maxDecimals: number): boolean {
  const parts = amount.split('.');
  if (parts.length <= 1) return true;

  return parts[1].length <= maxDecimals;
}

// Format decimal places for display
export function formatDecimalPlaces(amount: string, maxDecimals: number): string {
  const parts = amount.split('.');
  if (parts.length <= 1) return amount;

  if (parts[1].length <= maxDecimals) return amount;

  return `${parts[0]}.${parts[1].substring(0, maxDecimals)}`;
}

// Calculate minimum received amount with slippage
export function calculateMinReceived(
  outputAmount: string | number,
  slippageBps: number
): number {
  try {
    const output = typeof outputAmount === 'string' ? parseFloat(outputAmount) : outputAmount;
    const slippagePercent = bpsToSlippage(slippageBps);

    const minReceived = output * (1 - slippagePercent / 100);

    return Math.floor(minReceived * 1000000) / 1000000; // 6 decimal precision
  } catch (error) {
    console.error('Calculate min received error:', error);
    return 0;
  }
}

// Format currency for display
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Validate token amount is positive
export function isValidAmount(amount: string): boolean {
  try {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
  } catch {
    return false;
  }
}

// Calculate effective exchange rate
export function calculateEffectiveRate(
  sellAmount: string,
  buyAmount: string
): number {
  try {
    const sell = parseFloat(sellAmount);
    const buy = parseFloat(buyAmount);

    if (sell <= 0 || buy <= 0) return 0;

    return buy / sell;
  } catch (error) {
    console.error('Calculate effective rate error:', error);
    return 0;
  }
}

// Calculate estimated gas cost in ETH
export function calculateGasCost(
  gasLimit: string | number,
  gasPrice: string | number,
  nativeTokenSymbol: string = 'ETH'
): string {
  try {
    const limit = typeof gasLimit === 'string' ? parseInt(gasLimit) : gasLimit;
    const price = typeof gasPrice === 'string' ? parseInt(gasPrice) : gasPrice;

    if (!limit || !price || limit <= 0 || price <= 0) return '0';

    const costWei = limit * price;
    const costEth = ethers.formatEther(costWei.toString());

    return costEth;
  } catch (error) {
    console.error('Calculate gas cost error:', error);
    return '0';
  }
}
