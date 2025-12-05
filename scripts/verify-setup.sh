#!/bin/bash

# CasperFlow Setup Verification Script
# Checks if all prerequisites are installed and configured

set -e

echo "🔍 CasperFlow Setup Verification"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SUCCESS=0
WARNINGS=0
ERRORS=0

# Function to check command existence
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $2 is installed"
        ((SUCCESS++))
        return 0
    else
        echo -e "${RED}✗${NC} $2 is NOT installed"
        echo "   Install: $3"
        ((ERRORS++))
        return 1
    fi
}

# Function to check version
check_version() {
    local version=$($1)
    echo "   Version: $version"
}

echo "Checking Prerequisites..."
echo "------------------------"

# Check Rust
if check_command rustc "Rust"; then
    check_version "rustc --version"
fi

# Check Cargo
if check_command cargo "Cargo"; then
    check_version "cargo --version"
fi

# Check wasm32 target
echo -n "Checking wasm32-unknown-unknown target... "
if rustup target list | grep -q "wasm32-unknown-unknown (installed)"; then
    echo -e "${GREEN}✓${NC} Installed"
    ((SUCCESS++))
else
    echo -e "${RED}✗${NC} Not installed"
    echo "   Install: rustup target add wasm32-unknown-unknown"
    ((ERRORS++))
fi

# Check Node.js
if check_command node "Node.js"; then
    check_version "node --version"
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo -e "${YELLOW}⚠${NC}  Node.js version should be 18 or higher"
        ((WARNINGS++))
    fi
fi

# Check npm
if check_command npm "npm"; then
    check_version "npm --version"
fi

# Check Casper Client (optional)
if check_command casper-client "Casper Client (optional)"; then
    check_version "casper-client --version"
else
    echo -e "${YELLOW}⚠${NC}  Casper Client is recommended but optional"
    ((WARNINGS++))
fi

# Check Git
check_command git "Git"

echo ""
echo "Checking Project Structure..."
echo "----------------------------"

# Check if in project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}✗${NC} Not in project root directory"
    echo "   Please run this script from the casperflow root directory"
    ((ERRORS++))
else
    echo -e "${GREEN}✓${NC} In project root directory"
    ((SUCCESS++))
fi

# Check contracts directory
if [ -d "contracts" ]; then
    echo -e "${GREEN}✓${NC} contracts/ directory exists"
    ((SUCCESS++))
else
    echo -e "${RED}✗${NC} contracts/ directory not found"
    ((ERRORS++))
fi

# Check frontend directory
if [ -d "frontend" ]; then
    echo -e "${GREEN}✓${NC} frontend/ directory exists"
    ((SUCCESS++))
else
    echo -e "${RED}✗${NC} frontend/ directory not found"
    ((ERRORS++))
fi

# Check scripts directory
if [ -d "scripts" ]; then
    echo -e "${GREEN}✓${NC} scripts/ directory exists"
    ((SUCCESS++))
else
    echo -e "${RED}✗${NC} scripts/ directory not found"
    ((ERRORS++))
fi

echo ""
echo "Checking Dependencies..."
echo "----------------------"

# Check if node_modules exists in frontend
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Frontend dependencies installed"
    ((SUCCESS++))
else
    echo -e "${YELLOW}⚠${NC}  Frontend dependencies not installed"
    echo "   Run: cd frontend && npm install"
    ((WARNINGS++))
fi

# Check if node_modules exists in scripts
if [ -d "scripts/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Scripts dependencies installed"
    ((SUCCESS++))
else
    echo -e "${YELLOW}⚠${NC}  Scripts dependencies not installed"
    echo "   Run: cd scripts && npm install"
    ((WARNINGS++))
fi

echo ""
echo "Checking Build Artifacts..."
echo "-------------------------"

# Check if contract is built
if [ -f "contracts/target/wasm32-unknown-unknown/release/casperflow_escrow.wasm" ]; then
    echo -e "${GREEN}✓${NC} Contract WASM file exists"
    WASM_SIZE=$(du -h "contracts/target/wasm32-unknown-unknown/release/casperflow_escrow.wasm" | cut -f1)
    echo "   Size: $WASM_SIZE"
    ((SUCCESS++))
else
    echo -e "${YELLOW}⚠${NC}  Contract not built"
    echo "   Run: cd contracts && make build"
    ((WARNINGS++))
fi

echo ""
echo "Checking Configuration..."
echo "-----------------------"

# Check if keys directory exists
if [ -d "keys" ]; then
    echo -e "${GREEN}✓${NC} keys/ directory exists"
    ((SUCCESS++))

    # Check for secret key
    if [ -f "keys/secret_key.pem" ]; then
        echo -e "${GREEN}✓${NC} Secret key exists"
        ((SUCCESS++))
    else
        echo -e "${YELLOW}⚠${NC}  Secret key not found"
        echo "   Run: casper-client keygen keys/"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}⚠${NC}  keys/ directory not found"
    echo "   Run: mkdir keys && casper-client keygen keys/"
    ((WARNINGS++))
fi

# Check if .env exists in frontend
if [ -f "frontend/.env" ]; then
    echo -e "${GREEN}✓${NC} Frontend .env file exists"
    ((SUCCESS++))
else
    echo -e "${YELLOW}⚠${NC}  Frontend .env not configured"
    echo "   Run: cd frontend && cp .env.example .env"
    ((WARNINGS++))
fi

echo ""
echo "================================"
echo "Summary:"
echo "--------"
echo -e "${GREEN}✓ Success: $SUCCESS${NC}"
echo -e "${YELLOW}⚠ Warnings: $WARNINGS${NC}"
echo -e "${RED}✗ Errors: $ERRORS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 Setup verification passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Build contract: cd contracts && make build"
    echo "2. Run tests: cd contracts && make test"
    echo "3. Deploy to testnet: cd scripts && npm run deploy:testnet"
    echo "4. Start frontend: cd frontend && npm run dev"
    exit 0
else
    echo -e "${RED}❌ Setup verification failed!${NC}"
    echo ""
    echo "Please fix the errors above before proceeding."
    exit 1
fi
