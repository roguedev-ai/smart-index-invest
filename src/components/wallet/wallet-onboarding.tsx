"use client"

import { useState } from 'react'
import {
  Smartphone,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import { walletCore } from '@/lib/wallet-core'

// Simplified onboarding component
export function WalletOnboarding() {
  const [walletName, setWalletName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setPasswordConfirm] = useState('')
  const [step, setStep] = useState('create')
  const [loading, setLoading] = useState(false)
  const [wallet, setWallet] = useState(null)

  // Simplified password validation
  const passwordsMatch = password && confirmPassword && password === confirmPassword
  const isPasswordStrong = password.length >= 6

  const handleSubmit = async () => {
    if (!passwordsMatch || !isPasswordStrong || !walletName.trim()) return

    setLoading(true)

    try {
      // Create simple wallet
      const name = walletName.trim() || 'My Web Wallet'
      const newWallet = await walletCore.generateWallet(name, password)
      setWallet(newWallet)
      setStep('success')
    } catch (error) {
      console.error('Error:', error)
      alert('Error creating wallet')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              Wallet Created!
            </h2>

            <p className="text-lg text-slate-300 mb-8">
              Your TokenMarket web wallet is ready to use.
            </p>

            {wallet && (
              <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 p-6 rounded-xl mb-8">
                <div className="text-green-400 font-medium mb-2">Wallet Address</div>
                <div className="text-white font-mono text-sm bg-slate-800/50 p-3 rounded-lg break-all">
                  {wallet.address}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <a
                href="/wallet"
                className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 rounded-xl font-semibold text-white text-center transition-all transform hover:scale-105 shadow-lg"
              >
                Access Your Wallet
                <ArrowRight className="ml-2 w-5 h-5 inline-block" />
              </a>

              <button
                onClick={() => window.location.href = '/'}
                className="block w-full border border-slate-600 text-slate-300 hover:text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Create wallet step
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Create Your Web Wallet</h1>
          <p className="text-slate-400">Secure storage for your TokenMarket tokens</p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Wallet Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Wallet Name
            </label>
            <input
              type="text"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="e.g., My Crypto Wallet"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="Create strong password"
            />

            {/* Strength indicator */}
            {password && (
              <div className="flex items-center mt-2">
                <div className={`h-2 w-20 rounded-full ${
                  password.length < 4 ? 'bg-red-500' :
                  password.length < 6 ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <span className="text-sm ml-2 text-slate-400">
                  {!isPasswordStrong ? 'Too weak' : 'Strong'}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="Confirm password"
            />

            {confirmPassword && !passwordsMatch && (
              <div className="text-red-400 text-sm mt-1">Passwords don't match</div>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!passwordsMatch || !isPasswordStrong || !walletName.trim() || loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? 'Creating...' : 'Create Wallet'}
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>

          {/* Back button */}
          <button
            onClick={() => window.location.href = '/'}
            className="w-full text-slate-400 hover:text-white text-sm py-2 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
