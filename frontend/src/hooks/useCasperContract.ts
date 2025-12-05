/**
 * React hooks for interacting with CasperFlow contract
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CLPublicKey, DeployUtil } from 'casper-js-sdk';
import toast from 'react-hot-toast';
import {
  buildCreateRemittanceDeploy,
  buildContributeDeploy,
  buildReleaseFundsDeploy,
  buildCancelRemittanceDeploy,
  buildClaimRefundDeploy,
  casperClient,
  waitForDeploy,
  getAccountMainPurse,
} from '../lib/casper';
import { GAS_PAYMENT } from '../lib/constants';
import { csprToMotes } from '../lib/utils';

declare global {
  interface Window {
    csprclick?: {
      sign: (deploy: any, publicKey: string) => Promise<any>;
      getActivePublicKey: () => Promise<string>;
    };
  }
}

/**
 * Hook for creating a remittance
 */
export function useCreateRemittance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recipient,
      targetAmount,
      purpose,
    }: {
      recipient: string;
      targetAmount: string;
      purpose: string;
    }) => {
      if (!window.csprclick) {
        throw new Error('CSPR.click wallet not found');
      }

      // Get active public key
      const activeKey = await window.csprclick.getActivePublicKey();
      const publicKey = CLPublicKey.fromHex(activeKey);

      // Convert amount to motes
      const targetAmountMotes = csprToMotes(targetAmount);

      // Build deploy
      const deploy = await buildCreateRemittanceDeploy(
        publicKey,
        recipient,
        targetAmountMotes,
        purpose,
        GAS_PAYMENT.CREATE_REMITTANCE
      );

      // Sign with CSPR.click
      const deployJson = DeployUtil.deployToJson(deploy);
      const signedDeployJson = await window.csprclick.sign(deployJson, activeKey);
      const signedDeploy = DeployUtil.deployFromJson(signedDeployJson).unwrap();

      // Send deploy
      const deployHash = await casperClient.putDeploy(signedDeploy);

      // Wait for finalization
      toast.loading('Creating remittance...', { id: deployHash });
      const result = await waitForDeploy(deployHash);

      if (!result.success) {
        throw new Error(result.error || 'Deploy failed');
      }

      toast.success('Remittance created successfully!', { id: deployHash });
      return { deployHash, result };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remittances'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create remittance');
    },
  });
}

/**
 * Hook for contributing to a remittance
 */
export function useContribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      remittanceId,
      amount,
    }: {
      remittanceId: number;
      amount: string;
    }) => {
      if (!window.csprclick) {
        throw new Error('CSPR.click wallet not found');
      }

      const activeKey = await window.csprclick.getActivePublicKey();
      const publicKey = CLPublicKey.fromHex(activeKey);

      // Get account purse
      const purse = await getAccountMainPurse(publicKey);

      // Convert amount to motes
      const amountMotes = csprToMotes(amount);

      // Build deploy
      const deploy = await buildContributeDeploy(
        publicKey,
        remittanceId,
        amountMotes,
        purse,
        GAS_PAYMENT.CONTRIBUTE
      );

      // Sign and send
      const deployJson = DeployUtil.deployToJson(deploy);
      const signedDeployJson = await window.csprclick.sign(deployJson, activeKey);
      const signedDeploy = DeployUtil.deployFromJson(signedDeployJson).unwrap();

      const deployHash = await casperClient.putDeploy(signedDeploy);

      // Wait for finalization
      toast.loading('Processing contribution...', { id: deployHash });
      const result = await waitForDeploy(deployHash);

      if (!result.success) {
        throw new Error(result.error || 'Deploy failed');
      }

      toast.success('Contribution successful!', { id: deployHash });
      return { deployHash, result };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remittances'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to contribute');
    },
  });
}

/**
 * Hook for releasing funds
 */
