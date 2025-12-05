/**
 * Utility functions for CasperFlow
 */

import { MOTES_PER_CSPR, PLATFORM_FEE_BPS } from './constants';

/**
 * Converts CSPR to motes
 * @param cspr Amount in CSPR
 * @returns Amount in motes as string
 */
export function csprToMotes(cspr: string | number): string {
  const amount = typeof cspr === 'string' ? parseFloat(cspr) : cspr;
  const motes = Math.floor(amount * MOTES_PER_CSPR);
  return motes.toString();
}

/**
 * Converts motes to CSPR
 * @param motes Amount in motes as string
 * @returns Amount in CSPR
 */
export function motesToCspr(motes: string): number {
  const motesNum = BigInt(motes);
  return Number(motesNum) / MOTES_PER_CSPR;
}

/**
 * Formats CSPR amount for display
 * @param motes Amount in motes as string
 * @param decimals Number of decimal places (default: 4)
 * @returns Formatted CSPR string
 */
export function formatCspr(motes: string, decimals: number = 4): string {
  const cspr = motesToCspr(motes);
  return cspr.toFixed(decimals);
}

/**
 * Calculates platform fee for an amount
 * @param amountMotes Amount in motes
 * @returns Fee in motes
 */
export function calculatePlatformFee(amountMotes: string): string {
  const amount = BigInt(amountMotes);
  const fee = (amount * BigInt(PLATFORM_FEE_BPS)) / BigInt(10000);
  return fee.toString();
}

/**
 * Calculates amount after deducting platform fee
 * @param amountMotes Amount in motes
 * @returns Amount after fee in motes
 */
export function amountAfterFee(amountMotes: string): string {
  const amount = BigInt(amountMotes);
  const fee = BigInt(calculatePlatformFee(amountMotes));
  return (amount - fee).toString();
}

/**
 * Truncates an account hash for display
 * @param hash Account hash or public key
 * @param chars Number of chars to show on each side (default: 6)
 * @returns Truncated hash
 */
export function truncateHash(hash: string, chars: number = 6): string {
  if (!hash || hash.length < chars * 2) return hash;
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

/**
 * Formats a timestamp to readable date
 * @param timestamp Timestamp in milliseconds
 * @returns Formatted date string
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formats a timestamp to relative time (e.g., "2 hours ago")
 * @param timestamp Timestamp in milliseconds
 * @returns Relative time string
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

/**
 * Validates account hash format
 * @param hash Account hash to validate
 * @returns true if valid
 */
export function isValidAccountHash(hash: string): boolean {
  // Casper account hashes are 64 hex characters (32 bytes)
  // or prefixed with "account-hash-"
  if (hash.startsWith('account-hash-')) {
    return /^account-hash-[0-9a-fA-F]{64}$/.test(hash);
  }
  return /^[0-9a-fA-F]{64}$/.test(hash);
}

/**
 * Validates CSPR amount
 * @param amount Amount to validate
 * @returns true if valid
 */
export function isValidAmount(amount: string): boolean {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && isFinite(num);
}

/**
 * Calculates remittance progress percentage
 * @param current Current amount in motes
 * @param target Target amount in motes
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(current: string, target: string): number {
  const currentNum = BigInt(current);
  const targetNum = BigInt(target);

  if (targetNum === BigInt(0)) return 100;

  const percentage = (Number(currentNum) * 100) / Number(targetNum);
  return Math.min(Math.floor(percentage), 100);
}

/**
 * Gets explorer URL for a deploy
 * @param deployHash Deploy hash
 * @param explorerBaseUrl Base explorer URL
 * @returns Full explorer URL
 */
export function getDeployExplorerUrl(deployHash: string, explorerBaseUrl: string): string {
  return `${explorerBaseUrl}/deploy/${deployHash}`;
}

/**
 * Gets explorer URL for an account
 * @param accountHash Account hash
 * @param explorerBaseUrl Base explorer URL
 * @returns Full explorer URL
 */
export function getAccountExplorerUrl(accountHash: string, explorerBaseUrl: string): string {
  return `${explorerBaseUrl}/account/${accountHash}`;
}

/**
 * Debounces a function
 * @param fn Function to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Copies text to clipboard
 * @param text Text to copy
 * @returns Promise resolving to success boolean
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Classnames utility (simple version)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
