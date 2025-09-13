"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Simplified wallet context for now
interface WalletContextType {
  address: string | null
  isConnected: boolean
  isConnecting: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('Please install MetaMask or a Web3 compatible wallet')
      return
    }

    setIsConnecting(true)
    try {
      const accounts = await window.ethereum!.request({ method: 'eth_requestAccounts' }) as string[]
      if (accounts && accounts[0]) {
        setAddress(accounts[0])
        setIsConnected(true)
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
      alert('Failed to connect wallet. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAddress(null)
    setIsConnected(false)
  }

  // Auto-connect if already connected
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts && accounts[0]) {
            setAddress(accounts[0])
            setIsConnected(true)
          }
        })
        .catch(console.error)

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts && accounts[0]) {
          setAddress(accounts[0])
          setIsConnected(true)
        } else {
          disconnectWallet()
        }
      })

      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })
    }
  }, [])

  const value = {
    address,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}
