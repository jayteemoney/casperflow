/**
 * RefundClaimer Component
 * Allows contributors to claim refunds from cancelled remittances
 */

import { useState, useEffect } from 'react';
import { DollarSign, AlertCircle } from 'lucide-react';
import { useClaimRefund } from '../hooks/useCasperContract';
import type { Remittance } from '../types/remittance';

interface RefundClaimerProps {
  remittance: Remittance;
  userPublicKey: string | null;
  onSuccess?: () => void;
}

export function RefundClaimer({
  remittance,
  userPublicKey,
  onSuccess,
}: RefundClaimerProps) {
  const claimRefund = useClaimRefund();
  const [contributionAmount, setContributionAmount] = useState('0');
  const [isRefundClaimed, setIsRefundClaimed] = useState(false);

  // TODO: Fetch actual contribution amount and refund claimed status from contract
  useEffect(() => {
    async function fetchContributionData() {
      if (!userPublicKey || !remittance.is_cancelled) {
        return;
      }

      try {
        // This should query the contract to get:
        // 1. The user's contribution amount
        // 2. Whether they've already claimed the refund
        // For now, using placeholder values

        // const amount = await getContribution(remittance.id, userPublicKey);
        // const claimed = await isRefundClaimed(remittance.id, userPublicKey);

        // setContributionAmount(amount);
        // setIsRefundClaimed(claimed);
      } catch (error) {
        console.error('Failed to fetch contribution data:', error);
      }
    }

    fetchContributionData();
  }, [remittance.id, userPublicKey, remittance.is_cancelled]);

  const handleClaimRefund = async () => {
    try {
      await claimRefund.mutateAsync(remittance.id);
      setIsRefundClaimed(true);
      onSuccess?.();
    } catch (error) {
      console.error('Refund claim failed:', error);
    }
  };

  // Only show if remittance is cancelled
  if (!remittance.is_cancelled) {
    return null;
  }

  // Only show if user is connected
  if (!userPublicKey) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Wallet Required</p>
            <p className="text-sm text-yellow-700 mt-1">
              Connect your wallet to check if you have a refund to claim
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show different UI based on refund status
  if (isRefundClaimed) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-800">Refund Claimed</p>
            <p className="text-sm text-green-700 mt-1">
              You have successfully claimed your refund for this remittance
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show claim button if user has contribution and hasn't claimed
  const hasContribution = parseFloat(contributionAmount) > 0;

  if (!hasContribution) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-800">No Contribution Found</p>
            <p className="text-sm text-gray-700 mt-1">
              You did not contribute to this remittance
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <DollarSign className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">Refund Available</p>
            <p className="text-sm text-blue-700 mt-1">
              You contributed <span className="font-semibold">{contributionAmount} CSPR</span> to
              this remittance
            </p>
          </div>
        </div>

        <button
          onClick={handleClaimRefund}
          disabled={claimRefund.isPending}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
        >
          <DollarSign className="w-5 h-5" />
          {claimRefund.isPending ? 'Claiming Refund...' : 'Claim Refund'}
        </button>

        <p className="text-xs text-blue-600">
          Note: You will receive your full contribution back minus gas fees for this transaction
        </p>
      </div>
    </div>
  );
}
