// ai-service.ts
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Type definitions for AI responses
export interface MarketAnalysis {
  token: string;
  confidence: number;
  reasoning: string;
  expectedReturn: string;
  volatility: 'Low' | 'Medium' | 'High';
  marketPosition: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export interface AIStrategyRecommendation {
  assets: {
    symbol: string;
    name: string;
    allocation: number;
    reasoning: string;
    expectedReturn: string;
    riskLevel: 'Low' | 'Medium' | 'High';
  }[];
  overallRisk: 'Conservative' | 'Moderate' | 'Aggressive';
  expectedTotalReturn: string;
  optimizationScore: number;
  rationale: string;
  marketConditions: {
    momentum: 'Positive' | 'Negative' | 'Neutral';
    volatility: 'Low' | 'Moderate' | 'High';
    correlations: string[];
  };
}

export interface UserProfile {
  riskTolerance: 'Low' | 'Medium' | 'High';
  investmentExperience: 'Beginner' | 'Intermediate' | 'Advanced';
  preferredTimeframe: string;
  preferredSectors: string[];
  currentPortfolio?: any[];
}

export class DeFiAIService {
  constructor() {}

  /**
   * Analyzes potential assets for Smart Index inclusion
   */
  async analyzeAssetsForIndex(
    availableAssets: string[],
    userProfile: UserProfile
  ): Promise<MarketAnalysis[]> {
    const prompt = this.buildMarketAnalysisPrompt(availableAssets, userProfile);

    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-1106-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a DeFi market analyst AI specializing in cryptocurrency analysis for index fund creation. Your analysis must be data-driven, conservative, and focused on long-term performance.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.3'),
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      return this.parseMarketAnalysisResponse(response, availableAssets);
    } catch (error) {
      console.error('AI Market Analysis Error:', error);
      return this.getFallbackAnalysis(availableAssets);
    }
  }

