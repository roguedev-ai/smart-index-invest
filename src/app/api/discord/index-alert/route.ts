import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDiscordClient } from '@/lib/discord';

// Zod schema for index alert validation
const indexAlertSchema = z.object({
  indexName: z.string().min(1),
  creator: z.string().min(1),
  action: z.enum(['created', 'updated']),
  tokenCount: z.number().optional(),
  totalValue: z.string().optional(),
  description: z.string().optional(),
});

/**
 * POST /api/discord/index-alert - Send index alert to Discord
 * Specialized endpoint for index creation/update notifications
 * Includes detailed index information in Discord embed
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = indexAlertSchema.parse(body);
    const { indexName, creator, action, tokenCount, totalValue, description } = validatedData;

    const discord = getDiscordClient();
    if (!discord) {
      return NextResponse.json(
        { success: false, error: 'Discord webhook not configured' },
        { status: 400 }
      );
    }

    // Send index alert
    const result = await discord.sendIndexAlert({
      indexName,
      creator,
      action,
      timestamp: new Date(),
      tokenCount,
      totalValue,
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Failed to send Discord notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Index ${action} alert sent successfully`,
      data: {
        indexName,
        creator,
        action,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Discord index alert error:', error);

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
