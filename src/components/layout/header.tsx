"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useWallet } from "@/components/providers/wallet-provider"
import { CryptoTicker } from "./crypto-ticker"

export function Header() {
  const { address, isConnected, disconnectWallet } = useWallet()
  const [showWalletDropdown, setShowWalletDropdown] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by ensuring same initial render
  useEffect(() => {
    setMounted(true)
  }, [])

  const navigationLinks = [
    { name: "Home", href: "/" },
    { name: "Create Index", href: "/index/create" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Admin", href: "/admin" },
  ]

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <>
      {/* Crypto Ticker */}
      <CryptoTicker />

      {/* Main Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                TokenMarket
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigationLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Wallet Connection - Always render same structure */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => mounted && (!isConnected || !address) ? null : setShowWalletDropdown(!showWalletDropdown)}
                  onDoubleClick={() => mounted && (!isConnected || !address) && window.location.assign('/wallet/onboard')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                    mounted && isConnected && address
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {mounted && isConnected && address ? (
                    <>
                      <span className="flex items-center">
                        <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                        {formatAddress(address)}
                      </span>
                      <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  ) : (
                    <>
                      Connect Wallet
                      <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.65.366 1.65 2.68 0 3.046a1.724 1.724 0 00-2.573 1.066 1.704 1.704 0 01-1.604-1.071 3.176 3.176 0 01-1.604-1.071 1.724 1.724 0 00-2.573-1.066c-1.65-.366-1.65-2.68 0-3.046a1.724 1.724 0 002.573-1.066zM12 14.74c-1.657 0-3 .895-3 2.823s1.343 2.823 3 2.823 3 .895 3 2.823" />
                      </svg>
                    </>
                  )}
                </button>

                {/* Wallet Dropdown - Only show when connected */}
                {mounted && isConnected && address && showWalletDropdown && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowWalletDropdown(false)}
                    ></div>

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border z-20">
                      <div className="p-4 border-b">
                        <p className="text-sm text-gray-600">Connected Wallet</p>
                        <p className="text-sm font-mono text-gray-900 break-all">{address}</p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => {
                            disconnectWallet()
                            setShowWalletDropdown(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Disconnect Wallet
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
