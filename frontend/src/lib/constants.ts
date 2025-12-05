/**
 * CasperFlow application constants and configuration
 */

// Network configuration
export const NETWORK_CONFIG = {
  testnet: {
    nodeUrl: import.meta.env.VITE_NODE_URL || 'https://node.testnet.casper.network/rpc',
    chainName: import.meta.env.VITE_CHAIN_NAME || 'casper-test',
    explorerUrl: 'https://testnet.cspr.live',
  },
  mainnet: {
    nodeUrl: 'https://node.mainnet.casper.network/rpc',
    chainName: 'casper',
    explorerUrl: 'https://cspr.live',
  },
} as const;

export const CURRENT_NETWORK = (import.meta.env.VITE_NETWORK as 'testnet' | 'mainnet') || 'testnet';
export const CONFIG = NETWORK_CONFIG[CURRENT_NETWORK];

// Contract configuration
export const CONTRACT_HASH = import.meta.env.VITE_CONTRACT_HASH || '';

// Casper constants
export const MOTES_PER_CSPR = 1_000_000_000; // 1 CSPR = 10^9 motes

// Gas payment amounts (in motes)
export const GAS_PAYMENT = {
  CREATE_REMITTANCE: '3000000000', // 3 CSPR
  CONTRIBUTE: '2500000000', // 2.5 CSPR
  RELEASE_FUNDS: '2500000000', // 2.5 CSPR
  CANCEL_REMITTANCE: '2000000000', // 2 CSPR
  CLAIM_REFUND: '2000000000', // 2 CSPR
} as const;

// Platform constants
export const PLATFORM_FEE_BPS = 50; // 0.5% = 50 basis points
export const MAX_PURPOSE_LENGTH = 256;

// UI constants
export const ITEMS_PER_PAGE = 10;
export const REFRESH_INTERVAL = 10000; // 10 seconds

// Transaction confirmation timeouts
export const DEPLOY_TIMEOUT = 180000; // 3 minutes
export const POLLING_INTERVAL = 5000; // 5 seconds
