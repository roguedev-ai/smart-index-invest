"use client"

import { useState, useEffect } from "react"
import { config } from "@/lib/config"
import {
  DollarSign,
  Users,
  Tokens,
  TrendingUp,
  Settings,
  BarChart3,
  Wallet,
  PieChart,
  Info,
  RefreshCw,
  ExternalLink
} from "lucide-react"

// Mock data for demonstration
const mockData = {
  totalRevenue: 25.3,
  totalTokensCreated: 847,
  totalUsers: 3456,
  monthlyGrowth: 23.5,
  recentTokenCreationFee: 0.01,
  adminWallet: "0x742d35Cc6634C0532925a3b844Bc454e4438f44f",
  monthlyTransactions: [
    { date: "2025-09-13", amount: 0.01, token: "MyToken", user: "0x1234...5678" },
    { date: "2025-09-12", amount: 0.01, token: "SuperCoin", user: "0x5678...9012" },
    { date: "2025-09-11", amount: 0.01, token: "EpicToken", user: "0x9012...3456" },
    { date: "2025-09-10", amount: 0.01, token: "MagicToken", user: "0x3456...7890" },
    { date: "2025-09-09", amount: 0.01, token: "PowerToken", user: "0x7890...1234" }
  ],
  tokenStatistics: [
    { type: "Standard ERC20", count: 523, percentage: 61.7 },
    { type: "Flexible ERC20", count: 189, percentage: 22.3 },
    { type: "Commercial ERC20", count: 89, percentage: 10.5 },
    { type: "Security ERC20", count: 46, percentage: 5.4 }
  ],
  revenueTrends: [
    { month: "Jan", amount: 8.2 },
    { month: "Feb", amount: 12.1 },
    { month: "Mar", amount: 15.8 },
    { month: "Apr", amount: 18.5 },
    { month: "May", amount: 22.1 },
    { month: "Jun", amount: 20.3 },
    { month: "Jul", amount: 16.7 },
    { month: "Aug", amount: 23.8 },
    { month: "Sep", amount: 25.3 }
  ]
}

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(false)

  const refreshData = () => {
    setIsLoading(true)
    // In a real app, this would fetch fresh data from the backend
    setTimeout(() => setIsLoading(false), 2000)
  }

  const StatCard = ({ title, value, change, icon: Icon, color, suffix }: any) => (
    <div className={`p-6 rounded-lg border ${color} transition-all hover:shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {value}{suffix}
          </p>
          {change && (
            <p className={`text-sm mt-1 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </p>
          )}
        </div>
        <div className="text-gray-400">
          <Icon size={32} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">TokenMarket Admin</h1>
              <p className="text-gray-600 mt-1">Platform management and analytics</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshData}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isLoading
                    ? 'bg-gray-100 text-gray-500'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Refreshing...' : 'Refresh Data'}
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-600">Admin Wallet</p>
                <p className="text-xs text-gray-500 font-mono">{config.adminWallet.slice(0, 8)}...{config.adminWallet.slice(-6)}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'revenue', label: 'Revenue', icon: DollarSign },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'tokens', label: 'Tokens', icon: Tokens },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center px-1 py-4 border-b-2 text-sm font-medium ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Revenue"
                value={mockData.totalRevenue}
                change="+12.5% vs last month"
                icon={DollarSign}
                color="bg-green-50 border-green-200"
                suffix=" ETH"
              />
              <StatCard
                title="Tokens Created"
                value={mockData.totalTokensCreated}
                change="+18.2% vs last month"
                icon={Tokens}
                color="bg-blue-50 border-blue-200"
              />
              <StatCard
                title="Active Users"
                value={mockData.totalUsers}
                change="+24.3% vs last month"
                icon={Users}
                color="bg-purple-50 border-purple-200"
              />
              <StatCard
                title="Monthly Growth"
                value={mockData.monthlyGrowth}
                icon={TrendingUp}
                color="bg-yellow-50 border-yellow-200"
                suffix="%"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Transactions */}
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
                <div className="space-y-4">
                  {mockData.monthlyTransactions.map((tx, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">{tx.token}</p>
                        <p className="text-sm text-gray-500">{tx.user}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">+{tx.amount} ETH</p>
                        <p className="text-sm text-gray-500">{tx.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Token Distribution */}
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Token Type Distribution</h3>
                <div className="space-y-3">
                  {mockData.tokenStatistics.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                        <span className="text-sm font-medium text-gray-900">{stat.type}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-3">{stat.percentage}%</span>
                        <span className="text-sm font-medium text-gray-900">{stat.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {selectedTab === 'revenue' && (
          <div>
            <div className="bg-white rounded-lg border p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Revenue Analytics</h3>
                  <p className="text-gray-600">Monthly revenue trends and statistics</p>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Export Data →
                </button>
              </div>

              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Monthly Revenue</h4>
                <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Chart visualization would be here</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{config.creationFee} ETH</div>
                  <div className="text-sm text-gray-600">Current Fee</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">847</div>
                  <div className="text-sm text-gray-600">This Month</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{mockData.totalRevenue} ETH</div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {selectedTab === 'users' && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{mockData.totalUsers}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">2,345</div>
                <div className="text-sm text-gray-600">Active This Month</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">72%</div>
                <div className="text-sm text-gray-600">Retention Rate</div>
              </div>
            </div>
          </div>
        )}

        {/* Tokens Tab */}
        {selectedTab === 'tokens' && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Token Creation Statistics</h3>
            <div className="space-y-4">
              {mockData.tokenStatistics.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Tokens className="h-8 w-8 text-blue-600 mr-4" />
                    <div>
                      <div className="font-medium text-gray-900">{stat.type}</div>
                      <div className="text-sm text-gray-600">{stat.percentage}% of total</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.count}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {selectedTab === 'settings' && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Platform Settings</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token Creation Fee (ETH)
                </label>
                <input
                  type="number"
                  step="0.01"
                  defaultValue={config.creationFee}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Wallet Address
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    defaultValue={config.adminWallet}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Edit
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supported Networks
                </label>
                <div className="flex flex-wrap gap-2">
                  {config.supportedNetworks.map((network, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {network}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
