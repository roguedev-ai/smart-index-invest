"use client"

import { useState, useEffect } from 'react'
import { config } from '@/lib/config'

// Production configuration types
interface NetworkConfig {
  id: string
  name: string
  rpcUrl: string
  chainId: number
  explorerUrl: string
  enabled: boolean
  gasLimit: string
  maxFee: string
  priorityFee: string
}

interface TokenSettings {
  defaultSupply: string
  maxSupply: string
  burnable: boolean
  mintable: boolean
  pausable: boolean
  transferFeeEnabled: boolean
  transferFeeBPS: string // basis points
  ownerRenounceable: boolean
}

interface AdminUser {
  id: string
  username: string
  email: string
  role: 'super_admin' | 'admin' | 'moderator'
  permissions: string[]
  createdAt: string
  lastActive: string
}

const defaultNetworkSettings: NetworkConfig[] = [
  {
    id: 'ethereum',
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID',
    chainId: 1,
    explorerUrl: 'https://etherscan.io',
    enabled: true,
    gasLimit: '2000000',
    maxFee: '100',
    priorityFee: '2'
  },
  {
    id: 'polygon',
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com/',
    chainId: 137,
    explorerUrl: 'https://polygonscan.com',
    enabled: true,
    gasLimit: '2000000',
    maxFee: '250',
    priorityFee: '30'
  },
  {
    id: 'bsc',
    name: 'BSC Mainnet',
    rpcUrl: 'https://bsc-dataseed1.binance.org/',
    chainId: 56,
    explorerUrl: 'https://bscscan.com',
    enabled: true,
    gasLimit: '3000000',
    maxFee: '20',
    priorityFee: '3'
  }
]

