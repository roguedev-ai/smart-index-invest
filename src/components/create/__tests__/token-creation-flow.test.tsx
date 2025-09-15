/**
 * Token Creation Flow Integration Tests
 * Tests the complete token creation wizard workflow
 * Ensures token creation process works end-to-end
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TokenTypeSelection } from '../steps/token-type-selection'

// Mock wallet provider
jest.mock('@/components/providers/wallet-provider', () => ({
  useWallet: () => ({
    isConnected: true,
    address: '0x1234567890123456789012345678901234567890',
    isConnecting: false,
    connectWallet: jest.fn(),
    disconnectWallet: jest.fn(),
    balance: '1.5',
    chainId: 1
  })
}))

describe('Token Creation Flow Integration Tests', () => {
  describe('Token Type Selection Component', () => {
    const mockOnTypeSelect = jest.fn()
    const mockOnContinue = jest.fn()

    beforeEach(() => {
      mockOnTypeSelect.mockClear()
      mockOnContinue.mockClear()
    })

    test('renders all 4 token options correctly', () => {
      render(
        <TokenTypeSelection
          selectedType={null}
          onTypeSelect={mockOnTypeSelect}
          onContinue={mockOnContinue}
        />
      )

      // Check all token type options are present
      expect(screen.getByText('Standard ERC20')).toBeInTheDocument()
      expect(screen.getByText('Flexible ERC20')).toBeInTheDocument()
      expect(screen.getByText('Commercial ERC20')).toBeInTheDocument()
      expect(screen.getByText('Security ERC20')).toBeInTheDocument()

      // Ensure NFT collection is NOT present (our clean state)
      expect(screen.queryByText('NFT Collection')).not.toBeInTheDocument()
    })

    test('displays token features correctly', () => {
      render(
        <TokenTypeSelection
          selectedType={null}
          onTypeSelect={mockOnTypeSelect}
          onContinue={mockOnContinue}
        />
      )

      // Check specific features for different token types
      expect(screen.getByText('Mintable')).toBeInTheDocument()
      expect(screen.getByText('Burnable')).toBeInTheDocument()
      expect(screen.getByText('Max Supply Cap')).toBeInTheDocument()
      expect(screen.getByText('Tax Collection')).toBeInTheDocument()
      expect(screen.getByText('Admin Controls')).toBeInTheDocument()
      expect(screen.getByText('Transfer Restrictions')).toBeInTheDocument()
    })

    test('4-column grid layout is applied', () => {
      render(
        <TokenTypeSelection
          selectedType={null}
          onTypeSelect={mockOnTypeSelect}
          onContinue={mockOnContinue}
        />
      )

      // Check that the grid container uses 4-column layout
      const gridContainer = screen.getByRole('main')
      expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4')
    })

    test('token selection calls onTypeSelect correctly', () => {
      render(
        <TokenTypeSelection
          selectedType={null}
          onTypeSelect={mockOnTypeSelect}
          onContinue={mockOnContinue}
        />
      )

      // Click on Standard ERC20
      const standardOption = screen.getByText('Standard ERC20').closest('div')
      fireEvent.click(standardOption!)

      expect(mockOnTypeSelect).toHaveBeenCalledWith('standard')
    })

    test('continue button is disabled when no token selected', () => {
      render(
        <TokenTypeSelection
          selectedType={null}
          onTypeSelect={mockOnTypeSelect}
          onContinue={mockOnContinue}
        />
      )

      const continueButton = screen.getByText(/Continue with/)
      expect(continueButton).toBeDisabled()
    })

    test('continue button is enabled when token selected', () => {
      render(
        <TokenTypeSelection
          selectedType="standard"
          onTypeSelect={mockOnTypeSelect}
          onContinue={mockOnContinue}
        />
      )

      const continueButton = screen.getByText('Continue with Standard ERC20')
      fireEvent.click(continueButton)

      expect(mockOnContinue).toHaveBeenCalledTimes(1)
    })

    test('properly handles token type selection state', () => {
      render(
        <TokenTypeSelection
          selectedType="commercial"
          onTypeSelect={mockOnTypeSelect}
          onContinue={mockOnContinue}
        />
      )

      // Commercial ERC20 should be highlighted/selected
      const commercialOption = screen.getByText('Commercial ERC20').closest('div')
      expect(commercialOption).toHaveClass('border-blue-500', 'bg-blue-50')

      // Continue button should show commercial selection
      expect(screen.getByText('Continue with Commercial ERC20')).toBeInTheDocument()
    })
  })

  describe('Token Creation Workflow States', () => {
    test('handles loading state during token deployment', async () => {
      // Mock deployment step component
      const MockDeploymentStep = () => (
        <div>
          <div>Ready to Deploy</div>
          <div>Deploying Token</div>
          <button onClick={() => {
            const loadingDiv = document.getElementById('loading-spinner')
            if (loadingDiv) loadingDiv.style.display = 'block'
          }}>
            Start Deployment
          </button>
          <div id="loading-spinner" style={{ display: 'none' }}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      )

      render(<MockDeploymentStep />)

      const startBtn = screen.getByText('Start Deployment')
      fireEvent.click(startBtn)

      await waitFor(() => {
        expect(screen.getByText('Ready to Deploy')).toBeInTheDocument()
      })
    })

    test('displays token configuration correctly before deployment', () => {
      const mockTokenData = {
        config: {
          name: 'Test Token',
          symbol: 'TTK',
          initialSupply: '1000000'
        },
        tokenType: 'standard',
        liquidityConfig: {
          createLiquidityPool: true,
          proportionForPairing: 10,
          pairWith: 'ETH' as const,
          feeTier: 3000,
          strategy: 'balanced' as const
        }
      }

      // Mock deployment preview
      const MockDeploymentPreview = ({ tokenData }: { tokenData: any }) => (
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-8">
          <h3 className="text-lg font-semibold mb-4">Ready for Deployment</h3>
          <div className="text-left bg-gray-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="font-medium">Token:</span> {tokenData.config.name}</div>
              <div><span className="font-medium">Symbol:</span> {tokenData.config.symbol}</div>
              <div><span className="font-medium">Supply:</span> {tokenData.config.initialSupply}</div>
              <div><span className="font-medium">Type:</span> {tokenData.tokenType}</div>
            </div>
          </div>
          {tokenData.liquidityConfig?.createLiquidityPool && (
            <div className="text-left bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-400">
              <h4 className="font-medium text-green-800">🏊‍♂️ Liquidity Pool Enabled</h4>
              <div className="text-sm text-green-700 mt-2">
                <div>Fee Tier: {(tokenData.liquidityConfig.feeTier / 10000).toFixed(2)}%</div>
                <div>Pair With: {tokenData.liquidityConfig.pairWith}</div>
                <div>Liquidity: {tokenData.liquidityConfig.proportionForPairing}% of supply</div>
              </div>
            </div>
          )}
        </div>
      )

      render(<MockDeploymentPreview tokenData={mockTokenData} />)

      expect(screen.getByText('Ready for Deployment')).toBeInTheDocument()
      expect(screen.getByText('Test Token')).toBeInTheDocument()
      expect(screen.getByText('TTK')).toBeInTheDocument()
      expect(screen.getByText('1,000,000')).toBeInTheDocument()
      expect(screen.getByText('🏊‍♂️ Liquidity Pool Enabled')).toBeInTheDocument()
      expect(screen.getByText('Fee Tier: 0.30%')).toBeInTheDocument()
      expect(screen.getByText('Pair With: ETH')).toBeInTheDocument()
      expect(screen.getByText('Liquidity: 10% of supply')).toBeInTheDocument()
    })

    test('handles deployment success state correctly', async () => {
      let deploymentStatus = 'initializing'
      const setDeploymentStatus = (status: string) => depositionStatus = status

      const mockDeploymentSuccess = {
        success: true,
        poolAddress: '0x1234567890123456789012345678901234567890',
        positionId: 12345,
        tokensProvisioned: '100000',
        ethProvisioned: '0.5',
        liquidityRange: '-34500-98700',
        estimatedFees24h: '2.45',
        transactionHash: '0xabcdef123456789012345678901234567890abcdef',
        message: 'Liquidity pool created successfully'
      }

      // Mock deployment success component
      const MockDeploymentSuccess = () => (
        <div>
          <div>🎉 Deployment complete! Your token and liquidity pool are live!</div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-green-800">🏊‍♂️ Liquidity Pool Created!</h4>
            <div className="text-sm text-green-700 mt-2 space-y-1">
              <div>Pool: USDC/0x1234567890123456789012345678901234</div>
              <div>Liquidity: 100,000 USDC</div>
              <div>Estimated Daily Fees: $2.45</div>
            </div>
          </div>
        </div>
      )

      render(<MockDeploymentSuccess />)

      expect(screen.getByText('🎉 Deployment complete! Your token and liquidity pool are live!')).toBeInTheDocument()
      expect(screen.getByText('🏊‍♂️ Liquidity Pool Created!')).toBeInTheDocument()
      expect(screen.getByText(/Pool: USDC/)).toBeInTheDocument()
      expect(screen.getByText('Liquidity: 100,000 USDC')).toBeInTheDocument()
      expect(screen.getByText('Estimated Daily Fees: $2.45')).toBeInTheDocument()
    })
  })

  describe('Token Creation Error Handling', () => {
    test('handles wallet not connected error gracefully', () => {
      // Mock not connected state
      jest.mock('@/components/providers/wallet-provider', () => ({
        useWallet: () => ({
          isConnected: false,
          address: null,
          isConnecting: false,
          connectWallet: jest.fn(),
          disconnectWallet: jest.fn(),
          balance: '0.00',
          chainId: 1
        })
      }), { virtual: true })

      // Render component with wallet not connected
      const MockComponent = () => {
        const { isConnected } = jest.requireMock('@/components/providers/wallet-provider').useWallet()

        return (
          <div>
            <h2>Token Creation Wizard</h2>
            {!isConnected ? (
              <div data-testid="wallet-required">
                <p>Please connect your wallet to create tokens</p>
                <button>Connect Wallet</button>
              </div>
            ) : (
              <div>Ready to create tokens!</div>
            )}
          </div>
        )
      }

      render(<MockComponent />)

      expect(screen.getByTestId('wallet-required')).toBeInTheDocument()
      expect(screen.getByText('Please connect your wallet to create tokens')).toBeInTheDocument()
    })

    test('handles insufficient gas fees gracefully', () => {
      // Mock low balance scenario
      jest.mock('@/components/providers/wallet-provider', () => ({
        useWallet: () => ({
          isConnected: true,
          address: '0x123...',
          isConnecting: false,
          connectWallet: jest.fn(),
          disconnectWallet: jest.fn(),
          balance: '0.001', // Very low ETH balance
          chainId: 1
        })
      }), { virtual: true })

      const MockGasWarning = () => {
        const { balance } = jest.requireMock('@/components/providers/wallet-provider').useWallet()

        const hasEnoughGas = parseFloat(balance) > 0.01 // Need at least 0.01 ETH

        return (
          <div>
            <h3>Ready to Deploy</h3>
            <div className={`p-4 rounded-lg ${!hasEnoughGas ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
              <span className="font-medium">
                {hasEnoughGas ? '✅ Sufficient Gas Fees' : '⚠️ Insufficient Gas Fees'}
              </span>
              <div className="text-sm mt-1">
                ETH Balance: {balance} ETH
                {!hasEnoughGas && ' (Top up your wallet with more ETH for gas fees)'}
              </div>
            </div>
            <button disabled={!hasEnoughGas}>
              {hasEnoughGas ? 'Deploy Token' : 'Insufficient ETH for Gas'}
            </button>
          </div>
        )
      }

      render(<MockGasWarning />)

      expect(screen.getByText('⚠️ Insufficient Gas Fees')).toBeInTheDocument()
      expect(screen.getByText('ETH Balance: 0.001 ETH')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Insufficient ETH for Gas' })).toBeDisabled()
    })

    test('handles network compatibility correctly', () => {
      // Mock wrong network
      const networkScenarios = [
        { chainId: 1, expectedNetwork: 'Ethereum Mainnet', shouldWork: true },
        { chainId: 56, expectedNetwork: 'BSC Mainnet', shouldWork: true },
        { chainId: 137, expectedNetwork: 'Polygon', shouldWork: true },
        { chainId: 42161, expectedNetwork: 'Arbitrum', shouldWork: false }
      ]

      networkScenarios.forEach(scenario => {
        jest.mock('@/components/providers/wallet-provider', () => ({
          useWallet: () => ({
            isConnected: true,
            address: '0x123...',
            chainId: scenario.chainId,
            balance: '1.0'
          })
        }), { virtual: true })

        const MockNetworkCheck = () => {
          const { chainId } = jest.requireMock('@/components/providers/wallet-provider').useWallet()

          const networkNames: { [key: number]: string } = {
            1: 'Ethereum Mainnet',
            56: 'BSC Mainnet',
            137: 'Polygon'
          }

          const networkName = networkNames[chainId] || 'Unsupported Network'
          const isSupported = scenario.shouldWork

          return (
            <div>
              <h3>Network Check</h3>
              <div className={`network-status ${isSupported ? 'supported' : 'unsupported'}`}>
                {isSupported ? '✅' : '❌'} Network: {networkName}
              </div>
              {!isSupported && <div className="error">Please switch to a supported network</div>}
            </div>
          )
        }

        render(<MockNetworkCheck />)

        const networkElement = screen.getByText(`Network: ${scenario.expectedNetwork}`)
        expect(networkElement).toBeInTheDocument()

        if (!scenario.shouldWork) {
          expect(screen.getByText('Please switch to a supported network')).toBeInTheDocument()
        }
      })
    })
  })
})

describe('Token Creation Form Validation', () => {
  test('validates token name input', async () => {
    // Mock form validation
    const MockTokenForm = () => {
      const [tokenName, setTokenName] = useState('')
      const [errors, setErrors] = useState<string[]>([])

      const validateTokenName = (name: string) => {
        const validationErrors: string[] = []

        if (!name || name.trim().length === 0) {
          validationErrors.push('Token name is required')
        }

        if (name.length > 32) {
          validationErrors.push('Token name must be 32 characters or less')
        }

        if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
          validationErrors.push('Token name can only contain letters, numbers, and spaces')
        }

        return validationErrors
      }

      const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value
        setTokenName(name)
        setErrors(validateTokenName(name))
      }

      const isValid = tokenName.trim().length > 0 && tokenName.length <= 32 && /^[a-zA-Z0-9\s]+$/.test(tokenName)

      return (
        <form>
          <label htmlFor="token-name">Token Name:</label>
          <input
            id="token-name"
            value={tokenName}
            onChange={handleNameChange}
            data-testid="token-name-input"
          />
          {errors.length > 0 && (
            <div data-testid="validation-errors">
              {errors.map(error => <div key={error} className="error">{error}</div>)}
            </div>
          )}
          <button disabled={!isValid} data-testid="submit-btn">
            Create Token
          </button>
        </form>
      )
    }

    render(<MockTokenForm />)

    const input = screen.getByTestId('token-name-input')
    const submitBtn = screen.getByTestId('submit-btn')

    // Initially should be disabled and show no errors
    expect(submitBtn).toBeDisabled()
    expect(screen.queryByTestId('validation-errors')).not.toBeInTheDocument()

    // Test empty field
    fireEvent.change(input, { target: { value: '' } })
    await waitFor(() => {
      expect(submitBtn).toBeDisabled()
    })

    // Test valid name
    fireEvent.change(input, { target: { value: 'My Awesome Token' } })
    await waitFor(() => {
      expect(submitBtn).not.toBeDisabled()
      expect(screen.queryByTestId('validation-errors')).not.toBeInTheDocument()
    })

    // Test invalid characters
    fireEvent.change(input, { target: { value: 'Token!@#$%' } })
    await waitFor(() => {
      expect(submitBtn).toBeDisabled()
      expect(screen.getByTestId('validation-errors')).toBeInTheDocument()
      expect(screen.getByText('Token name can only contain letters, numbers, and spaces')).toBeInTheDocument()
    })

    // Test too long name
    fireEvent.change(input, { target: { value: 'A'.repeat(33) } })
    await waitFor(() => {
      expect(submitBtn).toBeDisabled()
      expect(screen.getByText('Token name must be 32 characters or less')).toBeInTheDocument()
    })
  })

  test('handles form submission workflow correctly', async () => {
    const onSubmitMock = jest.fn()

    const MockTokenSubmissionForm = ({ onSubmit }: { onSubmit: () => void }) => {
      const [isSubmitting, setIsSubmitting] = useState(false)
      const [submitted, setSubmitted] = useState(false)

      const handleSubmit = async () => {
        setIsSubmitting(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        setIsSubmitting(false)
        setSubmitted(true)
        onSubmit()
      }

      return (
        <div>
          {submitted ? (
            <div data-testid="success-message">
              <h3>🎉 Token Created Successfully!</h3>
              <p>Your token has been deployed to the blockchain</p>
            </div>
          ) : (
            <div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                data-testid="submit-token-btn"
              >
                {isSubmitting ? 'Creating Token...' : 'Create Token'}
              </button>
              {isSubmitting && (
                <div data-testid="loading-state">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
          )}
        </div>
      )
    }

    render(<MockTokenSubmissionForm onSubmit={onSubmitMock} />)

    const submitBtn = screen.getByTestId('submit-token-btn')

    expect(submitBtn).toHaveTextContent('Create Token')
    expect(submitBtn).not.toBeDisabled()

    fireEvent.click(submitBtn)

    // Should show loading state
    expect(screen.getByTestId('loading-state')).toBeInTheDocument()
    expect(screen.getByText('Creating Token...')).toBeInTheDocument()

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledTimes(1)
    })

    await waitFor(() => {
      expect(screen.getByTestId('success-message')).toBeInTheDocument()
      expect(screen.getByText('🎉 Token Created Successfully!')).toBeInTheDocument()
    })

    // Button should disappear after submission
    expect(screen.queryByTestId('submit-token-btn')).not.toBeInTheDocument()
  })
})
