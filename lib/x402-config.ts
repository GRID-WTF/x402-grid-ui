/**
 * x402 Configuration
 * Configuration for x402 payment protocol integration
 */

export const x402Config = {
  payTo: '8MeWTYDip5SWVJf3wkvDKZw9BjSAWMXm5oAeELJ6HFM9',
  network: (process.env.NEXT_PUBLIC_SOLANA_NETWORK as 'mainnet-beta' | 'devnet' | 'testnet') || 'mainnet-beta',
  rpcEndpoint: process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.mainnet-beta.solana.com',
  facilitatorUrl: process.env.NEXT_PUBLIC_X402_FACILITATOR_URL || 'https://facilitator.payai.network',
  asset: 'SOL' as const,
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://grid.wtf',
  prices: {
    '/api/render-ui': 500_000,   // 0.0005 SOL
    '/api/premium-ui': 500_000,  // 0.0005 SOL
    'https://grid.wtf/api/x402/v1/new-markets': 500_000,  // 0.0005 SOL for market data
  },
} as const;

export type X402Config = typeof x402Config;

