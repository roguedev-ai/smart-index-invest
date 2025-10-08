// SwapWidget Component
// Smart Index Invest Platform
// Main UI component for token swap functionality

'use client';

import { useState, useEffect } from 'react';
import { ArrowDown, Settings, RefreshCw, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useSwap } from '../../hooks/useSwap';
import { Token } from '../../lib/swap/types';
import { formatTokenAmount, calculatePriceImpact, calculateEffectiveRate } from '../../lib/swap/swap-utils';
import { getTokensForChain } from '../../lib/swap/tokens';

export default function SwapWidget() {
  const { address, chainId, isConnected } = useAccount();
  const { getPrice, getQuote, executeSwap, loading, error, price, quote, resetState } = useSwap();

  // Local state
  const tokens = chainId ? getTokensForChain(chainId) : [];

  const [fromToken, setFromToken] = useState<Token | null>(
    tokens[0] || null
  );
  const [toToken, setToToken] = useState<Token | null>(
    tokens[1] || null
  );
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [swapStatus, setSwapStatus] = useState<string | null>(null);

  // Update tokens when chain changes
  useEffect(() => {
    if (chainId) {
      const chainTokens = getTokensForChain(chainId);
      setFromToken(chainTokens[0] || null);
      setToToken(chainTokens[1] || null);
      resetState();
      setFromAmount('');
      setToAmount('');
    }
  }, [chainId, resetState]);

  // Fetch price when amount changes
  useEffect(() => {
    const debounce = setTimeout(async () => {
      if (fromAmount && fromToken && toToken && parseFloat(fromAmount) > 0) {
        const priceData = await getPrice(fromToken, toToken, fromAmount, slippage);
        if (priceData) {
          setToAmount(formatTokenAmount(priceData.buyAmount, toToken.decimals));
        } else {
          setToAmount('');
        }
      } else {
        setToAmount('');
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [fromAmount, fromToken, toToken, slippage, getPrice]);

  const handleAmountChange = (value: string) => {
    // Validate decimal places based on token
    if (fromToken && value.includes('.')) {
      const parts = value.split('.');
      if (parts[1] && parts[1].length > fromToken.decimals) {
        value = `${parts[0]}.${parts[1].substring(0, fromToken.decimals)}`;
      }
    }
    setFromAmount(value);
  };

  const handleSwap = async () => {
    if (!fromToken || !toToken || !fromAmount || !price) return;

    try {
      setSwapStatus('Getting quote...');
      const quoteData = await getQuote(fromToken, toToken, fromAmount, slippage);

      if (quoteData) {
        setSwapStatus('Executing swap...');
        const hash = await executeSwap(fromToken, toToken, fromAmount, quoteData);

        if (hash) {
          setSwapStatus('Swap completed!');
          setTimeout(() => {
            setSwapStatus(null);
            setFromAmount('');
            setToAmount('');
          }, 3000);
        }
      }
    } catch (err: any) {
      setSwapStatus(`Error: ${err.message}`);
      setTimeout(() => setSwapStatus(null), 5000);
    }
  };

  const switchTokens = () => {
    if (!fromToken || !toToken) return;
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const formatPrice = () => {
    if (!price || !fromToken || !toToken) return '-';

    const rate = parseFloat(price.price);
    return `1 ${fromToken.symbol} = ${rate.toFixed(6)} ${toToken.symbol}`;
  };

  const getPriceImpactColor = () => {
    if (!price || !fromToken) return 'text-gray-600';

    const impact = calculatePriceImpact(fromAmount, toAmount, price.price);
    if (impact < 0.1) return 'text-green-600';
    if (impact < 1) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold mb-4">Connect Your Wallet</h3>
        <p className="text-gray-600 mb-4">
          Please connect your wallet to start swapping tokens with the best rates from 130+ DEXs.
        </p>
        <div className="text-xs text-gray-500 flex items-center justify-center gap-2">
          <CheckCircle className="w-3 h-3" />
          Powered by 0x Protocol
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Swap Tokens</h2>
          <p className="text-sm text-gray-600">Best rates from 130+ DEXs</p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Settings"
        >
          <Settings size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-4 p-4 bg-gray-50 rounded-xl">
          <label className="block text-sm font-medium mb-2">
            Slippage Tolerance: {slippage}%
          </label>
          <div className="flex gap-2 mb-2">
            {[0.5, 1, 2].map((val) => (
              <button
                key={val}
                onClick={() => setSlippage(val)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  slippage === val
                    ? 'bg-blue-600 text-white'
                    : 'bg-white hover:bg-gray-200'
                }`}
              >
                {val}%
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Your transaction will revert if the price changes unfavorably by more than {slippage}%.
          </p>
        </div>
      )}

      {/* From Token Input */}
      <div className="mb-2">
        <label className="text-sm text-gray-600 mb-1 block">You pay</label>
        <div className="bg-gray-50 rounded-xl p-4">
          <input
            type="number"
            value={fromAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0.0"
            className="w-full text-2xl font-semibold bg-transparent outline-none mb-2"
            min="0"
            step="0.000001"
          />
          <select
            value={fromToken?.address}
            onChange={(e) => {
              const token = tokens.find(t => t.address === e.target.value);
              if (token) setFromToken(token);
            }}
            className="px-3 py-2 bg-white rounded-lg font-medium border border-gray-200"
          >
            {tokens.map(token => (
              <option key={token.address} value={token.address}>
                {token.symbol}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Switch Tokens Button */}
      <div className="flex justify-center -my-2 relative z-10 mb-2">
        <button
          onClick={switchTokens}
          className="p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200"
          title="Switch tokens"
        >
          <ArrowDown size={20} className="text-gray-600" />
        </button>
      </div>

      {/* To Token Display */}
      <div className="mb-4">
        <label className="text-sm text-gray-600 mb-1 block">You receive</label>
        <div className="bg-gray-50 rounded-xl p-4">
          <input
            type="text"
            value={toAmount}
            readOnly
            placeholder="0.0"
            className="w-full text-2xl font-semibold bg-transparent outline-none mb-2 text-gray-700"
          />
          <select
            value={toToken?.address}
            onChange={(e) => {
              const token = tokens.find(t => t.address === e.target.value);
              if (token) setToToken(token);
            }}
            className="px-3 py-2 bg-white rounded-lg font-medium border border-gray-200"
          >
            {tokens.map(token => (
              <option key={token.address} value={token.address}>
                {token.symbol}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rate Information */}
      {price && fromAmount && toAmount && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Rate</span>
            <span className="font-medium">{formatPrice()}</span>
          </div>
          {fromToken && toToken && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Minimum received:
                <span className={`ml-1 font-medium ${getPriceImpactColor()}`}>
                  {calculateEffectiveRate(fromAmount, toAmount).toFixed(4)}
                </span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg flex items-start gap-2">
          <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-red-700 mb-1">Error</p>
            <p className="text-xs text-red-600">{error}</p>
          </div>
        </div>
      )}

      {swapStatus && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg flex items-center gap-2">
          <RefreshCw size={16} className={`text-green-600 ${swapStatus.includes('Error') ? 'text-red-600' : 'animate-spin'}`} />
          <p className="text-sm text-green-700">{swapStatus}</p>
        </div>
      )}

      {!error && fromAmount && toAmount && !loading && (
        <div className="mb-4 p-3 bg-yellow-50 rounded-lg flex items-start gap-2">
          <Info size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-yellow-800 mb-1">Transaction Preview</p>
            <p className="text-xs text-yellow-700">
              Swapping {fromAmount} {fromToken?.symbol} for ~{parseFloat(toAmount).toFixed(6)} {toToken?.symbol}
            </p>
          </div>
        </div>
      )}

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        disabled={loading || !price || !fromAmount || !toToken}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
          loading || !price || !fromAmount || !toToken
            ? 'bg-gray-300 cursor-not-allowed text-gray-500'
            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-3">
            <RefreshCw size={20} className="animate-spin" />
            <span>{swapStatus || 'Processing...'}</span>
          </div>
        ) : !fromAmount ? (
          'Enter Amount'
        ) : !price ? (
          'Loading Price...'
        ) : (
          'Swap Tokens'
        )}
      </button>

      {/* Footer */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500 mb-1">
          Powered by 0x Protocol • No KYC Required
        </p>
        <p className="text-xs text-gray-400">
          Best rates from 130+ DEXs • MEV Protected
        </p>
      </div>
    </div>
  );
}
