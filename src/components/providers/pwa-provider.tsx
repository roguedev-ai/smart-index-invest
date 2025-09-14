"use client"

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

// PWA Context Type
type PWAContextType = {
  isInstallable: boolean
  isInstalled: boolean
  isStandalone: boolean
  promptInstall: () => void
  deferredPrompt: BeforeInstallPromptEvent | null
  userChoice: 'accepted' | 'dismissed' | null
  isSupported: boolean
  swStatus: 'registering' | 'registered' | 'error' | null
  updateAvailable: boolean
  updateSW: () => void
}

// Create PWA Context
const PWAContext = createContext<PWAContextType | undefined>(undefined)

// PWA Provider Props
type PWAProviderProps = {
  children: React.ReactNode
}

// Platform Detection
const getDeviceInfo = () => {
  const ua = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua)
  const isAndroid = /Android/.test(ua)
  const isMacOS = /Mac OS/.test(ua)
  const isWindows = /Windows/.test(ua)
  const isLinux = /Linux/.test(ua)

  return {
    isIOS,
    isAndroid,
    isMacOS,
    isWindows,
    isLinux,
    isMobile: isIOS || isAndroid,
    isDesktop: isMacOS || isWindows || isLinux
  }
}

// PWA Provider Component
export function PWAProvider({ children }: PWAProviderProps) {
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [userChoice, setUserChoice] = useState<'accepted' | 'dismissed' | null>(null)
  const [swStatus, setSwStatus] = useState<'registering' | 'registered' | 'error' | null>(null)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  // Device compatibility detection
  const deviceInfo = getDeviceInfo()
  const isSupported = typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'BeforeInstallPromptEvent' in window

  // Check if running in standalone mode (PWA)
  const checkStandaloneMode = useCallback(() => {
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')

    setIsStandalone(isStandaloneMode)
    return isStandaloneMode
  }, [])

  // Check if already installed
  const checkInstallStatus = useCallback(() => {
    if (typeof window === 'undefined') return

    // Check various installation indicators
    const isRelatedApp = (navigator as any)?.getInstalledRelatedApps?.() || []
    const isRelatedInstalled = isRelatedApp.length > 0

    // Check for service worker registration
    const hasSW = 'serviceWorker' in navigator

    // iOS specific check
    const isiOSInstalled = deviceInfo.isIOS && window.navigator.standalone

    // Android specific check
    const isAndroidInstalled = deviceInfo.isAndroid && (navigator as any).isAppInstalled

    setIsInstalled(isRelatedInstalled || isiOSInstalled || isAndroidInstalled || false)
  }, [deviceInfo])

  // Handle installation prompt
  useEffect(() => {
    if (!isSupported) return

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()

      // Store the event for later use
      setDeferredPrompt(e)
      setIsInstallable(true)

      // Log install prompt
      console.log('📱 Install prompt available')

      // Track prompt display
      if (typeof window !== 'undefined' && (window as any).gtag) {
        ;(window as any).gtag('event', 'pwa_install_prompt_shown', {
          event_category: 'pwa',
          event_label: 'install_prompt',
          non_interaction: true
        })
      }
    }

    const handleAppInstalled = () => {
      console.log('🎉 PWA was installed')

      // Clear deferred prompt
      setDeferredPrompt(null)
      setIsInstallable(false)
      setIsInstalled(true)

      // Track installation
      if (typeof window !== 'undefined' && (window as any).gtag) {
        ;(window as any).gtag('event', 'pwa_installed', {
          event_category: 'pwa',
          event_label: 'app_install'
        })
      }
    }

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any)

    // Listen for app installation
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isSupported])

  // Service worker registration
  useEffect(() => {
    if (!isSupported) return

    const registerServiceWorker = async () => {
      try {
        setSwStatus('registering')

        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })

        setRegistration(registration)

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New content available
                  setUpdateAvailable(true)
                  console.log('🎉 Service worker update available')
                }
              }
            })
          }
        })

        setSwStatus('registered')
        console.log('✅ Service worker registered:', registration)

      } catch (error) {
        console.error('❌ Service worker registration failed:', error)
        setSwStatus('error')
      }
    }

    registerServiceWorker()
  }, [isSupported])

  // Check installation status on mount
  useEffect(() => {
    checkStandaloneMode()
    checkInstallStatus()
  }, [checkStandaloneMode, checkInstallStatus])

  // Prompt installation function
  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      console.warn('🚫 No install prompt available')
      return
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt()

      // Wait for user choice
      const choice = await deferredPrompt.userChoice

      setUserChoice(choice.outcome)
      console.log(`👤 User choice: ${choice.outcome}`)

      // Track user choice
      if (typeof window !== 'undefined' && (window as any).gtag) {
        ;(window as any).gtag('event', 'pwa_install_prompt_choice', {
          event_category: 'pwa',
          event_label: choice.outcome,
          value: choice.outcome === 'accepted' ? 1 : 0
        })
      }

      // Clear prompt
      setDeferredPrompt(null)
      setIsInstallable(false)

    } catch (error) {
      console.error('❌ Install prompt failed:', error)
    }
  }, [deferredPrompt])

  // Update service worker
  const updateSW = useCallback(() => {
    if (!registration?.waiting) return

    // Tell the new SW to skip waiting
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })

    // Listen for new SW to take control
    window.addEventListener('controllerchange', () => {
      window.location.reload()
    })

    setUpdateAvailable(false)
    console.log('🔄 Service worker updating...')
  }, [registration])

  // Context value
  const value: PWAContextType = {
    isInstallable,
    isInstalled,
    isStandalone,
    promptInstall,
    deferredPrompt,
    userChoice,
    isSupported,
    swStatus,
    updateAvailable,
    updateSW
  }

  return (
    <PWAContext.Provider value={value}>
      {children}
    </PWAContext.Provider>
  )
}

