// Discord Integration for TokenMarket Ecosystem
// Combines OAuth authentication + Discord Bot for community features

export interface DiscordUser {
  id: string
  username: string
  discriminator: string
  avatar: string | null
  email?: string
  verified?: boolean
  locale?: string
}

export interface TokenMarketDiscordUser {
  walletAddress: string
  discordUser: DiscordUser
  joinedAt: string
  tokensCreated: number
  tokensOwned: string[]
  lastActivity: string
  notificationsEnabled: boolean
  verificationLevel: 'none' | 'basic' | 'verified' | 'premium'
}

export interface DiscordAnnouncement {
  id: string
  type: 'token_launched' | 'price_alert' | 'trading_signal' | 'platform_update' | 'admin_message'
  title: string
  description: string
  author: string
  timestamp: string
  channel: string
  embed: {
    color: number
    fields?: Array<{
      name: string
      value: string
      inline: boolean
    }>
    thumbnail?: {
      url: string
    }
    image?: {
      url: string
    }
    footer?: {
      text: string
      icon_url?: string
    }
  }
  reactions?: string[]
  pinned?: boolean
}

// Discord OAuth Configuration
export const discordOAuth = {
  clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || 'your-discord-client-id',
  clientSecret: process.env.DISCORD_CLIENT_SECRET || 'your-discord-client-secret',
  redirectUri: process.env.NEXT_PUBLIC_APP_URL + '/api/auth/discord/callback',
  scopes: ['identify', 'email', 'guilds.join'],
  botToken: process.env.DISCORD_BOT_TOKEN || 'your-discord-bot-token',
  guildId: process.env.DISCORD_GUILD_ID || 'your-discord-server-id'
}

// Discord Bot Channels
export const discordChannels = {
  announcements: 'TOKEN-LAUNCHES',
  alerts: 'PRICE-ALERTS',
  trading: 'TRADING-SIGNALS',
  support: 'SUPPORT',
  general: 'GENERAL',
  verification: 'VERIFICATION'
}

// Discord Embed Colors
export const embedColors = {
  success: 0x00FF00,
  error: 0xFF0000,
  warning: 0xFFFF00,
  info: 0x3498DB,
  premium: 0x9B59B6,
  admin: 0xE74C3C,
  tokenLaunch: 0x2ECC71,
  priceAlert: 0xF39C12
}

// Mock Discord user data for demonstration
export const mockDiscordUsers: TokenMarketDiscordUser[] = [
  {
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44f',
    discordUser: {
      id: '123456789012345678',
      username: 'MasterAdmin',
      discriminator: '0420',
      avatar: 'https://cdn.discord.com/avatars/123456789012345678/avatar.png',
      email: 'admin@tokenmarket.com',
      verified: true,
      locale: 'en-US'
    },
    joinedAt: new Date().toISOString(),
    tokensCreated: 25,
    tokensOwned: ['WETH', 'USDC', 'EDG', 'MYT'],
    lastActivity: new Date().toISOString(),
    notificationsEnabled: true,
    verificationLevel: 'premium'
  },
  {
    walletAddress: '0x1234567890123456789012345678901234567890',
    discordUser: {
      id: '987654321098765432',
      username: 'CryptoKing',
      discriminator: '1337',
      avatar: 'https://cdn.discord.com/avatars/987654321098765432/avatar.png',
      email: 'cryptoking@example.com',
      verified: true,
      locale: 'en-US'
    },
    joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    tokensCreated: 5,
    tokensOwned: ['EDG', 'WETH', 'USDC'],
    lastActivity: new Date(Date.now() - 3600000).toISOString(),
    notificationsEnabled: true,
    verificationLevel: 'verified'
  }
]

// Discord Bot Announcement Templates
export const announcementTemplates: Record<string, Partial<DiscordAnnouncement>> = {
  token_launched: {
    type: 'token_launched',
    title: '🚀 NEW TOKEN LAUNCHED!',
    channel: discordChannels.announcements,
    embed: {
      color: embedColors.tokenLaunch,
      thumbnail: { url: 'https://tokenmarket.com/logo.png' },
      footer: {
        text: 'TokenMarket - Where Innovation Meets Blockchain',
        icon_url: 'https://tokenmarket.com/icon.png'
      }
    }
  },
  price_alert: {
    type: 'price_alert',
    title: '📊 PRICE ALERT!',
    channel: discordChannels.alerts,
    embed: {
      color: embedColors.warning,
      thumbnail: { url: 'https://tokenmarket.com/alert-icon.png' }
    }
  },
  platform_update: {
    type: 'platform_update',
    title: '📰 PLATFORM UPDATE',
    channel: discordChannels.general,
    embed: {
      color: embedColors.info,
      thumbnail: { url: 'https://tokenmarket.com/update-icon.png' }
    }
  }
}

