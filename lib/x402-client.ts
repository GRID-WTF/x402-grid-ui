/**
 * x402 Client Utilities
 * Helper functions for handling x402 payment flow on the client side
 */

import type { PaymentRequiredResponse, PaymentProof } from './types';

/**
 * Fetches data from an x402-protected endpoint
 * Handles 402 Payment Required responses automatically
 */
export async function fetchWithPayment(
  url: string,
  options?: RequestInit,
  onPaymentRequired?: (paymentDetails: PaymentRequiredResponse) => Promise<PaymentProof | null>
): Promise<Response> {
  const response = await fetch(url, options);
  
  if (response.status === 402) {
    const paymentDetails: PaymentRequiredResponse = await response.json();
    
    if (onPaymentRequired) {
      const proof = await onPaymentRequired(paymentDetails);
      
      if (proof) {
        // Retry request with payment proof
        return fetch(url, {
          ...options,
          headers: {
            ...options?.headers,
            'X-Payment-Signature': proof.signature,
            'X-Payment-PublicKey': proof.publicKey,
            'X-Payment-Timestamp': proof.timestamp.toString(),
          },
        });
      }
    }
    
    throw new Error('Payment required but no payment handler provided');
  }
  
  return response;
}

/**
 * Formats price from smallest unit to display format
 * @param price Price in smallest unit (lamports for SOL)
 * @param decimals Number of decimals for the asset (default 9 for SOL)
 */
export function formatPrice(price: number, decimals: number = 9): string {
  return (price / Math.pow(10, decimals)).toFixed(decimals).replace(/\.?0+$/, '');
}

