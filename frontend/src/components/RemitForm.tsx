/**
 * Form component for creating a new remittance
 */

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useCreateRemittance } from '../hooks/useCasperContract';
import { isValidAccountHash, isValidAmount } from '../lib/utils';
import { MAX_PURPOSE_LENGTH } from '../lib/constants';

export function RemitForm() {
  const [recipient, setRecipient] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [purpose, setPurpose] = useState('');

  const createRemittance = useCreateRemittance();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!isValidAccountHash(recipient)) {
      alert('Please enter a valid recipient public key');
      return;
    }

    if (!isValidAmount(targetAmount)) {
      alert('Please enter a valid amount');
      return;
    }

    if (!purpose.trim() || purpose.length > MAX_PURPOSE_LENGTH) {
      alert(`Purpose must be between 1 and ${MAX_PURPOSE_LENGTH} characters`);
      return;
    }

    // Submit
    await createRemittance.mutateAsync({
      recipient,
      targetAmount,
      purpose,
    });

    // Reset form on success
    if (createRemittance.isSuccess) {
      setRecipient('');
      setTargetAmount('');
      setPurpose('');
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Create Remittance
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Recipient */}
        <div>
          <label className="label">
            Recipient Public Key
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="01ab3f... or account-hash-..."
            className="input"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            The public key of the person who will receive the funds
          </p>
        </div>

        {/* Target Amount */}
        <div>
          <label className="label">
            Target Amount (CSPR)
          </label>
          <input
            type="number"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="100"
            step="0.01"
            min="0"
            className="input"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Amount to collect before funds can be released
          </p>
        </div>

        {/* Purpose */}
        <div>
          <label className="label">
            Purpose
          </label>
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="Family support, medical expenses, education..."
            rows={3}
            maxLength={MAX_PURPOSE_LENGTH}
            className="input resize-none"
            required
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              Describe the purpose of this remittance
            </p>
            <span className="text-xs text-gray-400">
              {purpose.length}/{MAX_PURPOSE_LENGTH}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={createRemittance.isPending}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {createRemittance.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Create Remittance
            </>
          )}
        </button>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Funds are held in escrow until target is met</li>
            <li>• Multiple people can contribute</li>
            <li>• Recipient releases funds when ready</li>
            <li>• 0.5% platform fee on release</li>
            <li>• Can be cancelled with refunds</li>
          </ul>
        </div>
      </form>
    </div>
  );
}
