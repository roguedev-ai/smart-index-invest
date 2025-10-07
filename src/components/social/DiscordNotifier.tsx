'use client';

import React, { useState, useEffect } from 'react';
import { getDiscordClient, formatWalletAddress } from '@/lib/discord';

interface DiscordNotifierProps {
  indexId?: string;
  eventType: 'create' | 'update' | 'trade' | 'performance';
  customMessage?: string;
  indexName?: string;
}

interface NotificationHistory {
  id: string;
  type: string;
  message: string;
  success: boolean;
  timestamp: Date;
  details?: any;
}

export function DiscordNotifier({
  indexId,
  eventType,
  customMessage,
  indexName,
}: DiscordNotifierProps) {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [notificationHistory, setNotificationHistory] = useState<NotificationHistory[]>([]);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const prefs = localStorage.getItem('discord-prefs');
    if (prefs) {
      const parsedPrefs = JSON.parse(prefs);
      setIsEnabled(parsedPrefs.isEnabled ?? true);
    }

    // Check if Discord webhook is configured
    const webhookUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL;
    const client = getDiscordClient();
    setIsConfigured(!!client);

    // Load notification history
    const history = localStorage.getItem('discord-history');
    if (history) {
      const parsedHistory = JSON.parse(history);
      setNotificationHistory(parsedHistory.slice(-10)); // Keep last 10
    }
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    const prefs = { isEnabled };
    localStorage.setItem('discord-prefs', JSON.stringify(prefs));
  }, [isEnabled]);

  const sendTestNotification = async () => {
    if (!isEnabled || !isConfigured) {
      alert('Discord integration not available');
      return;
    }

    const client = getDiscordClient();
    if (!client) {
      alert('Discord client not initialized');
      return;
    }

    try {
      const result = await client.sendNotification(
        '🧪 Test notification from TokenMarket!',
        {
          title: 'Integration Test',
          description: 'This is a test notification to verify Discord integration is working.',
          color: 0x3498db,
          timestamp: new Date().toISOString(),
          footer: {
            text: 'TokenMarket Discord Integration',
          },
        }
      );

      const notification: NotificationHistory = {
        id: Date.now().toString(),
        type: 'test',
        message: 'Test notification sent',
        success: result,
        timestamp: new Date(),
      };

      setNotificationHistory(prev => [notification, ...prev.slice(0, 9)]);

      if (result) {
        alert('Test notification sent successfully');
      } else {
        alert('Failed to send test notification');
      }
    } catch (error) {
      alert('Error sending test notification');
      console.error('Test notification error:', error);
    }
  };

  const shareToDiscord = async (data?: any) => {
    if (!isEnabled || !isConfigured) {
      alert('Discord integration not available');
      return;
    }

    const client = getDiscordClient();
    if (!client) {
      alert('Discord client not initialized');
      return;
    }

    try {
      let result: boolean;
      let message: string;

      switch (eventType) {
        case 'create':
          result = await client.sendIndexAlert({
            indexName: indexName || 'Unnamed Index',
            creator: formatWalletAddress('0xCurrentWallet'), // Should come from wallet context
            action: 'created',
            timestamp: new Date(),
            tokenCount: data?.tokenCount,
            totalValue: data?.totalValue,
          });
          message = `Index created notification sent for "${indexName}"`;
          break;

        case 'update':
          result = await client.sendIndexAlert({
            indexName: indexName || 'Unnamed Index',
            creator: formatWalletAddress('0xCurrentWallet'), // Should come from wallet context
            action: 'updated',
            timestamp: new Date(),
            ...data,
          });
          message = `Index updated notification sent for "${indexName}"`;
          break;

        default:
          result = await client.sendNotification(
            customMessage || 'Notification from TokenMarket',
            {
              title: `TokenMarket ${eventType}`,
              color: 0x2ecc71,
            }
          );
          message = 'Notification sent to Discord';
      }

      const notification: NotificationHistory = {
        id: Date.now().toString(),
        type: eventType,
        message,
        success: result,
        timestamp: new Date(),
        details: data,
      };

      setNotificationHistory(prev => [notification, ...prev.slice(0, 9)]);

      if (result) {
        alert(message);
      } else {
        alert('Failed to send notification');
      }

      // Save history to localStorage
      localStorage.setItem('discord-history', JSON.stringify([notification, ...notificationHistory.slice(0, 9)]));

    } catch (error) {
      alert('Error sharing to Discord');
      console.error('Share error:', error);
    }
  };

  const clearHistory = () => {
    if (!confirm('Are you sure you want to clear notification history?')) {
      return;
    }
    setNotificationHistory([]);
    localStorage.removeItem('discord-history');
    alert('Notification history cleared');
  };

  if (!process.env.NEXT_PUBLIC_ENABLE_DISCORD_INTEGRATION) {
    return null; // Feature disabled globally
  }

  return (
    <div className="flex items-center gap-2">
      {/* Main Share Button */}
      <button
        onClick={() => shareToDiscord()}
        disabled={!isEnabled || !isConfigured}
        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Share to Discord
      </button>

      {/* Settings Button */}
      <button
        onClick={() => setIsSettingsOpen(true)}
        className="p-1 text-gray-500 hover:text-gray-700"
      >
        ⚙️
      </button>

      {/* Simple Modal Overlay */}
      {isSettingsOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsSettingsOpen(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Discord Notifications</h2>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Status Section */}
              <div>
                <h3 className="text-sm font-medium mb-2">Integration Status</h3>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-2">
                    {isConfigured ? (
                      <span className="text-green-500">✓</span>
                    ) : (
                      <span className="text-red-500">✗</span>
                    )}
                    <span className="text-sm">
                      {isConfigured ? 'Configured' : 'Not Configured'}
                    </span>
                  </div>
                  <button className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">
                    Check Health
                  </button>
                </div>
              </div>

              {/* Settings Section */}
              <div>
                <h3 className="text-sm font-medium mb-2">Settings</h3>
                <div className="flex items-center justify-between">
                  <label className="text-sm">Enable Notifications</label>
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => setIsEnabled(e.target.checked)}
                    className="w-4 h-4"
                  />
                </div>
              </div>

              <hr />

              {/* Test Notification */}
              <div>
                <h3 className="text-sm font-medium mb-2">Test Integration</h3>
                <button
                  onClick={sendTestNotification}
                  disabled={!isEnabled || !isConfigured}
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Send Test Notification
                </button>
              </div>

              <hr />

              {/* Notification History */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Recent Notifications</h3>
                  {notificationHistory.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Clear History
                    </button>
                  )}
                </div>

                <div className="max-h-32 overflow-y-auto">
                  {notificationHistory.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-4">
                      No notifications sent yet
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {notificationHistory.map((notification) => (
                        <div
                          key={notification.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                        >
                          <div className="flex items-center gap-2">
                            {notification.success ? (
                              <span className="text-green-500 text-xs">✓</span>
                            ) : (
                              <span className="text-red-500 text-xs">✗</span>
                            )}
                            <div className="text-xs">
                              <div className="font-medium">{notification.message}</div>
                              <div className="text-gray-500">
                                {notification.timestamp.toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              notification.success
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {notification.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Indicator */}
      {isConfigured && isEnabled && (
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Ready</span>
        </div>
      )}
      {!isConfigured && (
        <div className="flex items-center gap-1 text-xs text-yellow-600">
          <span>⚠️</span>
          <span>Not Configured</span>
        </div>
      )}
    </div>
  );
}
