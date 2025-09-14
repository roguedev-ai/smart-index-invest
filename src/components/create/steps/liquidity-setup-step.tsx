import React, { useState } from 'react'
import AutomatedLiquidityProvisioner, { V3_FEE_TIERS } from '@/lib/automated-liquidity'

interface LiquiditySetupStepProps {
  tokenConfig: {
    name: string
    symbol: string
    initialSupply: string
    tokenType: string
  }
  onLiquidityConfig: (config: {
    createLiquidityPool: boolean
    proportionForPairing: number
    pairWith: 'ETH' | 'USDC' | 'USDT'
    feeTier: number
    strategy: 'conservative' | 'balanced' | 'aggressive'
  }) => void
  onContinue: () => void
  onBack: () => void
}

export function LiquiditySetupStep({
  tokenConfig,
  onLiquidityConfig,
  onContinue,
  onBack,
}: LiquiditySetupStepProps) {
  const [config, setConfig] = useState({
    createLiquidityPool: true, // Default to yes
    proportionForPairing: 10, // 10% of supply for initial liquidity
    pairWith: 'ETH' as 'ETH' | 'USDC' | 'USDT',
    feeTier: 3000, // Standard 0.30%
    strategy: 'balanced' as 'conservative' | 'balanced' | 'aggressive'
  })

  const [analyzingLiquidity, setAnalyzingLiquidity] = useState(false)

  // Simulate analyzing optimal liquidity setup
  const analyzeLiquiditySetup = async () => {
    setAnalyzingLiquidity(true)

    // Mock analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    setAnalyzingLiquidity(false)

    // Automatically optimize based on token characteristics
    const liquidityManager = new AutomatedLiquidityProvisioner(1)

    // Mock optimization results
    const optimalConfig = {
      ...config,
      proportionForPairing: tokenConfig.tokenType === 'security' ? 5 : 10, // Less liquidity for security tokens
      feeTier: 3000, // Standard for new tokens
      strategy: 'balanced' as const
    }

    setConfig(optimalConfig)
    onLiquidityConfig(optimalConfig)
  }

  const handleConfigChange = (field: string, value: any) => {
    const newConfig = { ...config, [field]: value }
    setConfig(newConfig)
    onLiquidityConfig(newConfig)
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'ETH' ? 'USD' : currency,
      minimumFractionDigits: currency === 'ETH' ? 4 : 2
    })
      .format(amount)
      .replace('$', currency === 'ETH' ? 'Ξ' : '$')
  }

  const calculateLiquidityValues = () => {
    const initialSupply = parseFloat(tokenConfig.initialSupply)
    const proportion = config.proportionForPairing / 100
    const tokensForLiquidity = initialSupply * proportion

    // Mock current prices (would be fetched from API in production)
    const prices = { ETH: 2713.45, USDC: 1.00, USDT: 1.00 }
    const currentPrice = prices[config.pairWith]

    // Estimate required pairing tokens (very simplified)
    const estimatedPairingNeeded = tokensForLiquidity * 0.001 // Simplified 1:1000 ratio

    return {
      tokensForLiquidity,
      estimatedPairingNeeded,
      estimatedPairingValue: estimatedPairingNeeded * currentPrice,
      feeTierPercentage: config.feeTier / 10000,
      potentialDailyFees: tokensForLiquidity * (config.feeTier / 10000 / 100) * 0.01 // Simplified
    }
  }

  const liquidityValues = calculateLiquidityValues()

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🏊‍♂️ Set Up Liquidity Pool
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Automatically create a Uniswap V3 liquidity pool for your {tokenConfig.name} token
        </p>
      </div>

      {/* Benefits Highlight */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-2">🚀</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Instant Tradability</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your token becomes immediately tradable on Uniswap
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">💰</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Passive Income</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Earn {config.feeTier / 100} BPS from every swap
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">⚡</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">V3 Efficiency</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {config.strategy} range uses capital efficiently
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Options */}
      <div className="space-y-6">
        {/* Enable Liquidity Pool */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Create Liquidity Pool
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatically set up a Uniswap V3 pool after deployment
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.createLiquidityPool}
                onChange={(e) => handleConfigChange('createLiquidityPool', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {config.createLiquidityPool && (
          <>
            {/* Liquidity Proportion */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Initial Liquidity Amount
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    % of Token Supply
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    value={config.proportionForPairing}
                    onChange={(e) => handleConfigChange('proportionForPairing', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {config.proportionForPairing}% ({liquidityValues.tokensForLiquidity.toLocaleString()} tokens)
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estimated Pair Token Value
                  </label>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(liquidityValues.estimatedPairingValue, config.pairWith)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    for {liquidityValues.estimatedPairingNeeded.toFixed(2)} {config.pairWith}
                  </div>
                </div>
              </div>
            </div>

            {/* Pairing Configuration */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Pair Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Pair With
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['ETH', 'USDC', 'USDT'] as const).map(pair => (
                      <button
                        key={pair}
                        onClick={() => handleConfigChange('pairWith', pair)}
                        className={`p-3 rounded-lg border-2 text-center font-medium transition-all ${
                          config.pairWith === pair
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <div className="text-sm">{pair}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {pair === 'ETH' ? 'Ξ2,713' : pair === 'USDC' ? '$1.00' : '$1.00'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Range Strategy
                  </label>
                  <div className="space-y-2">
                    {[
                      { key: 'conservative', label: 'Conservative', desc: 'Safe, 5-7% range' },
                      { key: 'balanced', label: 'Balanced', desc: 'Medium, 10-15% range' },
                      { key: 'aggressive', label: 'Aggressive', desc: 'Wide, 30%+ range' }
                    ].map(strategy => (
                      <button
                        key={strategy.key}
                        onClick={() => handleConfigChange('strategy', strategy.key)}
                        className={`w-full p-2 rounded border text-left transition-all ${
                          config.strategy === strategy.key
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="font-medium text-sm">{strategy.label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-500">{strategy.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Fee Tier Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Fee Tier Optimization
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(V3_FEE_TIERS).map(([key, tier]: [string, any]) => (
                  <button
                    key={key}
                    onClick={() => handleConfigChange('feeTier', tier.fee)}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      config.feeTier === tier.fee
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {tier.fee / 10000}%
                    </div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {tier.description}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {tier.useCase}
                    </div>
                    <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                      Potential: ${liquidityValues.potentialDailyFees.toFixed(4)}/day
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Optimization Button */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
              <div className="text-center">
                <button
                  onClick={analyzeLiquiditySetup}
                  disabled={analyzingLiquidity}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
                >
                  {analyzingLiquidity ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing Market Conditions...
                    </>
                  ) : (
                    <>
                      <span className="text-lg mr-2">🧠</span>
                      Optimize Liquidity Settings
                    </>
                  )}
                </button>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                  AI will analyze market conditions and optimize your liquidity settings for maximum efficiency
                </p>
              </div>
            </div>
          </>
        )}

        {/* Summary */}
        {config.createLiquidityPool && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 border">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📊 Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-700 dark:text-gray-300">Pool Pair</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {tokenConfig.symbol}/{config.pairWith}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-700 dark:text-gray-300">Initial Liquidity</div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {liquidityValues.tokensForLiquidity.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-700 dark:text-gray-300">Estimated Fees/Day</div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  ${liquidityValues.potentialDailyFees.toFixed(4)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-8 mt-8 border-t">
        <button
          onClick={onBack}
          className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all duration-300"
        >
          ◄ Back to Configuration
        </button>

        <div className="flex items-center space-x-3">
          {!config.createLiquidityPool && (
            <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
              ⚠️ No liquidity pool will be created
            </div>
          )}
          <button
            onClick={onContinue}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-300"
          >
            Continue to Deployment
          </button>
        </div>
      </div>
    </div>
  )
}
