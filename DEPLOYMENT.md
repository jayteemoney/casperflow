
# CasperFlow Deployment Guide

Complete guide for deploying CasperFlow smart contract to Casper Network (Testnet and Mainnet).

---

## Prerequisites

### Required Software

1. **Rust** (1.75+)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   rustup target add wasm32-unknown-unknown
   ```

2. **Casper Client**
   ```bash
   cargo install casper-client
   casper-client --version
   ```

3. **Node.js** (18+)
   ```bash
   node --version
   npm --version
   ```

### Account Setup

1. **Generate Keys**
   ```bash
   mkdir keys
   casper-client keygen keys/
   ```

   This creates:
   - `keys/secret_key.pem` (⚠️ KEEP SECRET!)
   - `keys/public_key.pem`
   - `keys/public_key_hex`

2. **Get Your Public Key**
   ```bash
   cat keys/public_key_hex
   ```

---

## Testnet Deployment

### Step 1: Build Contract

```bash
cd contracts
make build
```

**Output:** `target/wasm32-unknown-unknown/release/casperflow_escrow.wasm`

**Verify build:**
```bash
ls -lh target/wasm32-unknown-unknown/release/casperflow_escrow.wasm
```

### Step 2: Fund Testnet Account

1. Copy your public key:
   ```bash
   cat keys/public_key_hex
   ```

2. Visit Casper Testnet Faucet:
   https://testnet.cspr.live/tools/faucet

3. Paste your public key and request tokens

4. Verify balance:
   ```bash
   casper-client get-balance \
     --node-address https://node.testnet.casper.network/rpc \
     --public-key keys/public_key_hex
   ```

   You should have at least 200 CSPR for deployment and testing.

### Step 3: Deploy Contract

#### Option A: Using Deployment Script (Recommended)

```bash
cd scripts
npm install
npm run deploy:testnet
```

The script will:
- ✅ Load and validate WASM file
- ✅ Sign and send deploy
- ✅ Monitor deployment progress
- ✅ Extract contract hash
- ✅ Save contract hash to `.contract-hash`

#### Option B: Manual Deployment

```bash
casper-client put-deploy \
  --node-address https://node.testnet.casper.network/rpc \
  --chain-name casper-test \
  --secret-key keys/secret_key.pem \
  --payment-amount 150000000000 \
  --session-path contracts/target/wasm32-unknown-unknown/release/casperflow_escrow.wasm
```

**Save the deploy hash from the output!**

### Step 4: Monitor Deployment

Visit Casper Explorer:
```
https://testnet.cspr.live/deploy/{YOUR_DEPLOY_HASH}
```

Wait for:
- ⏳ Status: Pending
- ✅ Status: Executed (takes 1-3 minutes)

### Step 5: Get Contract Hash

From the deployment result, extract the contract hash.

**Using the script:** It's automatically saved to `.contract-hash`

**Manual extraction:**
1. Go to your deploy in the explorer
2. Look for "Transforms" section
3. Find entry with key starting with `hash-`
4. Copy the hash: `hash-xxxxxxxxxxxxxxxxx`

### Step 6: Configure Frontend

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
```bash
VITE_NODE_URL=https://node.testnet.casper.network/rpc
VITE_CHAIN_NAME=casper-test
VITE_CONTRACT_HASH=hash-xxxxxxxxxxxxxxxxx  # Your contract hash
VITE_NETWORK=testnet
```

### Step 7: Test Contract

Test creating a remittance:

```bash
# Create test remittance
casper-client put-deploy \
  --node-address https://node.testnet.casper.network/rpc \
  --chain-name casper-test \
  --secret-key keys/secret_key.pem \
  --payment-amount 3000000000 \
  --session-hash hash-xxxxxxxxxxxxxxxxx \
  --session-entry-point create_remittance \
  --session-arg "recipient:key='account-hash-...'" \
  --session-arg "target_amount:u512='1000000000'" \
  --session-arg "purpose:string='Test remittance'"
```

---

## Mainnet Deployment

⚠️ **WARNING:** Mainnet deployment is IRREVERSIBLE and uses REAL CSPR!

### Prerequisites

1. ✅ Thoroughly tested on testnet
2. ✅ All tests passing
3. ✅ Security audit completed (recommended)
4. ✅ Mainnet account funded with 200+ CSPR

### Step 1: Verify Build

```bash
cd contracts
make clean
make build
make test
```

All tests must pass!

### Step 2: Fund Mainnet Account

1. Purchase CSPR from exchange
2. Withdraw to your public key address
3. Verify balance:
   ```bash
   casper-client get-balance \
     --node-address https://node.mainnet.casper.network/rpc \
     --public-key keys/public_key_hex
   ```

### Step 3: Deploy to Mainnet

```bash
cd scripts
npm run deploy:mainnet
```

**Confirm deployment:**
- Network: `casper` (mainnet)
- Gas: 150 CSPR
- Type: `yes` to proceed

### Step 4: Configure Production Frontend

```bash
cd frontend
cp .env.example .env.production
```

Edit `.env.production`:
```bash
VITE_NODE_URL=https://node.mainnet.casper.network/rpc
VITE_CHAIN_NAME=casper
VITE_CONTRACT_HASH=hash-xxxxxxxxxxxxxxxxx
VITE_NETWORK=mainnet
```

### Step 5: Deploy Frontend

```bash
cd frontend
npm run build

