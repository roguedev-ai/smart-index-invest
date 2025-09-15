"use client"

import { useState } from "react"
import { useWallet } from "@/components/providers/wallet-provider"
import Link from "next/link"

export default function WalletPage() {
  const { isConnected, address, isConnecting, connectWallet, disconnectWallet, balance } = useWallet()
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'settings'>('overview')

  if (isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Wallet</h1>
            <p className="text-gray-600">Manage your cryptocurrency wallet and tokens</p>
          </div>

          {!isConnected ? (
            // Not Connected State
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Connect your wallet to manage your tokens, check balances, and create new ERC20 tokens.
              </p>

              <div className="space-y-4">
                <button
                  onClick={connectWallet}
                  className="w-full max-w-xs mx-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-300"
                >
                  🏗️ Connect Wallet
                </button>

                <p className="text-sm text-gray-500">
                  New to Web3?
                  <Link href="/wallet/onboard" className="text-blue-600 hover:underline ml-1">
                    Start with Wallet Setup →
                  </Link>
                </p>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 border rounded-lg">
                  <div className="text-lg mb-2">MetaMask</div>
                  <div className="text-sm text-gray-600">Popular browser extension wallet</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-lg mb-2">WalletConnect</div>
                  <div className="text-sm text-gray-600">Connect with mobile wallets</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-lg mb-2">Coinbase</div>
                  <div className="text-sm text-gray-600">Secure exchange wallet</div>
                </div>
              </div>
            </div>
          ) : (
            // Connected State - Wallet Dashboard
            <div className="space-y-6">
              {/* Wallet Status Card */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold">✓</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Wallet Connected</h3>
                      <p className="text-sm text-gray-600 font-mono">
                        {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium"
                  >
                    Disconnect
                  </button>
                </div>

                {/* Balance Display */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Total Balance</div>
                    <div className="text-2xl font-bold text-gray-900">{balance || '0.00'}</div>
                    <div className="text-xs text-gray-500">ETH</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Tokens Owned</div>
                    <div className="text-2xl font-bold text-gray-900">-</div>
                    <div className="text-xs text-gray-500">ERC20</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Transactions</div>
                    <div className="text-2xl font-bold text-gray-900">-</div>
                    <div className="text-xs text-gray-500">Count</div>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="border-b border-gray-200">
                  <nav className="px-6 pt-4">
                    <div className="flex space-x-8">
                      {[
                        { id: 'overview', name: 'Overview', icon: '📊' },
                        { id: 'transactions', name: 'Transactions', icon: '↗️' },
                        { id: 'settings', name: 'Settings', icon: '⚙️' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === tab.id
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <span>{tab.icon}</span>
                          <span>{tab.name}</span>
                        </button>
                      ))}
                    </div>
                  </nav>
                </div>

                <div className="p-6">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Your Assets</h3>
                        <div className="text-center py-12 text-gray-500">
                          <div className="text-4xl mb-4">💰</div>
                          <p>Asset tracking coming soon...</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Quick Actions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <Link
                            href="/create"
                            className="block p-4 border rounded-lg hover:shadow-md transition-shadow"
                          >
                            <div className="text-lg mb-2">🚀</div>
                            <div className="font-medium">Create Token</div>
                            <div className="text-sm text-gray-600">Launch your ERC20 token</div>
                          </Link>

                          <Link
                            href="/dashboard"
                            className="block p-4 border rounded-lg hover:shadow-md transition-shadow"
                          >
                            <div className="text-lg mb-2">📊</div>
                            <div className="font-medium">View Dashboard</div>
                            <div className="text-sm text-gray-600">Manage your assets</div>
                          </Link>

                          <div className="block p-4 border rounded-lg hover:shadow-md transition-shadow">
                            <div className="text-lg mb-2">🔗</div>
                            <div className="font-medium">Liquidity Pools</div>
                            <div className="text-sm text-gray-600">Coming with Uniswap V3</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'transactions' && (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-4">📈</div>
                      <p>Transaction history coming soon...</p>
                    </div>
                  )}

                  {activeTab === 'settings' && (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-4">⚙️</div>
                      <p>Wallet settings coming soon...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
