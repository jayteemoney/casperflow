/**
 * Extract public key hex from PEM file
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_KEY_PATH = path.join(__dirname, '../keys/public_key.pem');
const OUTPUT_PATH = path.join(__dirname, '../keys/public_key_hex');

try {
  // Read PEM file
  const pemContent = fs.readFileSync(PUBLIC_KEY_PATH, 'utf8');

  // Extract the key using Node.js crypto
  const publicKey = crypto.createPublicKey(pemContent);

  // Export as DER (binary) and convert to hex
  const der = publicKey.export({ type: 'spki', format: 'der' });

  // Ed25519 public key is the last 32 bytes of the SPKI DER encoding
  const publicKeyRaw = der.slice(-32);
  const publicKeyHex = '01' + publicKeyRaw.toString('hex'); // 01 prefix for Ed25519

  // Save to file
  fs.writeFileSync(OUTPUT_PATH, publicKeyHex);

  console.log('✅ Public key hex extracted successfully!');
  console.log('');
  console.log('🔐 Your Public Key (for funding):');
  console.log(`   ${publicKeyHex}`);
  console.log('');
  console.log('📝 Saved to: keys/public_key_hex');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. Copy the public key above');
  console.log('2. Visit: https://testnet.cspr.live/tools/faucet');
  console.log('3. Paste your public key and click "Request tokens"');
  console.log('4. Wait ~1 minute for tokens to arrive');
  console.log('5. Verify balance with the command shown below');
  console.log('');
  console.log('💡 To check your balance later:');
  console.log(`   Visit: https://testnet.cspr.live/account/${publicKeyHex}`);

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