# Deploy to Vercel, Netlify, or your hosting provider
```

---

## Troubleshooting

### Error: "WASM file not found"

**Solution:**
```bash
cd contracts
make build
```

Verify output exists:
```bash
ls -lh target/wasm32-unknown-unknown/release/casperflow_escrow.wasm
```

### Error: "Insufficient balance"

**Solution:**
- **Testnet:** Request more tokens from faucet
- **Mainnet:** Add more CSPR to your account

### Error: "Deploy timeout"

**Solution:**
- Network may be congested
- Wait longer (up to 5 minutes)
- Check deploy status manually in explorer

### Error: "Invalid public key format"

**Solution:**
```bash
# Regenerate keys
rm -rf keys/
casper-client keygen keys/
```

### Error: "Contract hash not found"

**Solution:**
- Check deploy succeeded in explorer
- Look for "Transforms" section
- Extract hash manually from execution results

---

## Post-Deployment Checklist

### Smart Contract

- [ ] Deploy hash recorded
- [ ] Contract hash extracted and saved
- [ ] Deployment verified in explorer
- [ ] Test transaction successful
- [ ] Contract events visible

### Frontend

- [ ] `.env` configured with contract hash
- [ ] CSPR.click wallet connects
- [ ] Can create remittance
- [ ] Can contribute to remittance
- [ ] Can release funds
- [ ] Can cancel and claim refund
- [ ] All UI components working

### Documentation

- [ ] Contract hash documented
- [ ] Deploy hash recorded
- [ ] Network configuration saved
- [ ] Admin keys secured
- [ ] Team notified

---

## Network Configuration

### Testnet

```bash
NODE_URL=https://node.testnet.casper.network/rpc
CHAIN_NAME=casper-test
EXPLORER=https://testnet.cspr.live
FAUCET=https://testnet.cspr.live/tools/faucet
```

### Mainnet

```bash
NODE_URL=https://node.mainnet.casper.network/rpc
CHAIN_NAME=casper
EXPLORER=https://cspr.live
```

---

## Gas Costs Reference

| Operation | Gas (CSPR) | USD (@ $0.02/CSPR) |
|-----------|------------|--------------------|
| Deploy Contract | 150 | $3.00 |
| Create Remittance | 3 | $0.06 |
| Contribute | 2.5 | $0.05 |
| Release Funds | 2.5 | $0.05 |
| Cancel Remittance | 2 | $0.04 |
| Claim Refund | 2 | $0.04 |

---

## Security Best Practices

1. **Never commit private keys**
   - Add `keys/` to `.gitignore`
   - Use environment variables
   - Rotate keys regularly

2. **Use different keys for testnet/mainnet**
   - Testnet: `keys/testnet/`
   - Mainnet: `keys/mainnet/`

3. **Backup keys securely**
   - Encrypted storage
   - Multiple secure locations
   - Hardware wallet for large amounts

4. **Monitor contract**
   - Set up alerts for large transactions
   - Regular security audits
   - Bug bounty program

---

## Emergency Procedures

### Pause Contract (Owner Only)

```bash
casper-client put-deploy \
  --node-address {NODE_URL} \
  --chain-name {CHAIN_NAME} \
  --secret-key keys/secret_key.pem \
  --payment-amount 2000000000 \
  --session-hash {CONTRACT_HASH} \
  --session-entry-point pause_contract
```

### Update Platform Fee (Owner Only)

```bash
casper-client put-deploy \
  --node-address {NODE_URL} \
  --chain-name {CHAIN_NAME} \
  --secret-key keys/secret_key.pem \
  --payment-amount 2000000000 \
  --session-hash {CONTRACT_HASH} \
  --session-entry-point set_platform_fee \
  --session-arg "fee_bps:u64='50'"  # 0.5%
```

---

## Support

If you encounter issues:

1. Check [README.md](README.md) for general info
2. Review [Troubleshooting](#troubleshooting) section
3. Check Casper docs: https://docs.casper.network
4. Join Casper Discord for community support
5. Open GitHub issue for bugs

---

**Deployment completed successfully? Congratulations! 🎉**

Next steps:
1. Test all features thoroughly
2. Share with beta users
3. Gather feedback
4. Iterate and improve

Happy deploying! 🚀
