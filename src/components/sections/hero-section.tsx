"use client"

import { useState } from "react"
import { useWallet } from "@/components/providers/wallet-provider"

export function HeroSection() {
  const { isConnected, address, isConnecting, connectWallet } = useWallet()

  const [isHovered, setIsHovered] = useState(false)

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white to-slate-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="container relative mx-auto px-4 py-20 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 flex justify-center">
            <span className="inline-flex items-center rounded-full bg-black px-4 py-2 text-sm font-medium text-white">
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Now Live - Create Your Token in Minutes
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
            Create Your Own
            <span className="block bg-gradient-to-r from-black to-slate-600 bg-clip-text text-transparent">
              ERC20 Token
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mb-12 text-xl text-slate-600 sm:text-2xl">
            Professional token creation platform supporting multiple blockchain networks.
            Connect your wallet, configure your token, and deploy in minutes.
          </p>

          {/* CTA Button */}
          <div className="flex justify-center">
            {!isConnected ? (
              <button
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={connectWallet}
                disabled={isConnecting}
                className="group relative inline-flex items-center justify-center rounded-full bg-black px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="mr-3 h-6 w-6 transition-transform group-hover:scale-110"
                     fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                {isConnecting ? 'Connecting...' : 'Connect Wallet & Create Token'}
                <span className={`ml-3 transition-transform ${isHovered ? 'translate-x-1' : 'translate-x-0'}`}>
                  →
                </span>
              </button>
            ) : (
              <div className="flex items-center space-x-4 rounded-full bg-green-100 px-6 py-4">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-lg font-medium text-green-800">
                  Wallet Connected
                </span>
                <span className="font-mono text-sm text-green-700">
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
                </span>
              </div>
            )}
          </div>

          {/* Wallet Support */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
            <span className="flex items-center">
              Support for
            </span>
            <div className="flex items-center space-x-4">
              <span className="font-medium">MetaMask</span>
              <span className="font-medium">WalletConnect</span>
              <span className="font-medium">Coinbase</span>
              <span className="font-medium">Trust</span>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3 lg:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">
                Secure & Audited
              </h3>
              <p className="text-slate-600">
                Built with security best practices and regular audits
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 2.5 2.5 0 004.5 2.5V3.935M20 21a1 1 0 01-1-1c0-4.208-3.00-7.586-7-8.999C8.001 11.414 5 14.792 5 19a1 1 0 01-2 0c0-5.208 3.001-9.586 7-10.999 3.999 1.413 7 5.79 7 10.999a1 1 0 01-1 1z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">
                Multi-Network
              </h3>
              <p className="text-slate-600">
                Deploy on Ethereum, Polygon, BSC, and more networks
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">
                Lightning Fast
              </h3>
              <p className="text-slate-600">
                Create and deploy tokens in under 10 minutes
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
