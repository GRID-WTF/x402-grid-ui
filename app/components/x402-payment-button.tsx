'use client';

/**
 * x402 Payment Button Component
 * Handles payment flow for x402 protected services
 */

import React, { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Transaction, SystemProgram, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { formatPrice } from '@/lib/x402-client';
import type { PaymentRequiredResponse, UIConfig, UIResponse } from '@/lib/types';

interface X402PaymentButtonProps {
  endpoint: string;
  componentType: string;
  config?: UIConfig;
  onSuccess: (data: UIResponse, signature?: string) => void;
  onError?: (error: Error) => void;
}

export function X402PaymentButton({
  endpoint,
  componentType,
  config,
  onSuccess,
  onError,
}: X402PaymentButtonProps) {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [paymentRequired, setPaymentRequired] = useState<PaymentRequiredResponse | null>(null);
  const [status, setStatus] = useState<string>('');
  const [lastSignature, setLastSignature] = useState<string>('');
  
  const handleRequest = async () => {
    if (!connected || !publicKey) {
      alert('Please connect your wallet first');
      return;
    }
    
    setLoading(true);
    setStatus('Requesting service...');
    
    try {
      // Determine if endpoint is external (starts with http/https)
      const isExternalEndpoint = endpoint.startsWith('http://') || endpoint.startsWith('https://');
      
      // Use GET for external endpoints (like markets API), POST for internal
      const method = isExternalEndpoint ? 'GET' : 'POST';
      
      // First, try to fetch without payment
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        ...(method === 'POST' ? { body: JSON.stringify({ componentType, config }) } : {}),
      });
      
      if (response.status === 402) {
        // Payment required
        const paymentDetails: PaymentRequiredResponse = await response.json();
        setPaymentRequired(paymentDetails);
        
        // Process payment
        const signature = await processPayment(paymentDetails);
        setLastSignature(signature);
      } else if (response.ok) {
        // Success (payment already made or free)
        const data = await response.json();
        
        // Transform external API responses to match UIResponse format
        if (isExternalEndpoint && data.markets) {
          // Markets API response - wrap it in UIResponse format
          const uiResponse: UIResponse = {
            success: true,
            ui: {
              type: 'markets',
              markets: data.markets,
              meta: data.meta,
            },
            tier: 'premium',
            message: 'Markets data loaded successfully',
          };
          onSuccess(uiResponse);
        } else {
          onSuccess(data);
        }
      } else {
        throw new Error('Request failed');
      }
    } catch (error: any) {
      console.error('Error:', error);
      
      // Clear payment required state on error so user can retry
      setPaymentRequired(null);
      setStatus('');
      
      if (onError) {
        onError(error as Error);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const processPayment = async (paymentDetails: PaymentRequiredResponse): Promise<string> => {
    if (!publicKey || !connected) {
      throw new Error('Wallet not connected');
    }
    
    // Validate payTo address
    if (!paymentDetails.payTo || paymentDetails.payTo.trim() === '') {
      throw new Error('Payment recipient address is not configured. Please set NEXT_PUBLIC_X402_WALLET_ADDRESS environment variable.');
    }
    
    try {
      // Create payment transaction using SOL
      let recipientPubkey: PublicKey;
      try {
        recipientPubkey = new PublicKey(paymentDetails.payTo);
      } catch (error) {
        throw new Error(`Invalid payment recipient address: ${paymentDetails.payTo}. Please check NEXT_PUBLIC_X402_WALLET_ADDRESS environment variable.`);
      }
      
      // Price is already in lamports (smallest unit for SOL)
      const amountInLamports = paymentDetails.price;
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubkey,
          lamports: amountInLamports,
        })
      );

      // Send transaction
      setStatus('Waiting for wallet approval...');
      const signature = await sendTransaction(transaction, connection);
      
      setStatus('Confirming transaction...');
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      // Determine if endpoint is external (starts with http/https)
      const isExternalEndpoint = endpoint.startsWith('http://') || endpoint.startsWith('https://');
      const method = isExternalEndpoint ? 'GET' : 'POST';
      
      // Retry the request with payment proof
      const retryResponse = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Payment-Signature': signature,
          'X-Payment-PublicKey': publicKey.toString(),
          'X-Payment-Timestamp': Date.now().toString(),
        },
        ...(method === 'POST' ? { body: JSON.stringify({ componentType, config }) } : {}),
      });
      
      if (retryResponse.ok) {
        const data = await retryResponse.json();
        
        // Transform external API responses to match UIResponse format
        if (isExternalEndpoint && data.markets) {
          // Markets API response - wrap it in UIResponse format
          const uiResponse: UIResponse = {
            success: true,
            ui: {
              type: 'markets',
              markets: data.markets,
              meta: data.meta,
            },
            tier: 'premium',
            message: 'Markets data loaded successfully',
          };
          onSuccess(uiResponse, signature);
        } else {
          onSuccess(data, signature);
        }
        setPaymentRequired(null);
        return signature;
      } else {
        throw new Error('Failed to fetch after payment');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      
      // Handle specific wallet errors
      if (error.name === 'WalletSendTransactionError' || 
          error.message?.includes('User rejected') || 
          error.message?.includes('Plugin Closed') ||
          error.message?.includes('User cancelled')) {
        throw new Error('Transaction cancelled. Please try again and approve the transaction in your wallet.');
      }
      
      throw error;
    }
  };
  
  if (!connected) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-gray-600">Connect your wallet to use x402 services</p>
        <WalletMultiButton />
      </div>
    );
  }
  
  // Determine button text based on component type
  const getButtonText = () => {
    if (componentType === 'markets') {
      return 'Get Markets Data';
    }
    return 'Render UI';
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={handleRequest}
        disabled={loading}
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </span>
        ) : (
          `${getButtonText()} (Pay with Solana)`
        )}
      </button>
      
      {status && loading && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <p className="text-blue-800 font-medium flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {status}
          </p>
        </div>
      )}
      
      {paymentRequired && !loading && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
          <p className="font-semibold text-yellow-900">Payment Required</p>
          <p className="text-yellow-700 mt-1">
            Amount: {formatPrice(paymentRequired.price)} {paymentRequired.asset}
          </p>
          <p className="text-yellow-700">
            Network: {paymentRequired.network}
          </p>
        </div>
      )}
      
      {lastSignature && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
          <p className="font-semibold text-green-900 mb-1">Transaction Confirmed</p>
          <a
            href={`https://orb.helius.dev/tx/${lastSignature}?cluster=mainnet-beta&advanced=true&tab=summary`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline break-all text-xs flex items-center gap-1"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            {lastSignature}
          </a>
        </div>
      )}
    </div>
  );
}

