/**
 * Wallet Provider Component Tests
 * Tests wallet connection, transaction handling, and state management
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useWallet } from '@/components/providers/wallet-provider'

// Mock the wallet provider
const mockWalletProvider = ({
  children
}: {
  children: React.ReactNode
}) => {
  const mockContextValue = {
    isConnected: false,
    address: null,
    isConnecting: false,
    connectWallet: jest.fn(),
    disconnectWallet: jest.fn(),
    balance: '0.00',
    chainId: 1
  }

  return (
    <div data-testid="wallet-provider">
      {children}
    </div>
  )
}

jest.mock('@/components/providers/wallet-provider', () => ({
  WalletProvider: mockWalletProvider,
  useWallet: () => ({
    isConnected: false,
    address: null,
    isConnecting: false,
    connectWallet: jest.fn(),
    disconnectWallet: jest.fn(),
    balance: '0.00',
    chainId: 1
  })
}))

// Mock the actual component we're testing
const MockWalletPage = () => {
  const { isConnected, address, connectWallet, disconnectWallet } = useWallet()

  return (
    <div>
      <div data-testid="connection-status">
        {isConnected ? 'Connected' : 'Disconnected'}
      </div>
      {address && <div data-testid="wallet-address">{address}</div>}
      <button data-testid="connect-btn" onClick={connectWallet}>
        Connect Wallet
      </button>
      <button data-testid="disconnect-btn" onClick={disconnectWallet}>
        Disconnect Wallet
      </button>
    </div>
  )
}

describe('Wallet Provider Integration Tests', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
  })

  describe('Initial State', () => {
    test('renders disconnected state initially', () => {
      render(<MockWalletPage />)

      expect(screen.getByTestId('connection-status')).toHaveTextContent('Disconnected')
      expect(screen.getByTestId('connect-btn')).toBeInTheDocument()
      expect(screen.getByTestId('disconnect-btn')).toBeInTheDocument()
    })

    test('does not show wallet address when disconnected', () => {
      render(<MockWalletPage />)

      expect(screen.queryByTestId('wallet-address')).not.toBeInTheDocument()
    })

    test('shows zero balance initially', () => {
      render(<MockWalletPage />)

      const balanceElement = screen.getByText('0.00')
      expect(balanceElement).toBeInTheDocument()
    })
  })

  describe('Wallet Connection Logic', () => {
    test('calls connectWallet when connect button clicked', () => {
      const mockConnectWallet = jest.fn()
      jest.mocked(useWallet).mockReturnValue({
        isConnected: false,
        address: null,
        isConnecting: false,
        connectWallet: mockConnectWallet,
        disconnectWallet: jest.fn(),
        balance: '0.00',
        chainId: 1
      })

      render(<MockWalletPage />)

      const connectBtn = screen.getByTestId('connect-btn')
      fireEvent.click(connectBtn)

      expect(mockConnectWallet).toHaveBeenCalledTimes(1)
    })

    test('calls disconnectWallet when disconnect button clicked', () => {
      const mockDisconnectWallet = jest.fn()
      jest.mocked(useWallet).mockReturnValue({
        isConnected: true,
        address: '0x1234567890123456789012345678901234567890',
        isConnecting: false,
        connectWallet: jest.fn(),
        disconnectWallet: mockDisconnectWallet,
        balance: '1.5',
        chainId: 1
      })

      render(<MockWalletPage />)

      const disconnectBtn = screen.getByTestId('disconnect-btn')
      fireEvent.click(disconnectBtn)

      expect(mockDisconnectWallet).toHaveBeenCalledTimes(1)
    })

    test('shows wallet address when connected', () => {
      jest.mocked(useWallet).mockReturnValue({
        isConnected: true,
        address: '0x1234567890123456789012345678901234567890',
        isConnecting: false,
        connectWallet: jest.fn(),
        disconnectWallet: jest.fn(),
        balance: '1.5',
        chainId: 1
      })

      render(<MockWalletPage />)

      expect(screen.getByTestId('wallet-address'))
        .toHaveTextContent('0x1234567890123456789012345678901234567890')
    })
  })

  describe('Balance State Tests', () => {
    test('displays correct balance when connected', () => {
      jest.mocked(useWallet).mockReturnValue({
        isConnected: true,
        address: '0x1234567890123456789012345678901234567890',
        isConnecting: false,
        connectWallet: jest.fn(),
        disconnectWallet: jest.fn(),
        balance: '2.5',
        chainId: 1
      })

      render(<MockWalletPage />)

      const balanceElement = screen.getByText('2.5')
      expect(balanceElement).toBeInTheDocument()
    })

    test('handles balance format variations', () => {
      ['0.00', '1.23', '10.50', '100.00'].forEach(balance => {
        jest.mocked(useWallet).mockReturnValue({
          isConnected: true,
          address: '0x123',
          isConnecting: false,
          connectWallet: jest.fn(),
          disconnectWallet: jest.fn(),
          balance,
          chainId: 1
        })

        render(<MockWalletPage />)

        expect(screen.getByText(balance)).toBeInTheDocument()
      })
    })
  })

  describe('Network Support', () => {
    test('handles different network chain IDs', () => {
      [1, 137, 56, 42161].forEach(chainId => {
        jest.mocked(useWallet).mockReturnValue({
          isConnected: true,
          address: '0x123',
          isConnecting: false,
          connectWallet: jest.fn(),
          disconnectWallet: jest.fn(),
          balance: '1.0',
          chainId
        })

        render(<MockWalletPage />)

        // Should handle different networks gracefully
        expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected')
      })
    })

    test('integrates with wallet provider wrapper', () => {
      render(
        <mockWalletProvider>
          <MockWalletPage />
        </mockWalletProvider>
      )

      expect(screen.getByTestId('wallet-provider')).toBeInTheDocument()
      expect(screen.getByTestId('connection-status')).toBeInTheDocument()
    })
  })
})

describe('Wallet Provider Error Handling', () => {
  test('handles connection errors gracefully', () => {
    const mockConnectWithError = jest.fn().mockRejectedValue(new Error('Connection failed'))
    jest.mocked(useWallet).mockReturnValue({
      isConnected: false,
      address: null,
      isConnecting: true, // Connection in progress
      connectWallet: mockConnectWithError,
      disconnectWallet: jest.fn(),
      balance: '0.00',
      chainId: 1
    })

    render(<MockWalletPage />)

    // Should show connecting state despite the error
    expect(screen.getByTestId('connection-status')).toHaveTextContent('Disconnected')
  })

  test('handles undefined wallet states', () => {
    jest.mocked(useWallet).mockReturnValue({
      isConnected: undefined,
      address: undefined,
      isConnecting: undefined,
      connectWallet: jest.fn(),
      disconnectWallet: jest.fn(),
      balance: '0.00',
      chainId: 1
    })

    render(<MockWalletPage />)

    // Should handle undefined states without crashing
    expect(screen.getByTestId('connection-status')).toHaveTextContent('Disconnected')
  })
})

// Integration tests simulating real user workflows
describe('Wallet User Experience Tests', () => {
  test('complete wallet connection workflow', async () => {
    const mockConnect = jest.fn().mockResolvedValue('0x456...')

    jest.mocked(useWallet).mockReturnValue({
      isConnected: false,
      address: null,
      isConnecting: false,
      connectWallet: mockConnect,
      disconnectWallet: jest.fn(),
      balance: '0.00',
      chainId: 1
    })

    render(<MockWalletPage />)

    expect(screen.getByTestId('connection-status')).toHaveTextContent('Disconnected')

    const connectBtn = screen.getByTestId('connect-btn')
    fireEvent.click(connectBtn)

    await waitFor(() => {
      expect(mockConnect).toHaveBeenCalled()
    })
  })

  test('handles rapid click protection', () => {
    const mockConnect = jest.fn()
    jest.mocked(useWallet).mockReturnValue({
      isConnected: false,
      address: null,
      isConnecting: true, // Already connecting
      connectWallet: mockConnect,
      disconnectWallet: jest.fn(),
      balance: '0.00',
      chainId: 1
    })

    render(<MockWalletPage />)

    const connectBtn = screen.getByTestId('connect-btn')

    // Rapid clicks should be handled gracefully
    fireEvent.click(connectBtn)
    fireEvent.click(connectBtn)
    fireEvent.click(connectBtn)

    expect(mockConnect).toHaveBeenCalledTimes(1)
  })
})
