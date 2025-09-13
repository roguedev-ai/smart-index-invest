// Multi-admin management system for TokenMarket enterprise platform

export interface AdminUser {
  id: string
  walletAddress: string
  username: string
  email?: string
  role: AdminRole
  status: 'active' | 'inactive' | 'suspended'
  createdAt: string
  lastLogin?: string
  permissions: AdminPermissions
  feeShare?: number // Percentage of revenue (0-100)
  totalEarned?: number // ETH earned
  inviteCode?: string
  invitedBy?: string
}

export type AdminRole = 'master' | 'admin' | 'moderator' | 'support'

export interface AdminPermissions {
  // Platform Management
  manageUsers: boolean
  managePricing: boolean
  viewAnalytics: boolean
  manageSettings: boolean

  // Content Management
  moderateContent: boolean
  manageTokens: boolean
  issueWarnings: boolean
  banUsers: boolean

  // Financial
  viewRevenue: boolean
  managePayments: boolean
  approveDisbursements: boolean
  financialReporting: boolean

  // System
  technicalSupport: boolean
  systemMonitoring: boolean
  dataExport: boolean
  emergencyControls: boolean
}

export interface FeeDistribution {
  platformFee: number     // 10% → Platform maintenance (fixed)
  masterAdminFee: number  // 65% → Master administrator
  adminFees: number       // 20% → Distributed to active admins
  referralsFee: number    // 5% → Referral and loyalty program
  reserveFund: number     // Last 0% - contingency fund
}

export interface AdminMetrics {
  totalAdmins: number
  activeAdmins: number
  totalRevenue: number
  averageFeeShare: number
  topPerformers: AdminUser[]
  monthlyDisbursements: number
  pendingPayments: number
}

// Default permission sets by role
const rolePermissions: Record<AdminRole, AdminPermissions> = {
  master: {
    manageUsers: true,
    managePricing: true,
    viewAnalytics: true,
    manageSettings: true,
    moderateContent: true,
    manageTokens: true,
    issueWarnings: true,
    banUsers: true,
    viewRevenue: true,
    managePayments: true,
    approveDisbursements: true,
    financialReporting: true,
    technicalSupport: true,
    systemMonitoring: true,
    dataExport: true,
    emergencyControls: true
  },
  admin: {
    manageUsers: false,
    managePricing: true,
    viewAnalytics: true,
    manageSettings: false,
    moderateContent: true,
    manageTokens: true,
    issueWarnings: true,
    banUsers: false,
    viewRevenue: true,
    managePayments: false,
    approveDisbursements: false,
    financialReporting: true,
    technicalSupport: true,
    systemMonitoring: true,
    dataExport: true,
    emergencyControls: false
  },
  moderator: {
    manageUsers: false,
    managePricing: false,
    viewAnalytics: true,
    manageSettings: false,
    moderateContent: true,
    manageTokens: false,
    issueWarnings: true,
    banUsers: false,
    viewRevenue: false,
    managePayments: false,
    approveDisbursements: false,
    financialReporting: false,
    technicalSupport: true,
    systemMonitoring: false,
    dataExport: false,
    emergencyControls: false
  },
  support: {
    manageUsers: false,
    managePricing: false,
    viewAnalytics: false,
    manageSettings: false,
    moderateContent: false,
    manageTokens: false,
    issueWarnings: false,
    banUsers: false,
    viewRevenue: false,
    managePayments: false,
    approveDisbursements: false,
    financialReporting: false,
    technicalSupport: true,
    systemMonitoring: false,
    dataExport: false,
    emergencyControls: false
  }
}

export interface EarningsRecord {
  id: string
  adminId: string
  amount: number // ETH earned
  source: 'platform_fee' | 'referral' | 'bonus' | 'commission'
  transactionHash?: string
  timestamp: string
  status: 'pending' | 'paid' | 'cancelled'
  description: string
}

