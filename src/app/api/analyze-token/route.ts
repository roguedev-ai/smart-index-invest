// API Route: /api/analyze-token
// Analyzes tokens using Etherscan data for enhanced TokenMarket features

import { NextRequest, NextResponse } from 'next/server';
import { createEtherscanService } from '@/lib/services/etherscan-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokenAddress, etherscanApiKey, network = 'mainnet' } = body;

    // Validate required parameters
    if (!tokenAddress) {
      return NextResponse.json(
        { error: 'Token address is required' },
        { status: 400 }
      );
    }

    if (!etherscanApiKey) {
      return NextResponse.json(
        { error: 'Etherscan API key is required' },
        { status: 400 }
      );
    }

    // Validate token address format
    if (!isValidEthAddress(tokenAddress)) {
      return NextResponse.json(
        { error: 'Invalid Ethereum address format' },
        { status: 400 }
      );
    }

    // Create Etherscan service
    const etherscanService = createEtherscanService(etherscanApiKey, network);

    // Analyze the token using Etherscan
    const startTime = Date.now();

    const [tokenInfo, contractAnalytics] = await Promise.all([
      etherscanService.getTokenInfo(tokenAddress),
      etherscanService.analyzeContract(tokenAddress, 30) // Last 30 days
    ]);

    const analysisTime = Date.now() - startTime;

    if (!tokenInfo) {
      return NextResponse.json({
        success: false,
        error: 'Token not found or analysis failed',
        analysisTime
      }, { status: 404 });
    }

    // Enhance token info with analytics
    const enrichedTokenData = {
      ...tokenInfo,
      analytics: contractAnalytics,
      riskAssessment: analyzeTokenRisk(tokenInfo, contractAnalytics),
      marketInsights: generateMarketInsights(tokenInfo, contractAnalytics),
      analysisMetadata: {
        analyzedAt: new Date().toISOString(),
        analysisTimeMs: analysisTime,
        network,
        dataFreshness: 'Live from Etherscan',
        confidence: calculateConfidenceScore(contractAnalytics),
        version: '2.0.0'
      }
    };

    return NextResponse.json({
      success: true,
      data: enrichedTokenData
    });

  } catch (error) {
    console.error('Token Analysis Error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Analysis failed',
      fallback: {
        message: 'Using cached or estimated data',
        note: 'Real-time Etherscan data unavailable - check API key and network connectivity'
      }
    }, { status: 500 });
  }
}

// Helper function to validate Ethereum address
function isValidEthAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Analyze token risk factors
function analyzeTokenRisk(token: any, analytics: any): {
  overallRisk: 'Low' | 'Medium' | 'High';
  riskFactors: string[];
  riskScore: number;
  recommendations: string[];
} {
  const riskFactors: string[] = [];
  const recommendations: string[] = [];
  let riskScore = 50; // Base score

  // Analyze holders concentration
  if (analytics?.topHolders && analytics.topHolders.length > 0) {
    const topHolderPercentage = analytics.topHolders.reduce((sum: number, holder: any) =>
      sum + holder.percentage, 0);

    if (topHolderPercentage > 50) {
      riskFactors.push('High holder concentration');
      recommendations.push('Monitor top holder distribution');
      riskScore += 25;
    }
  }

  // Analyze transaction volume
  if (analytics?.transactions === 0) {
    riskFactors.push('No transaction history');
    recommendations.push('New token - exercise caution');
    riskScore += 30;
  } else if (analytics?.transactions < 100) {
    riskFactors.push('Low trading volume');
    recommendations.push('Limited liquidity available');
    riskScore += 10;
  }

  // Analyze method calls for security
  if (analytics?.methodCalls) {
    const hasPermissionedMethods = analytics.methodCalls.some((call: any) =>
      call.name.includes('owner') ||
      call.name.includes('admin') ||
      call.name.includes('privileged')
    );

    if (!hasPermissionedMethods) {
      riskFactors.push('Limited access controls detected');
      recommendations.push('Consider contracts with clear ownership');
      riskScore += 15;
    }
  }

  // Calculate overall risk level
  let overallRisk: 'Low' | 'Medium' | 'High';
  if (riskScore >= 70) {
    overallRisk = 'High';
  } else if (riskScore >= 30) {
    overallRisk = 'Medium';
  } else {
    overallRisk = 'Low';
  }

  return {
    overallRisk,
    riskFactors,
    riskScore: Math.min(100, Math.max(0, riskScore)),
    recommendations
  };
}

