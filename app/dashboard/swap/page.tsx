// Swap Page - Smart Index Invest Platform
// Dashboard page for token swapping functionality

import SwapWidget from '../../../components/swap/SwapWidget';

export default function SwapPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Token Swaps</h1>
            <p className="text-xl text-gray-600 mb-4">
              Trade cryptocurrencies with the best rates across 130+ DEXs
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>No KYC Required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>MEV Protected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Ethereum & Base</span>
              </div>
            </div>
          </div>

          {/* Main Swap Interface */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Swap Widget */}
            <div className="md:col-span-1">
              <SwapWidget />
            </div>

            {/* Info Panel */}
            <div className="md:col-span-1 space-y-6">
              {/* How It Works */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">How Swaps Work</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Enter Amount</h4>
                      <p className="text-sm text-gray-600">Enter the amount you want to swap</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 font-semibold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Get Quote</h4>
                      <p className="text-sm text-gray-600">Get real-time prices from 130+ DEXs</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 font-semibold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Confirm Swap</h4>
                      <p className="text-sm text-gray-600">Review details and execute the trade</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Supported Tokens */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">Supported Tokens</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { symbol: 'ETH', name: 'Ethereum', color: 'bg-blue-100 text-blue-800' },
                    { symbol: 'USDC', name: 'USD Coin', color: 'bg-green-100 text-green-800' },
                    { symbol: 'USDT', name: 'Tether', color: 'bg-green-100 text-green-800' },
                    { symbol: 'DAI', name: 'Dai', color: 'bg-orange-100 text-orange-800' },
                    { symbol: 'WBTC', name: 'Wrapped BTC', color: 'bg-orange-100 text-orange-800' },
                    { symbol: 'UNI', name: 'Uniswap', color: 'bg-pink-100 text-pink-800' },
                  ].map((token) => (
                    <div key={token.symbol} className={`${token.color} px-3 py-2 rounded-lg text-center`}>
                      <div className="text-sm font-semibold">{token.symbol}</div>
                      <div className="text-xs opacity-75">{token.name}</div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  +1000+ more tokens supported across Ethereum and Base networks
                </p>
              </div>

              {/* Security Highlights */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
                <h3 className="text-xl font-bold mb-4 text-gray-900">Security First</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    No KYC or identity verification required
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Smart contract audits by leading firms
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    MEV protection minimizes front-running
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Wallet connection stays local to your browser
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Slippage protection prevents bad trades
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold mb-6">Frequently Asked Questions</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">How do you get the best rates?</h4>
                <p className="text-gray-600">
                  We aggregate prices from 130+ decentralized exchanges using 0x Protocol's
                  smart routing algorithm to find the most optimal trade execution.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What are gas fees?</h4>
                <p className="text-gray-600">
                  Gas fees are blockchain network fees required to process your transaction.
                  We optimize for the lowest possible gas usage and show cost estimates.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What is slippage?</h4>
                <p className="text-gray-600">
                  Slippage is the maximum price movement you're willing to accept.
                  If the price moves more than your slippage tolerance, the transaction reverts.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What is MEV protection?</h4>
                <p className="text-gray-600">
                  MEV (Miner Extractable Value) protection prevents frontrunning bots from
                  seeing and manipulating your trades before they're confirmed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
