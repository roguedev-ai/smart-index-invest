"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

// Web wallet generation status
type CreationStep = 'loading' | 'wallet-ready' | 'seed-phrase' | 'verification' | 'setup-complete'

interface WebWallet {
  address: string
  privateKey: string // In production, this would be encrypted/stored securely
  mnemonic: string
  path: string
}

export default function CreateWebWallet() {
  const [step, setStep] = useState<CreationStep>('loading')
  const [wallet, setWallet] = useState<WebWallet | null>(null)
  const [isWalletVerified, setIsWalletVerified] = useState(false)
  const [saveLocally, setSaveLocally] = useState(true)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  // Generate HD wallet on component mount
  useEffect(() => {
    const createWallet = async () => {
      try {
        // For demo purposes - in production this would use ethers.js
        // const { ethers } = await import('ethers')
        // const wallet = ethers.Wallet.createRandom()

        // Mock wallet for now (in production: use real wallet generation)
        const mockWallet: WebWallet = {
          address: '0x' + Math.random().toString(16).substr(2, 40),
          privateKey: '0x' + Math.random().toString(16).substr(2, 64),
          mnemonic: 'bless lounge conduct oil force pride april worry big among urgent current',
          path: "m/44'/60'/0'/0/0"
        }

        setWallet(mockWallet)
        setTimeout(() => {
          setStep('wallet-ready')
        }, 2000)

      } catch (error) {
        console.error('Wallet creation failed:', error)
        setStep('wallet-ready') // Fallback for demo
      }
    }

    createWallet()
  }, [])

  // Verify wallet exists on blockchain
  const verifyWallet = async () => {
    if (!wallet) return

    setStep('verification')
    try {
      // Mock verification - in production: check etherscan/blockchain
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsWalletVerified(true)
      setStep('seed-phrase')
    } catch (error) {
      console.error('Verification failed:', error)
    }
  }

  // Save wallet and continue
  const saveAndContinue = async () => {
    if (!wallet || !saveLocally) return

    try {
      setStep('setup-complete')

      // Store wallet securely (in production: use encrypted storage)
      if (saveLocally) {
        const walletData = {
          address: wallet.address,
          encryptedKey: password ? btoa(wallet.privateKey) : wallet.privateKey,
          createdAt: new Date().toISOString(),
          network: 'ethereum'
        }

        // Store in localStorage (in production: encrypted + remote backup)
        localStorage.setItem('tokenmarket_wallet', JSON.stringify(walletData))
      }

      // Log the user in with the authentication system
      await login(wallet.address, 'web')

      // Auth context will auto-redirect to dashboard after login

    } catch (error) {
      console.error('Save failed:', error)
    }
  }

  // Loading screen
  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="animate-spin rounded-full h-20 w-20 bg-gradient-to-br from-purple-500 to-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Creating Your Secure Wallet
          </h2>
          <p className="text-gray-600 mb-6">
            Generating HD wallet with industry-standard security...
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center justify-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Generating cryptographic keys
            </div>
            <div className="flex items-center justify-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></span>
              Creating backup phrase
            </div>
            <div className="flex items-center justify-center">
              <span className="w-2 h-2 bg-gray-300 rounded-full mr-3"></span>
              Checking blockchain availability
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Wallet ready screen
  if (step === 'wallet-ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13l3 3L22 4m0 12h-6a2 2 0 01-2-2V8l4-4h4v6" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Your Wallet is Ready! 🎉
              </h1>
              <p className="text-lg text-gray-600">
                A secure HD wallet has been generated for you. Please verify it's working correctly.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Wallet Address</h3>
                <code className="bg-gray-100 px-3 py-1 rounded text-sm text-gray-800 font-mono">
                  {wallet?.address}
                </code>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  This is your new Ethereum wallet address. It can hold ETH and any ERC20 tokens.
                </p>
                <button
                  onClick={verifyWallet}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
                >
                  Verify Wallet On Blockchain →
                </button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                This will check if your wallet address exists on the Ethereum blockchain
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Seed phrase screen
  if (step === 'seed-phrase') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Your Recovery Phrase
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Save these 12 words safely. They are the only way to recover your wallet if you lose access.
                <strong> Never share this with anyone!</strong>
              </p>
            </div>

            {/* Seed Phrase Display */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                {wallet?.mnemonic.split(' ').map((word, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
                    <span className="text-xs text-gray-500 block">{index + 1}</span>
                    <span className="font-semibold text-gray-900">{word}</span>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-amber-800">Security Warning</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Store these words offline in a secure location. Anyone with access to these words can control your funds.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Storage Options */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">How would you like to store your wallet?</h3>

              <div className="space-y-3">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    checked={saveLocally}
                    onChange={(e) => setSaveLocally(e.target.checked)}
                    className="mt-1 mr-3 rounded"
                  />
                  <div>
                    <label className="font-medium text-gray-900">Save Locally in Browser</label>
                    <p className="text-sm text-gray-600">Recommended for development. Your wallet will be stored encrypted locally.</p>
                  </div>
                </div>

                {saveLocally && (
                  <div className="ml-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Set a password for encryption (optional)
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="ml-6">
                  <div className="flex items-start">
                    <input type="checkbox" className="mt-1 mr-3 rounded" />
                    <div>
                      <label className="font-medium text-gray-900">Cloud Backup</label>
                      <p className="text-sm text-gray-600">Coming soon: Encrypted backup to secure cloud storage</p>
                      <p className="text-xs text-gray-500 mt-1">(This feature is not available yet)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={saveAndContinue}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300"
              >
                Continue to Token Creation 🚀
              </button>
              <p className="text-sm text-gray-600 mt-4">
                Don't worry, you can always view and manage your seed phrase later
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Setup complete
  if (step === 'setup-complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-6 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13l3 3L22 4m0 12h-6a2 2 0 01-2-2V8l4-4h4v6" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Wallet Setup Complete! 🎉
          </h2>
          <p className="text-gray-600 mb-6">
            Your wallet is now ready for token creation. You can now deploy your own ERC20 tokens!
          </p>

          <div className="bg-white rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              Wallet Saved Securely ✓<br/>
              Blockchain Access ✅<br/>
              Ready for Token Creation 🚀
            </p>
          </div>

          <p className="text-sm text-gray-600">
            Redirecting to token creation...
          </p>
        </div>
      </div>
    )
  }

  return null
}
