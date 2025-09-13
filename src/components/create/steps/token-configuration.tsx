import React from "react"

interface TokenConfigurationProps {
  tokenType?: string
  config?: any
  onConfigUpdate: (config: any) => void
  onContinue: () => void
  onBack: () => void
}

export function TokenConfiguration({
  tokenType,
  config = {},
  onConfigUpdate,
  onContinue,
  onBack,
}: TokenConfigurationProps) {
  const handleInputChange = (field: string, value: string) => {
    onConfigUpdate({ ...config, [field]: value })
  }

  const handleContinue = () => {
    if (config.name && config.symbol && config.initialSupply) {
      onContinue()
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Configure Your Token
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Set up the basic parameters for your {tokenType} token
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Token Name *
          </label>
          <input
            type="text"
            value={config.name || ""}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="e.g. My Awesome Token"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Token Symbol *
          </label>
          <input
            type="text"
            value={config.symbol || ""}
            onChange={(e) => handleInputChange("symbol", e.target.value)}
            placeholder="e.g. MAT"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Initial Supply *
          </label>
          <input
            type="text"
            value={config.initialSupply || ""}
            onChange={(e) => handleInputChange("initialSupply", e.target.value)}
            placeholder="e.g. 1000000"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {(tokenType === "flexible" || tokenType === "commercial" || tokenType === "security") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Supply (Optional)
            </label>
            <input
              type="text"
              value={config.maxSupply || ""}
              onChange={(e) => handleInputChange("maxSupply", e.target.value)}
              placeholder="Leave empty for unlimited supply"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {tokenType === "commercial" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tax Fee (%)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={config.taxFee || ""}
              onChange={(e) => handleInputChange("taxFee", e.target.value)}
              placeholder="e.g. 2"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {tokenType === "security" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Security Admin Address
            </label>
            <input
              type="text"
              value={config.securityAdmin || ""}
              onChange={(e) => handleInputChange("securityAdmin", e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      <div className="flex justify-between pt-8">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Back
        </button>

        <button
          onClick={handleContinue}
          disabled={!config.name || !config.symbol || !config.initialSupply}
          className="px-8 py-3 bg-blue-500 text-white rounded-lg font-medium transition-all duration-300 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
