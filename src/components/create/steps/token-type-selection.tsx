import React from "react"

const tokenTypes = [
  {
    id: "standard",
    name: "Standard ERC20",
    description: "Basic ERC20 token with standard features",
    features: ["Mintable", "Burnable", "Transferable"],
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
        />
      </svg>
    ),
  },
  {
    id: "flexible",
    name: "Flexible ERC20",
    description: "Advanced token with supply controls",
    features: ["Mintable", "Burnable", "Max Supply Cap", "Pausable"],
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    id: "commercial",
    name: "Commercial ERC20",
    description: "Business token with tax features",
    features: ["Tax Collection", "Marketing Wallet", "Transfer Fees"],
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1m5.196-5.196A2.18 2.18 0 0115.99 5.823c.736.666 1.224 1.632 1.224 2.706M12 8.5c.08-.08.24-.16.5-.16.32 0 .5.08.5.32s-.18.32-.5.32c-.58 0-.5-.32-.5-.64z"
        />
      </svg>
    ),
  },
  {
    id: "security",
    name: "Security ERC20",
    description: "Compliant token with admin controls",
    features: ["Admin Controls", "Transfer Restrictions", "Compliance Tools"],
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
  },
]

interface TokenTypeSelectionProps {
  selectedType?: string
  onTypeSelect: (type: string) => void
  onContinue: () => void
}

export function TokenTypeSelection({
  selectedType,
  onTypeSelect,
  onContinue,
}: TokenTypeSelectionProps) {
  const handleContinue = () => {
    if (selectedType) {
      onContinue()
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Choose Your Token Type
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select the type of token you want to create
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {tokenTypes.map((type) => (
          <div
            key={type.id}
            onClick={() => onTypeSelect(type.id)}
            className={`cursor-pointer rounded-lg border-2 p-6 transition-all duration-300 hover:shadow-lg ${
              selectedType === type.id
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-center mb-4">
              <div
                className={`p-3 rounded-lg ${
                  selectedType === type.id
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-800"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-700"
                }`}
              >
                {type.icon}
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
              {type.name}
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
              {type.description}
            </p>

            <ul className="space-y-1">
              {type.features.map((feature, index) => (
                <li key={index} className="flex items-center text-xs text-gray-500">
                  <svg
                    className="h-3 w-3 text-green-500 mr-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleContinue}
          disabled={!selectedType}
          className="px-8 py-3 bg-blue-500 text-white rounded-lg font-medium transition-all duration-300 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue with {selectedType && tokenTypes.find(t => t.id === selectedType)?.name}
        </button>
      </div>
    </div>
  )
}
