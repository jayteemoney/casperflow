/**
 * Deployment script for CasperFlow contract
 *
 * Usage:
 *   node scripts/deploy.js
 *
 * Environment variables required:
 *   NODE_URL - Casper node RPC URL
 *   CHAIN_NAME - Chain name (casper-test or casper)
 *   SECRET_KEY_PATH - Path to secret key PEM file
 */

import { CasperClient, CLPublicKey, DeployUtil, Signer } from 'casper-js-sdk';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const NODE_URL = process.env.NODE_URL || 'https://node.testnet.casper.network/rpc';
const CHAIN_NAME = process.env.CHAIN_NAME || 'casper-test';
const SECRET_KEY_PATH = process.env.SECRET_KEY_PATH || path.join(__dirname, '../keys/secret_key.pem');
const WASM_PATH = path.join(__dirname, '../contracts/target/wasm32-unknown-unknown/release/casperflow_escrow.wasm');

// Gas payment for deployment (150 CSPR)
const DEPLOYMENT_GAS = '150000000000';

async function main() {
  console.log('🚀 CasperFlow Contract Deployment');
  console.log('='.repeat(50));
  console.log(`Network: ${CHAIN_NAME}`);
  console.log(`Node URL: ${NODE_URL}`);
  console.log('='.repeat(50));
  console.log('');

  // Check if WASM file exists
  if (!fs.existsSync(WASM_PATH)) {
    console.error('❌ Error: WASM file not found!');
    console.error(`   Expected location: ${WASM_PATH}`);
    console.error('   Please build the contract first: cd contracts && make build');
    process.exit(1);
  }

  // Check if secret key exists
  if (!fs.existsSync(SECRET_KEY_PATH)) {
    console.error('❌ Error: Secret key file not found!');
    console.error(`   Expected location: ${SECRET_KEY_PATH}`);
    console.error('   Please generate keys: casper-client keygen keys/');
    process.exit(1);
  }

  try {
    // Initialize Casper client
    const client = new CasperClient(NODE_URL);

    // Load keys
    console.log('📂 Loading keys...');
    const privateKey = fs.readFileSync(SECRET_KEY_PATH, 'utf8');
    const publicKeyPath = SECRET_KEY_PATH.replace('secret_key', 'public_key_hex');
    const publicKeyHex = fs.readFileSync(publicKeyPath, 'utf8').trim();
    const publicKey = CLPublicKey.fromHex(publicKeyHex);

    console.log(`   Public Key: ${publicKeyHex}`);
    console.log('');

    // Load WASM
    console.log('📦 Loading contract WASM...');
    const wasm = new Uint8Array(fs.readFileSync(WASM_PATH));
    console.log(`   WASM size: ${(wasm.length / 1024).toFixed(2)} KB`);
    console.log('');

    // Create deploy
    console.log('📝 Creating deploy...');
    const deploy = DeployUtil.makeDeploy(
      new DeployUtil.DeployParams(publicKey, CHAIN_NAME),
      DeployUtil.ExecutableDeployItem.newModuleBytes(
        wasm,
        DeployUtil.RuntimeArgs.fromMap({})
      ),
      DeployUtil.standardPayment(DEPLOYMENT_GAS)
    );

    // Sign deploy
    console.log('✍️  Signing deploy...');
    const signedDeploy = DeployUtil.signDeploy(deploy, privateKey);
    const deployHash = DeployUtil.deployToJson(signedDeploy).deploy.hash;

    console.log(`   Deploy Hash: ${deployHash}`);
    console.log('');

    // Send deploy
    console.log('📡 Sending deploy to network...');
    await client.putDeploy(signedDeploy);

    console.log('✅ Deploy sent successfully!');
    console.log('');
    console.log(`🔍 Track deployment:`);
    console.log(`   https://testnet.cspr.live/deploy/${deployHash}`);
    console.log('');
    console.log('⏳ Waiting for deployment to finalize (this may take 2-3 minutes)...');
    console.log('');

    // Wait for deployment
    const result = await waitForDeploy(client, deployHash, 180000);

    if (result.success) {
      console.log('✅ Contract deployed successfully!');
      console.log('');

      // Extract contract hash from execution results
      const contractHash = extractContractHash(result);

      if (contractHash) {
        console.log(`📋 Contract Hash: ${contractHash}`);
        console.log('');
        console.log('💾 Saving contract hash...');

        // Save contract hash to file
        fs.writeFileSync(
          path.join(__dirname, '../.contract-hash'),
          contractHash
        );

        console.log('   Saved to .contract-hash');
        console.log('');
        console.log('🎉 Deployment complete!');
        console.log('');
        console.log('Next steps:');
        console.log('1. Update frontend/.env with:');
        console.log(`   VITE_CONTRACT_HASH=${contractHash}`);
        console.log('2. Test the contract with sample transactions');
        console.log('3. Deploy frontend: cd frontend && npm run build');
      }
    } else {
      console.error('❌ Deployment failed!');
      console.error('   Error:', result.error);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Deployment error:', error.message);
    process.exit(1);
  }
}

async function waitForDeploy(client, deployHash, timeout = 180000) {
  const startTime = Date.now();
  let attempts = 0;

  while (Date.now() - startTime < timeout) {
    attempts++;

    try {
      const [deploy, raw] = await client.getDeploy(deployHash);

      if (raw.execution_results && raw.execution_results.length > 0) {
        const result = raw.execution_results[0].result;

        if (result.Success) {
          console.log(`✓ Deploy finalized after ${attempts} attempts`);
          return { success: true, deploy, result: raw.execution_results[0] };
        } else if (result.Failure) {
          return {
            success: false,
            deploy,
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

    // Wait 5 seconds before next poll
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  throw new Error('Deploy timeout - transaction not finalized within expected time');
}

function extractContractHash(result) {
  try {
    const transforms = result.result.Success.effect.transforms;

    for (const transform of transforms) {
      if (transform.key && transform.key.startsWith('hash-')) {
        return transform.key;
      }
    }

    // Alternative: look in deploy result
    if (result.deploy && result.deploy.execution_results) {
      for (const execResult of result.deploy.execution_results) {
        if (execResult.result && execResult.result.Success) {
          const effects = execResult.result.Success.effect;
          if (effects && effects.transforms) {
            for (const transform of effects.transforms) {
              if (transform.key && transform.key.startsWith('hash-')) {
                return transform.key;
              }
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
main().catch(console.error);
