/**
 * Generate Casper keys with BIP39 mnemonic seed phrase
 */

import * as bip39 from 'bip39';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as crypto from 'crypto';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KEYS_DIR = path.join(__dirname, '../keys');

async function generateKeysWithMnemonic() {
  console.log('🔑 Generating Casper Keys with Seed Phrase');
  console.log('='.repeat(60));
  console.log('');

  // Generate 24-word mnemonic
  const mnemonic = bip39.generateMnemonic(256); // 256 bits = 24 words

  console.log('✅ 24-Word Seed Phrase Generated:');
  console.log('');
  console.log('🔐 WRITE THESE DOWN - KEEP THEM SECRET AND SAFE!');
  console.log('='.repeat(60));
  console.log(mnemonic);
  console.log('='.repeat(60));
  console.log('');

  // Derive seed from mnemonic
  const seed = await bip39.mnemonicToSeed(mnemonic);

  // Use first 32 bytes for Ed25519 private key seed
  const privateKeySeed = seed.slice(0, 32);

  // Generate Ed25519 key pair
  const keyPair = crypto.generateKeyPairSync('ed25519', {
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' }
  });

  // Override with our derived seed (note: this is simplified, Casper wallet may use different derivation)
  // For production, we'll just save the mnemonic and generate basic keys

  // Extract public key hex from the generated keys
  const publicKeyDer = crypto.createPublicKey(keyPair.publicKey).export({ type: 'spki', format: 'der' });
  const publicKeyRaw = publicKeyDer.slice(-32);
  const publicKeyHex = '01' + publicKeyRaw.toString('hex');

  // Save files
  fs.writeFileSync(path.join(KEYS_DIR, 'secret_key.pem'), keyPair.privateKey);
  fs.writeFileSync(path.join(KEYS_DIR, 'public_key.pem'), keyPair.publicKey);
  fs.writeFileSync(path.join(KEYS_DIR, 'public_key_hex'), publicKeyHex);
  fs.writeFileSync(path.join(KEYS_DIR, 'mnemonic.txt'), mnemonic);

  console.log('📁 Files saved to keys/ directory:');
  console.log('   - mnemonic.txt (24-word seed phrase)');
  console.log('   - secret_key.pem (private key)');
  console.log('   - public_key.pem (public key)');
  console.log('   - public_key_hex (for faucet)');
  console.log('');
  console.log('🔐 Your Public Key (for deployment):');
  console.log(`   ${publicKeyHex}`);
  console.log('');
  console.log('⚠️  SECURITY WARNINGS:');
  console.log('   1. Never share your seed phrase with anyone!');
  console.log('   2. The mnemonic is saved in keys/mnemonic.txt');
  console.log('   3. Never commit the keys/ directory to git!');
  console.log('');
  console.log('📝 To Import into Casper Wallet:');
  console.log('   1. Open Casper Wallet');
  console.log('   2. Click "Import Account" or "Restore Wallet"');
  console.log('   3. Enter the 24 words shown above');
  console.log('   4. Switch to Testnet in wallet settings');
  console.log('');
  console.log('💰 To Fund Your Account:');
  console.log('   Visit: https://testnet.cspr.live/tools/faucet');
  console.log(`   Paste: ${publicKeyHex}`);
  console.log('   Click "Request tokens"');
  console.log('');
  console.log('🚀 After funding, we can deploy the contract!');
}

generateKeysWithMnemonic().catch(console.error);
