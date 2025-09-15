import { NextRequest, NextResponse } from 'next/server';
import { deFiAIService } from '@/lib/services/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      availableAssets,
      userProfile,
      marketConditions = {}
    } = body;

    // Validate required fields
    if (!availableAssets || !userProfile) {
      return NextResponse.json(
        { error: 'Missing required fields: availableAssets, userProfile' },
        { status: 400 }
      );
    }

    if (!Array.isArray(availableAssets) || availableAssets.length === 0) {
      return NextResponse.json(
        { error: 'availableAssets must be a non-empty array' },
        { status: 400 }
      );
    }

    // Generate AI-powered strategy recommendations
    const startTime = Date.now();

    const [marketAnalysis, strategyRecommendation] = await Promise.all([
      deFiAIService.analyzeAssetsForIndex(availableAssets, userProfile),
      deFiAIService.generateIndexStrategy(userProfile, availableAssets, marketConditions)
    ]);

    const processingTime = Date.now() - startTime;

    // Return comprehensive AI analysis
    return NextResponse.json({
      success: true,
      data: {
        strategy: strategyRecommendation,
        marketAnalysis: marketAnalysis,
        metaData: {
          processedAssets: availableAssets.length,
          processingTimeMs: processingTime,
          aiConfidence: strategyRecommendation.optimizationScore / 1000, // Convert to 0-1 scale
          generatedAt: new Date().toISOString(),
          version: '1.0.0'
        }
      }
    });

  } catch (error) {
    console.error('AI Strategy Generation Error:', error);

    // Return fallback response in case of AI service failure
    return NextResponse.json({
      success: false,
      error: 'AI service temporarily unavailable',
      fallback: {
        strategy: {
          assets: [
            { symbol: 'USDC', name: 'USD Coin', allocation: 40, reasoning: 'Stability and liquidity', expectedReturn: 'Conservative', riskLevel: 'Low' },
            { symbol: 'USDT', name: 'Tether', allocation: 30, reasoning: 'Stable value preservation', expectedReturn: 'Conservative', riskLevel: 'Low' },
            { symbol: 'WETH', name: 'Wrapped Ether', allocation: 20, reasoning: 'ETH exposure for growth', expectedReturn: 'Growth', riskLevel: 'Medium' },
            { symbol: 'LINK', name: 'Chainlink', allocation: 10, reasoning: 'Web3 infrastructure provider', expectedReturn: 'Growth', riskLevel: 'Medium' }
          ] as const,
          overallRisk: 'Conservative' as const,
          expectedTotalReturn: 'Conservative portfolio estimate: 6-10% annual',
          optimizationScore: 550,
          rationale: 'Conservative balanced portfolio as fallback',
          marketConditions: {
            momentum: 'Neutral' as const,
            volatility: 'Low' as const,
            correlations: []
          }
        },
        message: 'Using conservative fallback strategy while AI service initializes'
      }
    }, { status: 503 });
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'AI Strategy Suggestions API',
    endpoints: {
      POST: '/api/ai/strategy-suggestions',
      description: 'Generate AI-powered Smart Index strategy recommendations',
      requiredFields: {
        availableAssets: 'Array of token symbols to consider',
        userProfile: 'User investment profile with risk tolerance',
        marketConditions: 'Optional market sentiment data'
      }
    },
    exampleRequest: {
      availableAssets: ['WETH', 'WBTC', 'USDC', 'LINK', 'UNI', 'AAVE'],
      userProfile: {
        riskTolerance: 'Medium',
        investmentExperience: 'Intermediate',
        preferredTimeframe: '6 months',
        preferredSectors: ['DeFi', 'Infrastructure']
      },
      marketConditions: {
        momentum: 'Positive',
        volatility: 'Moderate',
        sentiment: 'Bullish'
      }
    }
  });
}
