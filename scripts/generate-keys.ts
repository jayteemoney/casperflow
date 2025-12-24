/**
 * Generate Casper keys using casper-js-sdk
 */

import pkg from 'casper-js-sdk';
const { Keys } = pkg;
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KEYS_DIR = path.join(__dirname, '../keys');

async function generateKeys() {
  console.log('🔑 Generating Casper Keys');
  console.log('='.repeat(50));

  // Create keys directory if it doesn't exist
  if (!fs.existsSync(KEYS_DIR)) {
    fs.mkdirSync(KEYS_DIR, { recursive: true });
  }

  // Generate Ed25519 key pair
  const keys = Keys.Ed25519.new();

  // Export keys
  const publicKeyHex = keys.publicKey.toHex();
  const privateKeyPem = keys.exportPrivateKeyInPem();
  const publicKeyPem = keys.exportPublicKeyInPem();

  // Save to files
  fs.writeFileSync(path.join(KEYS_DIR, 'secret_key.pem'), privateKeyPem);
  fs.writeFileSync(path.join(KEYS_DIR, 'public_key.pem'), publicKeyPem);
  fs.writeFileSync(path.join(KEYS_DIR, 'public_key_hex'), publicKeyHex);

  console.log('✅ Keys generated successfully!');
  console.log('');
  console.log('📁 Files created:');
  console.log(`   ${KEYS_DIR}/secret_key.pem`);
  console.log(`   ${KEYS_DIR}/public_key.pem`);
  console.log(`   ${KEYS_DIR}/public_key_hex`);
  console.log('');
  console.log('🔐 Your Public Key (for funding):');
  console.log(`   ${publicKeyHex}`);
  console.log('');
  console.log('⚠️  IMPORTANT: Never share your secret_key.pem file!');
  console.log('');
  console.log('📝 Next steps:');
  console.log('1. Copy your public key above');
  console.log('2. Visit: https://testnet.cspr.live/tools/faucet');
  console.log('3. Paste your public key and request testnet tokens');
  console.log('4. Wait for tokens to arrive (~1 minute)');
  console.log('5. Run: npm run deploy:testnet');
}

generateKeys().catch(console.error);
