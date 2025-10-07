/**
 * Discord Webhook Integration Utility for TokenMarket
 * Handles sending notifications to Discord channels via webhooks
 *
 * @author TokenMarket Development Team
 * @version 1.0.0
 * @since 2025-10-07
 */

export interface DiscordEmbed {
  title: string;
  description?: string;
  color?: number;
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  timestamp?: string;
  footer?: { text: string; icon_url?: string };
}

export interface IndexAlert {
  indexName: string;
  creator: string;
  action: 'created' | 'updated';
  timestamp: Date;
  tokenCount?: number;
  totalValue?: string;
  performanceMetrics?: Record<string, any>;
}

export interface TradeNotification {
  buyer: string;
  seller: string;
  amount: string;
  indexName: string;
  price: number;
  timestamp: Date;
  transactionHash?: string;
}

export interface PerformanceUpdate {
  indexName: string;
  performance: number;
  timeframe: '1h' | '24h' | '7d';
  changePercent: number;
  timestamp: Date;
  topPerformers?: Array<{ token: string; change: number }>;
}

/**
 * Discord Webhook class for managing webhook communications
 * Provides rate limiting, error handling, and multiple notification types
 */
export class DiscordWebhook {
  private webhookUrl: string;
  private rateLimitCounter: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly DEFAULT_RATE_LIMIT = 5; // requests per second

  constructor(webhookUrl: string) {
    if (!this.isValidWebhookUrl(webhookUrl)) {
      throw new Error('Invalid Discord webhook URL format');
    }
    this.webhookUrl = webhookUrl;
  }

  /**
   * Send a basic notification to Discord
   * @param message - The message content
   * @param options - Optional embed options
   * @returns Promise<boolean> - Success status
   */
  async sendNotification(
    message: string,
    options: Partial<DiscordEmbed> = {}
  ): Promise<boolean> {
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please wait before sending another notification.');
    }

    const embeds = options.title || options.description ? [options] : [];

    return this.sendToDiscord({
      content: message,
      embeds,
    });
  }

  /**
   * Send an index alert for creation/update events
   * @param alert - Index alert data
   * @returns Promise<boolean> - Success status
   */
  async sendIndexAlert(alert: IndexAlert): Promise<boolean> {
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please wait before sending another notification.');
    }

    const embed: DiscordEmbed = {
      title: `📊 Index ${alert.action.charAt(0).toUpperCase() + alert.action.slice(1)}`,
      description: `**Index:** ${alert.indexName}\n**Creator:** ${alert.creator}\n**Time:** ${alert.timestamp.toLocaleString()}`,
      color: alert.action === 'created' ? 0x00ff00 : 0xffaa00,
      fields: [],
      timestamp: alert.timestamp.toISOString(),
    };

    if (alert.tokenCount) {
      embed.fields!.push({
        name: 'Tokens',
        value: alert.tokenCount.toString(),
        inline: true,
      });
    }

    if (alert.totalValue) {
      embed.fields!.push({
        name: 'Value',
        value: alert.totalValue,
        inline: true,
      });
    }

    return this.sendToDiscord({
      embeds: [embed],
    });
  }

  /**
   * Send a trading notification
   * @param trade - Trade notification data
   * @returns Promise<boolean> - Success status
   */
  async sendTradingNotification(trade: TradeNotification): Promise<boolean> {
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please wait before sending another notification.');
    }

    const embed: DiscordEmbed = {
      title: '💰 Trade Executed',
      description: `**Index:** ${trade.indexName}\n**Buyer:** ${trade.buyer}\n**Seller:** ${trade.seller}\n**Amount:** ${trade.amount}\n**Price:** $${trade.price}`,
      color: 0x00aaff,
      timestamp: trade.timestamp.toISOString(),
      footer: trade.transactionHash ? {
        text: `Tx: ${trade.transactionHash.slice(0, 10)}...`,
      } : undefined,
    };

    return this.sendToDiscord({
      embeds: [embed],
    });
  }

  /**
   * Send a performance update notification
   * @param update - Performance update data
   * @returns Promise<boolean> - Success status
   */
  async sendPerformanceUpdate(update: PerformanceUpdate): Promise<boolean> {
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please wait before sending another notification.');
    }

    const color = update.changePercent >= 0 ? 0x00ff00 : 0xff0000;
    const changeSymbol = update.changePercent >= 0 ? '📈' : '📉';

    const embed: DiscordEmbed = {
      title: `${changeSymbol} Performance Update - ${update.timeframe}`,
      description: `**Index:** ${update.indexName}\n**Change:** ${update.changePercent >= 0 ? '+' : ''}${update.changePercent.toFixed(2)}%\n**Timeframe:** ${update.timeframe}`,
      color,
      fields: [],
      timestamp: update.timestamp.toISOString(),
    };

    if (update.topPerformers && update.topPerformers.length > 0) {
      embed.fields!.push({
        name: 'Top Performers',
        value: update.topPerformers
          .slice(0, 3)
          .map(p => `${p.token}: ${p.change >= 0 ? '+' : ''}${p.change.toFixed(2)}%`)
          .join('\n'),
        inline: false,
      });
    }

    return this.sendToDiscord({
      embeds: [embed],
    });
  }

  /**
   * Send a welcome message for new users
   * @param userAddress - Wallet address of the new user
   * @returns Promise<boolean> - Success status
   */
  async sendWelcomeMessage(userAddress: string): Promise<boolean> {
    return this.sendNotification(
      `👋 Welcome to TokenMarket!\nNew user joined: ${userAddress}`,
      {
        title: 'New User Registration',
        description: `Wallet: \`${userAddress}\``,
        color: 0x9b59b6,
      }
    );
  }

  /**
   * Private method to send data to Discord webhook
   */
  private async sendToDiscord(payload: any): Promise<boolean> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Discord API error: ${response.status} ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Discord webhook error:', error);
      return false;
    }
  }

  /**
   * Check if webhook request is within rate limits
   */
  private checkRateLimit(): boolean {
    const now = Date.now();
    const key = 'global';
    const limit = this.rateLimitCounter.get(key);

    if (!limit || now > limit.resetTime) {
      this.rateLimitCounter.set(key, { count: 1, resetTime: now + 1000 });
      return true;
    }

    if (limit.count >= this.DEFAULT_RATE_LIMIT) {
      return false; // Rate limit exceeded
    }

    limit.count++;
    return true;
  }

  /**
   * Validate Discord webhook URL format
   */
  private isValidWebhookUrl(url: string): boolean {
    return /^https:\/\/discord(?:app)?\.com\/api\/webhooks\/\d+\/[\w-]+$/.test(url);
  }
}

/**
 * Singleton function to get Discord webhook instance
 * Uses environment variable for webhook URL
 */
export function getDiscordClient(): DiscordWebhook | null {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl || !new DiscordWebhook('').isValidWebhookUrl(webhookUrl)) {
    return null; // Gracefully handle missing or invalid webhook
  }

  return new DiscordWebhook(webhookUrl);
}

/**
 * Utility function to format wallet addresses for Discord
 */
export function formatWalletAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Utility function to format USD values
 */
export function formatUsdValue(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}