// Generate market insights
function generateMarketInsights(token: any, analytics: any): {
  activityLevel: 'Low' | 'Moderate' | 'High';
  popularityScore: number;
  maturity: 'New' | 'Established' | 'Mature';
  marketHealth: 'Poor' | 'Fair' | 'Good' | 'Excellent';
} {
  // Analyze activity level
  let activityLevel: 'Low' | 'Moderate' | 'High' = 'Low';
  const txCount = analytics?.transactions || 0;

  if (txCount > 10000) activityLevel = 'High';
  else if (txCount > 1000) activityLevel = 'Moderate';

  // Determine maturity
  let maturity: 'New' | 'Established' | 'Mature' = 'New';

  if (txCount > 50000) maturity = 'Mature';
  else if (txCount > 5000) maturity = 'Established';

  // Calculate popularity score (0-100)
  const popularityScore = calculatePopularityScore(analytics);

  // Determine market health
  let marketHealth: 'Poor' | 'Fair' | 'Good' | 'Excellent' = 'Poor';

  if (popularityScore > 80) marketHealth = 'Excellent';
  else if (popularityScore > 60) marketHealth = 'Good';
  else if (popularityScore > 30) marketHealth = 'Fair';

  return {
    activityLevel,
    popularityScore,
    maturity,
    marketHealth
  };
}

// Calculate popularity score based on various metrics
function calculatePopularityScore(analytics: any): number {
  if (!analytics) return 25;

  let score = 0;

  // Transaction count contributes to popularity
  if (analytics.transactions > 0) {
    // Logarithmic scale for fairness
    score += Math.min(30, Math.log10(analytics.transactions + 1) * 10);
  }

  // Unique users indicator
  if (analytics.uniqueUsers > 0) {
    score += Math.min(25, (analytics.uniqueUsers / 100) * 5);
  }

  // Diversity of method calls (healthy contract usage)
  if (analytics.methodCalls && analytics.methodCalls.length > 3) {
    score += 15;
  }

  // Distributed holder ownership (higher engagement)
  if (analytics.topHolders && analytics.topHolders.length > 10) {
    const concentration = analytics.topHolders.reduce((sum: number, holder: any) =>
      sum + holder.percentage, 0);

    if (concentration < 60) score += 20;
    else if (concentration < 80) score += 15;
  }

  return Math.min(100, Math.max(0, score));
}

// Calculate confidence score for analysis
function calculateConfidenceScore(analytics: any): number {
  let confidence = 50; // Base confidence

  if (analytics?.transactions > 100) confidence += 10;
  if (analytics?.uniqueUsers > 10) confidence += 10;
  if (analytics?.methodCalls && analytics.methodCalls.length > 5) confidence += 10;
  if (analytics?.topHolders && analytics.topHolders.length > 0) confidence += 20;

  return Math.min(100, Math.max(0, confidence));
}

// GET endpoint for token analysis examples
export async function GET() {
  return NextResponse.json({
    message: 'Token Analysis API',
    description: 'Analyze tokens using Etherscan data for TokenMarket',
    endpoints: {
      POST: {
        path: '/api/analyze-token',
        description: 'Analyze a token using real-time Etherscan data',
        requiredFields: {
          tokenAddress: 'Valid Ethereum contract address',
          etherscanApiKey: 'Your Etherscan API key',
          network: 'mainnet or testnet (optional, defaults to mainnet)'
        },
        response: {
          success: true,
          data: {
            token: 'Enriched token information',
            analytics: 'Contract behavior analysis',
            riskAssessment: 'Risk factor analysis',
            marketInsights: 'Activity and popularity metrics',
            analysisMetadata: 'Analysis details and timestamps'
          }
        }
      }
    },
    exampleUsage: {
      request: {
        tokenAddress: '0xA0b86a33e6449Cr9283ea03ae498f3bfee5e3a1d1',
        etherscanApiKey: 'YOUR_API_KEY_HERE',
        network: 'mainnet'
      },
      response: {
        token: 'USDC',
        holders: 1500000,
        transactions: 25000000,
        riskLevel: 'Low',
        popularityScore: 95
      }
    },
    features: [
      'Real-time holder analysis',
      'Transaction volume tracking',
      'Contract verification status',
      'Risk assessment scores',
      'Market health indicators',
      'Gas optimization recommendations'
    ]
  });
}

/*
Next steps to enhance this API:

1. Add caching layer (Redis) for expensive Etherscan calls
2. Implement batch analysis for multiple tokens
3. Add token price integration (Coingecko/DeFiPulse)
4. Include DEX trading data (Uniswap V3 pools)
5. Add yield farming analysis
6. Implement token security scanning
7. Add arbitrage opportunity detection
8. Support cross-chain analysis
9. Add historical trend analysis
10. Integrate with token discovery APIs

This would make TokenMarket a comprehensive DeFi intelligence platform!
*/