// Discord event handlers (functions to be called when events occur)
export async function announceTokenLaunch(tokenData: {
  name: string
  symbol: string
  creator: string
  network: string
  contractAddress: string
  totalSupply: string
}): Promise<boolean> {
  // In production, this would send to actual Discord bot

  const announcement: DiscordAnnouncement = {
    ...announcementTemplates.token_launched,
    description: `**${tokenData.name}** (${tokenData.symbol}) is now live on ${tokenData.network}!`,
    author: tokenData.creator,
    timestamp: new Date().toISOString(),
    embed: {
      color: embedColors.tokenLaunch,
      fields: [
        {
          name: '💰 Token Details',
          value: `**Symbol:** ${tokenData.symbol}\n**Supply:** ${tokenData.totalSupply}\n**Network:** ${tokenData.network}`,
          inline: true
        },
        {
          name: '🔗 Contract',
          value: `[${tokenData.contractAddress.slice(0, 10)}...${tokenData.contractAddress.slice(-6)}](https://etherscan.io/token/${tokenData.contractAddress})`,
          inline: true
        },
        {
          name: '🎯 Creator',
          value: `[${tokenData.creator.slice(0, 6)}...${tokenData.creator.slice(-4)}](https://tokenmarket.com/u/${tokenData.creator})`,
          inline: true
        }
      ],
      footer: {
        text: 'TokenMarket - Create, Trade, Connect',
        icon_url: 'https://tokenmarket.com/icon.png'
      }
    },
    reactions: ['🚀', '💰', '🔥']
  } as DiscordAnnouncement

  console.log('🎉 Discord Announcement:', JSON.stringify(announcement, null, 2))
  return Promise.resolve(true)
}

export async function sendPriceAlert(alertData: {
  tokenSymbol: string
  currentPrice: number
  priceChange24h: number
  volume24h: number
  marketCap: number
}): Promise<boolean> {
  const announcement: DiscordAnnouncement = {
    id: `alert-${Date.now()}`,
    type: 'price_alert',
    author: 'TokenMarket Bot',
    title: '📊 PRICE MOVEMENT ALERT!',
    description: `${alertData.tokenSymbol} is moving!`,
    channel: discordChannels.alerts,
    timestamp: new Date().toISOString(),
    embed: {
      color: alertData.priceChange24h > 0 ? embedColors.success : embedColors.error,
      thumbnail: { url: 'https://tokenmarket.com/alert-icon.png' },
      fields: [
        {
          name: '💎 Token',
          value: `**${alertData.tokenSymbol}**`,
          inline: true
        },
        {
          name: '💰 Current Price',
          value: `$${alertData.currentPrice.toLocaleString()}`,
          inline: true
        },
        {
          name: '📈 24h Change',
          value: `${alertData.priceChange24h > 0 ? '+' : ''}${alertData.priceChange24h.toFixed(2)}%`,
          inline: true
        },
        {
          name: '📊 Volume 24h',
          value: `$${formatVolume(alertData.volume24h)}`,
          inline: true
        },
        {
          name: '🏢 Market Cap',
          value: `$${formatMarketCap(alertData.marketCap)}`,
          inline: true
        }
      ]
    }
  }

  console.log('📊 Price Alert:', JSON.stringify(announcement, null, 2))
  return Promise.resolve(true)
}

export async function sendPlatformUpdate(updateData: {
  title: string
  description: string
  severity: 'info' | 'warning' | 'error' | 'success'
  affectedServices?: string[]
}): Promise<boolean> {
  const announcement: DiscordAnnouncement = {
    id: `update-${Date.now()}`,
    type: 'platform_update',
    author: 'TokenMarket Platform',
    title: `📰 ${updateData.title}`,
    description: updateData.description,
    channel: discordChannels.general,
    timestamp: new Date().toISOString(),
    embed: {
      color: embedColors[updateData.severity],
      fields: updateData.affectedServices ? [
        {
          name: '🛠️ Affected Services',
          value: updateData.affectedServices.map(service => `• ${service}`).join('\n'),
          inline: false
        }
      ] : [],
      footer: {
        text: 'TokenMarket Platform Update',
        icon_url: 'https://tokenmarket.com/platform-icon.png'
      }
    }
  }

  console.log('📰 Platform Update:', JSON.stringify(announcement, null, 2))
  return Promise.resolve(true)
}

