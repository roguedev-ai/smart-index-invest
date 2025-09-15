'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

interface WalletState {
  address: string | null
  isConnected: boolean
  isConnecting: boolean
  network: string | null
  chainId: number | null
  balance: string | null
  walletType: 'metamask' | 'walletconnect' | 'coinbase' | 'trust' | null
  tokens: WalletToken[]
  transactions: Transaction[]
  socialEnabled: boolean
  socialProfiles: SocialProfile
  lastConnected: Date | null
  autoReconnect: boolean
}

interface WalletToken {
  address: string
  symbol: string
  name: string
  balance: string
  value: string
  change24h: number
  decimals: number
}

interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  timestamp: number
  status: 'pending' | 'confirmed' | 'failed'
  gasUsed?: string
  gasPrice?: string
}

interface SocialProfile {
  discord?: {
    username: string
    avatar?: string
    verified: boolean
  }
  twitter?: {
    username: string
    followers: number
    verified: boolean
  }
  linkedin?: {
    profile: string
    connected: boolean
  }
}

interface WalletContextType extends WalletState {
  connectWallet: (type?: 'metamask' | 'walletconnect') => Promise<void>
  disconnectWallet: () => void
  switchNetwork: (chainId: number) => Promise<void>
  refreshData: () => Promise<void>
  getTokenBalance: (tokenAddress: string) => Promise<string | null>
  getTransactionHistory: (limit?: number) => Promise<Transaction[]>
  activateSocialFeatures: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

const WALLET_STORAGE_KEY = 'tokenmarket_wallet_state'
const NETWORKS = {
  1: 'Ethereum Mainnet',
  5: 'Goerli Testnet',
  137: 'Polygon Mainnet',
  80001: 'Mumbai Testnet',
  56: 'BSC Mainnet',
  97: 'BSC Testnet'
}

// Simple Persistence Manager
class WalletPersistence {
  static save(state: Partial<WalletState>): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify({
        ...state,
        lastConnected: state.lastConnected?.toISOString()
      }));
    }
  }

  static load(): Partial<WalletState> | null {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(WALLET_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          parsed.lastConnected = parsed.lastConnected ? new Date(parsed.lastConnected) : null;
          return parsed;
        } catch (error) {
          console.error('Failed to load wallet state:', error);
          this.clear();
        }
      }
    }
    return null;
  }

  static clear(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(WALLET_STORAGE_KEY);
    }
  }
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

