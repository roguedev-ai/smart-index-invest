"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HelpCircle,
  MessageCircle,
  Book,
  Lightbulb,
  Target,
  Zap,
  CheckCircle,
  ArrowRight,
  X,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward
} from 'lucide-react'

// Help System Context and State
interface HelpContext {
  currentUser: 'new' | 'returning' | 'experienced'
  currentStep: string
  walletCreated: boolean
  tokensCreated: boolean
  lastDownload: Date | null
}

// Interactive Tutorial Steps
interface TutorialStep {
  id: string
  title: string
  description: string
  content: string
  targetElement?: string
  actions: Array<{
    label: string
    action: string
    highlight?: boolean
  }>
  voiceover?: {
    key: string
    duration: number
  }
  media?: {
    type: 'video' | 'image' | 'animation'
    src: string
    alt: string
  }
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: '🎉 Welcome to TokenMarket!',
    description: 'Your journey to building amazing tokens starts here.',
    content: `Welcome to TokenMarket, the largest platform for creating custom blockchain tokens!

    Here you'll learn everything you need to know to:
    ✅ Create your first digital wallet (completely free!)
    ✅ Deploy custom tokens on multiple blockchains
    ✅ Manage your portfolio with AI-powered analytics
    ✅ Grow your community with built-in tools`,
    actions: [
      {
        label: 'Start My Journey →',
        action: 'next',
        highlight: true
      }
    ],
    voiceover: {
      key: 'voice_welcome',
      duration: 8500
    }
  },
  {
    id: 'wallet-creation',
    title: '🛡️ Create Your Free Wallet',
    description: 'The first step is creating your secure web wallet - no downloads required!',
    content: `Your TokenMarket wallet is different from traditional crypto wallets:

    ✨ **Zero-Friction Setup:** No MetaMask installation required
    🔒 **Enterprise Security:** Bank-grade encryption and protections
    🌐 **Multi-Network Support:** Works with Ethereum, Polygon, BSC, and more
    📱 **Cross-Platform:** Access from any device, anywhere
    💰 **Cost-Effective:** Zero wallet fees - only pay for transactions

    Ready to experience the future of crypto wallets?`,
    actions: [
      {
        label: 'Create My Free Wallet Now!',
        action: 'create-wallet',
        highlight: true
      },
      {
        label: 'Learn About Wallet Security First',
        action: 'next'
      }
    ],
    media: {
      type: 'animation',
      src: '/animations/wallet-creation.webm',
      alt: 'Animated demo of wallet creation process'
    },
    voiceover: {
      key: 'voice_wallet_creation',
      duration: 5220
    }
  },
  {
    id: 'wallet-security',
    title: '🔐 Wallet Security Made Simple',
    description: 'Understanding how TokenMarket protects your assets.',
    content: `Your security is our top priority. Here's how we protect your assets:

    🛡️ **Local Encryption:** All data stays on your device
    🔑 **Password Protection:** Only you know your master password
    📊 **No Seed Phrases:** Eliminates seed phrase loss risks
    🔄 **Recovery System:** Secure backup and recovery methods
    📱 **Biometric Soon:** Fingerprint authentication support
    🏦 **Bank-Grade:** Same security as traditional banking

    We don't store your private keys or passwords anywhere - you maintain full control.`,
    actions: [
      { label: '← Back', action: 'prev' },
      { label: 'Create Secure Wallet', action: 'create-wallet', highlight: true },
      { label: 'Next →', action: 'next' }
    ],
    voiceover: {
      key: 'voice_wallet_security',
      duration: 4100
    }
  },
  {
    id: 'token-creation-basics',
    title: '🏗️ Building Your First Token',
    description: 'Learn the fundamentals of token creation on TokenMarket.',
    content: `Creating tokens on TokenMarket is revolutionaryy easy:

    🚀 **AI-Powered Creation:** Smart suggestions and optimizations
    💰 **Multiple Types:** Standard ERC20, Flexible, Commercial, Security tokens
    🌐 **Cross-Chain Ready:** Deploy on any supported network instantly
    🎨 **Custom Branding:** Add logos, descriptions, and marketing assets
    📊 **Live Analytics:** Real-time token performance tracking
    👥 **Community Features:** Built-in Discord integration

    TokenMarket combines the best of DeFi with professional-grade tools.`,
    actions: [
      { label: '← Back', action: 'prev' },
      { label: 'Create My First Token', action: 'create-token', highlight: true },
      { label: 'Explore Advanced Features →', action: 'next' }
    ],
    voiceover: {
      key: 'voice_token_creation',
      duration: 7680
    }
  },
  {
    id: 'platform-overview',
    title: '🏆 TokenMarket Complete Ecosystem',
    description: 'Explore all the powerful features that make TokenMarket unique.',
    content: `TokenMarket is a complete blockchain ecosystem for serious projects:

    🔬 **Sold Exploiter:** Professional token listings (soon!)
    🤖 **AI Analytics:** Smart contract audits and optimizations
    💱 **DEX Integration:** Automated liquidity pool management
    🎯 **Yield Farming:** Automated reward maximization
    🏛️ **Governance:** Community governance tools
    📱 **Multi-Device:** Desktop, tablet, and mobile support
    🌍 **Global Access:** Available in multiple languages

    Join the thousands of successful projects built with TokenMarket!`,
    actions: [
      { label: '← Back', action: 'prev' },
      { label: 'Submit My First Token Idea', action: 'create-token' },
      { label: 'Complete My Onboarding →', action: 'complete', highlight: true }
    ],
    voiceover: {
      key: 'voice_platform_overview',
      duration: 5820
    }
  }
]

