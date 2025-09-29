'use client';

import { useState, useMemo } from 'react';
import { INDEX_TEMPLATES, IndexTemplate, getTemplatesByCategory } from '@/lib/data/indexTemplates';

interface TemplateSelectorProps {
  onSelectTemplate: (template: IndexTemplate) => void;
}

/**
 * Template Selector Component
 *
 * Visual card grid for selecting pre-built index templates.
 * Features filtering by category and search functionality.
 */
export function TemplateSelector({ onSelectTemplate }: TemplateSelectorProps) {
  const [filter, setFilter] = useState<'all' | 'conservative' | 'moderate' | 'aggressive'>('all');
  const [search, setSearch] = useState('');

  // Filter and search templates
  const filteredTemplates = useMemo(() => {
    const templates = filter === 'all' ? INDEX_TEMPLATES : getTemplatesByCategory(filter);

    if (!search.trim()) return templates;

    const searchLower = search.toLowerCase().trim();
    return templates.filter(template =>
      template.name.toLowerCase().includes(searchLower) ||
      template.description.toLowerCase().includes(searchLower) ||
      template.assets.some(asset =>
        asset.name.toLowerCase().includes(searchLower) ||
        asset.symbol.toLowerCase().includes(searchLower)
      )
    );
  }, [filter, search]);

  // Get risk badge styling
  const getRiskBadgeStyle = (risk: string) => {
    switch (risk) {
      case 'conservative':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'aggressive':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Show asset count helper
  const getAssetDisplayText = (assets: IndexTemplate['assets']) => {
    const firstAssets = assets.slice(0, 4).map(a => a.symbol).join(', ');
    const remainingCount = assets.length - 4;
    return remainingCount > 0 ? `${firstAssets} +${remainingCount} more` : firstAssets;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Index Template</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select from pre-built investment strategies or customize your own crypto portfolio index
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search templates or tokens..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-lg border border-gray-300 bg-white">
          {[
            { value: 'all', label: 'All Templates' },
            { value: 'conservative', label: 'Conservative' },
            { value: 'moderate', label: 'Moderate' },
            { value: 'aggressive', label: 'Aggressive' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value as any)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === option.value
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer"
              onClick={() => onSelectTemplate(template)}
            >
              {/* Template Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <span className="text-3xl mr-3">{template.icon}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRiskBadgeStyle(template.riskProfile)}`}>
                    {template.riskProfile}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
              </div>

              {/* Template Details */}
              <div className="p-6">
                {/* Expected Return */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Expected Return</span>
                    <span className="text-sm font-semibold text-green-600">{template.expectedReturn}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Min Investment</span>
                    <span>{template.minInvestment} ETH</span>
                  </div>
                </div>

                {/* Asset List */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Assets ({template.assets.length})</p>
                  <div className="flex flex-wrap gap-1 text-xs">
                    {template.assets.slice(0, 3).map((asset, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        {asset.symbol}
                      </span>
                    ))}
                    {template.assets.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 text-gray-600 border border-gray-200">
                        +{template.assets.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTemplate(template);
                  }}
                >
                  Select Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Don't see what you need? Create a custom index with your preferred assets and weights.</p>
      </div>
    </div>
  );
}
