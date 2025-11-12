'use client';

/**
 * Service Card Component
 * Displays available x402 UI services with pricing
 */

import React from 'react';
import { formatPrice } from '@/lib/x402-client';

interface ServiceCardProps {
  title: string;
  description: string;
  price: number;
  features: string[];
  endpoint: string;
  componentType: string;
  tier?: 'basic' | 'premium' | 'custom';
  onSelect: (endpoint: string, componentType: string) => void;
}

export function ServiceCard({
  title,
  description,
  price,
  features,
  endpoint,
  componentType,
  tier = 'basic',
  onSelect,
}: ServiceCardProps) {
  const tierColors = {
    basic: 'from-blue-500 to-cyan-500',
    premium: 'from-purple-500 to-pink-500',
    custom: 'from-orange-500 to-red-500',
  };
  
  const tierBorders = {
    basic: 'border-blue-200 hover:border-blue-400',
    premium: 'border-purple-200 hover:border-purple-400',
    custom: 'border-orange-200 hover:border-orange-400',
  };
  
  return (
    <div className={`relative bg-white rounded-xl border-2 ${tierBorders[tier]} p-6 shadow-lg hover:shadow-2xl transition-all hover:scale-105`}>
      {/* Tier Badge */}
      <div className={`absolute -top-3 -right-3 px-3 py-1 bg-gradient-to-r ${tierColors[tier]} text-white text-xs font-bold rounded-full shadow-lg`}>
        {tier.toUpperCase()}
      </div>
      
      {/* Content */}
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      
      {/* Price */}
      <div className="mb-4">
        <span className="text-3xl font-bold">${formatPrice(price)}</span>
        <span className="text-gray-500 text-sm ml-2">USDC per render</span>
      </div>
      
      {/* Features */}
      <ul className="space-y-2 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      
      {/* Select Button */}
      <button
        onClick={() => onSelect(endpoint, componentType)}
        className={`w-full py-3 bg-gradient-to-r ${tierColors[tier]} text-white rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-md`}
      >
        Select Service
      </button>
    </div>
  );
}

