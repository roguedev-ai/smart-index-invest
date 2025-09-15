// etherscan-service.ts - TokenMarket Etherscan API Integration
import { ethers } from 'ethers';

interface EtherscanConfig {
  apiKey: string;
  baseUrl: string;
  network: 'mainnet' | 'testnet';
}

interface ContractVerificationData {
  contractAddress: string;
  sourceCode: string;
  contractName: string;
  compilerVersion: string;
  optimizationUsed: boolean;
  runs: number;
  constructorArguments: string;
  library: string;
  licenseType: string;
}

interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  holdersCount: number;
  transfersCount: number;
  officialSite: string | null;
  socialProfiles: string[];
  description: string;
  logoUrl: string | null;
}

interface ContractAnalytics {
  transactions: number;
  uniqueUsers: number;
  averageGasPrice: string;
  methodCalls: {
    name: string;
    count: number;
    percentage: number;
  }[];
  dailyActiveAddresses: number[];
  topHolders: {
    address: string;
    balance: string;
    percentage: number;
  }[];
}

export class EtherscanService {
  private config: EtherscanConfig;
  private rateLimitDelay: number = 200; // ms between requests

  constructor(apiKey: string, network: 'mainnet' | 'testnet' = 'mainnet') {
    this.config = {
      apiKey,
      baseUrl: network === 'mainnet'
        ? 'https://api.etherscan.io/api'
        : 'https://api-mumbai.etherscan.io/api',
      network
    };
  }

