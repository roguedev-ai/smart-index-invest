// Type declarations for Ethereum provider
interface EthereumProvider {
  request: (request: { method: string; params?: unknown[] }) => Promise<unknown>
  isMetaMask?: boolean
  on: (event: string, callback: (...args: unknown[]) => void) => void
  removeListener: (event: string, callback: (...args: unknown[]) => void) => void
}

declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
}

export {}
