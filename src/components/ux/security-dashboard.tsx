'use client';

import { useState } from 'react';

interface SecurityDashboardProps {
  contractAddress?: string;
  verified?: boolean;
  audited?: boolean;
  creator?: string;
  renounceable?: boolean;
  currentOwner?: string;
}

export default function SecurityDashboard({
  contractAddress = 'N/A',
  verified = false,
  audited = false,
  creator,
  renounceable = true,
  currentOwner
}: SecurityDashboardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTrustLevel = () => {
    let score = 0;
    if (verified) score += 40;
    if (audited) score += 40;
    if (renounceable && currentOwner === creator) score += 20;

    return score;
  };

  const trustScore = getTrustLevel();
  const trustColor = trustScore >= 80 ? 'text-green-600' :
                     trustScore >= 60 ? 'text-yellow-600' :
                     'text-red-600';

  const trustLabel = trustScore >= 80 ? 'High Trust' :
                     trustScore >= 60 ? 'Moderate Trust' :
                     'Low Trust';

  return (
    <div className={`p-4 border-2 rounded-lg ${verified ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${verified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
          <span className="font-medium text-gray-800">
            Security & Trust Status
          </span>
          <span className={`text-sm font-bold ${trustColor}`}>
            {trustScore}/100
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 text-sm hover:underline"
        >
          {isExpanded ? 'Less' : 'Details'}
        </button>
      </div>

      {/* Trust Badge */}
      <div className="mb-3">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {trustLabel}
        </span>
        {verified && (
          <span className="inline-flex items-center ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✓ Verified Source Code
          </span>
        )}
      </div>

      {/* Quick Status */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${audited ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span>Audited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${verified ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span>Verified</span>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 p-3 bg-white rounded border space-y-3">
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-700">Contract Address:</span>
              <div className="font-mono text-xs bg-gray-100 p-1 rounded mt-1 break-all">
                {contractAddress}
              </div>
            </div>

            {creator && (
              <div>
                <span className="text-sm font-medium text-gray-700">Creator:</span>
                <div className="font-mono text-xs bg-gray-100 p-1 rounded mt-1 break-all">
                  {creator}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Ownership:</span>
              <span className={`text-sm font-medium ${renounceable ? 'text-green-600' : 'text-orange-600'}`}>
                {renounceable ? 'Renounceable' : 'Controlled'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Audit:</span>
              <span className={`text-sm font-medium ${audited ? 'text-green-600' : 'text-gray-600'}`}>
                {audited ? 'Audited' : 'Not Audited'}
              </span>
            </div>
          </div>

          {/* Trust Score Breakdown */}
          <div className="border-t pt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Trust Score Breakdown:</h4>
            <div className="space-y-1 text-xs text-gray-600">
              {verified && <div className="flex justify-between">
                <span>✓ Source Code Verified</span>
                <span className="text-green-600">+40</span>
              </div>}
              {audited && <div className="flex justify-between">
                <span>✓ Security Audited</span>
                <span className="text-green-600">+40</span>
              </div>}
              {renounceable && <div className="flex justify-between">
                <span>✓ Renounceable Ownership</span>
                <span className="text-green-600">+20</span>
              </div>}
            </div>
          </div>

          {/* Recommendations */}
          <div className="border-t pt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Security Recommendations:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              {!verified && <li>• Verify contract source code on Etherscan</li>}
              {!audited && <li>• Consider security audit from reputable firm</li>}
              {renounceable && <li>• Owner can renounce control (good decentralization)</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

/*
USAGE EXAMPLE:

import SecurityDashboard from '@/components/ux/security-dashboard';

<SecurityDashboard
  contractAddress="0x123456789abcdef..."
  verified={true}
  audited={false}
  creator="0xabcdef123456..."
  renounceable={true}
  currentOwner="0xabcdef123456..."
/>

DESIGN PRINCIPLES:
1. Clear visual indicators (colors, icons) for security status
2. Expandable details for advanced users
3. Trust score calculation with breakdown
4. Actionable security recommendations
5. Non-intrusive but informative UI

BUSINESS VALUE:
- Builds user trust and confidence
- Reduces support tickets about security concerns
- Demonstrates transparency and professionalism
- Increases conversion rates by removing security fears
*/
