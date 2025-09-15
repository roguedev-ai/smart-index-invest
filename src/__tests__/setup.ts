import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    query: {},
    pathname: '/',
  }),
}))

// Mock dynamic imports
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (component: any) => component,
}))

// Mock window.ethereum
Object.defineProperty(window, 'ethereum', {
  value: {
    isMetaMask: true,
    request: jest.fn(),
    selectedAddress: '0x1234567890123456789012345678901234567890',
    connect: jest.fn(),
    disconnect: jest.fn(),
  },
})

// Global test helpers
global.fetch = jest.fn()
global.console = {
  ...console,
  // Uncomment to see console logs during tests
  // log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}
