// 0x API Service - Smart Index Invest Platform
// No KYC, professional-grade DeFi token swapping
// https://0x.org/docs/api - Free tier: 100k calls/month

import { SwapQuote, SwapPrice, Token } from './types';

export class ZeroXSwapService {
  private apiKey: string = 'a1754262-394e-40e8-b7cb-029504f14ff9';
  private baseUrl: string = 'https://api.0x.org';

  // Supported chains for production
  private supportedChains: number[] = [
    1,      // Ethereum Mainnet
    8453,   // Base
    137,    // Polygon
    42161,  // Arbitrum
    10,     // Optimism
    56,     // BSC
    43114,  // Avalanche
    534352, // Scroll
  ];

  constructor(apiKey?: string) {
    if (apiKey) {
      this.apiKey = apiKey;
    }
  }

  /**
   * Get indicative price (no commitment pricing)
   * Used for UI display before confirming swap
   */
  async getPrice(params: {
    chainId: string;
    sellToken: string;
    buyToken: string;
    sellAmount?: string;
    buyAmount?: string;
    taker: string;
    slippageBps?: number; // 100 = 1%
  }): Promise<SwapPrice> {
    // Validate chain support
    if (!this.supportedChains.includes(parseInt(params.chainId))) {
      throw new Error(`Chain ${params.chainId} not supported`);
    }

    // Validate tokens are not the same
    if (params.sellToken.toLowerCase() === params.buyToken.toLowerCase()) {
      throw new Error('Cannot swap same token');
    }

    const queryParams = new URLSearchParams({
      chainId: params.chainId,
      sellToken: params.sellToken,
      buyToken: params.buyToken,
      takerAddress: params.taker,
    });

    // Add amount (either sellAmount or buyAmount)
    if (params.sellAmount) {
      queryParams.append('sellAmount', params.sellAmount);
    } else if (params.buyAmount) {
      queryParams.append('buyAmount', params.buyAmount);
    }

    // Add slippage
    if (params.slippageBps) {
      queryParams.append('slippageBps', params.slippageBps.toString());
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/swap/allowance-holder/price?${queryParams}`,
        {
          method: 'GET',
          headers: {
            '0x-api-key': this.apiKey,
            '0x-version': 'v2',
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.reason?.toString() || `API Error ${response.status}`;
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error: any) {
      console.error('0x Price API Error:', error);
      throw new Error(error.message || 'Failed to get price');
    }
  }

  /**
   * Get firm quote (ready to execute)
   * Used for actual swap execution with final pricing
   */
  async getQuote(params: {
    chainId: string;
    sellToken: string;
    buyToken: string;
    sellAmount?: string;
    buyAmount?: string;
    taker: string;
    slippageBps?: number;
  }): Promise<SwapQuote> {
    // Validate chain support
    if (!this.supportedChains.includes(parseInt(params.chainId))) {
      throw new Error(`Chain ${params.chainId} not supported`);
    }

    // Validate tokens are not the same
    if (params.sellToken.toLowerCase() === params.buyToken.toLowerCase()) {
      throw new Error('Cannot swap same token');
    }

    const queryParams = new URLSearchParams({
      chainId: params.chainId,
      sellToken: params.sellToken,
      buyToken: params.buyToken,
      takerAddress: params.taker,
    });

    // Add amount (either sellAmount or buyAmount)
    if (params.sellAmount) {
      queryParams.append('sellAmount', params.sellAmount);
    } else if (params.buyAmount) {
      queryParams.append('buyAmount', params.buyAmount);
    }

    // Add slippage
    if (params.slippageBps) {
      queryParams.append('slippageBps', params.slippageBps.toString());
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/swap/allowance-holder/quote?${queryParams}`,
        {
          method: 'GET',
          headers: {
            '0x-api-key': this.apiKey,
            '0x-version': 'v2',
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.reason?.toString() || `API Error ${response.status}`;
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error: any) {
      console.error('0x Quote API Error:', error);
      throw new Error(error.message || 'Failed to get quote');
    }
  }

  /**
   * Check if chain is supported
   */
  isChainSupported(chainId: number): boolean {
    return this.supportedChains.includes(chainId);
  }

  /**
   * Get all supported chains
   */
  getSupportedChains(): number[] {
    return [...this.supportedChains];
  }

  /**
   * Get API key (for debugging - don't expose in production)
   */
  getApiKey(): string {
    return this.apiKey;
  }

  /**
   * Validate token address format
   */
  static isValidTokenAddress(address: string): boolean {
    // Basic Ethereum address validation
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Get chain name from chainId
   */
  static getChainName(chainId: number): string {
    const chainNames: Record<number, string> = {
      1: 'Ethereum',
      8453: 'Base',
      137: 'Polygon',
      42161: 'Arbitrum',
      10: 'Optimism',
      56: 'BSC',
      43114: 'Avalanche',
      534352: 'Scroll',
    };
    return chainNames[chainId] || `Unknown (${chainId})`;
  }
}
