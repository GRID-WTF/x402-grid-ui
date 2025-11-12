'use client';

/**
 * UI Renderer Component
 * Dynamically renders UI based on x402 API responses
 */

import React from 'react';
import type { 
  UIResponse, 
  GridUI, 
  CardUI, 
  DashboardUI, 
  AdvancedGridUI, 
  DataTableUI, 
  AnalyticsDashboardUI,
  MarketsUI,
  MarketData,
  GridItem,
  AdvancedGridItem,
  Widget,
  DataColumn,
  AnalyticsSection
} from '@/lib/types';

interface UIRendererProps {
  uiData: UIResponse;
  signature?: string;
}

function SignatureLink({ signature }: { signature?: string }) {
  if (!signature) return null;
  
  return (
    <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
      <p className="font-semibold text-green-900 mb-1">Transaction Signature</p>
      <a
        href={`https://orb.helius.dev/tx/${signature}?cluster=mainnet-beta&advanced=true&tab=summary`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline break-all text-xs flex items-center gap-1"
      >
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        View on Orb Explorer: {signature}
      </a>
    </div>
  );
}

export function UIRenderer({ uiData, signature }: UIRendererProps) {
  if (!uiData || !uiData.ui) {
    return null;
  }
  
  const { ui } = uiData;
  
  // Render based on UI type
  switch (ui.type) {
    case 'grid':
      return (
        <>
          <GridRenderer data={ui} />
          <SignatureLink signature={signature} />
        </>
      );
    case 'card':
      return (
        <>
          <CardRenderer data={ui} />
          <SignatureLink signature={signature} />
        </>
      );
    case 'dashboard':
      return (
        <>
          <DashboardRenderer data={ui} />
          <SignatureLink signature={signature} />
        </>
      );
    case 'advanced-grid':
      return (
        <>
          <AdvancedGridRenderer data={ui} />
          <SignatureLink signature={signature} />
        </>
      );
    case 'data-table':
      return (
        <>
          <DataTableRenderer data={ui} />
          <SignatureLink signature={signature} />
        </>
      );
    case 'analytics-dashboard':
      return (
        <>
          <AnalyticsDashboardRenderer data={ui} />
          <SignatureLink signature={signature} />
        </>
      );
    case 'markets':
      return (
        <>
          <MarketsRenderer data={ui} />
          <SignatureLink signature={signature} />
        </>
      );
    default:
      // This should never happen if all types are handled
      return <div>Unsupported UI type</div>;
  }
}

function GridRenderer({ data }: { data: GridUI }) {
  const { layout } = data;
  
  return (
    <div className="w-full">
      <h3 className="text-xl font-bold mb-4">Grid Layout</h3>
      <div 
        className="grid gap-4"
        style={{ 
          gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))`,
          gap: `${layout.gap * 0.25}rem`
        }}
      >
        {layout.items.map((item: GridItem) => (
          <div
            key={item.id}
            className="p-6 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-all hover:shadow-lg"
            style={{ backgroundColor: `${item.color}20` }}
          >
            <h4 className="font-bold text-lg mb-2">{item.title}</h4>
            <p className="text-sm text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardRenderer({ data }: { data: CardUI }) {
  return (
    <div className="max-w-md w-full">
      <h3 className="text-xl font-bold mb-4">Card Component</h3>
      <div className="border-2 border-gray-200 rounded-xl p-6 shadow-lg bg-white">
        <h4 className="text-2xl font-bold mb-4">{data.title}</h4>
        <p className="text-gray-600 mb-6">{data.content}</p>
        <div className="flex gap-3">
          {data.actions.map((action, i: number) => (
            <button
              key={i}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                action.variant === 'primary'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardRenderer({ data }: { data: DashboardUI }) {
  return (
    <div className="w-full">
      <h3 className="text-xl font-bold mb-4">Dashboard</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.widgets.map((widget: Widget, i: number) => (
          <div key={i} className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm">
            {widget.type === 'stat' && (
              <>
                <p className="text-sm text-gray-600 mb-2">{widget.label}</p>
                <p className="text-3xl font-bold mb-1">{widget.value}</p>
                <p className="text-sm text-green-600">{widget.trend}</p>
              </>
            )}
            {widget.type === 'chart' && widget.data && (
              <>
                <p className="text-sm text-gray-600 mb-4">{widget.label}</p>
                <div className="flex items-end gap-1 h-20">
                  {widget.data.map((value: number, j: number) => (
                    <div
                      key={j}
                      className="flex-1 bg-blue-500 rounded-t"
                      style={{ height: `${value}%` }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AdvancedGridRenderer({ data }: { data: AdvancedGridUI }) {
  const { layout } = data;
  
  return (
    <div className="w-full">
      <h3 className="text-xl font-bold mb-4">Advanced Grid Layout (Premium)</h3>
      <div 
        className="grid gap-6"
        style={{ 
          gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))`,
        }}
      >
        {layout.items.map((item: AdvancedGridItem) => (
          <div
            key={item.id}
            className="rounded-xl border-2 border-gray-200 overflow-hidden hover:border-purple-400 transition-all hover:shadow-2xl hover:scale-105 bg-white"
          >
            <div className="h-48 bg-gradient-to-br from-purple-400 to-blue-500" />
            <div className="p-4">
              <h4 className="font-bold text-lg mb-2">{item.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-yellow-500">★ {item.rating}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.features.map((feature, i: number) => (
                  <span key={i} className="px-2 py-1 bg-gray-100 rounded text-xs">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DataTableRenderer({ data }: { data: DataTableUI }) {
  return (
    <div className="w-full">
      <h3 className="text-xl font-bold mb-4">Data Table (Premium)</h3>
      <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
        <table className="w-full bg-white">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              {data.columns.map((col: DataColumn) => (
                <th key={col.key} className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.data.slice(0, 10).map((row, i: number) => (
              <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                {data.columns.map((col: DataColumn) => (
                  <td key={col.key} className="px-6 py-4 text-sm text-gray-700">
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnalyticsDashboardRenderer({ data }: { data: AnalyticsDashboardUI }) {
  return (
    <div className="w-full space-y-8">
      <h3 className="text-xl font-bold">Analytics Dashboard (Premium)</h3>
      {data.sections.map((section: AnalyticsSection, i: number) => (
        <div key={i}>
          <h4 className="text-lg font-semibold mb-4">{section.title}</h4>
          {section.widgets && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {section.widgets.map((widget, j: number) => (
                <div key={j} className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm">
                  <p className="text-sm text-gray-600 mb-2">{widget.label}</p>
                  <p className="text-3xl font-bold mb-1">{widget.value}</p>
                  <p className="text-sm text-green-600">{widget.change}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MarketsRenderer({ data }: { data: MarketsUI }) {
  const { markets, meta } = data;
  
  const formatPrice = (price: number) => {
    return `${(price * 100).toFixed(1)}%`;
  };
  
  const formatVolume = (volume: number) => {
    if (volume >= 1_000_000) {
      return `$${(volume / 1_000_000).toFixed(2)}M`;
    } else if (volume >= 1_000) {
      return `$${(volume / 1_000).toFixed(1)}K`;
    }
    return `$${volume.toFixed(0)}`;
  };
  
  const getPriceColor = (price: number) => {
    if (price >= 0.7) return 'text-green-600';
    if (price >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">New Markets Data (Premium)</h3>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>📊 {meta.totalCount} new markets</span>
          <span>⏰ Last {meta.hoursBack}h</span>
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md">x402 Protected</span>
        </div>
      </div>
      
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {markets.slice(0, 20).map((market: MarketData) => (
          <div
            key={market.id}
            className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {market.icon && (
                    <img 
                      src={market.icon} 
                      alt="" 
                      className="w-6 h-6 rounded-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                  <h4 className="font-semibold text-sm text-gray-900 line-clamp-2">
                    {market.question}
                  </h4>
                </div>
                
                {market.category && (
                  <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-md mb-2">
                    {market.category}
                  </span>
                )}
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Yes:</span>
                    <span className={`font-bold ${getPriceColor(market.yesPrice)}`}>
                      {formatPrice(market.yesPrice)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">No:</span>
                    <span className={`font-bold ${getPriceColor(market.noPrice)}`}>
                      {formatPrice(market.noPrice)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Volume:</span>
                    <span className="font-medium text-gray-900">
                      {formatVolume(market.volume)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Liquidity:</span>
                    <span className="font-medium text-gray-900">
                      {formatVolume(market.liquidity)}
                    </span>
                  </div>
                </div>
                
                {market.polymarket?.eventSlug && (
                  <a
                    href={`https://polymarket.com/event/${market.polymarket.eventSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-xs text-purple-600 hover:text-purple-800 font-medium"
                  >
                    View on Polymarket
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
              
              {market.oneHourPriceChange !== undefined && market.oneHourPriceChange !== 0 && (
                <div className={`flex items-center gap-1 text-xs font-bold ${
                  market.oneHourPriceChange > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {market.oneHourPriceChange > 0 ? '↑' : '↓'}
                  {Math.abs(market.oneHourPriceChange * 100).toFixed(1)}%
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {markets.length > 20 && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Showing 20 of {markets.length} markets
        </div>
      )}
    </div>
  );
}

