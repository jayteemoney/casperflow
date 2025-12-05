/**
 * Card component for displaying a single remittance
 */

import { useState } from 'react';
import {
  ArrowRight,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { Remittance } from '../types/remittance';
import {
  formatCspr,
  truncateHash,
  formatDate,
  calculateProgress,
  amountAfterFee,
} from '../lib/utils';
import {
  useContribute,
  useReleaseFunds,
  useCancelRemittance,
  useClaimRefund,
} from '../hooks/useCasperContract';

interface RemittanceCardProps {
  remittance: Remittance;
  userPublicKey: string | null;
}

export function RemittanceCard({ remittance, userPublicKey }: RemittanceCardProps) {
  const [contributionAmount, setContributionAmount] = useState('');

  const contribute = useContribute();
  const releaseFunds = useReleaseFunds();
  const cancelRemittance = useCancelRemittance();
  const claimRefund = useClaimRefund();

  const progress = calculateProgress(
    remittance.currentAmount,
    remittance.targetAmount
  );

  const isCreator = userPublicKey === remittance.creator;
  const isRecipient = userPublicKey === remittance.recipient;
  const isTargetMet = progress >= 100;

  const handleContribute = async () => {
    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    await contribute.mutateAsync({
      remittanceId: remittance.id,
      amount: contributionAmount,
    });

    setContributionAmount('');
  };

  const handleRelease = async () => {
    if (!confirm('Release funds to recipient? This action cannot be undone.')) {
      return;
    }

    await releaseFunds.mutateAsync(remittance.id);
  };

  const handleCancel = async () => {
    if (
      !confirm(
        'Cancel this remittance? Contributors will be able to claim refunds.'
      )
    ) {
      return;
    }

    await cancelRemittance.mutateAsync(remittance.id);
  };

  const handleClaimRefund = async () => {
    await claimRefund.mutateAsync(remittance.id);
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {remittance.purpose}
          </h3>
          <p className="text-sm text-gray-500">
            Remittance #{remittance.id}
          </p>
        </div>

        {/* Status Badge */}
        <div>
          {remittance.isReleased && (
            <span className="badge-success">Released</span>
          )}
          {remittance.isCancelled && (
            <span className="badge-danger">Cancelled</span>
          )}
          {!remittance.isReleased && !remittance.isCancelled && (
            <span className="badge-info">Active</span>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {formatCspr(remittance.currentAmount)} CSPR
          </span>
          <span className="text-sm text-gray-500">
            of {formatCspr(remittance.targetAmount)} CSPR
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">{progress}% complete</p>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-500 mb-1">Creator</p>
          <p className="font-mono text-gray-900">
            {truncateHash(remittance.creator)}
          </p>
        </div>
        <div>
          <p className="text-gray-500 mb-1">Recipient</p>
          <p className="font-mono text-gray-900">
            {truncateHash(remittance.recipient)}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-gray-500 mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Created
          </p>
          <p className="text-gray-900">{formatDate(remittance.createdAt)}</p>
        </div>
      </div>

      {/* Actions */}
      {!remittance.isReleased && !remittance.isCancelled && (
        <div className="border-t pt-4 space-y-3">
          {/* Contribute */}
          {!isCreator && (
            <div className="flex gap-2">
              <input
                type="number"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                placeholder="Amount in CSPR"
                step="0.01"
                min="0"
                className="input flex-1"
              />
              <button
                onClick={handleContribute}
                disabled={contribute.isPending}
                className="btn-primary whitespace-nowrap"
              >
                {contribute.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Contribute'
                )}
              </button>
            </div>
          )}

          {/* Release (Recipient only) */}
          {isRecipient && isTargetMet && (
            <button
              onClick={handleRelease}
              disabled={releaseFunds.isPending}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {releaseFunds.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Releasing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Release Funds (
                  {formatCspr(amountAfterFee(remittance.currentAmount))} CSPR)
                </>
              )}
            </button>
          )}

          {/* Cancel (Creator only) */}
          {isCreator && (
            <button
              onClick={handleCancel}
              disabled={cancelRemittance.isPending}
              className="btn-danger w-full flex items-center justify-center gap-2"
            >
              {cancelRemittance.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Cancel Remittance
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Claim Refund (if cancelled) */}
      {remittance.isCancelled && !isCreator && (
        <div className="border-t pt-4">
          <button
            onClick={handleClaimRefund}
            disabled={claimRefund.isPending}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {claimRefund.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Claiming...
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" />
                Claim Refund
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
