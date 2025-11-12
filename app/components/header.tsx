'use client';

import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface HeaderProps {
  showWallet?: boolean;
}

export function Header({ showWallet = true }: HeaderProps) {
  return (
    <header className="border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-semibold hover:text-purple-600 transition-colors">
              x402 GRID UI
            </Link>
            <nav className="flex items-center gap-4">
              <Link 
                href="/" 
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Home
              </Link>
              <Link 
                href="/test" 
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Test API
              </Link>
            </nav>
          </div>
          {showWallet && <WalletMultiButton />}
        </div>
      </div>
    </header>
  );
}

