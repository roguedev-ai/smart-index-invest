import React from "react"

interface DeploymentStepProps {
  tokenData: any
  onComplete: () => void
  onBack: () => void
}

export function DeploymentStep({ tokenData, onComplete, onBack }: DeploymentStepProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Deploying Your Token
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Your token is being deployed to the blockchain
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border p-8 mb-8">
        <div className="flex items-center justify-center mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Processing...</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please wait while we deploy your {tokenData?.config?.name} token
          </p>

          <div className="space-y-2 text-sm text-left bg-gray-50 dark:bg-gray-700 p-4 rounded">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-blue-600">Deploying to blockchain</span>
            </div>
            <div className="flex justify-between">
              <span>Token Type:</span>
              <span>{tokenData?.tokenType}</span>
            </div>
            <div className="flex justify-between">
              <span>Network:</span>
              <span>Ethereum</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={() => {
            // Simulate successful deployment
            setTimeout(onComplete, 2000)
          }}
          className="px-8 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
        >
          Complete Deployment
        </button>

        <p className="mt-4 text-sm text-gray-600">
          <button onClick={onBack} className="text-blue-500 hover:underline">
            Need to modify configuration?
          </button>
        </p>
      </div>
    </div>
  )
}