export function WalletProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage
  const [walletState, setWalletState] = useState<WalletState>(() => {
    const stored = WalletPersistence.load();

    if (stored) {
      return {
        address: stored.address || null,
        isConnected: stored.isConnected || false,
        isConnecting: false,
        network: stored.network || null,
        chainId: stored.chainId || null,
        balance: stored.balance || null,
        walletType: stored.walletType || null,
        tokens: stored.tokens || [],
        transactions: stored.transactions || [],
        socialEnabled: stored.socialEnabled || false,
        socialProfiles: stored.socialProfiles || {},
        lastConnected: stored.lastConnected || null,
        autoReconnect: stored.autoReconnect !== false
      };
    }

    return {
      address: null,
      isConnected: false,
      isConnecting: false,
      network: null,
      chainId: null,
      balance: null,
      walletType: null,
      tokens: [],
      transactions: [],
      socialEnabled: false,
      socialProfiles: {},
      lastConnected: null,
      autoReconnect: true
    };
  });

  // Persist state to localStorage
  const persistState = useCallback((newState: Partial<WalletState>) => {
    setWalletState(prev => {
      const updated = { ...prev, ...newState };
      WalletPersistence.save(updated);
      return updated;
    });
  }, []);

  const connectWallet = async (type?: 'metamask' | 'walletconnect') => {
    if (typeof window === 'undefined') return;

    persistState({ isConnecting: true });

    try {
      let accounts: string[] = [];
      let provider: any;

      if (type === 'walletconnect') {
        // Future: Implement WalletConnect v2
        throw new Error('WalletConnect coming soon');
      } else {
        // Default to injection (MetaMask, etc.)
        if (!window.ethereum) {
          throw new Error('No Web3 provider detected. Please install MetaMask or another Web3 wallet.');
        }

        provider = window.ethereum;
        accounts = await provider.request({ method: 'eth_requestAccounts' });

        if (accounts && accounts.length > 0) {
          const address = accounts[0];
          console.log('Wallet connected:', address);

          // Get network info
          const chainIdHex = await provider.request({ method: 'eth_chainId' });
          const chainId = parseInt(chainIdHex as string, 16);
          const network = NETWORKS[chainId as keyof typeof NETWORKS] || `Chain ${chainId}`;

          persistState({
            address,
            isConnected: true,
            network,
            chainId,
            walletType: 'metamask',
            lastConnected: new Date()
          });

          // Load initial wallet data
          await loadWalletData(address, provider);

          // Auto-activate social features
          await activateSocialFeatures();

          console.log('✓ Wallet fully connected with data and social features');
        }
      }

    } catch (error: any) {
      console.error('Wallet connection failed:', error);

      if (error.code === 4001) {
        throw new Error('Connection rejected by user');
      } else if (error.code === -32002) {
        throw new Error('Connection request already pending. Check your wallet.');
      } else {
        throw new Error(error.message || 'Failed to connect wallet. Please try again.');
      }
    } finally {
      persistState({ isConnecting: false });
    }
  };

  const disconnectWallet = () => {
    persistState({
      address: null,
      isConnected: false,
      network: null,
      chainId: null,
      walletType: null,
      balance: null,
      tokens: [],
      transactions: [],
      socialEnabled: false,
      socialProfiles: {},
      lastConnected: null
    });
    console.log('Wallet disconnected');
  };

  const switchNetwork = async (chainId: number) => {
    if (!window.ethereum || !walletState.isConnected) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }]
      });

      const network = NETWORKS[chainId as keyof typeof NETWORKS] || `Chain ${chainId}`;
      persistState({ network, chainId });
      console.log('Switched to network:', network);
    } catch (switchError: any) {
      // Network doesn't exist, add it
      if (switchError.code === 4902) {
        // TODO: Add network automatically
      }
    }
  };

  const loadWalletData = async (address: string, provider: any) => {
    try {
      console.log('Loading wallet data...');

      // Get native balance
      const balanceWei = await provider.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      const balanceEth = parseInt(balanceWei, 16) / 10**18;
      const balance = balanceEth.toFixed(4);

      persistState({ balance });

      // Load token balances
      await loadTokenBalances(address, provider);

      // Load transaction history
      await loadTransactionHistory(address);

      console.log('✓ Wallet data loaded:', { balance, tokens: walletState.tokens.length });

    } catch (error) {
      console.error('Failed to load wallet data:', error);
    }
  };

  const loadTokenBalances = async (address: string, provider: any) => {
    // Mock token data - In production, this would query token contracts using Etherscan
    const mockTokens: WalletToken[] = [
      {
        address: '0x0000000000000000000000000000000000000000', // ETH
        symbol: 'ETH',
        name: 'Ethereum',
        balance: walletState.balance || '0',
        value: `$${(parseFloat(walletState.balance || '0') * 2600).toFixed(2)}`,
        change24h: 2.4,
        decimals: 18
      },
      {
        address: '0xA0b86a33e6449Cr9283ea03ae498f3bfee5e3a1d1', // USDC
        symbol: 'USDC',
        name: 'USD Coin',
        balance: '1250.00',
        value: '$1250.00',
        change24h: 0.0,
        decimals: 6
      },
      {
        address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', // MATIC
        symbol: 'MATIC',
        name: 'Polygon',
        balance: '685.23',
        value: '$557.84',
        change24h: -1.8,
        decimals: 18
      }
    ];

    persistState({ tokens: mockTokens });
  };

  const loadTransactionHistory = async (address: string) => {
    // Mock transaction data - In production, this would query Etherscan API
    const mockTransactions: Transaction[] = [
      {
        hash: '0x123456789abcdef123456789abcdef123456789abcdef',
        from: '0xabcd123456789abcd123456789abcd123456789abcdef',
        to: address,
        value: '0.5',
        timestamp: Date.now() - (2 * 60 * 1000), // 2 minutes ago
        status: 'confirmed',
        gasUsed: '21000',
        gasPrice: '20'
      },
      {
        hash: '0x987654321fedcba987654321fedcba987654321fedcba',
        from: address,
        to: '0xijkl987654321ijkl987654321ijkl987654321ijkl',
        value: '0.25',
        timestamp: Date.now() - (30 * 60 * 1000), // 30 minutes ago
        status: 'pending',
        gasUsed: '151000',
        gasPrice: '15'
      }
    ];

    persistState({ transactions: mockTransactions });
  };

  const refreshData = async () => {
    if (walletState.address && typeof window !== 'undefined' && window.ethereum) {
      console.log('Refreshing wallet data...');
      await loadWalletData(walletState.address, window.ethereum);
    }
  };

  const getTokenBalance = async (tokenAddress: string): Promise<string | null> => {
    // TODO: Implement ERC20 token balance reading
    // This would use the Etherscan API to get token balances
    const token = walletState.tokens.find(t => t.address === tokenAddress);
    return token?.balance || null;
  };

  const getTransactionHistory = async (limit?: number): Promise<Transaction[]> => {
    return walletState.transactions.slice(0, limit || 50);
  };

  const activateSocialFeatures = async () => {
    // Mock social profile activation
    // In production, this would connect to actual social APIs
    persistState({
      socialEnabled: true,
      socialProfiles: {
        discord: {
          username: 'CryptoUser#1234',
          verified: true
        },
        twitter: {
          username: 'crypto_trader',
          followers: 1247,
          verified: false
        }
      }
    });

    // Trigger Discord widget or community access
    console.log('✓ Social features activated - Discord/Twitter connected');
  };

  // Auto-connect on app load
  useEffect(() => {
    const autoConnect = async () => {
      if (typeof window !== 'undefined' && window.ethereum && walletState.autoReconnect && walletState.address) {
        console.log('🔄 Attempting auto-reconnect...');

        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts[0] && accounts[0] === walletState.address) {
            console.log('✅ Auto-connected successfully');

            // Get network info
            const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
            const chainId = parseInt(chainIdHex, 16);
            const network = NETWORKS[chainId as keyof typeof NETWORKS] || `Chain ${chainId}`;

            persistState({
              isConnected: true,
              network,
              chainId
            });

            // Load fresh wallet data
            await loadWalletData(accounts[0], window.ethereum);

            // Auto-enable social features
            if (!walletState.socialEnabled) {
              await activateSocialFeatures();
            }

          } else {
            console.log('⚠️ Auto-reconnect failed - account changed');
          }
        } catch (error) {
          console.error('Auto-reconnect failed:', error);
          // Don't show error dialog on failed auto-connect
        }
      }
    };

    autoConnect();

    // Set up event listeners if ethereum is available
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChange = (accounts: string[]) => {
        if (accounts && accounts[0]) {
          console.log('👤 Account changed:', accounts[0]);
          persistState({ address: accounts[0], lastConnected: new Date() });
          loadWalletData(accounts[0], window.ethereum);
        } else {
          console.log('🚫 Account disconnected');
          disconnectWallet();
        }
      };

      const handleChainChange = async () => {
        console.log('⛓️ Network changed');
        try {
          const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
          const chainId = parseInt(chainIdHex, 16);
          const network = NETWORKS[chainId as keyof typeof NETWORKS] || `Chain ${chainId}`;

          persistState({
            network,
            chainId,
            lastConnected: new Date()
          });

          // Refresh wallet data for new network
          if (walletState.address) {
            await loadWalletData(walletState.address, window.ethereum);
          }
        } catch (error) {
          console.error('Chain change error:', error);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChange);
      window.ethereum.on('chainChanged', handleChainChange);

      // Cleanup function
      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChange);
          window.ethereum.removeListener('chainChanged', handleChainChange);
        }
      };
    }
  }, [walletState.address, walletState.autoReconnect, persistState]);

  // Auto-refresh wallet data every 30 seconds
  useEffect(() => {
    if (!walletState.isConnected || !walletState.address) return;

    const interval = setInterval(refreshData, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [walletState.isConnected, walletState.address]);

  const contextValue: WalletContextType = {
    ...walletState,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    refreshData,
    getTokenBalance,
    getTransactionHistory,
    activateSocialFeatures
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}

// Type declaration for ethereum provider
declare global {
  interface Window {
    ethereum: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: Function) => void;
      removeListener: (event: string, handler: Function) => void;
      isMetaMask?: boolean;
    };
  }
}
