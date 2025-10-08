// 0x API Token Swap Types - Smart Index Invest Platform
// Professional-grade DeFi token swapping with full TypeScript support

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId: number;
  logoURI?: string;
}

export interface SwapPrice {
  buyAmount: string;
  sellAmount: string;
  price: string;
  estimatedGas: string;
}

export interface SwapQuote {
  buyAmount: string;
  sellAmount: string;
  buyToken: string;
  sellToken: string;
  price: string;
  estimatedGas: string;
  allowanceTarget: string;
  to: string;
  data: string;
  value: string;
  issues?: {
    allowance: {
      actual: string;
      spender: string;
    } | null;
    balance: any;
  };
}

export interface SwapError {
  error: string;
  code: string;
  details?: any;
}

export interface SwapTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  data: string;
  gasLimit: string;
  chainId: number;
  timestamp: number;
}

// Rate limiting types
export interface RateLimit {
  remaining: number;
  resetTime: number;
  limit: number;
}

// Chain configuration
export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrls: string[];
  blockExplorerUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

// Swap configuration
export interface SwapConfig {
  slippage: number; // percentage 0-5
  deadline: number; // minutes
  gasPrice?: string;
  enabled: boolean;
}
