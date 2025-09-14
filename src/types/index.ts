// Core token types based on ERC standards
// Core token types based on ERC standards
export interface TokenInfo {
  name: string;
  symbol: string;
  decimals?: number; // Optional for NFTs
  totalSupply?: string;
  address?: string;
  network: NetworkInfo;
  tokenType: 'erc20' | 'erc721';
}

// NFT specific interface
export interface NFTCollectionInfo extends TokenInfo {
  description?: string;
  externalUrl?: string;
  imageUrl?: string;
  maxSupply?: number;
  mintingFee?: string;
  royaltyPercentage?: number;
  baseURI?: string;
}

export interface TokenCreationParams {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: string;
  maxSupply?: string;
  burnable?: boolean;
  mintable?: boolean;
  pausable?: boolean;
  taxFee?: number;
  marketingFee?: number;
  burnFee?: number;
}

// Network configuration
export interface NetworkInfo {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorerUrl: string;
  currency: string;
  isTestnet: boolean;
}

// Wallet connection types
export interface WalletState {
  address: string | null;
  isConnected: boolean;
  network: NetworkInfo | null;
  balance: string;
}

// Fee configuration
export interface FeeConfig {
  enabled: boolean;
  amount: string;
  currency: 'ETH' | 'MATIC' | 'BNB' | 'AVAX';
  recipientAddress: string;
  gasLimit: string;
}

// Admin configuration
export interface AdminConfig {
  feeWallet: string;
  feePercentage: number;
  supportedNetworks: NetworkInfo[];
  maintenanceMode: boolean;
}

// UI Theme types
export interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  border: string;
  muted: string;
}

// Contract deployment info
export interface ContractDeployment {
  address: string;
  network: NetworkInfo;
  deployer: string;
  deploymentTx: string;
  timestamp: number;
  contractType: 'StandardERC20' | 'FlexibleERC20' | 'CommercialERC20' | 'SecurityERC20';
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TokenDeploymentResponse {
  contractAddress: string;
  transactionHash: string;
  tokenInfo: TokenInfo;
  deployment: ContractDeployment;
}