// Achievement System
interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  reward?: string
}

const USER_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-visit',
    title: 'First Steps',
    description: 'Welcome to TokenMarket - your first step into DeFi!',
    icon: '👋',
    unlocked: true,
    reward: '5% off first token creation'
  },
  {
    id: 'wallet-created',
    title: 'Wallet Owner',
    description: 'Successfully created your secure web wallet',
    icon: '🛡️',
    unlocked: false,
    reward: 'Free transaction analysis tool'
  },
  {
    id: 'token-created',
    title: 'Token Master',
    description: 'Created your first blockchain token',
    icon: '🏗️',
    unlocked: false,
    reward: 'Exclusive premium feature access'
  },
  {
    id: 'community-builder',
    title: 'Community Builder',
    description: 'Added 100+ community members',
    icon: '👥',
    unlocked: false,
    reward: 'Advanced governance tools'
  }
]

// Main Help System Component
export function HelpSystem() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentTutorial, setCurrentTutorial] = useState(0)
  const [isTutorialActive, setIsTutorialActive] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [helpContext, setHelpContext] = useState<HelpContext>({
    currentUser: 'new',
    currentStep: 'welcome',
    walletCreated: false,
    tokensCreated: false,
    lastDownload: null
  })

  // Context-aware help suggestions
  const getContextHelp = () => {
    if (!helpContext.walletCreated) {
      return TUTORIAL_STEPS.find(step => step.id === 'wallet-creation')!
    }
    if (!helpContext.tokensCreated) {
      return TUTORIAL_STEPS.find(step => step.id === 'token-creation-basics')!
    }
    return TUTORIAL_STEPS.find(step => step.id === 'platform-overview')!
  }

  // Quick Actions for Different User States
  const QuickActionsComponent = ({ context }: { context: HelpContext }) => (
    <div className="space-y-3 mb-6">
      {!context.walletCreated && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.location.href = '/wallet/onboard'}
          className="w-full p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          🛡️ Create Your Free Wallet Now
        </motion.button>
      )}

      {context.walletCreated && !context.tokensCreated && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.location.href = '/create'}
          className="w-full p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          🚀 Create Your First Token
        </motion.button>
      )}

      {context.walletCreated && context.tokensCreated && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.location.href = '/dashboard'}
          className="w-full p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          📊 View My Dashboard
        </motion.button>
      )}
    </div>
  )

  // Main Help System Modal
  return (
    <>
      {/* Help Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all z-50"
      >
        <HelpCircle className="w-6 h-6" />
      </motion.button>

      {/* Main Help Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
                <div className="flex items-center space-x-3">
                  <HelpCircle className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-bold text-white">TokenMarket Help</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[50vh] overflow-y-auto">
                {/* Quick Actions */}
                <QuickActionsComponent context={helpContext} />

                {/* Tutorial Progress */}
                {isTutorialActive && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
                      <span>Onboarding Progress</span>
                      <span>{currentTutorial + 1}/{TUTORIAL_STEPS.length}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentTutorial + 1) / TUTORIAL_STEPS.length) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Tutorial Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTutorial}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="bg-slate-700/50 rounded-xl p-4">
                      <h4 className="text-lg font-semibold text-white mb-2">
                        {TUTORIAL_STEPS[currentTutorial].title}
                      </h4>
                      <p className="text-slate-300 mb-3">
                        {TUTORIAL_STEPS[currentTutorial].description}
                      </p>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {TUTORIAL_STEPS[currentTutorial].content}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      {TUTORIAL_STEPS[currentTutorial].actions.map((action, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            switch (action.action) {
                              case 'next':
                                setCurrentTutorial(prev => Math.min(prev + 1, TUTORIAL_STEPS.length - 1))
                                break
                              case 'prev':
                                setCurrentTutorial(prev => Math.max(prev - 1, 0))
                                break
                              case 'create-wallet':
                                window.location.href = '/wallet/onboard'
                                break
                              case 'create-token':
                                window.location.href = '/create'
                                break
                              case 'complete':
                                setIsTutorialActive(false)
                                break
                            }
                          }}
                          className={`w-full p-3 rounded-lg font-medium transition-all ${
                            action.highlight
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {action.label}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Achievement Badges */}
                <div className="mt-8">
                  <h5 className="text-white font-medium mb-4">Your Achievements</h5>
                  <div className="grid grid-cols-2 gap-3">
                    {USER_ACHIEVEMENTS.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`p-3 rounded-lg border transition-all ${
                          achievement.unlocked
                            ? 'bg-emerald-500/20 border-emerald-500/50'
                            : 'bg-slate-700/50 border-slate-600/50'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-1">{achievement.icon}</div>
                          <div className={`text-sm ${
                            achievement.unlocked ? 'text-emerald-300' : 'text-slate-400'
                          }`}>
                            {achievement.title}
                          </div>
                          {achievement.unlocked && achievement.reward && (
                            <div className="text-xs text-purple-300 mt-1">
                              ✅ {achievement.reward}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Get Help Section */}
                <div className="mt-8 p-4 bg-slate-700/50 rounded-xl">
                  <h5 className="text-white font-medium mb-3">Need More Help?</h5>
                  <div className="space-y-2">
                    <a
                      href="/help/support"
                      className="flex items-center text-blue-400 hover:text-blue-300 text-sm transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contact Support
                    </a>
                    <a
                      href="/help/docs"
                      className="flex items-center text-blue-400 hover:text-blue-300 text-sm transition-colors"
                    >
                      <Book className="w-4 h-4 mr-2" />
                      View Full Documentation
                    </a>
                    <a
                      href="/help/tutorials"
                      className="flex items-center text-blue-400 hover:text-blue-300 text-sm transition-colors"
                    >
                      <Lightbulb className="w-4 h-4 mr-2" />
                      More Tutorials
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Help Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          const currentHelp = getContextHelp()
          setCurrentTutorial(TUTORIAL_STEPS.indexOf(currentHelp))
          setIsTutorialActive(true)
          setIsOpen(true)
        }}
        className="fixed top-1/2 right-6 bg-slate-800 text-white p-3 rounded-full shadow-xl hover:shadow-2xl transition-all z-40 border border-slate-700"
      >
        <Target className="w-5 h-5" />
        <div className="absolute -bottom-8 right-0 bg-slate-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Need Help?
        </div>
      </motion.button>
    </>
  )
}

// Quick Tip Component for individual pages
export function QuickTip({ tip, onDismiss }: { tip: string, onDismiss?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-blue-400 font-medium mb-1">Quick Tip</h4>
            <p className="text-blue-300 text-sm">{tip}</p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  )
}

// Progress Indicator Component
export function OnboardingProgress({ currentStep, totalSteps, title }: {
  currentStep: number
  totalSteps: number
  title: string
}) {
  const progress = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className="mb-6 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-medium">{title}</h3>
        <span className="text-slate-400 text-sm">
          {currentStep + 1} of {totalSteps}
        </span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
        />
      </div>
      <p className="text-slate-400 text-sm mt-2">
        {totalSteps - currentStep - 1} steps remaining
      </p>
    </div>
  )
}

// Export all help components
export { TUTORIAL_STEPS, USER_ACHIEVEMENTS }
