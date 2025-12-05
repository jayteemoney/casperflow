/**
 * Casper SDK configuration and utilities
 */

import { CasperClient, CLPublicKey, DeployUtil, RuntimeArgs, CLValueBuilder } from 'casper-js-sdk';
import { CONFIG, CONTRACT_HASH } from './constants';

// Initialize Casper client
export const casperClient = new CasperClient(CONFIG.nodeUrl);

/**
 * Builds deploy for creating a remittance
 */
export async function buildCreateRemittanceDeploy(
  publicKey: CLPublicKey,
  recipient: string,
  targetAmountMotes: string,
  purpose: string,
  gasPayment: string
) {
  // Convert recipient to AccountHash
  const recipientKey = CLPublicKey.fromHex(recipient);
  const recipientHash = recipientKey.toAccountHash();

  const args = RuntimeArgs.fromMap({
    recipient: CLValueBuilder.key(recipientHash),
    target_amount: CLValueBuilder.u512(targetAmountMotes),
    purpose: CLValueBuilder.string(purpose),
  });

  const deploy = DeployUtil.makeDeploy(
    new DeployUtil.DeployParams(publicKey, CONFIG.chainName),
    DeployUtil.ExecutableDeployItem.newStoredContractByHash(
      Uint8Array.from(Buffer.from(CONTRACT_HASH.replace('hash-', ''), 'hex')),
      'create_remittance',
      args
    ),
    DeployUtil.standardPayment(gasPayment)
  );

  return deploy;
}

/**
 * Builds deploy for contributing to a remittance
 */
export async function buildContributeDeploy(
  publicKey: CLPublicKey,
  remittanceId: number,
  amountMotes: string,
  purse: any,
  gasPayment: string
) {
  const args = RuntimeArgs.fromMap({
    remittance_id: CLValueBuilder.u64(remittanceId),
    amount: CLValueBuilder.u512(amountMotes),
    purse: CLValueBuilder.uref(purse.data[0], purse.data[1]),
  });

  const deploy = DeployUtil.makeDeploy(
    new DeployUtil.DeployParams(publicKey, CONFIG.chainName),
    DeployUtil.ExecutableDeployItem.newStoredContractByHash(
      Uint8Array.from(Buffer.from(CONTRACT_HASH.replace('hash-', ''), 'hex')),
      'contribute',
      args
    ),
    DeployUtil.standardPayment(gasPayment)
  );

  return deploy;
}

/**
 * Builds deploy for releasing funds
 */
export async function buildReleaseFundsDeploy(
  publicKey: CLPublicKey,
  remittanceId: number,
  gasPayment: string
) {
  const args = RuntimeArgs.fromMap({
    remittance_id: CLValueBuilder.u64(remittanceId),
  });

  const deploy = DeployUtil.makeDeploy(
    new DeployUtil.DeployParams(publicKey, CONFIG.chainName),
    DeployUtil.ExecutableDeployItem.newStoredContractByHash(
      Uint8Array.from(Buffer.from(CONTRACT_HASH.replace('hash-', ''), 'hex')),
      'release_funds',
      args
    ),
    DeployUtil.standardPayment(gasPayment)
  );

  return deploy;
}

/**
 * Builds deploy for cancelling a remittance
 */
export async function buildCancelRemittanceDeploy(
  publicKey: CLPublicKey,
  remittanceId: number,
  gasPayment: string
) {
  const args = RuntimeArgs.fromMap({
    remittance_id: CLValueBuilder.u64(remittanceId),
  });

  const deploy = DeployUtil.makeDeploy(
    new DeployUtil.DeployParams(publicKey, CONFIG.chainName),
    DeployUtil.ExecutableDeployItem.newStoredContractByHash(
      Uint8Array.from(Buffer.from(CONTRACT_HASH.replace('hash-', ''), 'hex')),
      'cancel_remittance',
      args
    ),
    DeployUtil.standardPayment(gasPayment)
  );

  return deploy;
}

/**
 * Builds deploy for claiming a refund
 */
export async function buildClaimRefundDeploy(
  publicKey: CLPublicKey,
  remittanceId: number,
  gasPayment: string
) {
  const args = RuntimeArgs.fromMap({
    remittance_id: CLValueBuilder.u64(remittanceId),
  });

  const deploy = DeployUtil.makeDeploy(
    new DeployUtil.DeployParams(publicKey, CONFIG.chainName),
    DeployUtil.ExecutableDeployItem.newStoredContractByHash(
      Uint8Array.from(Buffer.from(CONTRACT_HASH.replace('hash-', ''), 'hex')),
      'claim_refund',
      args
    ),
    DeployUtil.standardPayment(gasPayment)
  );

  return deploy;
}

/**
 * Waits for a deploy to be executed
 */
export async function waitForDeploy(
  deployHash: string,
  timeout: number = 180000
): Promise<any> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const [deploy, raw] = await casperClient.getDeploy(deployHash);

      if (raw.execution_results && raw.execution_results.length > 0) {
        const result = raw.execution_results[0].result;

        if (result.Success) {
          return { success: true, deploy, result };
        } else if (result.Failure) {
          return { success: false, deploy, result, error: result.Failure };
        }
      }
    } catch (error) {
      // Deploy not found yet, continue polling
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  throw new Error('Deploy timeout - transaction not finalized within expected time');
}

/**
 * Gets account main purse URef
 */
export async function getAccountMainPurse(publicKey: CLPublicKey): Promise<any> {
  const stateRootHash = await casperClient.nodeClient.getStateRootHash();
  const accountHash = publicKey.toAccountHashStr();

  const { Account: account } = await casperClient.nodeClient.getBlockState(
    stateRootHash,
    accountHash,
    []
  );

  return account.mainPurse;
}

/**
 * Queries contract state for a remittance
 */
export async function queryRemittance(remittanceId: number): Promise<any> {
  try {
    const stateRootHash = await casperClient.nodeClient.getStateRootHash();

    // Get the contract data
    const contractHashKey = `hash-${CONTRACT_HASH.replace('hash-', '')}`;
    const {Contract: contractData} = await casperClient.nodeClient.getBlockState(
      stateRootHash,
      contractHashKey,
      []
    );

    // Get the remittances dictionary URef from named keys
    const remittancesDictURef = contractData.namedKeys.find(
      (key: any) => key.name === 'remittances'
    )?.key;

    if (!remittancesDictURef) {
      console.error('Remittances dictionary not found in contract');
      return null;
    }

    // Query the specific remittance from the dictionary
    const remittanceKey = remittanceId.toString();
    const result = await casperClient.nodeClient.getDictionaryItemByURef(
      stateRootHash,
      remittanceKey,
      remittancesDictURef
    );

    if (result && result.CLValue) {
      // Parse the CLValue to get the remittance data
      // This returns the raw Remittance struct from the contract
      return result.CLValue;
    }

    return null;
  } catch (error) {
    console.error(`Error querying remittance ${remittanceId}:`, error);
    return null;
  }
}
