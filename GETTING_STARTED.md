# Getting Started with CasperFlow

This guide will help you get CasperFlow up and running on your local machine for development and testing.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Building the Contract](#building-the-contract)
4. [Running Tests](#running-tests)
5. [Deploying to Testnet](#deploying-to-testnet)
6. [Running the Frontend](#running-the-frontend)
7. [Next Steps](#next-steps)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

1. **Rust** (1.75 or later)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source $HOME/.cargo/env
   rustup --version
   ```

2. **wasm32 Target**
   ```bash
   rustup target add wasm32-unknown-unknown
   ```

3. **Node.js** (18 or later)
   ```bash
   node --version  # Should be v18 or higher
   npm --version
   ```

4. **Casper Client** (optional but recommended)
   ```bash
   cargo install casper-client
   casper-client --version
   ```

5. **Git**
   ```bash
   git --version
   ```

### Browser Extension

- **CSPR.click** - Install from [https://www.cspr.click/](https://www.cspr.click/)

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/casperflow.git
cd casperflow
```

### 2. Install Dependencies

#### Root Dependencies
```bash
npm install
```

#### Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

#### Scripts Dependencies
```bash
cd scripts
npm install
cd ..
```

### 3. Verify Installation

```bash
# Check Rust
cargo --version

# Check wasm32 target
rustup target list | grep wasm32-unknown-unknown

# Check Node.js
node --version

# Check everything is installed
ls -la
```

You should see:
- `contracts/` - Rust smart contract
- `frontend/` - React frontend
- `scripts/` - Deployment scripts
- `package.json` - Root configuration

---

## Building the Contract

### 1. Navigate to Contracts Directory

```bash
cd contracts
```

### 2. Build the Contract

```bash
make build
```

This will:
- Compile the Rust contract to WebAssembly
- Optimize the WASM output
- Place the result in `target/wasm32-unknown-unknown/release/`

### 3. Verify Build

```bash
ls -lh target/wasm32-unknown-unknown/release/casperflow_escrow.wasm
```

You should see the WASM file with size around 50-100 KB.

### Alternative: Manual Build

```bash
cargo build --release --target wasm32-unknown-unknown
```

---

## Running Tests

### 1. Run Unit Tests

```bash
cd contracts
make test
```

Or manually:
```bash
cargo test --lib
```

### 2. Run with Verbose Output

```bash
make test-verbose
```

Or:
```bash
cargo test --lib -- --nocapture
```

### 3. Check Code Quality

```bash
# Format code
make fmt

# Run linter
make clippy
```

---

## Deploying to Testnet

### 1. Generate Keys

```bash
# From project root
mkdir -p keys
casper-client keygen keys/
```

This creates:
- `keys/secret_key.pem` ⚠️ Keep this secret!
- `keys/public_key.pem`
- `keys/public_key_hex`

### 2. Get Your Public Key

```bash
cat keys/public_key_hex
```

Copy this public key.

### 3. Fund Your Account

1. Visit the Casper Testnet Faucet:
   https://testnet.cspr.live/tools/faucet

2. Paste your public key

3. Request testnet tokens (you'll get ~1000 CSPR)

4. Wait ~1 minute for the transaction to complete

### 4. Verify Balance

```bash
casper-client get-balance \
  --node-address https://node.testnet.casper.network/rpc \
  --public-key keys/public_key_hex
```

You should see your balance in motes (1 CSPR = 1,000,000,000 motes).

### 5. Deploy Contract

```bash
cd scripts
npm run deploy:testnet
```

The script will:
- ✅ Validate your WASM file
- ✅ Send the deployment transaction
- ✅ Wait for finalization (~2-3 minutes)
- ✅ Extract the contract hash
- ✅ Save it to `.contract-hash`

### 6. Save Contract Hash

```bash
cat ../.contract-hash
```

Copy this hash - you'll need it for the frontend!

---

## Running the Frontend

### 1. Configure Environment

```bash
cd frontend
cp .env.example .env
```

### 2. Edit .env File

Open `frontend/.env` and update:

```bash
VITE_NODE_URL=https://node.testnet.casper.network/rpc
VITE_CHAIN_NAME=casper-test
VITE_CONTRACT_HASH=hash-YOUR_CONTRACT_HASH_HERE
VITE_NETWORK=testnet
```

Replace `hash-YOUR_CONTRACT_HASH_HERE` with your actual contract hash from `.contract-hash`.

### 3. Start Development Server

```bash
npm run dev
```

The frontend will start at: `http://localhost:3000`

### 4. Connect Wallet

1. Open `http://localhost:3000` in your browser
2. Click "Connect Wallet"
3. CSPR.click will prompt you to connect
4. Approve the connection
5. You're ready to use CasperFlow!

---

## Next Steps

### Try Creating a Remittance

1. Click "Connect Wallet" (if not already connected)
2. Fill in the remittance form:
   - **Recipient:** Another public key (can be your own for testing)
   - **Target Amount:** e.g., 10 CSPR
   - **Purpose:** e.g., "Test remittance"
3. Click "Create Remittance"
4. Sign the transaction in CSPR.click
5. Wait ~3 seconds for confirmation

### Try Contributing

1. View your created remittance
2. Enter a contribution amount
3. Click "Contribute"
4. Sign the transaction
5. Watch the progress bar update!

### Try Other Features

- **Release Funds:** If you're the recipient and target is met
- **Cancel Remittance:** If you're the creator
- **Claim Refund:** If remittance was cancelled

---

## Troubleshooting

### "WASM file not found"

**Solution:**
```bash
cd contracts
make build
```

### "Insufficient balance"

**Solution:**
- Visit testnet faucet again
- Wait for previous transactions to complete
- Check balance with `casper-client get-balance`

### "CSPR.click not found"

**Solution:**
- Install CSPR.click extension
- Refresh the page
- Ensure you're using a supported browser (Chrome, Brave, Edge)

### "Contract hash not found"

**Solution:**
```bash
# Check if .contract-hash exists
cat .contract-hash

# If not, redeploy:
cd scripts
npm run deploy:testnet
```

### Frontend won't start

**Solution:**
```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### Build errors

**Solution:**
```bash
# Update Rust
rustup update

# Clean and rebuild
cd contracts
make clean
make build
```

---

## Development Workflow

### Daily Development

1. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Make Contract Changes:**
   ```bash
   cd contracts
   # Edit files
   make build
   make test
   ```

3. **Redeploy if Needed:**
   ```bash
   cd scripts
   npm run deploy:testnet
   # Update .env with new contract hash
   ```

### Code Quality

```bash
# Format all code
cd contracts && make fmt

# Run linter
cd contracts && make clippy

# Run all tests
cd contracts && make test
```

---

## Project Structure

```
casperflow/
├── contracts/           # Rust smart contract
│   ├── src/
│   │   ├── lib.rs      # Main contract
│   │   ├── errors.rs   # Error definitions
│   │   ├── remittance.rs
│   │   └── ...
│   ├── tests/          # Contract tests
│   └── Cargo.toml
│
├── frontend/           # React frontend
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── hooks/      # Custom hooks
│   │   ├── lib/        # Utilities
│   │   └── types/      # TypeScript types
│   └── package.json
│
├── scripts/            # Deployment scripts
│   ├── deploy.js
│   └── package.json
│
├── keys/              # Your keys (gitignored!)
├── .env.example       # Environment template
└── README.md
```

---

## Useful Commands

### Contract

```bash
cd contracts
make build          # Build contract
make test          # Run tests
make clean         # Clean build artifacts
make fmt           # Format code
make clippy        # Lint code
```

### Frontend

```bash
cd frontend
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Lint TypeScript
```

### Scripts

```bash
cd scripts
npm run deploy:testnet   # Deploy to testnet
npm run deploy:mainnet   # Deploy to mainnet
```

---

## Support

- **Documentation:** [README.md](README.md), [DEPLOYMENT.md](DEPLOYMENT.md)
- **Casper Docs:** https://docs.casper.network
- **Discord:** Join Casper Discord community
- **Issues:** [GitHub Issues](https://github.com/yourusername/casperflow/issues)

---

**You're all set! Happy coding! 🚀**
