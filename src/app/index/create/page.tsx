"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CreateIndexRequest, AssetAllocation, IndexRules, SmartIndexTypes } from '@/types/smart-index'

// Token universe for index creation
const AVAILABLE_TOKENS = [
  // Major coins
  { address: '0xC02aaAE39b223FE8D0A0e5C4F27eAD9083C756Cc2', symbol: 'WETH', name: 'Wrapped Ethereum', category: 'layer1' },
  { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol: 'WBTC', name: 'Wrapped Bitcoin', category: 'layer1' },

  // DeFi tokens
  { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', symbol: 'UNI', name: 'Uniswap', category: 'defi' },
  { address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', symbol: 'AAVE', name: 'Aave', category: 'defi' },
  { address: '0xc00e94Cb662C3520282E6f5717214004A7f26888', symbol: 'COMP', name: 'Compound', category: 'defi' },
  { address: '0xLdo1ff0000F5FaF289DecB5c2DEdC289e89499f', symbol: 'LDO', name: 'Lido DAO', category: 'defi' },

  // Layer 1
  { address: '0xD31a59c85aE9D8XCc3f22C538439d51F41880BC3', symbol: 'SOL', name: 'Solana', category: 'layer1' },
  { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI', name: 'Dai', category: 'stable' },
  { address: '0xA0b86a33e6449Cr9283ea03ae498f3bfee5e3a1d1', symbol: 'USDC', name: 'USD Coin', category: 'stable' },

  // Altcoins
  { address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeB0', symbol: 'MATIC', name: 'Polygon', category: 'layer1' },
  { address: '0x514910771AF9Ca656af840dff83E8264ecf986CA', symbol: 'LINK', name: 'Chainlink', category: 'infrastructure' },
] as const

type CreationStep = 'token-selection' | 'weight-assignment' | 'rules-configuration' | 'review-deploy'

interface DraftIndex {
  name: string
  description: string
  tokens: AssetAllocation[]
  rules: Partial<IndexRules>
}

export default function CreateSmartIndex() {
  const [step, setStep] = useState<CreationStep>('token-selection')
  const [draftIndex, setDraftIndex] = useState<DraftIndex>({
    name: '',
    description: '',
    tokens: [],
    rules: {
      rebalanceFrequency: 'monthly',
      maxSingleAssetExposure: 30,
      minLiquidityScore: 70,
      maxVolatilityThreshold: 80,
      riskProfile: 'balanced'
    }
  })

  const [selectedTokens, setSelectedTokens] = useState<string[]>([])
  const [weights, setWeights] = useState<{ [symbol: string]: number }>({})
  const [isDeploying, setIsDeploying] = useState(false)
  const router = useRouter()

  // Auto-assign weights when tokens are selected
  useEffect(() => {
    if (selectedTokens.length === 0) {
      setWeights({})
    } else {
      const equalWeight = 100 / selectedTokens.length
      const newWeights: { [symbol: string]: number } = {}
      selectedTokens.forEach(symbol => {
        newWeights[symbol] = equalWeight
      })
      setWeights(newWeights)
    }
  }, [selectedTokens])

  const handleTokenToggle = (tokenSymbol: string) => {
    setSelectedTokens(prev => {
      if (prev.includes(tokenSymbol)) {
        return prev.filter(sym => sym !== tokenSymbol)
      } else if (prev.length < 10) { // Max 10 tokens
        return [...prev, tokenSymbol]
      }
      return prev
    })
  }

  const handleWeightChange = (tokenSymbol: string, weight: number) => {
    setWeights(prev => ({
      ...prev,
      [tokenSymbol]: weight
    }))
  }

  const normalizeWeights = () => {
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
    if (totalWeight !== 100) {
      const ratio = 100 / totalWeight
      const normalized: { [symbol: string]: number } = {}
      Object.entries(weights).forEach(([symbol, weight]) => {
        normalized[symbol] = Math.round(weight * ratio * 100) / 100
      })
      setWeights(normalized)
    }
  }

  const createIndexRequest = async (): Promise<SmartIndexTypes.Index> => {
    const tokens: AssetAllocation[] = selectedTokens.map(symbol => {
      const tokenInfo = AVAILABLE_TOKENS.find(t => t.symbol === symbol)!
      return {
        address: tokenInfo.address,
        symbol: tokenInfo.symbol,
        name: tokenInfo.name,
        weight: weights[symbol] || 0,
        currentPrice: 0 // Will be fetched from price feeds
      }
    })

    const rules: IndexRules = {
      rebalanceFrequency: draftIndex.rules.rebalanceFrequency || 'monthly',
      maxSingleAssetExposure: draftIndex.rules.maxSingleAssetExposure || 30,
      maxDrawdownTrigger: draftIndex.rules.maxDrawdownTrigger,
      minLiquidityScore: draftIndex.rules.minLiquidityScore || 70,
      maxVolatilityThreshold: draftIndex.rules.maxVolatilityThreshold || 80,
      riskProfile: draftIndex.rules.riskProfile || 'balanced'
    }

    // Generate a proper wallet address (this would come from auth context later)
    const walletAddress = '0x' + Math.random().toString(16).substr(2, 40)

    // Calculate total value locked (TVL) - mock calculation for now
    const totalTVL = tokens.reduce((sum, token) => {
      return sum + (token.weight / 100) * 1000000 // Mock TVL calculation
    }, 0)

    const request: CreateIndexRequest = {
      name: draftIndex.name || 'My Smart Index',
      description: draftIndex.description || 'A personalized cryptocurrency index',
      creator: walletAddress, // Use generated address for now
      tokens,
      rules,
      tvl: totalTVL // Add TVL calculation
    }

    console.log('=== INDEX CREATION REQUEST ===')
    console.log('Request data:', JSON.stringify(request, null, 2))

    try {
      // API call to create index
      const response = await fetch('/api/indexes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`API Error ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log('Success Response:', data)
      return data.data
    } catch (error) {
      console.error('Fetch error:', error)
      throw error
    }
  }

  const handleDeploy = async () => {
    setIsDeploying(true)
    try {
      await createIndexRequest()
      router.push('/dashboard/user-dashboard')
    } catch (error) {
      console.error('Deployment failed:', error)
      // TODO: Show error toast
    } finally {
      setIsDeploying(false)
    }
  }

  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
  const isWeightsValid = Math.abs(totalWeight - 100) < 0.1

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Create Your Smart Index
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Build a personalized ETF-like index of cryptocurrencies with custom weights,
              automated rebalancing, and professional risk management in minutes.
            </p>
          </div>

          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-3xl mx-auto mb-4">
              {[
                { id: 'token-selection', name: 'Select Tokens', icon: '🪙' },
                { id: 'weight-assignment', name: 'Set Weights', icon: '⚖️' },
                { id: 'rules-configuration', name: 'Configure Rules', icon: '⚙️' },
                { id: 'review-deploy', name: 'Review & Deploy', icon: '🚀' }
              ].map((s, index) => {
                const isActive = s.id === step
                const isCompleted = [
                  'weight-assignment',
                  'rules-configuration',
                  'review-deploy'
                ].includes(s.id) && step === 'review-deploy'

                const isCurrentStep = s.id === step
                const stepIndex = index + 1

                return (
                  <div key={s.id} className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 text-lg
                      ${isActive || isCompleted ? 'bg-purple-500 text-white' : 'bg-gray-300 text-gray-600'}
                    `}>
                      {isCompleted ? '✓' : isActive ? s.icon : stepIndex}
                    </div>
                    <div className={`text-sm font-medium ${isActive ? 'text-purple-600' : 'text-gray-600'}`}>
                      {s.name}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 max-w-3xl mx-auto">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    step === 'token-selection' ? 25 :
                    step === 'weight-assignment' ? 50 :
                    step === 'rules-configuration' ? 75 : 100
                  }%`
                }}
              ></div>
            </div>
          </div>

          {/* Step content */}
          {step === 'token-selection' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Select Your Assets
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                {AVAILABLE_TOKENS.map((token) => {
                  const isSelected = selectedTokens.includes(token.symbol)

                  return (
                    <button
                      key={token.symbol}
                      onClick={() => handleTokenToggle(token.symbol)}
                      className={`p-4 border rounded-lg transition-all duration-200 hover:shadow-md
                        ${isSelected ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                                    : 'border-gray-200 hover:border-gray-300'}
                      `}
                    >
                      <div className="text-center">
                        <div className={`text-2xl mb-1 ${getTokenIcon(token.category)}`}>
                          {getAssetEmoji(token.symbol)}
                        </div>
                        <div className="font-semibold text-sm">{token.symbol}</div>
                        <div className="text-xs text-gray-600 truncate">{token.name}</div>
                        {isSelected && (
                          <div className="mt-1">
                            <span className="inline-block w-2 h-2 bg-purple-500 rounded-full"></span>
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Selected: {selectedTokens.length} of 10 maximum
                </div>
                <button
                  onClick={() => setStep('weight-assignment')}
                  disabled={selectedTokens.length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Set Weights →
                </button>
              </div>
            </div>
          )}

          {step === 'weight-assignment' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Allocate Your Portfolio
              </h2>

              <div className="space-y-4 mb-8">
                {selectedTokens.map((symbol) => {
                  const tokenInfo = AVAILABLE_TOKENS.find(t => t.symbol === symbol)!
                  const weight = weights[symbol] || 0

                  return (
                    <div key={symbol} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold">
                        {symbol[0]}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{tokenInfo.name}</div>
                        <div className="text-sm text-gray-600">{symbol}</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="0.5"
                          value={weight}
                          onChange={(e) => handleWeightChange(symbol, parseFloat(e.target.value))}
                          className="flex-1"
                        />
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={weight}
                          onChange={(e) => handleWeightChange(symbol, parseFloat(e.target.value) || 0)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded"
                        />
                        <span className="text-sm font-medium">%</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Total Allocation:</span>
                  <span className={`font-bold ${isWeightsValid ? 'text-green-600' : 'text-red-600'}`}>
                    {totalWeight.toFixed(1)}%
                  </span>
                </div>
                {!isWeightsValid && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-red-600">Weights must total 100%</span>
                    <button
                      onClick={normalizeWeights}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    >
                      Auto-Adjust
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep('token-selection')}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep('rules-configuration')}
                  disabled={!isWeightsValid}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Configure Rules →
                </button>
              </div>
            </div>
          )}

          {step === 'rules-configuration' && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Set Your Index Rules
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rebalancing Frequency
                    </label>
                    <select
                      value={draftIndex.rules.rebalanceFrequency}
                      onChange={(e) => setDraftIndex(prev => ({
                        ...prev,
                        rules: {
                          ...prev.rules,
                          rebalanceFrequency: e.target.value as any
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="none">No Rebalancing</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Single Asset Exposure (%)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="100"
                      value={draftIndex.rules.maxSingleAssetExposure || 30}
                      onChange={(e) => setDraftIndex(prev => ({
                        ...prev,
                        rules: {
                          ...prev.rules,
                          maxSingleAssetExposure: parseInt(e.target.value) || 30
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Risk Profile
                    </label>
                    <select
                      value={draftIndex.rules.riskProfile}
                      onChange={(e) => setDraftIndex(prev => ({
                        ...prev,
                        rules: {
                          ...prev.rules,
                          riskProfile: e.target.value as any
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="conservative">Conservative - Focus on stability</option>
                      <option value="balanced">Balanced - Moderate risk/reward</option>
                      <option value="aggressive">Aggressive - Higher risk for potential returns</option>
                      <option value="ultra_high_risk">Ultra High Risk - Maximum volatility</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold text-blue-800 mb-2">Smart Index Benefits</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Professional portfolio management</li>
                      <li>• Automated risk control</li>
                      <li>• Real-time rebalancing</li>
                      <li>• Liquidity management</li>
                      <li>• Performance tracking vs benchmarks</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">What This Index Does</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Your basket becomes an ERC-20 token</li>
                      <li>• Automated rebalancing when rules trigger</li>
                      <li>• Risk monitoring 24/7</li>
                      <li>• Investors can buy into your strategy</li>
                      <li>• Performance comparisons with BTC/ETH</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep('weight-assignment')}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep('review-deploy')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-blue-700"
                >
                  Next: Review & Deploy →
                </button>
              </div>
            </div>
          )}

          {step === 'review-deploy' && (
            <div className="space-y-6">
              {/* Index Summary */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Index Summary & Deployment
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Index Name</h3>
                    <p className="text-gray-600">{draftIndex.name || 'Your Personal Index'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Assets ({selectedTokens.length})</h3>
                    <p className="text-gray-600">{selectedTokens.join(', ')}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Rebalancing</h3>
                    <p className="text-gray-600 capitalize">{draftIndex.rules.rebalanceFrequency}</p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Asset Allocation</h3>
                  <div className="space-y-3">
                    {selectedTokens.map((symbol) => {
                      const tokenInfo = AVAILABLE_TOKENS.find(t => t.symbol === symbol)!
                      const weight = weights[symbol] || 0
                      const percentage = weight / 100

                      return (
                        <div key={symbol} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-xs font-semibold">
                              {symbol[0]}
                            </div>
                            <div>
                              <span className="font-medium">{tokenInfo.name}</span>
                              <span className="text-gray-600 ml-2">({symbol})</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-blue-600 h-2 rounded-full"
                                style={{ width: `${percentage * 100}%` }}
                              ></div>
                            </div>
                            <span className="font-semibold w-12 text-right">{weight.toFixed(1)}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-semibold text-amber-800">Important Deployment Notes</h4>
                      <p className="text-sm text-amber-700 mt-1">
                        Your index will be deployed as an ERC-4626 vault contract with rebalancing automation.
                        The PitToken will be evenly distributed based on your current wallet balance.
                        High-volatility assets may trigger risk controls.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep('rules-configuration')}
                    disabled={isDeploying}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleDeploy}
                    disabled={isDeploying}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isDeploying ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Deploying Index...</span>
                      </>
                    ) : (
                      <>
                        <span>🚀 Deploy Smart Index</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

// Helper functions
function getAssetEmoji(symbol: string): string {
  const emojis: { [key: string]: string } = {
    'WETH': '⚡',
    'WBTC': '₿',
    'UNI': '🐄',
    'AAVE': '🏠',
    'COMP': '🏛️',
    'LDO': '🌊',
    'DAI': '💎',
    'USDC': '$',
    'SOL': '⚡',
    'MATIC': '🔺',
    'LINK': '🔗'
  }
  return emojis[symbol] || '🪙'
}

function getTokenIcon(category: string): string {
  switch (category) {
    case 'defi': return 'text-blue-600'
    case 'layer1': return 'text-green-600'
    case 'stable': return 'text-gray-600'
    case 'infrastructure': return 'text-purple-600'
    default: return 'text-gray-700'
  }
}
