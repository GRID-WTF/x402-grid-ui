/**
 * x402 Protected API Route - Basic UI Render
 * This endpoint requires payment before rendering UI components
 */

import { NextRequest, NextResponse } from 'next/server';
import { X402PaymentHandler } from 'x402-solana/server';
import { x402Config } from '@/lib/x402-config';
import type { UIConfig, UIData, GridConfig, CardConfig } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Initialize X402 Payment Handler
const x402 = new X402PaymentHandler({
  network: 'solana',
  treasuryAddress: x402Config.payTo,
  facilitatorUrl: x402Config.facilitatorUrl,
});

/**
 * Business logic for generating UI
 * Extracted to be called after payment verification
 */
function generateUI(componentType: string, config: UIConfig): UIData {
  const uiTemplates: Record<string, UIData> = {
    grid: {
      type: 'grid',
      layout: {
        columns: (config as GridConfig)?.columns || 3,
        gap: (config as GridConfig)?.gap || 4,
        items: Array.from({ length: (config as GridConfig)?.itemCount || 6 }, (_, i) => ({
          id: i + 1,
          title: `Grid Item ${i + 1}`,
          description: 'This is a dynamically rendered grid item',
          color: `hsl(${(i * 60) % 360}, 70%, 50%)`,
        })),
      },
    },
    card: {
      type: 'card',
      title: (config as CardConfig)?.title || 'Dynamic Card',
      content: (config as CardConfig)?.content || 'This is a dynamically rendered card component',
      actions: (config as CardConfig)?.actions || [
        { label: 'Action 1', variant: 'primary' },
        { label: 'Action 2', variant: 'secondary' },
      ],
    },
    dashboard: {
      type: 'dashboard',
      widgets: [
        { type: 'stat', label: 'Total Users', value: '1,234', trend: '+12%' },
        { type: 'stat', label: 'Revenue', value: '$45.6K', trend: '+8%' },
        { type: 'stat', label: 'Conversions', value: '89%', trend: '+3%' },
        { type: 'chart', label: 'Activity', data: [30, 40, 35, 50, 49, 60, 70] },
      ],
    },
  };
  
  return uiTemplates[componentType] || uiTemplates.grid;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Extract payment header (try x402 format first, then custom headers)
    let paymentHeader = x402.extractPayment(req.headers);
    
    // Check for custom payment headers if x402 format not found
    const customSignature = req.headers.get('X-Payment-Signature');
    const customPublicKey = req.headers.get('X-Payment-PublicKey');
    const customTimestamp = req.headers.get('X-Payment-Timestamp');
    
    const hasCustomPayment = customSignature && customPublicKey && customTimestamp;
    
    // 2. Parse request body
    const body = await req.json();
    const { componentType, config } = body;
    
    // 3. Create payment requirements
    const baseUrl = x402Config.baseUrl;
    const resourceUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;
    
    const paymentRequirements = await x402.createPaymentRequirements({
      price: {
        amount: String(x402Config.prices['/api/render-ui']), // Convert lamports to string
        asset: {
          address: 'So11111111111111111111111111111111111111112', // Native SOL
          decimals: 9
        }
      },
      network: 'solana',
      config: {
        description: `Basic UI Component Render - ${componentType}`,
        resource: `${resourceUrl}/api/render-ui` as `${string}://${string}`,
      }
    });
    
    if (!paymentHeader && !hasCustomPayment) {
      // Return 402 with payment requirements
      const response = x402.create402Response(paymentRequirements);
      console.log('[x402/render-ui] No payment header - returning 402');
      
      // Ensure the response includes all required fields for the client
      const clientResponse = {
        ...response.body,
        paymentRequired: true,
        price: x402Config.prices['/api/render-ui'],
        network: 'solana',
        asset: 'SOL',
        payTo: x402Config.payTo,
      };
      
      return NextResponse.json(clientResponse, { 
        status: response.status,
        headers: {
          'X-X402-Protected': 'true',
          'X-Payment-Required': 'true',
        }
      });
    }

    // 4. Verify payment
    console.log('[x402/render-ui] Verifying payment...');
    let verified = false;
    
    if (paymentHeader) {
      // Try standard x402 verification
      const verificationResult = await x402.verifyPayment(paymentHeader, paymentRequirements);
      verified = verificationResult.isValid;
      if (!verified) {
        console.error('[x402/render-ui] x402 verification failed:', verificationResult.invalidReason);
      }
    } else if (hasCustomPayment) {
      // Verify custom payment format (manual verification)
      console.log('[x402/render-ui] Using custom payment headers, verifying transaction...');
      try {
        const { Connection, PublicKey } = await import('@solana/web3.js');
        const connection = new Connection(x402Config.rpcEndpoint, 'confirmed');
        
        // Get transaction details
        const tx = await connection.getTransaction(customSignature!, {
          maxSupportedTransactionVersion: 0,
        });
        
        if (!tx || tx.meta?.err) {
          console.error('[x402/render-ui] Transaction not found or failed');
          verified = false;
        } else {
          // Verify the transaction details
          const senderPubkey = new PublicKey(customPublicKey!);
          const recipientPubkey = new PublicKey(x402Config.payTo);
          
          // Check if this is a transfer to our treasury
          const accountKeys = tx.transaction.message.getAccountKeys();
          const recipientIndex = accountKeys.staticAccountKeys.findIndex(
            key => key.equals(recipientPubkey)
          );
          
          if (recipientIndex !== -1 && tx.meta?.postBalances && tx.meta?.preBalances) {
            const amountTransferred = tx.meta.postBalances[recipientIndex] - tx.meta.preBalances[recipientIndex];
            const expectedAmount = x402Config.prices['/api/render-ui'];
            
            // Verify amount is correct (allow small variance for fees)
            if (amountTransferred >= expectedAmount * 0.95) {
              verified = true;
              console.log('[x402/render-ui] Custom payment verified successfully');
            } else {
              console.error('[x402/render-ui] Payment amount mismatch:', amountTransferred, 'expected:', expectedAmount);
            }
          }
        }
      } catch (error) {
        console.error('[x402/render-ui] Error verifying custom payment:', error);
        verified = false;
      }
    }
    
    if (!verified) {
      console.error('[x402/render-ui] Payment verification failed');
      return NextResponse.json(
        { error: 'Invalid payment - verification failed' }, 
        { status: 402 }
      );
    }

    console.log('[x402/render-ui] Payment verified successfully');

    // 5. Process business logic
    const uiResponse = generateUI(componentType, config);

    // 6. Settle payment (only if using x402 standard format)
    if (paymentHeader) {
      console.log('[x402/render-ui] Settling payment...');
      await x402.settlePayment(paymentHeader, paymentRequirements);
    } else {
      console.log('[x402/render-ui] Custom payment verified, skipping x402 settlement');
    }

    // 7. Return response with payment confirmation
    return NextResponse.json({
      success: true,
      ui: uiResponse,
      message: 'UI rendered successfully',
    }, {
      status: 200,
      headers: {
        'X-X402-Protected': 'true',
        'X-Payment-Verified': 'true',
      },
    });
  } catch (error) {
    console.error('Error processing UI render request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
