// Custom Hook: useSwap
// Smart Index Invest Platform
// React hook for managing token swap state and operations

'use client';

import { useState, useCallback } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { SwapQuote, Token, SwapPrice } from '../lib/swap/types';
import { parseTokenAmount, formatTokenAmount } from '../lib/swap/swap-utils';
import { ZeroXSwapService } from '../lib/swap/0x-service';

export function useSwap() {
  const { address, chainId, isConnected } = useAccount();
  const { data: walletClient, isError: walletError } = useWalletClient();

  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [price, setPrice] = useState<SwapPrice | null>(null);
  const [quote, setQuote] = useState<SwapQuote | null>(null);

  // Reset state
  const resetState = useCallback(() => {
    setError(null);
    setPrice(null);
    setQuote(null);
  }, []);

  /**
   * Get indicative price (no commitment pricing)
   */
  const getPrice = useCallback(async (
    fromToken: Token,
    toToken: Token,
    amount: string,
    slippage: number = 1
  ): Promise<SwapPrice | null> => {
    if (!address || !chainId || !isConnected) {
      setError('Wallet not connected');
      return null;
    }

    if (!ZeroXSwapService.isValidTokenAddress(fromToken.address) ||
        !ZeroXSwapService.isValidTokenAddress(toToken.address)) {
      setError('Invalid token addresses');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const parsedAmount = parseTokenAmount(amount, fromToken.decimals);
      if (!parsedAmount || parsedAmount === '0') {
        setError('Invalid amount');
        return null;
      }

      const response = await fetch('/api/swap/price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chainId,
          sellToken: fromToken.address,
          buyToken: toToken.address,
          sellAmount: parsedAmount,
          taker: address,
          slippage,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get price');
      }

      const priceData = data.price;
      setPrice(priceData);

      // Log successful price fetch
      console.log(`Price fetched: ${amount} ${fromToken.symbol} = ${formatTokenAmount(priceData.buyAmount, toToken.decimals)} ${toToken.symbol}`);

      return priceData;
    } catch (err: any) {
      setError(err.message || 'Failed to get price');
      return null;
    } finally {
      setLoading(false);
    }
  }, [address, chainId, isConnected]);

  /**
   * Get firm quote (ready to execute)
   */
  const getQuote = useCallback(async (
    fromToken: Token,
    toToken: Token,
    amount: string,
    slippage: number = 1
  ): Promise<SwapQuote | null> => {
    if (!address || !chainId || !isConnected) {
      setError('Wallet not connected');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const parsedAmount = parseTokenAmount(amount, fromToken.decimals);
      if (!parsedAmount || parsedAmount === '0') {
        setError('Invalid amount');
        return null;
      }

      const response = await fetch('/api/swap/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chainId,
          sellToken: fromToken.address,
          buyToken: toToken.address,
          sellAmount: parsedAmount,
          taker: address,
          slippage,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get quote');
      }

      const quoteData = data.quote;
      setQuote(quoteData);

      // Log successful quote fetch
      console.log(`Quote fetched with gas estimate: ${quoteData.estimatedGas}`);

      return quoteData;
    } catch (err: any) {
      setError(err.message || 'Failed to get quote');
      return null;
    } finally {
      setLoading(false);
    }
  }, [address, chainId, isConnected]);

  /**
   * Execute the swap transaction
   */
  const executeSwap = useCallback(async (
    fromToken: Token,
    toToken: Token,
    amount: string,
    quoteData: SwapQuote
  ): Promise<string | null> => {
    if (!address || !chainId || !walletClient || !quoteData) {
      setError('Missing required data for swap execution');
      return null;
    }

    if (walletError) {
      setError('Wallet connection error');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Validate that the quote is still valid (you might want to check timestamp in production)

      // Check if approval is needed for ERC20 tokens
      if (quoteData.issues?.allowance && quoteData.issues.allowance.actual === '0' && fromToken.address !== '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
        try {
          console.log('Approving token spend...');
          // Approve the swap contract to spend tokens
          const approvalHash = await walletClient.writeContract({
            address: fromToken.address as `0x${string}`,
            abi: [
              {
                name: 'approve',
                type: 'function',
                stateMutability: 'nonpayable',
                inputs: [
                  { name: 'spender', type: 'address' },
                  { name: 'amount', type: 'uint256' },
                ],
                outputs: [{ type: 'bool' }],
              },
            ],
            functionName: 'approve',
            args: [
              quoteData.issues.allowance.spender as `0x${string}`,
              BigInt(amount), // Approve the full amount being swapped
            ],
          });

          console.log(`Approval transaction: ${approvalHash}`);

          // Wait for approval confirmation (in production you might want a better way)
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (approvalError: any) {
          throw new Error(`Approval failed: ${approvalError.message}`);
        }
      }

      // Execute the swap
      console.log('Executing swap transaction...');

      const hash = await walletClient.sendTransaction({
        to: quoteData.to as `0x${string}`,
        data: quoteData.data as `0x${string}`,
        value: BigInt(quoteData.value || 0),
        gas: BigInt(quoteData.estimatedGas),
      });

      console.log(`Swap transaction sent: ${hash}`);

      // Reset state after successful transaction
      setTimeout(() => {
        resetState();
      }, 2000);

      return hash;
    } catch (err: any) {
      const errorMessage = err.message || 'Transaction failed';
      setError(errorMessage);
      console.error('Swap execution error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [address, chainId, walletClient, walletError, resetState]);

  /**
   * Switch tokens (swap from/to positions)
   */
  const switchTokens = useCallback(async (
    currentFromToken: Token,
    currentToToken: Token,
    currentAmount: string,
    onTokensSwitched: (from: Token, to: Token, amount: string) => void
  ) => {
    // Simply switch the tokens without fetching new price
    // The price will be updated when the user types again
    onTokensSwitched(currentToToken, currentFromToken, '');

    // Clear previous price/quote
    setPrice(null);
    setQuote(null);
  }, []);

  return {
    // State
    loading,
    error,
    price,
    quote,

    // Methods
    getPrice,
    getQuote,
    executeSwap,
    switchTokens,
    resetState,
  };
}