export function useReleaseFunds() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (remittanceId: number) => {
      if (!window.csprclick) {
        throw new Error('CSPR.click wallet not found');
      }

      const activeKey = await window.csprclick.getActivePublicKey();
      const publicKey = CLPublicKey.fromHex(activeKey);

      // Build deploy
      const deploy = await buildReleaseFundsDeploy(
        publicKey,
        remittanceId,
        GAS_PAYMENT.RELEASE_FUNDS
      );

      // Sign and send
      const deployJson = DeployUtil.deployToJson(deploy);
      const signedDeployJson = await window.csprclick.sign(deployJson, activeKey);
      const signedDeploy = DeployUtil.deployFromJson(signedDeployJson).unwrap();

      const deployHash = await casperClient.putDeploy(signedDeploy);

      // Wait for finalization
      toast.loading('Releasing funds...', { id: deployHash });
      const result = await waitForDeploy(deployHash);

      if (!result.success) {
        throw new Error(result.error || 'Deploy failed');
      }

      toast.success('Funds released successfully!', { id: deployHash });
      return { deployHash, result };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remittances'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to release funds');
    },
  });
}

/**
 * Hook for cancelling a remittance
 */
export function useCancelRemittance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (remittanceId: number) => {
      if (!window.csprclick) {
        throw new Error('CSPR.click wallet not found');
      }

      const activeKey = await window.csprclick.getActivePublicKey();
      const publicKey = CLPublicKey.fromHex(activeKey);

      // Build deploy
      const deploy = await buildCancelRemittanceDeploy(
        publicKey,
        remittanceId,
        GAS_PAYMENT.CANCEL_REMITTANCE
      );

      // Sign and send
      const deployJson = DeployUtil.deployToJson(deploy);
      const signedDeployJson = await window.csprclick.sign(deployJson, activeKey);
      const signedDeploy = DeployUtil.deployFromJson(signedDeployJson).unwrap();

      const deployHash = await casperClient.putDeploy(signedDeploy);

      // Wait for finalization
      toast.loading('Cancelling remittance...', { id: deployHash });
      const result = await waitForDeploy(deployHash);

      if (!result.success) {
        throw new Error(result.error || 'Deploy failed');
      }

      toast.success('Remittance cancelled. Contributors can now claim refunds.', {
        id: deployHash,
        duration: 5000,
      });
      return { deployHash, result };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remittances'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to cancel remittance');
    },
  });
}

/**
 * Hook for claiming a refund
 */
export function useClaimRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (remittanceId: number) => {
      if (!window.csprclick) {
        throw new Error('CSPR.click wallet not found');
      }

      const activeKey = await window.csprclick.getActivePublicKey();
      const publicKey = CLPublicKey.fromHex(activeKey);

      // Build deploy
      const deploy = await buildClaimRefundDeploy(
        publicKey,
        remittanceId,
        GAS_PAYMENT.CLAIM_REFUND
      );

      // Sign and send
      const deployJson = DeployUtil.deployToJson(deploy);
      const signedDeployJson = await window.csprclick.sign(deployJson, activeKey);
      const signedDeploy = DeployUtil.deployFromJson(signedDeployJson).unwrap();

      const deployHash = await casperClient.putDeploy(signedDeploy);

      // Wait for finalization
      toast.loading('Claiming refund...', { id: deployHash });
      const result = await waitForDeploy(deployHash);

      if (!result.success) {
        throw new Error(result.error || 'Deploy failed');
      }

      toast.success('Refund claimed successfully!', { id: deployHash });
      return { deployHash, result };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remittances'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to claim refund');
    },
  });
}

/**
 * Hook for fetching user's remittances
 * Note: This is a placeholder - actual implementation requires
 * querying contract state or using an indexer
 */
export function useUserRemittances(publicKey: string | null) {
  return useQuery({
    queryKey: ['remittances', publicKey],
    queryFn: async () => {
      if (!publicKey) return [];

      // TODO: Implement contract state query
      // For now, return mock data for UI development
      return [];
    },
    enabled: !!publicKey,
  });
}
