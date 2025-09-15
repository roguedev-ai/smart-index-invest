"use client"

import { HeroSection } from "@/components/sections/hero-section"
import { WalletCreationGuide } from "@/components/help/simple-help"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"

function IntroSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Revolutionary Smart Index Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create personalized cryptocurrency ETFs, share your strategies, and trade the wisdom of the crypto community
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl">
              <div className="text-5xl mb-4">🧠</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Create Smart Indexes</h3>
              <p className="text-gray-600 mb-4">
                Build personalized portfolios of cryptocurrencies with automated rebalancing and risk controls
              </p>
              <Link href="/index/create">
                <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-blue-700">
                  Create Index →
                </button>
              </Link>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <div className="text-5xl mb-4">📈</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Trade & Discover</h3>
              <p className="text-gray-600 mb-4">
                Browse trending indexes, follow successful creators, buy into winning strategies
              </p>
              <Link href="/marketplace">
                <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700">
                  🏛️ Marketplace →
                </button>
              </Link>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
              <div className="text-5xl mb-4">💼</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Professional Tools</h3>
              <p className="text-gray-600 mb-4">
                Advanced analytics, risk management, and creator monetization features
              </p>
              <Link href="/dashboard/user-dashboard">
                <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-700">
                  📊 Dashboard →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function WalletChoiceSectionNew() {
  const [isConnecting, setIsConnecting] = useState(false)
  const { connectWallet } = useAuth()

  const handleExternalWalletConnect = async () => {
    setIsConnecting(true)
    try {
      await connectWallet()
      // Auth system will handle redirect
    } catch (error: any) {
      alert(`Connection failed: ${error.message}`)
      setIsConnecting(false)
    }
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Wallet Path
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect your existing wallet or create a new one through TokenMarket for a seamless token creation experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* External Wallet Option */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 group">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 12l-4-4 -4 4Z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Connect External Wallet</h3>
              <p className="text-gray-600 text-lg">Use MetaMask, WalletConnect, or Coinbase Wallet</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                MetaMask integration
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                WalletConnect mobile support
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Full private key control
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Multi	blockchain support
              </div>
            </div>

            <button
              onClick={handleExternalWalletConnect}
              disabled={isConnecting}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connecting...
                </>
              ) : (
                <>Use External Wallet →</>
              )}
            </button>
          </div>

          {/* Web Wallet Option */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-500 to-blue-500 text-white px-3 py-1 rounded-bl-lg text-sm font-semibold">
              RECOMMENDED FOR NEW USERS
            </div>

            <div className="text-center mb-6 pt-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.5 7A7.5 7.5 0 0 0 8 4.5C8 4.5 8.5 4.5 8.5 4.5C9.5 4.5 9 4.5 9 4.5C12 4.5 15.5 7 15.5 10C15.5 12 14 13.5 12.5 13.5C11.5 13.5 11 13.5 11 13.5C11 13.5 11 14 11.5 14C12.5 14 13 13.5 13 13.5C16 13.5 18.5 11 18.5 8C18.5 7 15.5 7 15.5 7Z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Create TokenMarket Wallet</h3>
              <p className="text-gray-600 text-lg">Instant secure wallet creation with built-in verification</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                One-click wallet creation
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Automatic blockchain verification
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Real-time token deployment tracking
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Optional cloud backup
              </div>
            </div>

            <Link href="/web-wallet/create">
              <button className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300">
                Create Web Wallet (Recommended) →
              </button>
            </Link>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Already have a wallet? Use MetaMask, WalletConnect, or other supported wallets
          </p>
          <p className="text-sm text-gray-500">
            Don't have ETH? Web wallets can help you get started with gas fee assistance
          </p>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />

      {/* New Wallet Choice Interface */}
      <WalletChoiceSectionNew />

      {/* Smart Index Introduction */}
      <IntroSection />

      {/* Original Wallet Creation Showcase */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <WalletCreationGuide />

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Why Choose TokenMarket?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="text-3xl mb-3">⚡</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Lightning Fast</h3>
                  <p className="text-gray-600 text-sm">
                    Create and deploy tokens in under 10 minutes
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="text-3xl mb-3">🛡️</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Enterprise Security</h3>
                  <p className="text-gray-600 text-sm">
                    Bank-grade encryption and audit trails
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="text-3xl mb-3">🌐</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Multi-Chain Support</h3>
                  <p className="text-gray-600 text-sm">
                    Deploy on Ethereum, Polygon, BSC, and more
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TokenCreationIntro />
    </div>
  )
}

function TokenCreationIntro() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Create Your Token?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join thousands of developers and businesses who have launched their tokens with our platform.
          </p>
        </div>
        <div className="text-center">
          <Link
            href="/index/create"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Start Creating Your Smart Index
            <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
