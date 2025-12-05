# CasperFlow User Guide

Welcome to CasperFlow! This guide will help you understand how to use the platform for sending and receiving remittances.

---

## Table of Contents

1. [What is CasperFlow?](#what-is-casperflow)
2. [Getting Started](#getting-started)
3. [Creating a Remittance](#creating-a-remittance)
4. [Contributing to a Remittance](#contributing-to-a-remittance)
5. [Releasing Funds](#releasing-funds)
6. [Cancelling and Refunds](#cancelling-and-refunds)
7. [Understanding Fees](#understanding-fees)
8. [Security Best Practices](#security-best-practices)
9. [FAQ](#faq)
10. [Troubleshooting](#troubleshooting)

---

## What is CasperFlow?

CasperFlow is a peer-to-peer remittance platform built on Casper Network that enables:

- **Ultra-Low Fees**: 0.5% vs 5-10% traditional services
- **Fast Transfers**: Sub-3 second finality
- **Group Contributions**: Multiple people can pool funds
- **Secure Escrow**: Funds held safely on-chain
- **24/7 Availability**: No banking hours

### How It Works

1. **Create** - Someone creates a remittance with a target amount
2. **Contribute** - People contribute funds (including the creator)
3. **Release** - Once target is met, recipient releases funds
4. **Complete** - Recipient receives funds minus 0.5% platform fee

---

## Getting Started

### 1. Install CSPR.click Wallet

1. Visit [https://www.cspr.click/](https://www.cspr.click/)
2. Install the browser extension (Chrome, Brave, Edge)
3. Create a new wallet or import existing one
4. **Save your recovery phrase securely!**

### 2. Get CSPR Tokens

#### Testnet (for testing):
- Visit: https://testnet.cspr.live/tools/faucet
- Paste your public key
- Request free testnet tokens

#### Mainnet (real money):
- Purchase CSPR from an exchange (Coinbase, Gate.io, etc.)
- Withdraw to your CSPR.click wallet address

### 3. Connect to CasperFlow

1. Visit CasperFlow website
2. Click "Connect Wallet"
3. Approve connection in CSPR.click popup
4. You're ready to go!

---

## Creating a Remittance

### Step-by-Step

1. **Connect Your Wallet**
   - Click "Connect Wallet" button
   - Approve in CSPR.click

2. **Fill Out Remittance Form**
   - **Recipient Public Key**: The person who will receive the funds
     - Example: `01ab3f...` (66 characters) or `account-hash-...`
     - ⚠️ Double-check this! Funds can't be recovered if wrong

   - **Target Amount**: How much CSPR to collect
     - Example: `100` (for 100 CSPR)
     - This is the goal amount before funds can be released

   - **Purpose**: What the remittance is for
     - Example: "Family support", "Medical expenses", "Education"
     - Max 256 characters

3. **Review Details**
   - Double-check recipient address
   - Verify target amount
   - Ensure purpose is clear

4. **Create Remittance**
   - Click "Create Remittance"
   - Sign transaction in CSPR.click
   - Pay gas fee (~3 CSPR)
   - Wait ~3 seconds for confirmation

5. **Share Remittance**
   - Copy remittance ID
   - Share with contributors
   - Anyone can contribute!

### Best Practices

✅ **Do:**
- Verify recipient public key multiple times
- Use clear, descriptive purposes
- Set realistic target amounts
- Communicate with contributors

❌ **Don't:**
- Create remittances for illegal purposes
- Use addresses you haven't verified
- Set unrealistic targets
- Share your private keys

---

## Contributing to a Remittance

### How to Contribute

1. **Find a Remittance**
   - Browse active remittances
   - Or navigate to specific remittance ID

2. **Review Details**
   - Check purpose
   - Verify target amount
   - See current progress
   - View creator and recipient

3. **Enter Contribution Amount**
   - Type amount in CSPR
   - Example: `10` for 10 CSPR
   - Can be any amount (even partial)

4. **Contribute**
   - Click "Contribute" button
   - Sign transaction in CSPR.click
   - Pay gas fee (~2.5 CSPR)
   - Wait for confirmation

5. **Track Progress**
   - Progress bar updates automatically
   - See total contributions
   - View all contributors

### Contribution Tips

- **Start Small**: Test with small amounts first
- **Verify Purpose**: Ensure you understand what you're supporting
- **Check Progress**: See how close to target
- **Multiple Contributions**: You can contribute multiple times

### What Happens to Your Contribution?

- Funds go into smart contract escrow
- Cannot be withdrawn by anyone except:
  - Recipient (when target met and released)
  - You (if remittance is cancelled)
- Safe and transparent on blockchain

---

## Releasing Funds

### Who Can Release?

**Only the recipient** can release funds.

### When Can Funds Be Released?

- Target amount must be met (100% or more)
- Remittance must not be cancelled
- Remittance must not already be released

### How to Release

1. **Verify You're the Recipient**
   - Your wallet address matches recipient address
   - "Release Funds" button appears

2. **Check Amount**
   - See total collected
   - See amount after 0.5% fee
   - Example: 100 CSPR → Receive 99.5 CSPR

3. **Release Funds**
   - Click "Release Funds"
   - Confirm in dialog
   - Sign transaction (~2.5 CSPR gas)
   - Wait for confirmation

4. **Receive Funds**
   - Funds appear in your wallet
   - Check balance in CSPR.click
   - Platform fee goes to fee collector

### After Release

- Remittance marked as "Released"
- Cannot be cancelled
- Cannot receive more contributions
- Permanent on blockchain

---

## Cancelling and Refunds

### Cancelling a Remittance

**Who Can Cancel?**
- Only the **creator** of the remittance

**How to Cancel:**

1. Click "Cancel Remittance" button
2. Confirm in dialog
3. Sign transaction (~2 CSPR gas)
4. Wait for confirmation

**What Happens:**
- Remittance marked as "Cancelled"
- No more contributions accepted
- Contributors can claim refunds
- Cannot be un-cancelled

### Claiming Refunds

**Who Can Claim?**
- Anyone who contributed to a cancelled remittance

**How to Claim:**

1. Navigate to cancelled remittance
2. Click "Claim Refund" button
3. Sign transaction (~2 CSPR gas)
4. Receive your contribution back

**Important Notes:**
- Each contributor claims their own refund (pull pattern)
- You only get back what you contributed
- Can only claim once
- No time limit to claim

### Refund Example

**Scenario:**
- Created remittance for 100 CSPR
- Alice contributed 30 CSPR
- Bob contributed 20 CSPR
- Creator cancels remittance

**Refund Process:**
- Alice claims refund → Gets 30 CSPR back
- Bob claims refund → Gets 20 CSPR back
- Each pays their own gas (~2 CSPR)

---

## Understanding Fees

### Platform Fee

- **Rate**: 0.5% (50 basis points)
- **When Charged**: Only when funds are released
- **Who Pays**: Deducted from total amount
- **Example**: 100 CSPR → Recipient gets 99.5 CSPR

### Gas Fees

Gas fees pay for blockchain transactions (separate from platform fee):

| Action | Gas Cost | USD (@ $0.02/CSPR) |
|--------|----------|---------------------|
| Create Remittance | ~3 CSPR | $0.06 |
| Contribute | ~2.5 CSPR | $0.05 |
| Release Funds | ~2.5 CSPR | $0.05 |
| Cancel | ~2 CSPR | $0.04 |
| Claim Refund | ~2 CSPR | $0.04 |

### Total Cost Comparison

**CasperFlow (100 CSPR transfer):**
- Platform fee: 0.5 CSPR
- Gas fees: ~8 CSPR (create + contribute + release)
- **Total: 8.5 CSPR (~$0.17 or 8.5%)**

**Traditional Service (100 CSPR equivalent):**
- Service fee: 5-10%
- **Total: 5-10 CSPR ($0.10-$0.20 or 5-10%)**

**Savings at Scale:**
- 1000 CSPR: Save ~45-95 CSPR
- 10,000 CSPR: Save ~495-995 CSPR

*Note: Gas fees are fixed, so larger amounts = lower percentage cost*

---

## Security Best Practices

### Wallet Security

✅ **Do:**
- Keep your recovery phrase offline and secure
- Never share your private keys
- Use hardware wallet for large amounts
- Enable all security features in CSPR.click
- Verify URLs before connecting wallet

❌ **Don't:**
- Screenshot or email recovery phrase
- Share wallet access with anyone
- Click suspicious links
- Install untrusted browser extensions
- Ignore security warnings

### Transaction Security

✅ **Do:**
- Double-check recipient addresses
- Verify transaction details before signing
- Start with small test amounts
- Keep records of transaction hashes
- Monitor your wallet regularly

❌ **Don't:**
- Rush through transactions
- Ignore error messages
- Trust unverified recipients
- Send to addresses you don't recognize

### Smart Contract Security

✅ **Safe:**
- Contract code is open source
- Audited for common vulnerabilities
- Funds held in escrow
- Pull-over-push refund pattern

✅ **Your Responsibility:**
- Verify recipient addresses
- Understand platform fees
- Keep wallet secure
- Monitor transactions

---

## FAQ

### General Questions

**Q: What is CSPR?**
A: CSPR is the native token of Casper Network. 1 CSPR = 1,000,000,000 motes.

**Q: Is CasperFlow safe?**
A: Yes! Funds are held in audited smart contracts. However, always verify addresses and start small.

**Q: Can I cancel a contribution?**
A: No, but the creator can cancel the entire remittance, allowing you to claim a refund.

**Q: How long do transactions take?**
A: Casper has ~3 second finality. Most transactions confirm in under 10 seconds.

**Q: What if I send to wrong address?**
A: Blockchain transactions are irreversible. Always double-check addresses!

### Remittance Questions

**Q: Can I contribute to my own remittance?**
A: Yes! Anyone can contribute, including the creator.

**Q: Can I contribute more than the target?**
A: Yes! Remittances can receive over-funding. Recipient gets all contributions.

**Q: What if target is never met?**
A: Creator can cancel and contributors get refunds.

**Q: Can I edit a remittance after creation?**
A: No, remittances are immutable once created.

### Technical Questions

**Q: Which wallets are supported?**
A: Currently CSPR.click. More wallets coming soon.

**Q: Can I use this on mobile?**
A: Yes, if using mobile browser with CSPR.click support.

**Q: Is the code open source?**
A: Yes! View on GitHub: [github.com/yourusername/casperflow]

**Q: What blockchain network is this on?**
A: Casper Network (mainnet and testnet supported).

---

## Troubleshooting

### Wallet Issues

**Problem: "CSPR.click not found"**
- Solution: Install CSPR.click extension and refresh page

**Problem: "Cannot connect wallet"**
- Solution: Check if CSPR.click is unlocked, refresh page, try different browser

**Problem: "Insufficient balance"**
- Solution: Add more CSPR to your wallet

### Transaction Issues

**Problem: "Transaction failed"**
- Solution: Check gas fee balance, verify all inputs, try again

**Problem: "Transaction pending forever"**
- Solution: Wait up to 3 minutes, check explorer, contact support if stuck

**Problem: "Cannot release funds"**
- Solution: Verify you're recipient, target is met, remittance is active

### UI Issues

**Problem: "Remittance not showing"**
- Solution: Refresh page, clear browser cache, verify on blockchain explorer

**Problem: "Balance not updating"**
- Solution: Wait for blockchain confirmation, refresh page

---

## Getting Help

### Support Channels

- **Documentation**: README.md, DEPLOYMENT.md
- **GitHub Issues**: Report bugs and request features
- **Discord**: Join Casper community
- **Explorer**: https://testnet.cspr.live (verify transactions)

### Before Asking for Help

1. Check this user guide
2. Review FAQ section
3. Check transaction on blockchain explorer
4. Gather error messages/screenshots
5. Note transaction hashes

---

## Quick Reference Card

### Creating Remittance
```
1. Connect wallet
2. Fill form (recipient, amount, purpose)
3. Sign transaction (~3 CSPR gas)
4. Share remittance ID
```

### Contributing
```
1. Find remittance
2. Enter amount
3. Click "Contribute"
4. Sign transaction (~2.5 CSPR gas)
```

### Releasing (Recipient Only)
```
1. Verify target met
2. Click "Release Funds"
3. Sign transaction (~2.5 CSPR gas)
4. Receive funds (minus 0.5% fee)
```

### Cancelling (Creator Only)
```
1. Click "Cancel Remittance"
2. Sign transaction (~2 CSPR gas)
3. Contributors can claim refunds
```

### Claiming Refund
```
1. Navigate to cancelled remittance
2. Click "Claim Refund"
3. Sign transaction (~2 CSPR gas)
4. Receive contribution back
```

---

**Welcome to the future of remittances! 🚀**

Questions? Join our community on Discord or open an issue on GitHub.
