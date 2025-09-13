import { FeeConfig } from '@/types';

// Contract ABIs (simplified for the basic ERC20 functions)
export const ERC20_ABI = [
  // ERC20 Standard
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',

  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',

  // Admin functions (for mintable/pausable tokens)
  'function mint(address to, uint256 amount) returns (bool)',
  'function burn(uint256 amount) returns (bool)',
  'function pause()',
  'function unpause()',
  'function owner() view returns (address)',
];

// Token Factory ABI
export const TOKEN_FACTORY_ABI = [
  'function createToken(string name, string symbol, uint8 decimals, uint256 initialSupply) returns (address)',
  'function createFlexibleToken(string name, string symbol, uint8 decimals, uint256 initialSupply, uint256 maxSupply) returns (address)',
  'function createCommercialToken(string name, string symbol, uint8 decimals, uint256 initialSupply, uint256 taxFee, uint256 marketingFee) returns (address)',
  'function createSecurityToken(string name, string symbol, uint8 decimals, uint256 initialSupply, address securityAdmin) returns (address)',
  'function getCreatedTokens() view returns (address[])',
];

// Contract addresses (these will be configurable per network)
// For now, these are placeholder addresses that should be replaced with actual deployed contracts
export const CONTRACT_ADDRESSES = {
  // Sepolia Testnet
  11155111: {
    tokenFactoryV1: '0x0000000000000000000000000000000000000000', // Replace with actual
    tokenFactoryV2: '0x0000000000000000000000000000000000000000', // Replace with actual
    feeWallet: '0x0000000000000000000000000000000000000000', // Admin fee wallet
  },
  // Polygon Mumbai
  80001: {
    tokenFactoryV1: '0x0000000000000000000000000000000000000000',
    tokenFactoryV2: '0x0000000000000000000000000000000000000000',
    feeWallet: '0x0000000000000000000000000000000000000000',
  },
  // BSC Testnet
  97: {
    tokenFactoryV1: '0x0000000000000000000000000000000000000000',
    tokenFactoryV2: '0x0000000000000000000000000000000000000000',
    feeWallet: '0x0000000000000000000000000000000000000000',
  },
};

// Default fee configuration
export const DEFAULT_FEE_CONFIG: FeeConfig = {
  enabled: true,
  amount: '0.01', // Fee in native currency (ETH, MATIC, etc.)
  currency: 'ETH',
  recipientAddress: '0x0000000000000000000000000000000000000000', // Set to admin wallet
  gasLimit: '200000', // Gas limit for token creation
};

// Gas settings for different networks
export const GAS_SETTINGS = {
  1: { // Ethereum Mainnet
    gasLimit: '2500000',
    gasPrice: '20000000000', // 20 gwei
  },
  11155111: { // Sepolia
    gasLimit: '2500000',
    gasPrice: '20000000000',
  },
  137: { // Polygon
    gasLimit: '2500000',
    gasPrice: '40000000000', // 40 gwei
  },
  80001: { // Mumbai
    gasLimit: '2500000',
    gasPrice: '3000000000', // 3 gwei
  },
  56: { // BSC
    gasLimit: '2500000',
    gasPrice: '5000000000', // 5 gwei
  },
  97: { // BSC Testnet
    gasLimit: '2500000',
    gasPrice: '10000000000', // 10 gwei
  },
};

// Contract bytecode sizes (for estimating deployment costs)
export const CONTRACT_SIZES = {
  StandardERC20: 2048, // bytes
  FlexibleERC20: 3072,
  CommercialERC20: 4096,
  SecurityERC20: 5120,
};
