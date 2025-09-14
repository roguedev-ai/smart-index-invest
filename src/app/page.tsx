import { HeroSection } from "@/components/sections/hero-section"
import { WalletCreationGuide } from "@/components/help/simple-help"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />

      {/* Wallet Creation Showcase Section */}
      <section className="py-12 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <WalletCreationGuide />

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Why Choose TokenMarket?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="text-3xl mb-3">⚡</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Lightning Fast</h3>
                  <p className="text-gray-600 text-sm">
                    Create and deploy tokens in under 10 minutes
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="text-3xl mb-3">🛡️</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Enterprise Security</h3>
                  <p className="text-gray-600 text-sm">
                    Bank-grade encryption and audit trails
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="text-3xl mb-3">🌐</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Multi-Chain Support</h3>
                  <p className="text-gray-600 text-sm">
                    Deploy on Ethereum, Polygon, BSC, and more
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TokenCreationIntro />
    </div>
  )
}

function TokenCreationIntro() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Create Your Token?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join thousands of developers and businesses who have launched their tokens with our platform.
          </p>
        </div>
        <div className="text-center">
          <a
            href="/create"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Start Creating Your Token
            <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
