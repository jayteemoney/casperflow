/**
 * Main layout component with navigation
 */

import { ReactNode } from 'react';
import { WalletConnect } from './WalletConnect';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">CF</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CasperFlow</h1>
                <p className="text-xs text-gray-500">Enterprise Remittances</p>
              </div>
            </div>

            {/* Wallet Connect */}
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm">
            <p>&copy; 2025 CasperFlow. Built with ❤️ on Casper Network.</p>
            <p className="mt-2 text-gray-500">
              Casper Hackathon 2026 • Enterprise-Grade Remittances
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