// Mock admin hierarchy (in production, this would be stored in database)
export const adminUsers: AdminUser[] = [
  {
    id: 'master-admin-001',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44f',
    username: 'MasterAdmin',
    email: 'master@tokenmarket.com',
    role: 'master',
    status: 'active',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    permissions: rolePermissions.master,
    feeShare: 65,
    totalEarned: 25.3,
    inviteCode: 'MASTER2025'
  },
  {
    id: 'admin-001',
    walletAddress: '0x1234567890123456789012345678901234567890',
    username: 'RyanAdmin',
    email: 'ryan@tokenmarket.com',
    role: 'admin',
    status: 'active',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date().toISOString(),
    permissions: rolePermissions.admin,
    feeShare: 15,
    totalEarned: 12.5,
    invitedBy: 'master-admin-001',
    inviteCode: 'RYAN2025'
  },
  {
    id: 'admin-002',
    walletAddress: '0x0987654321098765432109876543210987654321',
    username: 'SarahAdmin',
    email: 'sarah@tokenmarket.com',
    role: 'admin',
    status: 'active',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    permissions: rolePermissions.admin,
    feeShare: 8,
    totalEarned: 6.8,
    invitedBy: 'master-admin-001',
    inviteCode: 'SARAH2025'
  },
  {
    id: 'moderator-001',
    walletAddress: '0xabcd1234abcd1234abcd1234abcd1234abcd1234',
    username: 'JohnMod',
    email: 'john@tokenmarket.com',
    role: 'moderator',
    status: 'active',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    permissions: rolePermissions.moderator,
    invitedBy: 'admin-001'
  }
]

// Earnings records for tracking payouts
export let earningsRecords: EarningsRecord[] = [
  {
    id: 'earn-001',
    adminId: 'master-admin-001',
    amount: 0.01625,
    source: 'platform_fee',
    transactionHash: '0xabc123...',
    timestamp: new Date().toISOString(),
    status: 'paid',
    description: 'Token creation fee share (65% of 0.025 ETH)'
  },
  {
    id: 'earn-002',
    adminId: 'admin-001',
    amount: 0.00375,
    source: 'platform_fee',
    transactionHash: '0xdef456...',
    timestamp: new Date().toISOString(),
    status: 'paid',
    description: 'Token creation fee share (15% of 0.025 ETH)'
  },
  {
    id: 'earn-003',
    adminId: 'admin-002',
    amount: 0.002,
    source: 'platform_fee',
    transactionHash: '0xghi789...',
    timestamp: new Date().toISOString(),
    status: 'pending',
    description: 'Token creation fee share (8% of 0.025 ETH) - Pending payout'
  }
]

// Admin management functions
export function getAdminByWallet(walletAddress: string): AdminUser | undefined {
  return adminUsers.find(admin => admin.walletAddress.toLowerCase() === walletAddress.toLowerCase())
}

export function getAdminById(adminId: string): AdminUser | undefined {
  return adminUsers.find(admin => admin.id === adminId)
}

export function getAdminsByRole(role: AdminRole): AdminUser[] {
  return adminUsers.filter(admin => admin.role === role)
}

export function getActiveAdmins(): AdminUser[] {
  return adminUsers.filter(admin => admin.status === 'active')
}

// Fee calculation functions
export function calculateFeeDistribution(tokenFee: number): FeeDistribution {
  const distribution = {
    platformFee: tokenFee * 0.1,      // 10%
    masterAdminFee: tokenFee * 0.65,  // 65%
    adminFees: tokenFee * 0.2,        // 20%
    referralsFee: tokenFee * 0.05,    // 5%
    reserveFund: 0                    // For now, no reserve
  }

  // Ensure total adds up to original fee (handle rounding)
  const total = Object.values(distribution).reduce((sum, val) => sum + val, 0)
  if (Math.abs(total - tokenFee) > 0.000001) {
    distribution.reserveFund = tokenFee - total
  }

  return distribution
}

