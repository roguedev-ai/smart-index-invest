import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDiscordClient } from '@/lib/discord';

// Zod schema for notification validation
const notificationSchema = z.object({
  type: z.enum(['user_joined', 'index_created', 'index_updated', 'trade_executed', 'performance_update']),
  data: z.record(z.any()),
});

// Rate limiting store (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const key = ip;
  const limit = rateLimitMap.get(key);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (limit.count >= maxRequests) {
    return false;
  }

  limit.count++;
  return true;
}

/**
 * GET /api/discord/notify - Health check endpoint
 * Returns status of Discord webhook integration
 */
export async function GET() {
  try {
    const client = getDiscordClient();
    const isEnabled = process.env.NEXT_PUBLIC_ENABLE_DISCORD_INTEGRATION === 'true';
    const webhookConfigured = !!process.env.DISCORD_WEBHOOK_URL;

    return NextResponse.json({
      success: true,
      status: {
        enabled: isEnabled,
        webhookConfigured: webhookConfigured,
        clientReady: !!client,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Health check failed' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/discord/notify - Send notification to Discord
 * Accepts different types of event notifications
 */
export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validatedData = notificationSchema.parse(body);
    const { type, data } = validatedData;

    const discord = getDiscordClient();
    if (!discord) {
      return NextResponse.json(
        { success: false, error: 'Discord webhook not configured' },
        { status: 400 }
      );
    }

    let result: boolean;

    switch (type) {
      case 'user_joined':
        if (!data.userAddress) {
          return NextResponse.json(
            { success: false, error: 'userAddress required for user_joined' },
            { status: 400 }
          );
        }
        result = await discord.sendWelcomeMessage(data.userAddress);
        break;

      case 'index_created':
        if (!data.indexName || !data.creator) {
          return NextResponse.json(
            { success: false, error: 'indexName and creator required for index_created' },
            { status: 400 }
          );
        }
        result = await discord.sendIndexAlert({
          indexName: data.indexName,
          creator: data.creator,
          action: 'created',
          timestamp: new Date(),
          tokenCount: data.tokenCount,
          totalValue: data.totalValue,
        });
        break;

      case 'index_updated':
        if (!data.indexName || !data.creator) {
          return NextResponse.json(
            { success: false, error: 'indexName and creator required for index_updated' },
            { status: 400 }
          );
        }
        result = await discord.sendIndexAlert({
          indexName: data.indexName,
          creator: data.creator,
          action: 'updated',
          timestamp: new Date(),
          ...data,
        });
        break;

      case 'trade_executed':
        if (!data.buyer || !data.seller || !data.amount || !data.indexName || !data.price) {
          return NextResponse.json(
            { success: false, error: 'buyer, seller, amount, indexName, and price required for trade_executed' },
            { status: 400 }
          );
        }
        result = await discord.sendTradingNotification({
          buyer: data.buyer,
          seller: data.seller,
          amount: data.amount,
          indexName: data.indexName,
          price: data.price,
          timestamp: new Date(),
          transactionHash: data.transactionHash,
        });
        break;

      case 'performance_update':
        if (!data.indexName || !data.performance || !data.timeframe || data.changePercent === undefined) {
          return NextResponse.json(
            { success: false, error: 'indexName, performance, timeframe, and changePercent required for performance_update' },
            { status: 400 }
          );
        }
        result = await discord.sendPerformanceUpdate({
          indexName: data.indexName,
          performance: data.performance,
          timeframe: data.timeframe,
          changePercent: data.changePercent,
          timestamp: new Date(),
          topPerformers: data.topPerformers,
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Unsupported notification type' },
          { status: 400 }
        );
    }

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Failed to send Discord notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Notification sent successfully' });

  } catch (error) {
    console.error('Discord notification error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