// PWA Hook
export function usePWA() {
  const context = useContext(PWAContext)
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider')
  }
  return context
}

// Installation Banner Component
export function InstallBanner() {
  const { isInstallable, promptInstall, userChoice } = usePWA()
  const [dismissed, setDismissed] = useState(false)

  // Don't show if not installable, already installed, or dismissed
  if (!isInstallable || dismissed || userChoice === 'dismissed') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 sm:left-auto sm:right-4 sm:max-w-sm">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-white/70 hover:text-white"
      >
        ×
      </button>

      <div className="flex items-center mb-2">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
          📱
        </div>
        <h3 className="font-semibold">Install TokenMarket</h3>
      </div>

      <p className="text-sm mb-3 text-white/90">
        Get the full mobile experience with offline access and push notifications
      </p>

      <button
        onClick={promptInstall}
        className="w-full bg-white text-blue-600 py-2 px-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
      >
        Install App
      </button>
    </div>
  )
}

// Update Banner Component
export function UpdateBanner() {
  const { updateAvailable, updateSW } = usePWA()
  const [dismissed, setDismissed] = useState(false)

  if (!updateAvailable || dismissed) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 sm:left-auto sm:right-4 sm:max-w-sm">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-white/70 hover:text-white"
      >
        ×
      </button>

      <div className="flex items-center mb-2">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
          🔄
        </div>
        <h3 className="font-semibold">Update Available</h3>
      </div>

      <p className="text-sm mb-3 text-white/90">
        New version ready! Install now for the latest features.
      </p>

      <button
        onClick={updateSW}
        className="w-full bg-white text-green-600 py-2 px-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
      >
        Update Now
      </button>
    </div>
  )
}

// Device Detection Hook
export function useDevice() {
  const [deviceInfo, setDeviceInfo] = useState(getDeviceInfo())

  useEffect(() => {
    setDeviceInfo(getDeviceInfo())
  }, [])

  return {
    ...deviceInfo,
    // Helper computed properties
    isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    supportsPWA: 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window,
    isOnline: navigator.onLine
  }
}

// Offline Detection Hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [connectionType] = useState(() => {
    const connection = (navigator as any).connection ||
                      (navigator as any).mozConnection ||
                      (navigator as any).webkitConnection

    return connection?.effectiveType || 'unknown'
  })

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline, connectionType }
}

// Battery Status Hook
export function useBatteryStatus() {
  const [battery, setBattery] = useState<{
    level: number
    charging: boolean
    chargingTime: number
    dischargingTime: number
  } | null>(null)

  useEffect(() => {
    if (!(navigator as any).getBattery) return

    ;(navigator as any).getBattery().then((batteryManager: any) => {
      setBattery({
        level: batteryManager.level,
        charging: batteryManager.charging,
        chargingTime: batteryManager.chargingTime,
        dischargingTime: batteryManager.dischargingTime
      })

      batteryManager.addEventListener('levelchange', () => {
        setBattery(prev => prev ? {
          ...prev,
          level: batteryManager.level
        } : null)
      })

      batteryManager.addEventListener('chargingchange', () => {
        setBattery(prev => prev ? {
          ...prev,
          charging: batteryManager.charging
        } : null)
      })
    }).catch(() => {
      // Battery API not supported or failed
      setBattery(null)
    })
  }, [])

  return battery
}

// Export types
export type { PWAContextType }