  /**
   * Generates optimized index strategy recommendations
   */
  async generateIndexStrategy(
    userProfile: UserProfile,
    availableAssets: string[],
    marketConditions: any = {}
  ): Promise<AIStrategyRecommendation> {
    const prompt = this.buildStrategyRecommendationPrompt(userProfile, availableAssets, marketConditions);

    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-1106-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a DeFi portfolio strategist AI that creates optimal index fund strategies. Focus on risk-adjusted returns, diversification, and provide clear rationale for every recommendation.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.3'),
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      return this.parseStrategyRecommendationResponse(response);
    } catch (error) {
      console.error('AI Strategy Generation Error:', error);
      return this.getFallbackStrategy(userProfile, availableAssets);
    }
  }

  /**
   * Analyzes existing portfolio and suggests improvements
   */
  async analyzePortfolioOptimization(
    currentAssets: any[],
    timeHorizon: string,
    objectives: string[]
  ): Promise<any> {
    const prompt = this.buildPortfolioOptimizationPrompt(currentAssets, timeHorizon, objectives);

    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-1106-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a DeFi portfolio optimization AI. Provide specific, actionable recommendations for improving portfolio performance while managing risk.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1500'),
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.3'),
      });

      const response = completion.choices[0]?.message?.content;
      return this.parsePortfolioOptimizationResponse(response);
    } catch (error) {
      console.error('Portfolio Optimization Error:', error);
      return {
        recommendations: [],
        riskAssessment: 'Unable to analyze',
        confidence: 0,
      };
    }
  }

  /**
   * Analyzes creator performance and strategy effectiveness
   */
  async analyzeCreatorStrategy(
    strategyMetrics: any,
    marketComparison: any,
    timePeriod: string
  ): Promise<any> {
    const prompt = this.buildCreatorAnalysisPrompt(strategyMetrics, marketComparison, timePeriod);

    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-1106-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a DeFi strategy analyst AI. Evaluate creator performance compared to market benchmarks and provide specific recommendations for improvement.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1500'),
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.3'),
      });

      const response = completion.choices[0]?.message?.content;
      return this.parseCreatorAnalysisResponse(response);
    } catch (error) {
      console.error('Creator Analysis Error:', error);
      return {
        score: 70,
        strengths: ['Good diversification'],
        improvements: ['Consider rebalancing'],
        marketPosition: 'Middle quartile',
        confidence: 75,
      };
    }
  }

  // Private helper methods for prompt building
  private buildMarketAnalysisPrompt(assets: string[], userProfile: UserProfile): string {
    return `
Analyze the following cryptocurrencies for potential inclusion in a DeFi Smart Index:

Assets to analyze: ${assets.join(', ')}

User Profile:
- Risk Tolerance: ${userProfile.riskTolerance}
- Investment Experience: ${userProfile.investmentExperience}
- Timeframe: ${userProfile.preferredTimeframe}
- Preferred Sectors: ${userProfile.preferredSectors.join(', ')}

For each asset, provide:
1. Recommendation confidence (0-100)
2. Expected return assessment
3. Volatility classification (Low/Medium/High)
4. Market position sentiment (BULLISH/BEARISH/NEUTRAL)
5. Specific reasoning with data-driven factors

Focus on DeFi ecosystem relevance, correlation benefits, and risk-adjusted potential.
Format your response as a structured JSON array with the required fields.
    `;
  }

  private buildStrategyRecommendationPrompt(
    userProfile: UserProfile,
    availableAssets: string[],
    marketConditions: any
  ): string {
    return `
Create an optimal DeFi Smart Index strategy:

User Investment Profile:
- Risk Level: ${userProfile.riskTolerance}
- Experience: ${userProfile.investmentExperience}
- Time Horizon: ${userProfile.preferredTimeframe}
- Sectors of Interest: ${userProfile.preferredSectors.join(', ')}

Available Assets: ${availableAssets.join(', ')}

Market Conditions:
- Momentum: ${marketConditions.momentum || 'Mixed'}
- Volatility: ${marketConditions.volatility || 'Moderate'}
- Overall Market Sentiment: ${marketConditions.sentiment || 'Neutral'}

Recommend 4-6 assets with:
1. Percentage allocations (total = 100%)
2. Asset names and symbols
3. Risk classification for each
4. Expected individual returns
5. Clear rationale for inclusion

Overall strategy should be:
- Well diversified across sectors
- Aligned with risk tolerance
- Positioned for growth potential
- Include an overall risk and return assessment

Provide response in structured JSON format with clear reasoning.
    `;
  }

  private buildPortfolioOptimizationPrompt(assets: any[], timeHorizon: string, objectives: string[]): string {
    return `
Analyze and optimize this DeFi portfolio:

Portfolio Assets:
${assets.map(asset => `- ${asset.symbol}: ${asset.allocation}%`).join('\n')}

Time Horizon: ${timeHorizon}
Objectives: ${objectives.join(', ')}

Provide specific recommendations for:
1. Rebalancing opportunities
2. Risk reduction strategies
3. Performance improvement suggestions
4. New asset considerations

Focus on practical, actionable advice with clear rationale.
    `;
  }

  private buildCreatorAnalysisPrompt(strategy: any, market: any, period: string): string {
    return `
Analyze this DeFi creator strategy performance:

Strategy Metrics: ${JSON.stringify(strategy)}
Market Comparison: ${JSON.stringify(market)}
Time Period: ${period}

Provide:
1. Overall strategy score (0-100)
2. Key strengths identified
3. Areas for improvement
4. Market positioning assessment
5. Specific optimization recommendations

Be constructive and data-driven in your analysis.
    `;
  }

  // Response parsing methods
  private parseMarketAnalysisResponse(response: string, assets: string[]): MarketAnalysis[] {
    try {
      const parsed = JSON.parse(response);
      if (Array.isArray(parsed)) {
        return parsed.map((analysis: any, index: number) => ({
          token: assets[index] || 'UNKNOWN',
          confidence: Math.min(100, Math.max(0, analysis.confidence || 70)),
          reasoning: analysis.reasoning || 'AI analysis pending',
          expectedReturn: analysis.expectedReturn || 'To be determined',
          volatility: ['Low', 'Medium', 'High'].includes(analysis.volatility) ? analysis.volatility : 'Medium',
          marketPosition: ['BULLISH', 'BEARISH', 'NEUTRAL'].includes(analysis.marketPosition) ?
                         analysis.marketPosition : 'NEUTRAL',
        })) as MarketAnalysis[];
      }
    } catch (error) {
      console.error('Failed to parse market analysis response:', error);
    }

    // Return fallback analysis if parsing fails
    return this.getFallbackAnalysis(assets);
  }

  private parseStrategyRecommendationResponse(response: string): AIStrategyRecommendation {
    try {
      const parsed = JSON.parse(response);
      return {
        assets: (parsed.assets || []).map((asset: any) => ({
          symbol: asset.symbol || 'UNKNOWN',
          name: asset.name || 'Unknown Asset',
          allocation: Math.min(100, Math.max(0, asset.allocation || 10)),
          reasoning: asset.reasoning || 'Diversification benefit',
          expectedReturn: asset.expectedReturn || 'Moderate',
          riskLevel: ['Low', 'Medium', 'High'].includes(asset.riskLevel) ? asset.riskLevel : 'Medium',
        })),
        overallRisk: ['Conservative', 'Moderate', 'Aggressive'].includes(parsed.overallRisk) ?
                     parsed.overallRisk : 'Moderate',
        expectedTotalReturn: parsed.expectedTotalReturn || 'To be determined',
        optimizationScore: Math.min(1000, Math.max(0, parsed.optimizationScore || 500)),
        rationale: parsed.rationale || 'Balanced portfolio approach',
        marketConditions: parsed.marketConditions || {
          momentum: 'Neutral',
          volatility: 'Moderate',
          correlations: [],
        },
      };
    } catch (error) {
      console.error('Failed to parse strategy recommendation:', error);
    }

    // Return a conservative fallback strategy
    return {
      assets: [
        { symbol: 'USDC', name: 'USD Coin', allocation: 40, reasoning: 'Stability anchor', expectedReturn: 'Conservative', riskLevel: 'Low' },
        { symbol: 'WETH', name: 'Wrapped Ether', allocation: 30, reasoning: 'Ethereum ecosystem exposure', expectedReturn: 'High', riskLevel: 'High' },
        { symbol: 'LINK', name: 'Chainlink', allocation: 20, reasoning: 'Oracle network utility', expectedReturn: 'Moderate', riskLevel: 'Medium' },
        { symbol: 'UNI', name: 'Uniswap', allocation: 10, reasoning: 'DeFi protocol utility', expectedReturn: 'Moderate', riskLevel: 'Medium' },
      ],
      overallRisk: 'Moderate',
      expectedTotalReturn: 'Conservative estimate: 8-12% annual',
      optimizationScore: 650,
      rationale: 'Balanced approach prioritizing stability with growth potential',
      marketConditions: { momentum: 'Neutral', volatility: 'Moderate', correlations: [] },
    };
  }

  private parsePortfolioOptimizationResponse(response: string) {
    // Implementation for portfolio optimization parsing
    return JSON.parse(response);
  }

  private parseCreatorAnalysisResponse(response: string) {
    // Implementation for creator analysis parsing
    return JSON.parse(response);
  }

  private getFallbackAnalysis(assets: string[]): MarketAnalysis[] {
    return assets.map((asset) => ({
      token: asset,
      confidence: 70,
      reasoning: 'Standard DeFi analysis - consult market data for current conditions',
      expectedReturn: 'Market average',
      volatility: 'Medium',
      marketPosition: 'NEUTRAL',
    }));
  }

  private getFallbackStrategy(userProfile: UserProfile, assets: string[]): AIStrategyRecommendation {
    const riskMap = {
      Low: { assets: ['USDC', 'USDT', 'DAI'], allocations: [40, 30, 30] },
      Medium: { assets: ['USDC', 'WETH', 'LINK'], allocations: [30, 40, 30] },
      High: { assets: ['ETH', 'BTC', 'SOL'], allocations: [50, 30, 20] },
    };

    const riskProfile = riskMap[userProfile.riskTolerance || 'Medium'];

    return {
      assets: riskProfile.assets.slice(0, 3).map((symbol, index) => ({
        symbol,
        name: symbol,
        allocation: riskProfile.allocations[index],
        reasoning: 'Conservative diversification strategy',
        expectedReturn: 'Market-correlated',
        riskLevel: userProfile.riskTolerance || 'Medium',
      })),
      overallRisk: userProfile.riskTolerance || 'Medium',
      expectedTotalReturn: 'Conservative portfolio estimate',
      optimizationScore: 600,
      rationale: 'Stable diversification approach aligned with risk tolerance',
      marketConditions: { momentum: 'Neutral', volatility: 'Moderate', correlations: [] },
    };
  }
}

// Export singleton instance
export const deFiAIService = new DeFiAIService();
