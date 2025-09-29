import Link from "next/link"
import { CryptoTicker } from "./crypto-ticker"

export function Header() {
  const navigationLinks = [
    { name: "Home", href: "/" },
    { name: "Create Index", href: "/index/create" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Admin", href: "/admin" },
  ]

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

            {/* Wallet Connection */}
            <div className="flex items-center space-x-4">
              <Link href="/wallet/onboard">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  Connect Wallet
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
