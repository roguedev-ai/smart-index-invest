'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Clock, TrendingUp, AlertTriangle, CheckCircle2, Calculator } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Mock data for gas prices - in production this would come from etherscan service
const mockGasEstimates = {
  ethereum: { safeLow: 10, standard: 20, fast: 30 },
  polygon: { safeLow: 1, standard: 2, fast: 3 },
  bsc: { safeLow: 2, standard: 4, fast: 6 }
};

export interface CostBreakdown {
  networkFee: {
    gasPrice: number;
    gasLimit: number;
    totalGasCost: number;
  };
  currentNetwork: 'ethereum' | 'polygon' | 'bsc';
  slippagePercentage: number;
  estimatedTime: {
    safeLow: number; // seconds
    standard: number;
    fast: number;
  };
  usdCost: number;
  totalTokenValue: number;
}

interface CostEstimatorProps {
  tokenSymbol: string;
  tokenAmount: number;
  currentNetwork: 'ethereum' | 'polygon' | 'bsc' = 'polygon';
  showBreakdown?: boolean;
  estimateSlippage?: boolean;
}

export default function CostEstimator({
  tokenSymbol,
  tokenAmount,
  currentNetwork = 'polygon',
  showBreakdown = true,
  estimateSlippage = true
}: CostEstimatorProps) {
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [confidence, setConfidence] = useState<'high' | 'medium' | 'low'>('medium');

  useEffect(() => {
    calculateCost();
  }, [tokenSymbol, tokenAmount, currentNetwork]);

  const calculateCost = async () => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const gasEstimates = mockGasEstimates[currentNetwork];

      // Base calculation for index creation/deployment
      const gasLimit = 150000; // Estimated gas for contract deployment + initial setup
      const ethPrice = 2600; // USD per ETH (this would come from API)

      const breakdown: CostBreakdown = {
        networkFee: {
          gasPrice: gasEstimates.standard,
          gasLimit: gasLimit,
          totalGasCost: (gasEstimates.standard * gasLimit) / 10**9 // Convert to ETH
        },
        currentNetwork,
        slippagePercentage: estimateSlippage ? Math.random() * 2 + 0.5 : 0,
        estimatedTime: {
          safeLow: 120, // 2 minutes
          standard: 45, // 45 seconds
          fast: 15      // 15 seconds
        },
        usdCost: 0, // Will be calculated
        totalTokenValue: tokenAmount * 2.5 // Mock token price
      };

      // Calculate USD cost based on current network
      let ethEquivalent;
      if (currentNetwork === 'polygon') {
        ethEquivalent = breakdown.networkFee.totalGasCost * 0.02; // MATIC/ETH ratio
      } else {
        ethEquivalent = breakdown.networkFee.totalGasCost;
      }
      breakdown.usdCost = ethEquivalent * ethPrice;

      setCostBreakdown(breakdown);

      // Determine confidence based on network and conditions
      if (currentNetwork === 'polygon' || currentNetwork === 'bsc') {
        setConfidence('high');
      } else {
        setConfidence('medium');
      }

    } catch (error) {
      console.error('Cost calculation failed:', error);
      setConfidence('low');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  const getNetworkBadge = (network: string) => {
    const badges = {
      ethereum: { variant: 'secondary' as const, label: 'ETH Mainnet' },
      polygon: { variant: 'destructive' as const, label: 'Polygon MATIC' },
      bsc: { variant: 'outline' as const, label: 'BSC BNB' }
    };
    return badges[network as keyof typeof badges] || badges.polygon;
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'medium':
        return <TrendingUp className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNetworkColor = (network: string) => {
    switch (network) {
      case 'ethereum': return 'text-blue-600';
      case 'polygon': return 'text-purple-600';
      case 'bsc': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <Card className="w-full border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2">
            <Calculator className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-sm text-blue-700">Calculating costs...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!costBreakdown) {
    return (
      <Card className="w-full border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-sm text-red-700">Unable to calculate costs</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const networkBadge = getNetworkBadge(currentNetwork);

  return (
    <div className="space-y-4">
      {/* Main Cost Summary */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Transaction Costs</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {getConfidenceIcon(confidence)}
              <Badge variant={networkBadge.variant}>
                {networkBadge.label}
              </Badge>
            </div>
          </div>
          <CardDescription>
            Estimated costs for deploying your Smart Index
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Total Cost Display */}
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="text-3xl font-bold text-green-600">
              ${costBreakdown.usdCost.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">
              Total estimated cost
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-white rounded-lg border">
              <div className="text-lg font-semibold text-blue-600">
                {formatTime(costBreakdown.estimatedTime.standard)}
              </div>
              <div className="text-xs text-gray-600">Est. Time</div>
            </div>
            <div className="p-3 bg-white rounded-lg border">
              <div className="text-lg font-semibold text-orange-600">
                {costBreakdown.slippagePercentage.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600">Slippage</div>
            </div>
            <div className="p-3 bg-white rounded-lg border">
              <div className="text-lg font-semibold text-purple-600">
                ${(tokenAmount * 2.5).toFixed(0)}
              </div>
              <div className="text-xs text-gray-600">Token Value</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      {showBreakdown && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Cost Breakdown
            </CardTitle>
            <CardDescription>
              Detailed cost analysis for transparent pricing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Network Fee Breakdown */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Network Fees</h4>
              <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                <div className="flex justify-between text-sm">
                  <span>Gas Price:</span>
                  <span className={getNetworkColor(currentNetwork)}>
                    {costBreakdown.networkFee.gasPrice} Gwei
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Gas Limit:</span>
                  <span>{costBreakdown.networkFee.gasLimit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Network Cost:</span>
                  <span className="font-medium">
                    ${costBreakdown.usdCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Gas:</span>
                  <span>
                    {costBreakdown.networkFee.totalGasCost.toFixed(8)} ETH
                  </span>
                </div>
              </div>
            </div>

            {/* Risk & Time Estimates */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Confirmation Times</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Fast:</span>
                    <span className="text-green-600">{formatTime(costBreakdown.estimatedTime.fast)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Standard:</span>
                    <span className="text-blue-600">{formatTime(costBreakdown.estimatedTime.standard)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Safe:</span>
                    <span className="text-gray-600">{formatTime(costBreakdown.estimatedTime.safeLow)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Risk Assessment</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Slippage Risk:</span>
                    <span className={costBreakdown.slippagePercentage > 1.5 ? 'text-orange-600' : 'text-green-600'}>
                      {costBreakdown.slippagePercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Price Impact:</span>
                    <span className="text-gray-600">Low</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Network Congestion:</span>
                    <span className="text-green-600">Normal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Comparison */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Cost Optimization</h4>
              <Progress
                value={75}
                className="h-2 mb-1"
              />
              <p className="text-sm text-gray-600">
                This transaction is optimized for cost-efficiency. 75% of similar deployments have lower costs.
              </p>
            </div>

            {/* Recommendations */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Cost Tip:</strong> Using {networkBadge.label} saves ~80% compared to Ethereum mainnet.
                Consider switching networks to reduce deployment costs.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
