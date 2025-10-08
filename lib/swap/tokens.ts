// Common Tokens - Smart Index Invest Platform
// Popular tokens on Ethereum and Base networks for swapping

import { Token } from './types';

export const COMMON_TOKENS: Record<number, Token[]> = {
  // Ethereum Mainnet (1)
  1: [
    {
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      chainId: 1,
    },
    {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: 1,
    },
    {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      symbol: 'USDT',
      name: 'Tether',
      decimals: 6,
      chainId: 1,
    },
    {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      chainId: 1,
    },
    {
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      decimals: 8,
      chainId: 1,
    },
    {
      address: '0x514910771AF9Ca656af840dff83E8264ecf986CA',
      symbol: 'LINK',
      name: 'Chainlink',
      decimals: 18,
      chainId: 1,
    },
    {
      address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      symbol: 'UNI',
      name: 'Uniswap',
      decimals: 18,
      chainId: 1,
    },
  ],
  // Base (8453)
  8453: [
    {
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      chainId: 8453,
    },
    {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: 8453,
    },
    {
      address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      chainId: 8453,
    },
    {
      address: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22',
      symbol: 'cbETH',
      name: 'Coinbase Wrapped Staked ETH',
      decimals: 18,
      chainId: 8453,
    },
    {
      address: '0x4200000000000000000000000000000000000006',
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      chainId: 8453,
    },
  ],
};

export function getTokensForChain(chainId: number): Token[] {
  return COMMON_TOKENS[chainId] || [];
}

export function findToken(chainId: number, symbol: string): Token | undefined {
  const tokens = getTokensForChain(chainId);
  return tokens.find(token =>
    token.symbol.toLowerCase() === symbol.toLowerCase()
  );
}

export function isTokenSupported(chainId: number, address: string): boolean {
  const tokens = getTokensForChain(chainId);
  return tokens.some(token =>
    token.address.toLowerCase() === address.toLowerCase()
  );
}

export function getTokenByAddress(chainId: number, address: string): Token | undefined {
  const tokens = getTokensForChain(chainId);
  return tokens.find(token =>
    token.address.toLowerCase() === address.toLowerCase()
  );
}

// Popular token pairs for recommendations
export const POPULAR_PAIRS: Record<number, Array<[string, string]>> = {
  1: [ // Ethereum
    ['ETH', 'USDC'],
    ['ETH', 'USDT'],
    ['ETH', 'WBTC'],
    ['USDC', 'USDT'],
    ['ETH', 'UNI'],
  ],
  8453: [ // Base
    ['ETH', 'USDC'],
    ['ETH', 'cbETH'],
    ['USDC', 'DAI'],
    ['ETH', 'WETH'],
  ],
};

// Get recommended pairs for a chain
export function getRecommendedPairs(chainId: number): Array<[Token, Token]> {
  const pairs = POPULAR_PAIRS[chainId] || [];
  const tokens = getTokensForChain(chainId);

  return pairs
    .map(([from, to]) => {
      const fromToken = findToken(chainId, from);
      const toToken = findToken(chainId, to);
      return fromToken && toToken ? [fromToken, toToken] : null;
    })
    .filter(Boolean) as Array<[Token, Token]>;
}
