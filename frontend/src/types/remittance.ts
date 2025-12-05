/**
 * Type definitions for CasperFlow remittance platform
 */

/**
 * Represents a remittance on-chain
 */
export interface Remittance {
  id: number;
  creator: string; // AccountHash as string
  recipient: string; // AccountHash as string
  targetAmount: string; // U512 as string
  currentAmount: string; // U512 as string
  purpose: string;
  createdAt: number; // Timestamp in milliseconds
  isReleased: boolean;
  isCancelled: boolean;
}

/**
 * Contribution to a remittance
 */
export interface Contribution {
  remittanceId: number;
  contributor: string; // AccountHash as string
  amount: string; // U512 as string
  timestamp: number;
}

/**
 * Wallet connection state
 */
export interface WalletState {
  isConnected: boolean;
  publicKey: string | null;
  activeKey: string | null;
}

/**
 * Transaction status
 */
export type TransactionStatus =
  | 'idle'
  | 'pending'
  | 'success'
  | 'error';

/**
 * Deploy result from Casper
 */
export interface DeployResult {
  deployHash: string;
  status: TransactionStatus;
}

/**
 * Remittance creation form data
 */
export interface RemittanceFormData {
  recipient: string;
  targetAmount: string;
  purpose: string;
}

/**
 * Contribution form data
 */
export interface ContributionFormData {
  remittanceId: number;
  amount: string;
}

/**
 * Platform configuration
 */
export interface PlatformConfig {
  nodeUrl: string;
  chainName: string;
  contractHash: string;
  network: 'testnet' | 'mainnet';
}

/**
 * Contract event types
 */
export enum ContractEventType {
  RemittanceCreated = 'RemittanceCreated',
  ContributionMade = 'ContributionMade',
  FundsReleased = 'FundsReleased',
  RemittanceCancelled = 'RemittanceCancelled',
  RefundClaimed = 'RefundClaimed',
}

/**
 * Contract event data
 */
export interface ContractEvent {
  type: ContractEventType;
  data: Record<string, any>;
  timestamp: number;
}
