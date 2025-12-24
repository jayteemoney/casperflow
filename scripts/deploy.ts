/**
 * CasperFlow Contract Deployment Script (TypeScript)
 * Based on official Casper SDK best practices
 *
 * References:
 * - https://docs.casper.network/developers/dapps/sdk/script-sdk
 * - https://github.com/casper-ecosystem/cep18/tree/master/client-js
 */

import CasperSDK from 'casper-js-sdk';
const { CasperClient, CLPublicKey, DeployUtil, Keys, RuntimeArgs } = CasperSDK;
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const NODE_URL = process.env.NODE_URL || 'https://node.testnet.casper.network/rpc';
const CHAIN_NAME = process.env.CHAIN_NAME || 'casper-test';
const WASM_PATH = path.join(__dirname, '../contracts/target/wasm32-unknown-unknown/release/casperflow_escrow.wasm');
const PUBLIC_KEY_PATH = path.join(__dirname, '../keys/public_key.pem');
const PRIVATE_KEY_PATH = path.join(__dirname, '../keys/secret_key.pem');

// Gas payment for deployment (150 CSPR in motes)
const DEPLOYMENT_GAS = '150000000000';

async function main() {
  console.log('🚀 CasperFlow Contract Deployment');
  console.log('='.repeat(60));
  console.log(`Network: ${CHAIN_NAME}`);
  console.log(`Node URL: ${NODE_URL}`);
  console.log('='.repeat(60));
  console.log('');

  try {
    // Initialize Casper client
    const client = new CasperClient(NODE_URL);

    // Load keys using Ed25519.parseKeyFiles (official method)
    console.log('📂 Loading keys...');
    const keyPair = Keys.Ed25519.parseKeyFiles(
      PUBLIC_KEY_PATH,
      PRIVATE_KEY_PATH
    );

    const publicKey = keyPair.publicKey;
    console.log(`   Public Key: ${publicKey.toHex()}`);
    console.log('');

    // Load WASM
    console.log('📦 Loading contract WASM...');
    if (!fs.existsSync(WASM_PATH)) {
      throw new Error(`WASM file not found at: ${WASM_PATH}`);
    }

    const wasm = new Uint8Array(fs.readFileSync(WASM_PATH));
    console.log(`   WASM size: ${(wasm.length / 1024).toFixed(2)} KB`);
    console.log('');

    // Create deploy using DeployUtil
    console.log('📝 Creating deploy...');
    const deployParams = new DeployUtil.DeployParams(
      publicKey,
      CHAIN_NAME
    );

    const session = DeployUtil.ExecutableDeployItem.newModuleBytes(
      wasm,
      RuntimeArgs.fromMap({}) // Empty args for installation
    );

    const payment = DeployUtil.standardPayment(DEPLOYMENT_GAS);

    const deploy = DeployUtil.makeDeploy(deployParams, session, payment);

    // Sign deploy using the key pair
    console.log('✍️  Signing deploy...');
    const signedDeploy = deploy.sign([keyPair]);

    // Get deploy hash
    const deployHash = Buffer.from(signedDeploy.hash).toString('hex');
    console.log(`   Deploy Hash: ${deployHash}`);
    console.log('');

    // Send deploy to network
    console.log('📡 Sending deploy to network...');

    // Convert to JSON format for transmission
    const deployJson = DeployUtil.deployToJson(signedDeploy);

    // Send using putDeploy
    await client.putDeploy(signedDeploy);

    console.log('✅ Deploy sent successfully!');
    console.log('');
    console.log(`🔍 Track deployment:`);
    console.log(`   https://testnet.cspr.live/deploy/${deployHash}`);
    console.log('');
    console.log('⏳ Waiting for deployment to finalize (2-3 minutes)...');
    console.log('');

    // Wait for deployment to complete
    const result = await waitForDeploy(client, deployHash);

    if (result.success) {
      console.log('✅ Contract deployed successfully!');
      console.log('');

      // Extract contract hash
      const contractHash = extractContractHash(result.deployInfo);

      if (contractHash) {
        console.log(`📋 Contract Hash: ${contractHash}`);
        console.log('');

        // Save contract hash
        fs.writeFileSync(
          path.join(__dirname, '../.contract-hash'),
          contractHash
        );
        console.log('💾 Contract hash saved to .contract-hash');
        console.log('');
        console.log('🎉 Deployment complete!');
        console.log('');
        console.log('Next steps:');
        console.log('1. Update frontend/.env with:');
        console.log(`   VITE_CONTRACT_HASH=${contractHash}`);
        console.log('2. Test contract interactions');
        console.log('3. Deploy frontend');
      } else {
        console.log('⚠️  Could not extract contract hash automatically');
        console.log('   Please check the deploy in the explorer');
      }
    } else {
      console.error('❌ Deployment failed!');
      console.error(`   Error: ${result.error}`);
      process.exit(1);
    }

  } catch (error: any) {
    console.error('❌ Deployment error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

async function waitForDeploy(
  client: any,
  deployHash: string,
  timeout: number = 180000
): Promise<any> {
  const startTime = Date.now();
  let attempts = 0;

  while (Date.now() - startTime < timeout) {
    attempts++;

    try {
      const [deployInfo, raw] = await client.getDeploy(deployHash);

      if (raw.execution_results && raw.execution_results.length > 0) {
        const result = raw.execution_results[0].result;

        if (result.Success) {
          console.log(`✓ Deploy finalized after ${attempts} checks`);
          return { success: true, deployInfo, raw };
        } else if (result.Failure) {
          return {
            success: false,
            error: result.Failure.error_message || 'Unknown error'
          };
        }
      }

      // Show progress
      if (attempts % 6 === 0) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        console.log(`   Still waiting... (${elapsed}s elapsed)`);
      }

    } catch (error) {
      // Deploy not found yet, continue polling
    }

    // Wait 5 seconds before next check
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  throw new Error('Deployment timeout - not finalized within expected time');
}

function extractContractHash(deployInfo: any): string | null {
  try {
    const namedKeys = deployInfo?.deploy?.session?.ModuleBytes?.module_bytes;

    // Try to find contract hash in execution results
    if (deployInfo?.execution_results) {
      for (const result of deployInfo.execution_results) {
        if (result?.result?.Success?.effect?.transforms) {
          for (const transform of result.result.Success.effect.transforms) {
            const key = transform.key;
            if (key && key.startsWith('hash-')) {
              return key;
            }
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Failed to extract contract hash:', error);
    return null;
  }
}

// Run deployment
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
