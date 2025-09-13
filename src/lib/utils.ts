import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format address for display
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Format token amount with decimals
export function formatTokenAmount(amount: string, decimals: number = 18): string {
  const numAmount = parseFloat(amount);
  return numAmount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: Math.min(decimals, 6),
  });
}

// Format ETH/MATIC balance
export function formatBalance(balance: string): string {
  const numBalance = parseFloat(balance);
  if (numBalance < 0.001) {
    return '< 0.001';
  }
  return numBalance.toLocaleString(undefined, {
    maximumFractionDigits: 4,
  });
}

// Calculate gas price in gwei
export function formatGasPrice(gasPrice: string): string {
  const numGasPrice = parseInt(gasPrice) / 1e9; // Convert from wei to gwei
  return `${numGasPrice} gwei`;
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Extract error message from various error types
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    if ('reason' in error && typeof error.reason === 'string') {
      return error.reason;
    }
  }

  return 'An unknown error occurred';
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  }) as T;
}

// Validate Ethereum address
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Validate token symbol
export function isValidTokenSymbol(symbol: string): boolean {
  return /^[A-Z]{2,10}$/.test(symbol.toUpperCase());
}

// Validate token name
export function isValidTokenName(name: string): boolean {
  return name.length >= 3 && name.length <= 50 && /^[\w\s\-]+$/.test(name);
}

// Sleep function for delays
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackErr) {
      return false;
    }
  }
}
