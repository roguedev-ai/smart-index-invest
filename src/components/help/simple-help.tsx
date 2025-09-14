"use client"

import { useState } from 'react'

// Simple help system without external dependencies
export function SimpleHelpSystem() {
  const [isOpen, setIsOpen] = useState(false)

  const helpTopics = [
    {
      title: '🎯 Build Your First Token',
      description: 'Quick guide: Name → Features → Deploy',
      link: '/create',
      highlight: true
    },
    {
      title: '🛡️ Create Free Wallet',
      description: 'Instant web wallet, no MetaMask needed',
      link: '/wallet/onboard',
      highlight: true
    },
    {
      title: '💰 Multiple Token Types',
      description: 'Standard ERC20, Flexible, Commercial',
      link: '/help/token-types'
    },
    {
      title: '🌐 Multi-Chain Support',
      description: 'Ethereum, Polygon, BSC, Arbitrum',
      link: '/help/networks'
    },
    {
      title: '🔒 Security Features',
      description: 'Bank-grade encryption & protection',
      link: '/help/security'
    },
    {
      title: '📊 Analytics Dashboard',
      description: 'Track performance & growth',
      link: '/dashboard'
    }
  ]

  return (
    <>
      {/* Help trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors z-50"
        aria-label="Open help"
      >
        <span className="text-xl ">?</span>
      </button>

      {/* Help modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">TokenMarket Help</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-gray-200"
                  aria-label="Close help"
                >
                  ✕
                </button>
              </div>
              <p className="mt-2 text-blue-100">
                Everything you need to get started with token creation
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Quick actions */}
              <div className="space-y-3 mb-8">
                {helpTopics.slice(0, 2).map((topic, index) => (
                  <a
                    key={index}
                    href={topic.link}
                    onClick={() => setIsOpen(false)}
                    className={`block w-full p-4 rounded-lg text-left transition-all ${
                      topic.highlight
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    <h3 className="font-semibold">{topic.title}</h3>
                    <p className="text-sm mt-1 opacity-90">
                      {topic.description}
                    </p>
                  </a>
                ))}
              </div>

              {/* Help topics */}
              <div>
                <h4 className="text-gray-900 font-medium mb-4">
                  Learn More
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {helpTopics.slice(2).map((topic, index) => (
                    <a
                      key={index}
                      href={topic.link}
                      onClick={() => setIsOpen(false)}
                      className="block p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
                    >
                      <h5 className="font-medium text-gray-900">
                        {topic.title}
                      </h5>
                      <p className="text-sm text-gray-600 mt-1">
                        {topic.description}
                      </p>
                    </a>
                  ))}
                </div>
              </div>

              {/* Contact support */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Can't find what you're looking for?
                  </p>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Wallet creation guide component
export function WalletCreationGuide() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
      <div className="flex items-start">
        <div className="flex-shrink-0 text-blue-600 text-xl mr-4">
          🛡️
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Create Your Free Web Wallet
          </h3>
          <p className="text-blue-800 mb-4">
            Experience the future of crypto wallets - no downloads, no MetaMask installation required!
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/wallet/onboard"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create Wallet Now →
            </a>
            <span className="text-sm text-blue-600 self-center">
              Takes under 2 minutes
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Token creation tips
export function TokenCreationTips({ step }: { step?: string }) {
  const tips = {
    name: "Choose a memorable name - this becomes your brand identity",
    features: "Start with basic features, you can always upgrade later",
    network: "Ethereum mainnet is recommended for serious projects",
    branding: "Add a professional logo and clear project description"
  }

  const currentTip = step ? tips[step as keyof typeof tips] : null

  if (!currentTip) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="text-yellow-400 mr-3">💡</div>
          <div>
            <p className="text-yellow-800 text-sm">
              <strong>Pro tip:</strong> Start simple, then upgrade to advanced features. Most projects make their first token too complex.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex">
        <div className="text-green-400 mr-3">✅</div>
        <div>
          <p className="text-green-800 text-sm">
            {currentTip}
          </p>
        </div>
      </div>
    </div>
  )
}

// Quick onboarding checklist
export function OnboardingChecklist({ walletCreated, tokenCreated }: {
  walletCreated: boolean
  tokenCreated: boolean
}) {
  const steps = [
    {
      id: 'wallet',
      title: 'Create Free Wallet',
      description: 'Zero-friction web wallet setup',
      completed: walletCreated,
      link: '/wallet/onboard'
    },
    {
      id: 'token',
      title: 'Create First Token',
      description: 'Deploy your blockchain token',
      completed: tokenCreated,
      link: '/create'
    },
    {
      id: 'dashboard',
      title: 'Set Up Dashboard',
      description: 'Monitor your token performance',
      completed: false,
      link: '/dashboard'
    },
    {
      id: 'community',
      title: 'Build Community',
      description: 'Share your token success story',
      completed: false,
      link: '/community'
    }
  ]

  const completedCount = steps.filter(step => step.completed).length
  const totalSteps = steps.length
  const progressPercentage = Math.round((completedCount / totalSteps) * 100)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Your Onboarding Progress
        </h3>
        <span className="text-sm text-gray-600">
          {completedCount} of {totalSteps} complete
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                step.completed
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}>
                {step.completed ? '✓' : step.id === 'wallet' ? '🛡️' : step.id === 'token' ? '🪙' : '📊'}
              </div>
              <div>
                <h4 className={`text-sm font-medium ${
                  step.completed ? 'text-gray-900' : 'text-gray-600'
                }`}>
                  {step.title}
                </h4>
                <p className="text-xs text-gray-500">
                  {step.description}
                </p>
              </div>
            </div>
            {!step.completed && step.link && (
              <a
                href={step.link}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {step.id === 'wallet' ? 'Start' : 'Continue'} →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