export default function AdminSettingsPage() {
  // State management for different settings sections
  const [activeTab, setActiveTab] = useState('networks')
  const [networks, setNetworks] = useState<NetworkConfig[]>(defaultNetworkSettings)
  const [tokenSettings, setTokenSettings] = useState<TokenSettings>({
    defaultSupply: '1000000000',
    maxSupply: '1000000000000000',
    burnable: true,
    mintable: false,
    pausable: true,
    transferFeeEnabled: false,
    transferFeeBPS: '25',
    ownerRenounceable: true
  })

  const [apiKeys, setApiKeys] = useState({
    infuraProjectId: '',
    alchemyKey: '',
    moralisKey: '',
    epnsKey: '',
    coinmarketcapKey: ''
  })

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [saving, setSaving] = useState(false)
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    email: '',
    password: '',
    role: 'moderator' as AdminUser['role']
  })

  // Load settings from localStorage on component mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const storedNetworks = localStorage.getItem('networkSettings')
        if (storedNetworks) {
          setNetworks(JSON.parse(storedNetworks))
        }

        const storedTokens = localStorage.getItem('tokenSettings')
        if (storedTokens) {
          setTokenSettings(JSON.parse(storedTokens))
        }

        const storedApiKeys = localStorage.getItem('apiKeys')
        if (storedApiKeys) {
          setApiKeys(JSON.parse(storedApiKeys))
        }

        const storedAdmins = localStorage.getItem('adminUsers')
        if (storedAdmins) {
          setAdminUsers(JSON.parse(storedAdmins))
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
    loadSettings()
  }, [])

  // Save settings to localStorage
  const saveSettings = async (section: string, data: any) => {
    setSaving(true)
    try {
      localStorage.setItem(`${section}`, JSON.stringify(data))
      console.log(`${section} settings saved successfully`)

      // Simulate API call to save to backend
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Settings saved successfully!')
    } catch (error) {
      console.error(`Error saving ${section}:`, error)
      alert('Error saving settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Update network settings
  const updateNetwork = (networkId: string, updates: Partial<NetworkConfig>) => {
    setNetworks(prev => prev.map(net =>
      net.id === networkId ? { ...net, ...updates } : net
    ))
  }

  // Add new admin user
  const addAdminUser = async () => {
    if (!newAdmin.username || !newAdmin.email || !newAdmin.password) {
      alert('Please fill in all fields')
      return
    }

    const adminUser: AdminUser = {
      id: `admin_${Date.now()}`,
      username: newAdmin.username,
      email: newAdmin.email,
      role: newAdmin.role,
      permissions: getPermissionsByRole(newAdmin.role),
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    }

    const updatedUsers = [...adminUsers, adminUser]
    setAdminUsers(updatedUsers)
    await saveSettings('adminUsers', updatedUsers)

    // Reset form
    setNewAdmin({ username: '', email: '', password: '', role: 'moderator' })
  }

  // Helper function for role permissions
  const getPermissionsByRole = (role: AdminUser['role']): string[] => {
    switch (role) {
      case 'super_admin':
        return ['read', 'write', 'delete', 'manage_users', 'manage_settings', 'deploy_contracts']
      case 'admin':
        return ['read', 'write', 'manage_users', 'deploy_contracts']
      case 'moderator':
        return ['read', 'write']
      default:
        return ['read']
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Settings ⚙️</h1>
            <p className="text-gray-600">Production configuration and system management</p>
          </div>
          <div className="text-right">
            <button
              onClick={() => {
                saveSettings('networkSettings', networks)
                saveSettings('tokenSettings', tokenSettings)
                saveSettings('apiKeys', apiKeys)
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-medium disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save All Settings'}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="px-6">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'networks', label: '🌐 Networks', description: 'Blockchain RPC & Gas Settings' },
              { id: 'tokens', label: '🪙 Token Settings', description: 'Default Token Configurations' },
              { id: 'api', label: '🔑 API Keys', description: 'Third-party Service Keys' },
              { id: 'admins', label: '👥 Admin Users', description: 'User Management & Roles' },
              { id: 'security', label: '🔒 Security', description: 'Access & Encryption Settings' },
              { id: 'monitoring', label: '📊 Monitoring', description: 'Logs & Analytics' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center px-4 py-4 border-b-2 text-center min-w-0 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="text-lg mb-1">{tab.label}</span>
                <span className="text-xs text-gray-500">{tab.description}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">

        {/* Networks Tab */}
        {activeTab === 'networks' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Blockchain Network Configuration</h2>
              <p className="text-gray-600 mb-6">
                Configure RPC endpoints, gas settings, and network parameters for token deployment.
                Use your own Infura/Alchemy projects for production deployments.
              </p>

              <div className="space-y-6">
                {networks.map(network => (
                  <div key={network.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{network.name}</h3>
                        <p className="text-sm text-gray-600">Chain ID: {network.chainId}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={network.enabled}
                            onChange={(e) => updateNetwork(network.id, { enabled: e.target.checked })}
                            className="mr-2"
                          />
                          Enabled
                        </label>
                        <button
                          onClick={() => saveSettings('networkSettings', networks)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                        >
                          Save Network
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">RPC URL</label>
                        <input
                          type="text"
                          value={network.rpcUrl}
                          onChange={(e) => updateNetwork(network.id, { rpcUrl: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="https://mainnet.infura.io/v3/YOUR_PROJECT_ID"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Block Explorer</label>
                        <input
                          type="text"
                          value={network.explorerUrl}
                          onChange={(e) => updateNetwork(network.id, { explorerUrl: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="https://etherscan.io"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gas Limit</label>
                        <input
                          type="text"
                          value={network.gasLimit}
                          onChange={(e) => updateNetwork(network.id, { gasLimit: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="2000000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Fee (gwei)</label>
                        <input
                          type="text"
                          value={network.maxFee}
                          onChange={(e) => updateNetwork(network.id, { maxFee: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Priority Fee (gwei)</label>
                        <input
                          type="text"
                          value={network.priorityFee}
                          onChange={(e) => updateNetwork(network.id, { priorityFee: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="2"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Token Settings Tab */}
        {activeTab === 'tokens' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Token Template Configuration</h2>
              <p className="text-gray-600 mb-6">
                Set default parameters for token deployments. These settings determine
                what features users get by default and maximum allowed values.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Supply</label>
                    <input
                      type="text"
                      value={tokenSettings.defaultSupply}
                      onChange={(e) => setTokenSettings({ ...tokenSettings, defaultSupply: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1000000000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Default token supply (18 decimals auto-added)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Supply Cap</label>
                    <input
                      type="text"
                      value={tokenSettings.maxSupply}
                      onChange={(e) => setTokenSettings({ ...tokenSettings, maxSupply: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1000000000000000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Maximum allowed total supply</p>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="burnable"
                      checked={tokenSettings.burnable}
                      onChange={(e) => setTokenSettings({ ...tokenSettings, burnable: e.target.checked })}
                      className="mr-3"
                    />
                    <label htmlFor="burnable" className="text-sm font-medium text-gray-700">
                      Burnable (allow token burning)
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="mintable"
                      checked={tokenSettings.mintable}
                      onChange={(e) => setTokenSettings({ ...tokenSettings, mintable: e.target.checked })}
                      className="mr-3"
                    />
                    <label htmlFor="mintable" className="text-sm font-medium text-gray-700">
                      Mintable (allow additional supply)
                    </label>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="pausable"
                      checked={tokenSettings.pausable}
                      onChange={(e) => setTokenSettings({ ...tokenSettings, pausable: e.target.checked })}
                      className="mr-3"
                    />
                    <label htmlFor="pausable" className="text-sm font-medium text-gray-700">
                      Pausable (emergency pause functionality)
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="transferFeeEnabled"
                      checked={tokenSettings.transferFeeEnabled}
                      onChange={(e) => setTokenSettings({ ...tokenSettings, transferFeeEnabled: e.target.checked })}
                      className="mr-3"
                    />
                    <label htmlFor="transferFeeEnabled" className="text-sm font-medium text-gray-700">
                      Transfer Fee (charged on transfers)
                    </label>
                  </div>

                  {tokenSettings.transferFeeEnabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Transfer Fee (basis points)</label>
                      <input
                        type="text"
                        value={tokenSettings.transferFeeBPS}
                        onChange={(e) => setTokenSettings({ ...tokenSettings, transferFeeBPS: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="25"
                      />
                      <p className="text-xs text-gray-500 mt-1">Fee as basis points (25 = 0.25%)</p>
                    </div>
                  )}

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="ownerRenounceable"
                      checked={tokenSettings.ownerRenounceable}
                      onChange={(e) => setTokenSettings({ ...tokenSettings, ownerRenounceable: e.target.checked })}
                      className="mr-3"
                    />
                    <label htmlFor="ownerRenounceable" className="text-sm font-medium text-gray-700">
                      Owner Renounceable (allow contract ownership transfer)
                    </label>
                  </div>

                  <button
                    onClick={() => saveSettings('tokenSettings', tokenSettings)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"
                  >
                    Save Token Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API Keys Tab */}
        {activeTab === 'api' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Third-Party API Configuration</h2>
              <p className="text-gray-600 mb-6">
                Configure API keys for external services used in token deployments and analytics.
                These are required for production deployments and enhanced functionality.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Infura Project ID</label>
                  <input
                    type="password"
                    value={apiKeys.infuraProjectId}
                    onChange={(e) => setApiKeys({ ...apiKeys, infuraProjectId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your Infura Project ID"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used for Ethereum/Polygon RPC connections</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alchemy API Key</label>
                  <input
                    type="password"
                    value={apiKeys.alchemyKey}
                    onChange={(e) => setApiKeys({ ...apiKeys, alchemyKey: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your Alchemy API Key"
                  />
                  <p className="text-xs text-gray-500 mt-1">Alternative RPC provider for enhanced reliability</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Moralis API Key</label>
                  <input
                    type="password"
                    value={apiKeys.moralisKey}
                    onChange={(e) => setApiKeys({ ...apiKeys, moralisKey: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your Moralis API Key"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used for NFT metadata and token analytics</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Push Protocol API Key</label>
                  <input
                    type="password"
                    value={apiKeys.epnsKey}
                    onChange={(e) => setApiKeys({ ...apiKeys, epnsKey: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your EPNS API Key"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used for push notifications and alerts</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">CoinMarketCap API Key</label>
                  <input
                    type="password"
                    value={apiKeys.coinmarketcapKey}
                    onChange={(e) => setApiKeys({ ...apiKeys, coinmarketcapKey: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your CMC API Key"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used for crypto price data and market analytics</p>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => saveSettings('apiKeys', apiKeys)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium"
                >
                  Save API Keys
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Users Tab */}
        {activeTab === 'admins' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Administrator Management</h2>

              {/* Add New Admin Form */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Administrator</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      value={newAdmin.username}
                      onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={newAdmin.email}
                      onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="admin@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      value={newAdmin.password}
                      onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={newAdmin.role}
                      onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value as AdminUser['role'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={addAdminUser}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium"
                >
                  Add Administrator
                </button>
              </div>

              {/* Current Admins List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Administrators</h3>
                <div className="space-y-4">
                  {adminUsers.map(admin => (
                    <div key={admin.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                            <span className="text-lg">👤</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{admin.username}</h4>
                            <p className="text-sm text-gray-600">{admin.email}</p>
                            <p className="text-xs text-gray-500">
                              Role: {admin.role.replace('_', ' ')} • Last active: {new Date(admin.lastActive).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            admin.role === 'super_admin'
                              ? 'bg-red-100 text-red-800'
                              : admin.role === 'admin'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {admin.role.replace('_', ' ')}
                          </span>
                          <button
                            onClick={() =>
                              setAdminUsers(prev => prev.filter(u => u.id !== admin.id))
                            }
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {adminUsers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No additional administrators configured
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Security & Access Control</h2>
              <p className="text-gray-600 mb-6">
                Configure security settings for production deployments including
                rate limiting, IP restrictions, and authentication policies.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900">Rate Limiting</h4>
                      <p className="text-sm text-gray-600">Limit API calls per IP</p>
                    </div>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      Enabled
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900">IP Whitelisting</h4>
                      <p className="text-sm text-gray-600">Restrict access by IP address</p>
                    </div>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Enabled
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-600">Require 2FA for admin access</p>
                    </div>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Enabled
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900">Audit Logging</h4>
                      <p className="text-sm text-gray-600">Track all administrative actions</p>
                    </div>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      Enabled
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900">Session Timeout</h4>
                      <p className="text-sm text-gray-600">Auto-logout after inactivity</p>
                    </div>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      Enabled
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900">Firewall Configuration</h4>
                      <p className="text-sm text-gray-600">Advanced DDoS protection</p>
                    </div>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Enabled
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Policies</h3>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    • Maximum failed login attempts: <span className="font-medium">5</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    • Password complexity: <span className="font-medium">Minimum 8 characters, special characters required</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    • Session duration: <span className="font-medium">24 hours</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    • SSL/TLS encryption: <span className="font-medium">Required for all connections</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Monitoring Tab */}
        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">System Monitoring & Analytics</h2>
              <p className="text-gray-600 mb-6">
                Monitor platform performance, deployment success rates, and system health metrics.
                Configure alerts and logging settings for production monitoring.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* System Health */}
                <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-3xl mb-2">🟢</div>
                  <div className="text-2xl font-bold text-green-600">Healthy</div>
                  <div className="text-sm text-green-700">All Systems Operational</div>
                </div>

                {/* Deployment Success */}
                <div className="text-center p-6 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-3xl mb-2">🔄</div>
                  <div className="text-2xl font-bold text-blue-600">94.2%</div>
                  <div className="text-sm text-blue-700">Success Rate</div>
                </div>

                {/* Average Response */}
                <div className="text-center p-6 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="text-3xl mb-2">⚡</div>
                  <div className="text-2xl font-bold text-purple-600">2.3s</div>
                  <div className="text-sm text-purple-700">Avg Response Time</div>
                </div>
              </div>

              {/* Charts Section (Placeholder for now) */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="text-4xl mb-2">📊</div>
                      <p>Deployment Success Rate Chart</p>
                      <p className="text-sm">Last 30 days would appear here</p>
                    </div>
                  </div>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="text-4xl mb-2">🎯</div>
                      <p>System Performance Metrics</p>
                      <p className="text-sm">Response times and throughput</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alert Configuration */}
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Configuration</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">Failed deployment alert</span>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      Email notification
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">System performance degradation</span>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      Slack notification
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">High gas price detected</span>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      SMS alert
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
