/**
 * x402 Protected API Route - Premium UI Render
 * This endpoint requires higher payment for premium UI components
 */

import { NextRequest, NextResponse } from 'next/server';
import { X402PaymentHandler } from 'x402-solana/server';
import { x402Config } from '@/lib/x402-config';
import type { UIConfig, UIData, GridConfig } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Initialize X402 Payment Handler
const x402 = new X402PaymentHandler({
  network: 'solana',
  treasuryAddress: x402Config.payTo,
  facilitatorUrl: x402Config.facilitatorUrl,
});

/**
 * Business logic for generating premium UI
 * Extracted to be called after payment verification
 */
function generatePremiumUI(componentType: string, config: UIConfig): UIData {
  const premiumTemplates: Record<string, UIData> = {
    'advanced-grid': {
      type: 'advanced-grid',
      layout: {
        columns: (config as GridConfig)?.columns || 4,
        rows: 'auto',
        gap: 6,
        items: Array.from({ length: (config as GridConfig)?.itemCount || 12 }, (_, i) => ({
          id: i + 1,
          title: `Premium Item ${i + 1}`,
          description: 'Premium UI with advanced features',
          image: `https://picsum.photos/seed/${i + 1}/400/300`,
          color: `hsl(${(i * 30) % 360}, 80%, 60%)`,
          features: ['Feature A', 'Feature B', 'Feature C'],
          rating: (4 + Math.random()).toFixed(1),
        })),
      },
      animations: true,
      interactions: ['hover', 'click', 'drag'],
    },
    'data-table': {
      type: 'data-table',
      columns: [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'name', label: 'Name', sortable: true },
        { key: 'value', label: 'Value', sortable: true },
        { key: 'status', label: 'Status', filterable: true },
      ],
      data: Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        name: `Record ${i + 1}`,
        value: Math.floor(Math.random() * 10000),
        status: ['Active', 'Pending', 'Inactive'][Math.floor(Math.random() * 3)],
      })),
      features: ['sorting', 'filtering', 'pagination', 'export'],
    },
    'analytics': {
      type: 'analytics-dashboard',
      sections: [
        {
          title: 'Key Metrics',
          widgets: [
            { type: 'metric', label: 'Total Revenue', value: '$123,456', change: '+23.5%' },
            { type: 'metric', label: 'Active Users', value: '8,765', change: '+12.3%' },
            { type: 'metric', label: 'Conversion Rate', value: '3.45%', change: '+0.8%' },
            { type: 'metric', label: 'Avg. Order Value', value: '$89.23', change: '+5.2%' },
          ],
        },
        {
          title: 'Performance Charts',
          charts: [
            { type: 'line', label: 'Revenue Trend', data: [/* chart data */] },
            { type: 'bar', label: 'User Growth', data: [/* chart data */] },
            { type: 'pie', label: 'Traffic Sources', data: [/* chart data */] },
          ],
        },
      ],
    },
  };
  
  return premiumTemplates[componentType] || premiumTemplates['advanced-grid'];
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
        amount: String(x402Config.prices['/api/premium-ui']), // Convert lamports to string
        asset: {
          address: 'So11111111111111111111111111111111111111112', // Native SOL
          decimals: 9
        }
      },
      network: 'solana',
      config: {
        description: `Premium UI Component Render - ${componentType}`,
        resource: `${resourceUrl}/api/premium-ui` as `${string}://${string}`,
      }
    });
    
    if (!paymentHeader && !hasCustomPayment) {
      // Return 402 with payment requirements
      const response = x402.create402Response(paymentRequirements);
      console.log('[x402/premium-ui] No payment header - returning 402');
      
      // Ensure the response includes all required fields for the client
      const clientResponse = {
        ...response.body,
        paymentRequired: true,
        price: x402Config.prices['/api/premium-ui'],
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
    console.log('[x402/premium-ui] Verifying payment...');
    let verified = false;
    
    if (paymentHeader) {
      // Try standard x402 verification
      const verificationResult = await x402.verifyPayment(paymentHeader, paymentRequirements);
      verified = verificationResult.isValid;
      if (!verified) {
        console.error('[x402/premium-ui] x402 verification failed:', verificationResult.invalidReason);
      }
    } else if (hasCustomPayment) {
      // Verify custom payment format (manual verification)
      console.log('[x402/premium-ui] Using custom payment headers, verifying transaction...');
      try {
        const { Connection, PublicKey } = await import('@solana/web3.js');
        const connection = new Connection(x402Config.rpcEndpoint, 'confirmed');
        
        // Get transaction details
        const tx = await connection.getTransaction(customSignature!, {
          maxSupportedTransactionVersion: 0,
        });
        
        if (!tx || tx.meta?.err) {
          console.error('[x402/premium-ui] Transaction not found or failed');
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
            const expectedAmount = x402Config.prices['/api/premium-ui'];
            
            // Verify amount is correct (allow small variance for fees)
            if (amountTransferred >= expectedAmount * 0.95) {
              verified = true;
              console.log('[x402/premium-ui] Custom payment verified successfully');
            } else {
              console.error('[x402/premium-ui] Payment amount mismatch:', amountTransferred, 'expected:', expectedAmount);
            }
          }
        }
      } catch (error) {
        console.error('[x402/premium-ui] Error verifying custom payment:', error);
        verified = false;
      }
    }
    
    if (!verified) {
      console.error('[x402/premium-ui] Payment verification failed');
      return NextResponse.json(
        { error: 'Invalid payment - verification failed' }, 
        { status: 402 }
      );
    }

    console.log('[x402/premium-ui] Payment verified successfully');

    // 5. Process business logic
    const premiumUI = generatePremiumUI(componentType, config);

    // 6. Settle payment (only if using x402 standard format)
    if (paymentHeader) {
      console.log('[x402/premium-ui] Settling payment...');
      await x402.settlePayment(paymentHeader, paymentRequirements);
    } else {
      console.log('[x402/premium-ui] Custom payment verified, skipping x402 settlement');
    }

    // 7. Return response with payment confirmation
    return NextResponse.json({
      success: true,
      ui: premiumUI,
      tier: 'premium',
      message: 'Premium UI rendered successfully',
    }, {
      status: 200,
      headers: {
        'X-X402-Protected': 'true',
        'X-Payment-Verified': 'true',
      },
    });
  } catch (error) {
    console.error('Error processing premium UI request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
