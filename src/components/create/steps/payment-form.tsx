import React from "react"

interface PaymentFormProps {
  tokenData: any
  onPaymentConfirm: () => void
  onBack: () => void
}

export function PaymentForm({ tokenData, onPaymentConfirm, onBack }: PaymentFormProps) {
  const feeAmount = "0.01" // ETH fee
  const isReady = tokenData?.config?.name && tokenData?.config?.symbol

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Review & Pay Creation Fee
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Review your token configuration and pay the creation fee
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Token Configuration</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Token Type:</span>
            <span className="font-medium capitalize">{tokenData?.tokenType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Name:</span>
            <span className="font-medium">{tokenData?.config?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Symbol:</span>
            <span className="font-medium">{tokenData?.config?.symbol}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Initial Supply:</span>
            <span className="font-medium">{tokenData?.config?.initialSupply}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Creation Fee</h3>
        <div className="flex justify-between items-center">
          <span>Token Creation Fee:</span>
          <span className="text-2xl font-bold text-blue-600">{feeAmount} ETH</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          This fee covers gas costs and admin wallet distribution
        </p>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Back
        </button>

        <button
          onClick={onPaymentConfirm}
          disabled={!isReady}
          className="px-8 py-3 bg-green-500 text-white rounded-lg font-medium transition-all duration-300 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Pay {feeAmount} ETH & Create Token
        </button>
      </div>
    </div>
  )
}