// Utility functions
function formatVolume(volume: number): string {
  if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`
  if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`
  if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`
  return volume.toFixed(2)
}

function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e9) return `${(marketCap / 1e9).toFixed(1)}B`
  if (marketCap >= 1e6) return `${(marketCap / 1e6).toFixed(1)}M`
  if (marketCap >= 1e3) return `${(marketCap / 1e3).toFixed(1)}K`
  return marketCap.toFixed(2)
}

// Discord verification levels
export const verificationLevels = {
  none: {
    name: 'None',
    description: 'Basic verification',
    color: '#6B7280',
    features: []
  },
  basic: {
    name: 'Basic',
    description: 'Email verified',
    color: '#3B82F6',
    features: ['📧 Email Verified', '🔔 Basic Notifications']
  },
  verified: {
    name: 'Verified',
    description: 'Wallet connected',
    color: '#10B981',
    features: ['✅ Wallet Verified', '🚀 Token Launch Announcements', '📊 Trading Signals']
  },
  premium: {
    name: 'Premium',
    description: 'Premium member',
    color: '#F59E0B',
    features: ['💎 Premium Features', '🎯 Priority Support', '📈 Advanced Analytics', '🔔 Custom Alerts']
  }
}

// Discord user management
export function getUserVerificationLevel(walletAddress: string): TokenMarketDiscordUser['verificationLevel'] {
  const discordUser = mockDiscordUsers.find(user => user.walletAddress.toLowerCase() === walletAddress.toLowerCase())
  return discordUser?.verificationLevel || 'none'
}

export function canUserAccessFeature(walletAddress: string, feature: string): boolean {
  const verificationLevel = getUserVerificationLevel(walletAddress)

  switch (feature) {
    case 'trading_signals':
      return ['verified', 'premium'].includes(verificationLevel)
    case 'premium_support':
      return verificationLevel === 'premium'
    case 'advanced_analytics':
      return verificationLevel === 'premium'
    case 'custom_alerts':
      return verificationLevel === 'premium'
    case 'token_announcements':
      return verificationLevel !== 'none'
    default:
      return false
  }
}

// Discord OAuth URL generator
export function generateDiscordOAuthURL(): string {
  const baseUrl = 'https://discord.com/api/oauth2/authorize'
  const params = new URLSearchParams({
    client_id: discordOAuth.clientId,
    redirect_uri: discordOAuth.redirectUri,
    response_type: 'code',
    scope: discordOAuth.scopes.join(' '),
    state: btoa(JSON.stringify({
      returnUrl: window?.location?.href,
      timestamp: Date.now()
    }))
  })

  return `${baseUrl}?${params.toString()}`
}

// Discord user invitation system
export function generateDiscordInviteUrl(tokenSymbol?: string): string {
  // In production, this would generate actual Discord invite links
  const baseUrl = 'https://discord.gg/tokenmarket'

  if (tokenSymbol) {
    return `${baseUrl}?ref=${tokenSymbol}`
  }

  return baseUrl
}

// Discord channels configuration
export const channelConfigs = {
  [discordChannels.announcements]: {
    name: '🚀 Token Launches',
    description: 'New token announcements and launches',
    autoSubscribe: true,
    permissions: {
      verified: ['view', 'announcements'],
      premium: ['view', 'announcements', 'react']
    }
  },
  [discordChannels.alerts]: {
    name: '📊 Price Alerts',
    description: 'Real-time price movements and alerts',
    autoSubscribe: true,
    permissions: {
      verified: ['view', 'announcements'],
      premium: ['view', 'announcements', 'send']
    }
  },
  [discordChannels.trading]: {
    name: '💱 Trading Signals',
    description: 'Trading signals and market analysis',
    autoSubscribe: false,
    permissions: {
      verified: ['view'],
      premium: ['view', 'send', 'react']
    }
  },
  [discordChannels.support]: {
    name: '🛠️ Support',
    description: 'Get help with TokenMarket platform',
    autoSubscribe: true,
    permissions: {
      verified: ['view', 'send'],
      premium: ['view', 'send', 'react', 'mention']
    }
  }
}

// Export combined interface
export interface DiscordIntegration {
  users: TokenMarketDiscordUser[]
  announcements: DiscordAnnouncement[]
  config: typeof discordOAuth
  channels: typeof channelConfigs
  verificationLevels: typeof verificationLevels
}

// Mock integration data for demonstration
export const discordIntegration: DiscordIntegration = {
  users: mockDiscordUsers,
  announcements: [],
  config: discordOAuth,
  channels: channelConfigs,
  verificationLevels
}
