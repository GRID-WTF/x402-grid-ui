/**
 * Payment Verification Endpoint
 * Verifies Solana transaction signatures
 */

import { NextRequest, NextResponse } from 'next/server';
import { Connection } from '@solana/web3.js';
import { x402Config } from '@/lib/x402-config';
import { verifyPaymentTransaction } from '@/lib/solana-payment';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { signature, publicKey, endpoint } = body;
    
    if (!signature || !publicKey || !endpoint) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Get expected price for the endpoint
    const expectedPrice = x402Config.prices[endpoint as keyof typeof x402Config.prices];
    if (!expectedPrice) {
      return NextResponse.json(
        { error: 'Invalid endpoint' },
        { status: 400 }
      );
    }
    
    // Connect to Solana network
    const connection = new Connection(x402Config.rpcEndpoint, 'confirmed');
    
    // Verify the transaction
    const isValid = await verifyPaymentTransaction(
      signature,
      connection,
      expectedPrice,
      x402Config.payTo
    );
    
    if (isValid) {
      return NextResponse.json({
        verified: true,
        message: 'Payment verified successfully',
        signature,
        timestamp: Date.now(),
      });
    } else {
      return NextResponse.json(
        {
          verified: false,
          error: 'Payment verification failed',
        },
        { status: 402 }
      );
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}

