import { NetworkInfo } from '@/types';

export const SUPPORTED_NETWORKS: NetworkInfo[] = [
  {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    blockExplorerUrl: 'https://etherscan.io',
    currency: 'ETH',
    isTestnet: false,
  },
  {
    chainId: 11155111,
    name: 'Ethereum Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/',
    blockExplorerUrl: 'https://sepolia.etherscan.io',
    currency: 'ETH',
    isTestnet: true,
  },
  {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com/',
    blockExplorerUrl: 'https://polygonscan.com',
    currency: 'MATIC',
    isTestnet: false,
  },
  {
    chainId: 80001,
    name: 'Polygon Mumbai',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com/',
    blockExplorerUrl: 'https://mumbai.polygonscan.com',
    currency: 'MATIC',
    isTestnet: true,
  },
  {
    chainId: 56,
    name: 'Binance Smart Chain',
    rpcUrl: 'https://bsc-dataseed1.binance.org/',
    blockExplorerUrl: 'https://bscscan.com',
    currency: 'BNB',
    isTestnet: false,
  },
  {
    chainId: 97,
    name: 'BSC Testnet',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    blockExplorerUrl: 'https://testnet.bscscan.com',
    currency: 'BNB',
    isTestnet: true,
  },
  {
    chainId: 43114,
    name: 'Avalanche C-Chain',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    blockExplorerUrl: 'https://snowtrace.io',
    currency: 'AVAX',
    isTestnet: false,
  },
  {
    chainId: 43113,
    name: 'Avalanche Fuji',
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    blockExplorerUrl: 'https://testnet.snowtrace.io',
    currency: 'AVAX',
    isTestnet: true,
  },
];

export const DEFAULT_NETWORK = SUPPORTED_NETWORKS.find(n => n.chainId === 11155111)!; // Sepolia testnet

export const getNetworkByChainId = (chainId: number): NetworkInfo | undefined => {
  return SUPPORTED_NETWORKS.find(network => network.chainId === chainId);
};

export const isTestnet = (chainId: number): boolean => {
  const network = getNetworkByChainId(chainId);
  return network?.isTestnet ?? false;
};
