// API Route: Get Swap Price
// Smart Index Invest Platform
// Get indicative pricing for token swaps

import { NextRequest, NextResponse } from 'next/server';
import { ZeroXSwapService } from '../../../../lib/swap/0x-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      chainId,
      sellToken,
      buyToken,
      sellAmount,
      taker,
      slippage = 1
    } = body;

    // Validation
    if (!chainId || !sellToken || !buyToken || !sellAmount || !taker) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    if (sellAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      );
    }

    if (slippage < 0 || slippage > 5) {
      return NextResponse.json(
        { success: false, error: 'Slippage must be between 0 and 5%' },
        { status: 400 }
      );
    }

    const swapService = new ZeroXSwapService();
    const price = await swapService.getPrice({
      chainId: chainId.toString(),
      sellToken,
      buyToken,
      sellAmount: sellAmount.toString(),
      taker: taker.toString(),
      slippageBps: Math.floor(slippage * 100), // Convert % to basis points
    });

    return NextResponse.json({
      success: true,
      price,
      timestamp: Date.now(),
    });

  } catch (error: any) {
    console.error('Swap Price API Error:', error);

    // Handle different error types
    if (error.message?.includes('Chain') && error.message?.includes('not supported')) {
      return NextResponse.json(
        { success: false, error: 'Chain not supported' },
        { status: 400 }
      );
    }

    if (error.message?.includes('Cannot swap same token')) {
      return NextResponse.json(
        { success: false, error: 'Cannot swap same token' },
        { status: 400 }
      );
    }

    if (error.message?.includes('API Error')) {
      return NextResponse.json(
        { success: false, error: 'Exchange rate unavailable' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get price'
      },
      { status: 500 }
    );
  }
}

// Health check for API status
export async function GET() {
  const swapService = new ZeroXSwapService();

  return NextResponse.json({
    success: true,
    message: 'Swap price API available',
    supportedChains: swapService.getSupportedChains(),
    timestamp: Date.now(),
  });
}
