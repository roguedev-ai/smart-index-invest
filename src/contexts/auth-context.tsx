"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ethers } from 'ethers'

// User authentication state types
export interface User {
  id: string
  address: string
  displayName?: string
  avatar?: string
  walletType: 'external' | 'web'
  kycStatus: 'none' | 'pending' | 'verified' | 'rejected'
  email?: string
  joinedAt: Date
  lastActive: Date
  smartIndexes: string[] // Index IDs created by user
  boughtIndexes: string[] // Index IDs user has invested in
  stats: UserStats
}

export interface UserStats {
  totalInvested: number
  totalWithdraws: number
  createdIndexes: number
  followedIndexes: number
  winRate: number
  avgPerformance: number
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (address: string, walletType?: 'external' | 'web') => Promise<void>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  connectWallet: () => Promise<void>
  switchWallet: (address: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        // Check localStorage for stored wallet/wallet session
        const storedWallet = localStorage.getItem('tokenmarket_wallet')
        const storedUser = localStorage.getItem('tokenmarket_user')

        if (storedWallet && storedUser) {
          const walletData = JSON.parse(storedWallet)
          const userData = JSON.parse(storedUser)

          setUser({
            ...userData,
            address: walletData.address,
            walletType: 'web',
            lastActive: new Date()
          })
        } else if (window.ethereum) {
          // Check if MetaMask is connected
          try {
            const accounts = await window.ethereum.request({
              method: 'eth_accounts'
            }) as string[]

            if (accounts && accounts.length > 0) {
              await login(accounts[0], 'external')
            }
          } catch (error) {
            console.log('No existing MetaMask connection')
          }
        }
      } catch (error) {
        console.error('Error checking session:', error)
        localStorage.removeItem('tokenmarket_wallet')
        localStorage.removeItem('tokenmarket_user')
      } finally {
        setIsLoading(false)
      }
    }

    checkExistingSession()
  }, [])

  const login = async (address: string, walletType: 'external' | 'web' = 'web') => {
    if (!address) {
      throw new Error('Wallet address is required')
    }

    const newUser: User = {
      id: `user_${address.slice(0, 8)}`,
      address,
      walletType,
      kycStatus: 'none',
      displayName: walletType === 'web' ? 'Web Wallet User' : 'MetaMask User',
      joinedAt: new Date(),
      lastActive: new Date(),
      smartIndexes: [],
      boughtIndexes: [],
      stats: {
        totalInvested: 0,
        totalWithdraws: 0,
        createdIndexes: 0,
        followedIndexes: 0,
        winRate: 0,
        avgPerformance: 0
      }
    }

    setUser(newUser)

    // Store user session
    localStorage.setItem('tokenmarket_user', JSON.stringify({
      ...newUser,
      joinedAt: newUser.joinedAt.toISOString(),
      lastActive: newUser.lastActive.toISOString()
    }))

    // Trigger welcome notification
    showNotification('Welcome to TokenMarket! 🎉', 'success')
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('tokenmarket_wallet')
    localStorage.removeItem('tokenmarket_user')
    showNotification('Logged out successfully', 'info')
  }

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null

      const updatedUser = { ...prev, ...updates }

      // Update stored user data
      localStorage.setItem('tokenmarket_user', JSON.stringify({
        ...updatedUser,
        joinedAt: updatedUser.joinedAt.toISOString(),
        lastActive: new Date().toISOString()
      }))

      return updatedUser
    })
  }

  const connectWallet = async () => {
    if (!window.ethereum) {
      throw new Error('Please install MetaMask or another Web3 wallet')
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      }) as string[]

      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      // Check network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })

      // For now, accept any network but recommend Ethereum mainnet
      if (chainId !== '0x1') {
        showNotification('Consider switching to Ethereum mainnet for full functionality', 'warning')
      }

      await login(accounts[0], 'external')

    } catch (error: any) {
      console.error('Wallet connection error:', error)

      if (error.code === 4001) {
        throw new Error('User rejected wallet connection')
      } else if (error.code === -32002) {
        throw new Error('Request already pending. Please check your wallet')
      } else {
        throw new Error(error.message || 'Failed to connect wallet')
      }
    }
  }

  const switchWallet = async (address: string) => {
    if (!address) {
      throw new Error('Wallet address is required')
    }

    await login(address, user?.walletType || 'external')
  }

  // Redirect to dashboard after login
  useEffect(() => {
    if (user && !isLoading) {
      // Auto-redirect to dashboard on successful login
      if (typeof window !== 'undefined' && window.location.pathname === '/') {
        window.location.href = '/dashboard/user-dashboard'
      }
    }
  }, [user, isLoading])

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      updateUser,
      connectWallet,
      switchWallet
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// Notification helper
function showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info') {
  // In production, this would integrate with React Hot Toast or similar
  console.log(`[${type.toUpperCase()}] ${message}`)

  // For now, use browser alert (replace with proper notification system)
  if (typeof window !== 'undefined') {
    if (type === 'error') {
      alert(`❌ ${message}`)
    } else if (type === 'success') {
      alert(`✅ ${message}`)
    }
  }
}

// Add ethereum to window type
declare global {
  interface Window {
    ethereum?: any
  }
}
