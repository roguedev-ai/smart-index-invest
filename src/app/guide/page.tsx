import { OnboardingChecklist, TokenCreationTips } from "@/components/help/simple-help"

export default function UserGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            TokenMarket User Guide
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your complete guide to creating tokens, managing wallets, and building successful projects on TokenMarket.
          </p>
        </header>

        {/* Quick Start Checklist */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Start Checklist</h2>
          <OnboardingChecklist walletCreated={false} tokenCreated={false} />
        </div>

        {/* Getting Started Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🚀 Getting Started</h2>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Create Your Wallet</h3>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="text-blue-600 mr-4">1️⃣</div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Visit Our Homepage</h4>
                    <p className="text-blue-800">
                      Navigate to TokenMarket and you'll see our wallet creation guide prominently displayed.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="text-blue-600 mr-4">2️⃣</div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Click "Create Wallet Now"</h4>
                    <p className="text-blue-800">
                      Click the prominent blue button on our homepage to start the wallet creation process.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="text-blue-600 mr-4">3️⃣</div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Choose Your Wallet Name</h4>
                    <p className="text-blue-800">
                      Give your wallet a memorable name like "My Crypto Wallet" or "DeFi Holdings".
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="text-blue-600 mr-4">4️⃣</div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Set a Strong Password</h4>
                    <p className="text-blue-800">
                      Create a password with at least 6 characters. We recommend using letters,
                      numbers, and special characters.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="text-blue-600 mr-4">5️⃣</div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Confirm Your Password</h4>
                    <p className="text-blue-800">
                      Re-enter your password to confirm it's correct and complete wallet creation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Helpful Tip */}
          <TokenCreationTips step="name" />

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h4 className="text-green-900 font-semibold mb-2">🎉 Congratulations!</h4>
            <p className="text-green-800">
              Once created, you'll receive a unique wallet address and be able to start creating tokens.
              Your wallet information is securely stored locally - you maintain full control.
            </p>
          </div>
        </section>

        {/* Security Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🔐 Security & Best Practices</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Password Security</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Use at least 8-12 characters
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Include uppercase and lowercase letters
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Add numbers and special characters
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Don't reuse passwords from other services
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Protection</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🛡️</span>
                  All data stored locally on your device
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🛡️</span>
                  No private keys sent to our servers
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🛡️</span>
                  Use trusted WiFi networks
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">🛡️</span>
                  Keep your operating system updated
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Token Creation Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🏗️ Creating Your First Token</h2>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Creation Process</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900">Step 1: Choose Token Type</h4>
                <p className="text-gray-600 mt-1">
                  Select from Standard ERC20, Flexible, Commercial, or Security token types.
                  Each type has different features optimized for specific use cases.
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-gray-900">Step 2: Define Token Details</h4>
                <p className="text-gray-600 mt-1">
                  Set your token name, symbol, total supply, and decimal places.
                  Choose wisely as these decisions are permanent on the blockchain.
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-gray-900">Step 3: Add Branding & Features</h4>
                <p className="text-gray-600 mt-1">
                  Upload logos, set descriptions, and configure advanced features
                  like burnability, mintability, and transfer restrictions.
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-gray-900">Step 4: Deploy to Network</h4>
                <p className="text-gray-600 mt-1">
                  Choose your blockchain network (Ethereum, Polygon, BSC, etc.)
                  and deploy your token. The process typically takes 2-3 minutes.
                </p>
              </div>
            </div>
          </div>

          {/* Tips for Each Step */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TokenCreationTips step="name" />
            <TokenCreationTips step="features" />
          </div>
        </section>

        {/* Common Questions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">❓ Frequently Asked Questions</h2>

          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do I need MetaMask or other external wallets?
              </h3>
              <p className="text-gray-600">
                No! TokenMarket's web wallet system is completely self-contained.
                You create a secure wallet directly in your browser without downloading or installing anything.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How much does token creation cost?
              </h3>
              <p className="text-gray-600">
                TokenMarket offers flexible pricing starting at $49 for basic tokens.
                Costs depend on token complexity, network selection, and advanced features.
                You only pay network fees (gas) for deployment, not monthly subscriptions.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I deploy on multiple networks?
              </h3>
              <p className="text-gray-600">
                Absolutely! TokenMarket supports deployment across multiple blockchains
                including Ethereum, Polygon, BSC, Arbitrum, and Optimism. You can even
                deploy the same token contract on multiple networks.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is my data and funds safe?
              </h3>
              <p className="text-gray-600">
                Yes! Your private keys and sensitive data are never sent to our servers.
                All wallet information is encrypted and stored locally on your device.
                You maintain full control and ownership of your funds at all times.
              </p>
            </div>
          </div>
        </section>

        {/* Getting Help */}
        <section className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Need More Help?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            If you need assistance at any point in your journey,
            our help system is available 24/7 on every page of TokenMarket.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/help"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🎯 Help & Support
            </a>
            <a
              href="/create"
              className="inline-flex items-center px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              🚀 Start Creating
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
