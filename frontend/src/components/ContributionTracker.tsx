/**
 * ContributionTracker Component
 * Allows users to contribute to remittances, release funds, or cancel remittances
 */

import { useState } from 'react';
import { Send, XCircle, CheckCircle } from 'lucide-react';
import { useContribute, useReleaseFunds, useCancelRemittance } from '../hooks/useCasperContract';
import type { Remittance } from '../types/remittance';

interface ContributionTrackerProps {
  remittance: Remittance;
  userPublicKey: string | null;
  onSuccess?: () => void;
}

export function ContributionTracker({
  remittance,
  userPublicKey,
  onSuccess,
}: ContributionTrackerProps) {
  const [contributionAmount, setContributionAmount] = useState('');
  const contribute = useContribute();
  const releaseFunds = useReleaseFunds();
  const cancelRemittance = useCancelRemittance();

  const isCreator = userPublicKey && remittance.creator === userPublicKey;
  const isRecipient = userPublicKey && remittance.recipient === userPublicKey;
  const canContribute = !remittance.is_released && !remittance.is_cancelled;
  const canRelease =
    isRecipient &&
    !remittance.is_released &&
    !remittance.is_cancelled &&
    remittance.is_target_met;
  const canCancel = isCreator && !remittance.is_released && !remittance.is_cancelled;

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      return;
    }

    try {
      await contribute.mutateAsync({
        remittanceId: remittance.id,
        amount: contributionAmount,
      });
      setContributionAmount('');
      onSuccess?.();
    } catch (error) {
      console.error('Contribution failed:', error);
    }
  };

  const handleRelease = async () => {
    try {
      await releaseFunds.mutateAsync(remittance.id);
      onSuccess?.();
    } catch (error) {
      console.error('Release failed:', error);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this remittance? All contributors will need to claim refunds.')) {
      return;
    }

    try {
      await cancelRemittance.mutateAsync(remittance.id);
      onSuccess?.();
    } catch (error) {
      console.error('Cancellation failed:', error);
    }
  };

  if (!userPublicKey) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          Connect your wallet to interact with this remittance
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Contribution Form */}
      {canContribute && !isCreator && (
        <form onSubmit={handleContribute} className="space-y-3">
          <div>
            <label
              htmlFor="contribution"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Contribute Amount (CSPR)
            </label>
            <div className="flex gap-2">
              <input
                id="contribution"
                type="number"
                step="0.01"
                min="0.01"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                placeholder="Enter amount"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={contribute.isPending}
              />
              <button
                type="submit"
                disabled={contribute.isPending || !contributionAmount}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {contribute.isPending ? 'Processing...' : 'Contribute'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {/* Release Funds Button */}
        {canRelease && (
          <button
            onClick={handleRelease}
            disabled={releaseFunds.isPending}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
          >
            <CheckCircle className="w-5 h-5" />
            {releaseFunds.isPending ? 'Releasing...' : 'Release Funds'}
          </button>
        )}

        {/* Cancel Button */}
        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={cancelRemittance.isPending}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
          >
            <XCircle className="w-5 h-5" />
            {cancelRemittance.isPending ? 'Cancelling...' : 'Cancel Remittance'}
          </button>
        )}
      </div>

      {/* Status Messages */}
      {remittance.is_released && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800 font-medium">
            Funds have been released to the recipient
          </p>
        </div>
      )}

      {remittance.is_cancelled && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800 font-medium">
            This remittance has been cancelled. Contributors can claim refunds.
          </p>
        </div>
      )}
    </div>
  );
}