export function calculateAdminPayout(distribution: FeeDistribution, activeAdmins: AdminUser[]): Record<string, number> {
  const payouts: Record<string, number> = {}

  // Master admin gets fixed percentage
  const masterAdmin = getAdminsByRole('master')[0]
  if (masterAdmin) {
    payouts[masterAdmin.walletAddress] = distribution.masterAdminFee
  }

  // Admin fees distributed among sub-admins based on their fee share percentages
  const subAdmins = activeAdmins.filter(admin => admin.role === 'admin' && admin.feeShare)
  if (subAdmins.length > 0) {
    const totalAdminFeeShare = subAdmins.reduce((sum, admin) => sum + (admin.feeShare! / 100), 0)

    subAdmins.forEach(admin => {
      const adminShare = (admin.feeShare! / 100) / totalAdminFeeShare
      payouts[admin.walletAddress] = distribution.adminFees * adminShare
    })
  }

  return payouts
}

// Permission checking
export function hasPermission(admin: AdminUser, permission: keyof AdminPermissions): boolean {
  return admin.permissions[permission] === true
}

export function canManageAdmin(user: AdminUser, targetAdmin: AdminUser): boolean {
  // Master admin can manage everyone
  if (user.role === 'master') return true

  // Admin can manage moderators and support users
  if (user.role === 'admin') {
    return ['moderator', 'support'].includes(targetAdmin.role)
  }

  // Others cannot manage administrators
  return false
}

// Admin creation and management
export function createAdminUser(userData: Omit<AdminUser, 'id' | 'createdAt' | 'status' | 'permissions'>): AdminUser {
  const newAdmin: AdminUser = {
    ...userData,
    id: `admin-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'active',
    permissions: rolePermissions[userData.role]
  }

  adminUsers.push(newAdmin)
  return newAdmin
}

// Analytics and reporting
export function getAdminMetrics(): AdminMetrics {
  const activeAdmins = getActiveAdmins()
  const totalRevenue = adminUsers.reduce((sum, admin) => sum + (admin.totalEarned || 0), 0)
  const averageFeeShare = activeAdmins
    .filter(admin => admin.role === 'admin')
    .reduce((sum, admin) => sum + (admin.feeShare || 0), 0) /
    Math.max(activeAdmins.filter(admin => admin.role === 'admin').length, 1)

  const topPerformers = adminUsers
    .sort((a, b) => (b.totalEarned || 0) - (a.totalEarned || 0))
    .slice(0, 5)

  const monthlyDisbursements = earningsRecords
    .filter(record => record.status === 'paid' && record.timestamp >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .reduce((sum, record) => sum + record.amount, 0)

  const pendingPayments = earningsRecords
    .filter(record => record.status === 'pending')
    .reduce((sum, record) => sum + record.amount, 0)

  return {
    totalAdmins: adminUsers.length,
    activeAdmins: activeAdmins.length,
    totalRevenue,
    averageFeeShare,
    topPerformers,
    monthlyDisbursements,
    pendingPayments
  }
}

// Generate invite code for new admins
export function generateInviteCode(admin: AdminUser): string {
  const baseString = admin.username.toUpperCase().slice(0, 4)
  const timestampSuffix = Date.now().toString().slice(-4)
  return `${baseString}${timestampSuffix}`
}

// Role hierarchy validation
export function canInviteRole(inviterRole: AdminRole, inviteeRole: AdminRole): boolean {
  const roleHierarchy = {
    master: ['master', 'admin', 'moderator', 'support'],
    admin: ['moderator', 'support'],
    moderator: ['support'],
    support: []
  }

  return roleHierarchy[inviterRole].includes(inviteeRole)
}

// Update admin user
export function updateAdminUser(adminId: string, updates: Partial<AdminUser>): boolean {
  const adminIndex = adminUsers.findIndex(admin => admin.id === adminId)
  if (adminIndex === -1) return false

  adminUsers[adminIndex] = { ...adminUsers[adminIndex], ...updates }

  // Update permissions if role changed
  if (updates.role) {
    adminUsers[adminIndex].permissions = rolePermissions[updates.role]
  }

  return true
}

// Remove admin user (soft delete)
export function deactivateAdminUser(adminId: string): boolean {
  const adminIndex = adminUsers.findIndex(admin => admin.id === adminId)
  if (adminIndex === -1) return false

  adminUsers[adminIndex].status = 'inactive'
  return true
}
