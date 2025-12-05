/**
 * Main CasperFlow application component
 */

import { useState } from 'react';
import { WalletConnect } from './components/WalletConnect';
import { ArrowRight, Shield, Zap, Users } from 'lucide-react';

function App() {
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

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Built on Casper Network
          </div>

          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Enterprise-Grade Remittances
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">
              At Blockchain Speed
            </span>
          </h2>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Send money globally with 90% lower fees, sub-3s finality, and bank-grade security.
            Perfect for families, businesses, and group contributions.
          </p>

          <div className="flex items-center justify-center gap-4">
            <button className="btn-primary flex items-center gap-2 px-8 py-3 text-lg">
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="btn-secondary px-8 py-3 text-lg">
              Learn More
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="card text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Secure Escrow
            </h3>
            <p className="text-gray-600">
              Funds held on-chain until target is met. No intermediaries, no trust required.
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Ultra-Low Fees
            </h3>
            <p className="text-gray-600">
              0.5% platform fee vs 5-10% traditional services. Save 90-95% on every transaction.
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Group Contributions
            </h3>
            <p className="text-gray-600">
              Multiple people can pool funds for a single remittance. Perfect for families.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="card bg-gradient-to-br from-primary-600 to-purple-600 text-white">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">0.5%</div>
              <div className="text-primary-100">Platform Fee</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">&lt;3s</div>
              <div className="text-primary-100">Finality Time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-primary-100">Always Available</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">$600B</div>
              <div className="text-primary-100">Market Opportunity</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to start sending?
          </h3>
          <p className="text-xl text-gray-600 mb-8">
            Connect your wallet to create your first remittance
          </p>
          <WalletConnect />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-white font-bold mb-4">CasperFlow</h4>
              <p className="text-sm">
                Enterprise-grade P2P remittance platform on Casper Network.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Casper Network</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Built For</h4>
              <ul className="space-y-2 text-sm">
                <li>Casper Hackathon 2026</li>
                <li>Enterprise Remittances</li>
                <li>Global Financial Inclusion</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 CasperFlow. Built with ❤️ on Casper Network.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
