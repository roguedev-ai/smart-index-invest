'use client';

import { useState } from 'react';
import { Brain, TrendingUp, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface AssetAllocation {
  symbol: string;
  name: string;
  allocation: number;
  reasoning: string;
  expectedReturn: string;
  riskLevel: 'Low' | 'Medium' | 'High';
}

interface AIStrategy {
  assets: AssetAllocation[];
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

interface AISuggestionsResponse {
  success: boolean;
  data?: {
    strategy: AIStrategy;
    marketAnalysis: any[];
    metaData: any;
  };
  fallback?: {
    strategy: AIStrategy;
    message: string;
  };
  error?: string;
}

interface SmartIndexAssistantProps {
  availableAssets: string[];
  userProfile: {
    riskTolerance: 'Low' | 'Medium' | 'High';
    investmentExperience: 'Beginner' | 'Intermediate' | 'Advanced';
    preferredTimeframe: string;
    preferredSectors: string[];
  };
  onStrategyGenerated?: (strategy: AIStrategy) => void;
  onClose?: () => void;
}

export default function SmartIndexAssistant({
  availableAssets,
  userProfile,
  onStrategyGenerated,
  onClose
}: SmartIndexAssistantProps) {
  const [loading, setLoading] = useState(false);
  const [aiStrategy, setAiStrategy] = useState<AIStrategy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const generateAIStrategy = async () => {
    if (availableAssets.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/strategy-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          availableAssets,
          userProfile,
          marketConditions: {
            momentum: 'Mixed',
            volatility: 'Moderate',
            sentiment: 'Neutral'
          }
        }),
      });

      const data: AISuggestionsResponse = await response.json();

      if (data.success && data.data) {
        setAiStrategy(data.data.strategy);
        setIsFallback(false);
        onStrategyGenerated?.(data.data.strategy);
      } else if (data.fallback) {
        setAiStrategy(data.fallback.strategy);
        setIsFallback(true);
        onStrategyGenerated?.(data.fallback.strategy);
      } else {
        throw new Error(data.error || 'Failed to generate AI strategy');
      }
    } catch (err) {
      console.error('AI Strategy Generation Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate AI strategy');
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (risk: string) => {
    const map = {
      'Low': { variant: 'default' as const, icon: CheckCircle2, color: 'text-green-600' },
      'Medium': { variant: 'secondary' as const, icon: TrendingUp, color: 'text-yellow-600' },
      'High': { variant: 'destructive' as const, icon: AlertTriangle, color: 'text-red-600' },
      'Conservative': { variant: 'outline' as const, icon: CheckCircle2, color: 'text-green-600' },
      'Moderate': { variant: 'secondary' as const, icon: TrendingUp, color: 'text-yellow-600' },
      'Aggressive': { variant: 'destructive' as const, icon: AlertTriangle, color: 'text-red-600' }
    };
    const config = map[risk as keyof typeof map] || map.Medium;
    const Icon = config.icon;
    return { ...config, Icon };
  };

  const getAICardIcon = (confidence: number) => {
    if (confidence >= 80) return { Icon: CheckCircle2, color: 'text-green-600', text: 'High Confidence' };
    if (confidence >= 60) return { Icon: TrendingUp, color: 'text-yellow-600', text: 'Moderate Confidence' };
    return { Icon: AlertTriangle, color: 'text-orange-600', text: 'Low Confidence' };
  };

  return (
    <div className="space-y-6">
      {/* AI Header */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Smart Index Assistant</CardTitle>
              <CardDescription>
                Get AI-powered investment recommendations tailored to your profile
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            onClick={generateAIStrategy}
            disabled={loading || availableAssets.length === 0}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Market Data...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Generate AI Strategy
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* AI Strategy Results */}
      {aiStrategy && (
        <>
          {/* AI Confidence & Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    AI Strategy Analysis
                    {isFallback && (
                      <Badge variant="outline" className="text-orange-600">
                        Fallback Strategy
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Optimized portfolio strategy based on AI analysis
                  </CardDescription>
                </div>
                {!isFallback && aiStrategy.optimizationScore && (
                  <div className="text-right">
                    {(() => {
                      const { Icon, color, text } = getAICardIcon(aiStrategy.optimizationScore / 10);
                      return (
                        <div className={`flex items-center gap-2 ${color}`}>
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{text}</span>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Strategy Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Overall Strategy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Strategy Overview
                  {(() => {
                    const { Icon, color, variant } = getRiskBadge(aiStrategy.overallRisk);
                    return (
                      <Badge variant={variant} className={color}>
                        <Icon className="w-3 h-3 mr-1" />
                        {aiStrategy.overallRisk}
                      </Badge>
                    );
                  })()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {aiStrategy.optimizationScore}/1000
                    </div>
                    <p className="text-sm text-gray-600">Optimization Score</p>
                    <Progress
                      value={aiStrategy.optimizationScore / 10}
                      className="h-2 mt-2"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Expected Total Return
                    </p>
                    <p className="text-lg font-semibold text-green-600">
                      {aiStrategy.expectedTotalReturn}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Strategy Rationale
                    </p>
                    <p className="text-sm text-gray-700">
                      {aiStrategy.rationale}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Asset Allocation */}
            <Card>
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
                <CardDescription>
                  Recommended portfolio breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiStrategy.assets.map((asset, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-blue-600">
                            {asset.symbol.slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{asset.name}</p>
                          <p className="text-xs text-gray-500">
                            {asset.expectedReturn} • {asset.riskLevel} risk
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{asset.allocation}%</p>
                        <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${asset.allocation}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                AI Insights & Explanations
              </CardTitle>
              <CardDescription>
                Detailed reasoning for each asset recommendation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiStrategy.assets.map((asset, index) => (
                  <div key={index} className="border-l-4 border-blue-200 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {asset.symbol} - {asset.name}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {asset.expectedReturn}
                        </span>
                        {(() => {
                          const { Icon, color, variant } = getRiskBadge(asset.riskLevel);
                          return (
                            <Badge variant={variant} className={`text-xs ${color}`}>
                              <Icon className="w-3 h-3 mr-1" />
                              {asset.riskLevel}
                            </Badge>
                          );
                        })()}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">
                      {asset.reasoning}
                    </p>
                  </div>
                ))}

                {/* Disclaimer */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900 mb-1">
                        AI-Assisted Recommendation
                      </p>
                      <p className="text-sm text-blue-800">
                        This is an AI-generated suggestion based on market analysis and your risk profile.
                        Always perform your own research and consider consulting with financial advisors.
                        Cryptocurrency investments carry inherent risks, including potential loss of principal.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Close Assistant
              </Button>
            )}
            <Button
              onClick={() => onStrategyGenerated?.(aiStrategy)}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Apply This Strategy
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