  /**
   * Make API request with error handling and rate limiting
   */
  private async apiRequest(params: Record<string, string>): Promise<any> {
    // Rate limiting - Etherscan has limits
    await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));

    const urlParams = new URLSearchParams({
      apikey: this.config.apiKey,
      ...params
    });

    try {
      const response = await fetch(`${this.config.baseUrl}?${urlParams}`);
      const data = await response.json();

      if (data.status === '1') {
        return data.result;
      } else if (data.message === 'NOTOK' && data.result) {
        // Sometimes error details are in result field
        console.error('Etherscan API Error:', data.result);
        return null;
      } else {
        throw new Error(`Etherscan API Error: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Etherscan API Request Failed:', error);
      return null;
    }
  }

  /**
   * Get comprehensive token information
   */
  async getTokenInfo(tokenAddress: string): Promise<TokenInfo | null> {
    try {
      // Validate address format
      if (!ethers.utils.isAddress(tokenAddress)) {
        throw new Error('Invalid Ethereum address format');
      }

      // Get ABI to determine token type
      const abi = await this.apiRequest({
        module: 'contract',
        action: 'getabi',
        address: tokenAddress
      });

      if (!abi) {
        return null;
      }

      // Get token holdings (for ERC20 supply info)
      const tokenTx = await this.apiRequest({
        module: 'token',
        action: 'tokentx',
        contractaddress: tokenAddress,
        page: '1',
        offset: '1000' // Sample for activity
      });

      // Get holders list (first 1000 for count)
      const holders = await this.apiRequest({
        module: 'token',
        action: 'tokenholderlist',
        contractaddress: tokenAddress,
        page: '1',
        offset: '1000'
      });

      // Parse ABI to check if it's ERC20
      const contractABI = JSON.parse(abi);
      const isERC20 = this.checkERC20Compliance(contractABI);

      return {
        address: tokenAddress,
        name: 'Unknown', // Would need contract call or manual lookup
        symbol: 'UNK',
        decimals: 18,
        totalSupply: 'Unknown', // Would need contract call
        holdersCount: holders ? holders.length : 0,
        transfersCount: tokenTx ? tokenTx.length : 0,
        officialSite: null, // Would need external API
        socialProfiles: [],
        description: isERC20 ? 'ERC20 Token' : 'Smart Contract',
        logoUrl: null
      };

    } catch (error) {
      console.error('Token Info Retrieval Failed:', error);
      return null;
    }
  }

  /**
   * Analyze contract behavior and statistics
   */
  async analyzeContract(contractAddress: string, days: number = 30): Promise<ContractAnalytics | null> {
    try {
      if (!ethers.utils.isAddress(contractAddress)) {
        throw new Error('Invalid contract address');
      }

      // Get normal transactions
      const transactions = await this.apiRequest({
        module: 'account',
        action: 'txlist',
        address: contractAddress,
        startblock: '0',
        endblock: '99999999',
        page: '1',
        offset: '1000',
        sort: 'desc'
      });

      if (!transactions || transactions.length === 0) {
        return {
          transactions: 0,
          uniqueUsers: 0,
          averageGasPrice: '0',
          methodCalls: [],
          dailyActiveAddresses: [],
          topHolders: []
        };
      }

      // Analyze transaction patterns
      const uniqueUsers = new Set();
      const methodCallCounts: Record<string, number> = {};
      let totalGasPrice = BigInt(0);

      transactions.forEach((tx: any) => {
        uniqueUsers.add(tx.from);

        // Track method calls
        if (tx.input && tx.input.length >= 10) {
          const methodSignature = tx.input.slice(0, 10);
          methodCallCounts[methodSignature] = (methodCallCounts[methodSignature] || 0) + 1;
        }

        // Calculate average gas price
        if (tx.gasPrice) {
          try {
            totalGasPrice += BigInt(tx.gasPrice);
          } catch (e) {
            // Skip invalid gas prices
          }
        }
      });

      // Convert method calls to readable names
      const methodCalls = Object.entries(methodCallCounts)
        .map(([signature, count]) => ({
          name: this.getMethodName(signature),
          count,
          percentage: (count / transactions.length) * 100
        }))
        .sort((a, b) => b.count - a.count);

      // Get top token holders (if it's a token contract)
      const holders = await this.apiRequest({
        module: 'token',
        action: 'tokenholderlist',
        contractaddress: contractAddress,
        page: '1',
        offset: '10'
      });

      const topHolders = (holders || []).map((holder: any) => ({
        address: holder.TokenHolderAddress,
        balance: holder.TokenHolderQuantity,
        percentage: parseFloat(holder.percentage || '0')
      }));

      const avgGasPrice = transactions.length > 0
        ? (totalGasPrice / BigInt(transactions.length)).toString()
        : '0';

      return {
        transactions: transactions.length,
        uniqueUsers: uniqueUsers.size,
        averageGasPrice: avgGasPrice,
        methodCalls,
        dailyActiveAddresses: [], // Would need more complex time-series analysis
        topHolders
      };

    } catch (error) {
      console.error('Contract Analysis Failed:', error);
      return null;
    }
  }

  /**
   * Verify smart contract source code
   */
  async verifyContract(contractData: ContractVerificationData): Promise<{
    success: boolean;
    guid: string | null;
    message: string;
  }> {
    try {
      const response = await this.apiRequest({
        module: 'contract',
        action: 'verifysourcecode',
        contractaddress: contractData.contractAddress,
        sourceCode: contractData.sourceCode,
        codeformat: 'solidity-single-file',
        contractname: contractData.contractName,
        compilerversion: contractData.compilerVersion,
        optimizationUsed: contractData.optimizationUsed ? '1' : '0',
        runs: contractData.runs.toString(),
        constructorArguements: contractData.constructorArguments,
        evmversion: 'london',
        libraryname1: contractData.library,
        libraryaddress1: '',
        licensetype: contractData.licenseType
      });

      if (response && typeof response === 'string' && response.startsWith('http')) {
        // Sometimes Etherscan returns a URL instead of GUID
        return {
          success: true,
          guid: response,
          message: 'Contract verification initiated'
        };
      }

      return {
        success: false,
        guid: null,
        message: response || 'Verification failed'
      };

    } catch (error) {
      console.error('Contract Verification Failed:', error);
      return {
        success: false,
        guid: null,
        message: 'Verification request failed'
      };
    }
  }

  /**
   * Get contract source code and metadata
   */
  async getContractSource(contractAddress: string): Promise<{
    sourceCode: string;
    contractName: string;
    compilerVersion: string;
    isVerified: boolean;
    auditReports: string[];
  } | null> {
    try {
      const response = await this.apiRequest({
        module: 'contract',
        action: 'getsourcecode',
        address: contractAddress
      });

      if (!response || response.length === 0) return null;

      const contract = response[0];

      return {
        sourceCode: contract.SourceCode || '',
        contractName: contract.ContractName || 'Unknown',
        compilerVersion: contract.CompilerVersion || '',
        isVerified: contract.SourceCode !== '',
        auditReports: contract.AuditReports || []
      };
    } catch (error) {
      console.error('Contract Source Retrieval Failed:', error);
      return null;
    }
  }

  /**
   * Get gas price estimates
   */
  async getGasPriceEstimate(): Promise<{
    currentGwei: string;
    estimatedPrices: { type: string; gwei: string; usdCost: number }[];
  }> {
    const response = await this.apiRequest({
      module: 'gastracker',
      action: 'gasoracle'
    });

    if (response) {
      return {
        currentGwei: response.SafeGasPrice || '0',
        estimatedPrices: [
          { type: 'Safe Low', gwei: response.SafeGasPrice || '0', usdCost: 1.0 },
          { type: 'Standard', gwei: response.ProposeGasPrice || '0', usdCost: 2.0 },
          { type: 'Fast', gwei: response.FastGasPrice || '0', usdCost: 3.0 }
        ]
      };
    }

    // Fallback if API is down
    return {
      currentGwei: '20',
      estimatedPrices: [
        { type: 'Low', gwei: '10', usdCost: 1.0 },
        { type: 'Standard', gwei: '20', usdCost: 2.0 },
        { type: 'Fast', gwei: '30', usdCost: 3.0 }
      ]
    };
  }

  /**
   * Check if contract is ERC20 compliant
   */
  private checkERC20Compliance(abi: any[]): boolean {
    const erc20Methods = ['balanceOf', 'transfer', 'transferFrom', 'approve', 'allowance'];
    const erc20Events = ['Transfer', 'Approval'];

    // Check for required methods
    for (const method of erc20Methods) {
      if (!abi.find(item =>
        (item.type === 'function' && item.name === method) ||
        (item.type === 'event' && erc20Events.includes(item.name))
      )) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get readable method name from function signature
   */
  private getMethodName(signature: string): string {
    const methodMap: Record<string, string> = {
      '0xa9059cbb': 'transfer(address,uint256)',
      '0xddf252ad': 'Transfer (Event)',
      '0x095ea7b3': 'approve(address,uint256)',
      '0x23b872dd': 'transferFrom(address,address,uint256)',
      '0x70a08231': 'balanceOf(address)',
      '0x18160ddd': 'totalSupply()',
      '0xa457c2d7': 'deposit() - ERC4626',
      '0x69328dec': 'withdraw(uint256) - ERC4626',
      '0x2e1a7d4d': 'withdraw(uint256,address,address)',
      '0x42966c68': '@name() - ERC721',
      '0x95d89b41': 'symbol() - ERC20/ERC721'
    };

    return methodMap[signature] || signature;
  }

  /**
   * Validate Ethereum address
   */
  static isValidAddress(address: string): boolean {
    try {
      return ethers.utils.isAddress(address);
    } catch {
      return false;
    }
  }

  /**
   * Batch process multiple contracts
   */
  async batchCheckContracts(contractAddresses: string[]): Promise<{
    [address: string]: {
      verified: boolean;
      name?: string;
      sourceCode?: string;
      analytics?: any;
    }
  }> {
    const results: Record<string, any> = {};

    // Process in small batches to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < contractAddresses.length; i += batchSize) {
      const batch = contractAddresses.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (address) => {
          const sourceData = await this.getContractSource(address);
          const analytics = await this.analyzeContract(address);

          results[address] = {
            verified: sourceData?.isVerified || false,
            name: sourceData?.contractName,
            sourceCode: sourceData?.sourceCode,
            analytics
          };
        })
      );

      // Wait between batches
      if (i + batchSize < contractAddresses.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }
}

// Export service factory
export const createEtherscanService = (apiKey: string, network: 'mainnet' | 'testnet' = 'mainnet') => {
  return new EtherscanService(apiKey, network);
};
