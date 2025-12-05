/**
 * Wallet connection component using CSPR.click
 */

import { useState, useEffect } from 'react';
import { Wallet, Power, ExternalLink } from 'lucide-react';
import { truncateHash } from '../lib/utils';
import { CONFIG } from '../lib/constants';

// Type declaration for CSPR.click window object
declare global {
  interface Window {
    csprclick?: {
      isConnected: () => Promise<boolean>;
      requestConnection: () => Promise<void>;
      getActivePublicKey: () => Promise<string>;
      disconnect: () => Promise<void>;
      sign: (deploy: any, publicKey: string) => Promise<any>;
    };
  }
}

export function WalletConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkInstallation();
    checkConnection();
  }, []);

  const checkInstallation = () => {
    setIsInstalled(typeof window.csprclick !== 'undefined');
  };

  const checkConnection = async () => {
    if (!window.csprclick) return;

    try {
      const connected = await window.csprclick.isConnected();
      if (connected) {
        const activeKey = await window.csprclick.getActivePublicKey();
        setPublicKey(activeKey);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Failed to check connection:', error);
    }
  };

  const connectWallet = async () => {
    if (!window.csprclick) {
      alert('CSPR.click extension not found. Please install it to continue.');
      window.open('https://www.cspr.click/', '_blank');
      return;
    }

    setIsLoading(true);

    try {
      // Request connection
      await window.csprclick.requestConnection();

      // Get active public key
      const activeKey = await window.csprclick.getActivePublicKey();

      setPublicKey(activeKey);
      setIsConnected(true);

      console.log('Wallet connected:', activeKey);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    if (!window.csprclick) return;

    try {
      await window.csprclick.disconnect();
      setPublicKey(null);
      setIsConnected(false);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  if (!isInstalled) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm text-gray-600">
          CSPR.click extension required
        </div>
        <a
          href="https://www.cspr.click/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary flex items-center gap-2"
        >
          Install CSPR.click
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <button
        onClick={connectWallet}
        disabled={isLoading}
        className="btn-primary flex items-center gap-2"
      >
        <Wallet className="w-4 h-4" />
        {isLoading ? 'Connecting...' : 'Connect Wallet'}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Account display */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-sm font-medium text-gray-900">
          {truncateHash(publicKey || '', 6)}
        </span>
        <a
          href={`${CONFIG.explorerUrl}/account/${publicKey}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Disconnect button */}
      <button
        onClick={disconnectWallet}
        className="btn-secondary flex items-center gap-2"
      >
        <Power className="w-4 h-4" />
        Disconnect
      </button>
    </div>
  );
}
