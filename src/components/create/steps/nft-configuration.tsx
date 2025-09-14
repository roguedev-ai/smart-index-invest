import React, { useState } from "react"

interface NFTConfig {
  name: string
  symbol: string
  description: string
  maxSupply: string
  baseURI: string
  externalUrl: string
  royaltyPercentage: number
  mintingFee: string
}

interface NFTConfigurationProps {
  config: NFTConfig
  onConfigUpdate: (config: NFTConfig) => void
  onContinue: () => void
  onBack: () => void
}

export function NFTConfiguration({
  config,
  onConfigUpdate,
  onContinue,
  onBack,
}: NFTConfigurationProps) {
  const [formData, setFormData] = useState(config)

  const updateFormData = (field: string, value: string | number) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onConfigUpdate(newData)
  }

  const handleContinue = () => {
    // Basic validation
    if (!formData.name.trim() || !formData.symbol.trim()) {
      alert("Please fill in name and symbol fields")
      return
    }
    onConfigUpdate(formData)
    onContinue()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Configure Your NFT Collection
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Set up your ERC721 NFT collection parameters
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📝 Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Collection Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                placeholder="My Awesome NFTs"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Symbol *
              </label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => updateFormData("symbol", e.target.value)}
                placeholder="MAN"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                maxLength={10}
                required
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              placeholder="Describe your NFT collection..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Supply Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🔢 Supply Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Supply
              </label>
              <input
                type="number"
                value={formData.maxSupply}
                onChange={(e) => updateFormData("maxSupply", e.target.value)}
                placeholder="10000"
                min="1"
                max="100000"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited supply</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minting Fee (ETH)
              </label>
              <input
                type="number"
                value={formData.mintingFee}
                onChange={(e) => updateFormData("mintingFee", e.target.value)}
                placeholder="0.01"
                step="0.001"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            ⚙️ Advanced Settings
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Royalty Percentage
              </label>
              <input
                type="number"
                value={formData.royaltyPercentage}
                onChange={(e) => updateFormData("royaltyPercentage", e.target.value)}
                placeholder="5"
                min="0"
                max="10"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <p className="text-xs text-gray-500 mt-1">Percentage paid to creator on secondary sales</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Base URI
              </label>
              <input
                type="url"
                value={formData.baseURI}
                onChange={(e) => updateFormData("baseURI", e.target.value)}
                placeholder="https://ipfs.io/ipfs/your-collection-hash/"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <p className="text-xs text-gray-500 mt-1">IPFS or HTTP URL for NFT metadata</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                External URL
              </label>
              <input
                type="url"
                value={formData.externalUrl}
                onChange={(e) => updateFormData("externalUrl", e.target.value)}
                placeholder="https://yourcollection.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <p className="text-xs text-gray-500 mt-1">Collection website or additional information</p>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-400 mb-4">
            ✨ NFT Features Included
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">ERC721 Standard Compliance</span>
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">IPFS Metadata Support</span>
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Royalty Enforcement</span>
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Admin Minting Controls</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-8 mt-8 border-t">
        <button
          onClick={onBack}
          className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all duration-300"
        >
          ◄ Back to Token Type
        </button>

        <button
          onClick={handleContinue}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-300"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  )
}
