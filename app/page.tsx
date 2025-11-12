'use client';

import { useState } from 'react';
import { Header } from './components/header';
import { X402PaymentButton } from './components/x402-payment-button';
import { UIRenderer } from './components/ui-renderer';
import { x402Config } from '@/lib/x402-config';
import { formatPrice } from '@/lib/x402-client';
import type { UIResponse } from '@/lib/types';

export default function Home() {
  const [selectedService, setSelectedService] = useState<{
    endpoint: string;
    componentType: string;
    title: string;
  } | null>(null);
  const [renderedUI, setRenderedUI] = useState<UIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transactionSignature, setTransactionSignature] = useState<string | undefined>(undefined);

  const services = [
    {
      title: 'Basic Grid',
      description: 'Responsive grid layout',
      price: x402Config.prices['/api/render-ui'],
      endpoint: '/api/render-ui',
      componentType: 'grid',
      tier: 'basic' as const,
    },
    {
      title: 'Card Component',
      description: 'Professional card UI',
      price: x402Config.prices['/api/render-ui'],
      endpoint: '/api/render-ui',
      componentType: 'card',
      tier: 'basic' as const,
    },
    {
      title: 'Dashboard',
      description: 'Stats dashboard',
      price: x402Config.prices['/api/render-ui'],
      endpoint: '/api/render-ui',
      componentType: 'dashboard',
      tier: 'basic' as const,
    },
    {
      title: 'Advanced Grid',
      description: 'Premium with animations',
      price: x402Config.prices['/api/premium-ui'],
      endpoint: '/api/premium-ui',
      componentType: 'advanced-grid',
      tier: 'premium' as const,
    },
    {
      title: 'Data Table',
      description: 'Sortable & filterable',
      price: x402Config.prices['/api/premium-ui'],
      endpoint: '/api/premium-ui',
      componentType: 'data-table',
      tier: 'premium' as const,
    },
    {
      title: 'Analytics',
      description: 'Complete dashboard',
      price: x402Config.prices['/api/premium-ui'],
      endpoint: '/api/premium-ui',
      componentType: 'analytics',
      tier: 'premium' as const,
    },
    {
      title: 'New Markets',
      description: 'Live Polymarket data',
      price: x402Config.prices['https://grid.wtf/api/x402/v1/new-markets'],
      endpoint: 'https://grid.wtf/api/x402/v1/new-markets',
      componentType: 'markets',
      tier: 'premium' as const,
    },
  ];

  const handleServiceSelect = (endpoint: string, componentType: string, title: string) => {
    setSelectedService({ endpoint, componentType, title });
    setRenderedUI(null);
    setError(null); // Clear any previous errors
    setTransactionSignature(undefined); // Clear previous signature
  };

  const handleSuccess = (data: UIResponse, signature?: string) => {
    setRenderedUI(data);
    setTransactionSignature(signature);
    setError(null);
  };

  const handleError = (error: Error) => {
    // Provide user-friendly error messages
    let errorMessage = error.message;
    
    if (errorMessage.includes('Transaction cancelled') || 
        errorMessage.includes('Plugin Closed') || 
        errorMessage.includes('User rejected')) {
      errorMessage = '❌ Transaction was cancelled. Click the button again to retry.';
    } else if (errorMessage.includes('Wallet not connected')) {
      errorMessage = '⚠️ Please connect your wallet to continue.';
    } else if (errorMessage.includes('insufficient funds')) {
      errorMessage = '💰 Insufficient funds. Please add SOL to your wallet.';
    }
    
    setError(errorMessage);
    setRenderedUI(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header showWallet={true} />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Services Grid */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-gray-500 mb-4">Select a component</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {services.map((service, index) => (
              <button
                key={index}
                onClick={() => handleServiceSelect(service.endpoint, service.componentType, service.title)}
                className={`
                  relative p-4 rounded-lg border-2 text-left transition-all
                  ${selectedService?.componentType === service.componentType
                    ? 'border-purple-500 bg-purple-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-sm">{service.title}</h3>
                  {service.tier === 'premium' && (
                    <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                      Pro
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-2">{service.description}</p>
                <p className="text-xs font-medium text-gray-900">{formatPrice(service.price)} {x402Config.asset}</p>
                {selectedService?.componentType === service.componentType && (
                  <div className="absolute bottom-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Section */}
        {selectedService && (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Ready to render</h3>
                <p className="text-xs text-gray-600 mt-1">{selectedService.title}</p>
              </div>
            </div>

            <X402PaymentButton
              endpoint={selectedService.endpoint}
              componentType={selectedService.componentType}
              config={{}}
              onSuccess={handleSuccess}
              onError={handleError}
            />

            {error && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200 animate-pulse">
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Rendered UI Display */}
        {renderedUI && (
          <div className="p-6 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-sm font-medium">Component rendered</h3>
              {renderedUI.tier && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                  {renderedUI.tier}
                </span>
              )}
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <UIRenderer uiData={renderedUI} signature={transactionSignature} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <p className="text-xs text-gray-500 text-center">
            Powered by{' '}
            <a href="https://solana.com/x402" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700">
              x402
            </a>
            {' '}on{' '}
            <a href="https://solana.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700">
              Solana
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
