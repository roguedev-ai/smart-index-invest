# 🏗️ **TokenMarket Web Wallet Integration Guide**

## 🚀 **Overview**

This guide shows you exactly how to use TokenMarket's web wallet integration for a seamless blockchain experience. TokenMarket supports multiple wallet providers and provides easy integration for token creation, liquidity pool management, and DeFi activities.

---

## 🛠️ **Supported Wallets**

### **Top Tiers** (Recommended)
- **MetaMask** - World's most popular Web3 wallet
- **WalletConnect** - Mobile wallet connection
- **Coinbase Wallet** - Exchange-integrated
- **Trust Wallet** - Mobile-focused

### **Compatibility Display:**
```
MetaMask     ✅ Supported
WalletConnect ✅ Supported
Coinbase     ✅ Supported
Trust Wallet ✅ Supported
Rainbow      ⚠️ Limited
```

---

## 🚀 **Getting Started with Wallet Integration**

### **Step 1: Install and Setup Wallet**

#### **Option A: MetaMask (Recommended)**
```
1. Visit: https://metamask.io/download/
2. Choose your browser: Firefox/Chrome/Edge
3. Click "Install MetaMask for Firefox/Chrome/Edge"
4. Follow setup wizard
5. **IMPORTANT:** Save your seed phrase securely
6. Fund wallet with ETH (for gas fees)
```

#### **Option B: WalletConnect (Mobile)**
```
1. Install mobile wallet: TrustWallet, Coinbase, Rainbow
2. Visit TokenMarket on mobile browser
3. Click "Connect Wallet" → "WalletConnect"
4. Scan QR code with mobile wallet
5. Approve connection
```

---

## 🔧 **Using TokenMarket with Your Wallet**

### **Scenario 1: Creating Your First Token**

**Complete Step-by-Step Example:**

```
1. 🌐 Open TokenMarket: http://localhost:3000/create
2. 📙 Choose Token Type: Click "Standard ERC20"
3. 📝 Fill Details:
   • Name: "My Awesome Token"
   • Symbol: "MAT"
   • Supply: 1,000,000
   • Features: Mintable, Burnable
4. 💰 Set Liquidity: 10% of supply, ETH pairing
5. 🏗️ Click "Deploy Token"
6. 🔐 MetaMask Popup: Connect/Sign in if needed
7. ✅ Approve Transaction: Pay gas fee (ETH)
8. ⌛ Wait for Confirmation: Block explorer link provided
9. 🎉 SUCCESS: Token deployed!
```

**Expected Wallet Interactions:**
- ✅ **Connect Request**: "Connect to TokenMarket?"
- ✅ **Network Switch**: "Switch to Ethereum Mainnet?"
- ✅ **Transaction Approval**: Review transaction details
- ✅ **Gas Fee Confirmation**: Approve transaction cost

---

### **Scenario 2: Managing Liquidity Pools**

**Complete Step-by-Step Example:**

```
1. 🌐 Open TokenMarket: http://localhost:3000/dashboard
2. 💰 View Your Tokens: New MAT token appears
3. 🏊‍♂️ Click "Uniswap Pool": Create liquidity pool
4. 🔗 Pair with WETH: 1,000 MAT : 1 WETH
5. 💰 Approve Tokens: First approve MAT spend limit
6. 🔗 Add Liquidity: Second approve liquidity addition
7. ✏️ Confirm Setup: Third approve fee management
8. 🎯 Position Created: View on Uniswap
```

**Advanced Wallet Prompts:**
```
1️⃣ "Approve": Allow contract to spend your MAT
2️⃣ "Deposit": Add tokens + ETH to Uniswap V3
3️⃣ "Initialize": Set price for new pool
4️⃣ "Fee Management": Set liquidity position parameters
```

---

### **Scenario 3: Transferring Tokens**

**Complete Step-by-Step Example:**

```
1. 🌐 Visit: http://localhost:3000/dashboard
2. 🔄 Click "Transfer Tokens": MAT transfer form
3. 📬 Recipient Address: 0xABC123... (valid ETH address)
4. 💸 Amount: 100 MAT
5. ✏️ Review Transaction: Check address & amount
6. ✅ Confirm Send: Approve in MetaMask
7. ⏱️ Wait for Mining: Usually 15-60 seconds
8. ✅ SUCCESS: Transaction confirmed
```

---

## 📱 **Mobile Wallet Integration**

### **Using TokenMarket on Mobile:**

**Best Practices:**
1. **Use DApp Browser**: Open TokenMarket in Coinbase or Trust Wallet
2. **Use Mobile Browser**: Safari/Chrome + WalletConnect
3. **Avoid Regular Browser**: May not have wallet access

**Mobile Connection Steps:**
```
1. Open Coinbase Wallet mobile app
2. Tap "Browser" icon (bottom right)
3. Go to: localhost:3000
4. Tap "Connect Wallet"
5. Choose WalletConnect
6. Scan QR code with mobile camera
7. Approve connection & transactions
```

---

## 🔀 **Network Switching**

**Supported Networks:**
- ✅ **Ethereum Mainnet** (Primary)
- ✅ **Sepolia Testnet** (Development)
- ⚠️ **Polygon PoS** (Coming Soon)

**Manual Network Switch:**
```
1. Open MetaMask
2. Click "Networks" dropdown
3. Click "Add Network"
4. Fill network details for next network
5. Switch networks before using TokenMarket
```

---

## 💦 **Liquidity Pool Management**

### **Adding Liquidity:**

**Step-by-step:**
1. **Find your token** in dashboard
2. **Click "Add Liquidity"**
3. **Choose pairing token** (WETH, USDC, USDT)
4. **Set liquidity ratio** (token: ETH)
5. **Set fee tier** (0.05%, 0.30%, 1.00%)
6. **Approve both tokens** (2 approvals)
7. **Confirm liquidity addition** (1 approval)
8. **Monitor position** on Uniswap

**Fee Tier Recommendations:**
- **StablePairs**: 0.05% (USDC/MAT)
- **Standard**: 0.30% (most tokens)
- **High Risk**: 1.00% (volatile tokens)

---

## 🛡️ **Security Best Practices**

### **Wallet Security:**
- ✅ **Never share** private keys or seed phrases
- ✅ **Use hardware wallets** for large amounts
- ✅ **Verify addresses** before transactions
- ✅ **Check transaction details** before signing
- ✅ **Use testnet first** for new wallets

### **TokenMarket Security:**
- ✅ **Audit all contracts** (links provided)
- ✅ **Use verified currencies** (WETH, USDC)
- ✅ **Start small** (test with small amounts)
- ✅ **Monitor transactions** on block explorers

### **Gas Fee Management:**
- ✅ **Review gas prices** before peak hours
- ✅ **Set reasonable gas limits** (default usually fine)
- ✅ **Use layer 2** when available (lower fees)
- ✅ **Batch transactions** when possible

---

## 🔧 **Troubleshooting Common Issues**

### **Issue: "Wallet Not Connected"**
```
✅ Close other DApps
✅ Refresh browser
✅ Check wallet popup not blocked
✅ Try different browser
✅ Reset wallet connection
```

### **Issue: "Transaction Failed"**
```
✅ Check gas fees (too low?)
✅ Verify sufficient ETH for gas
✅ Confirm network selection
✅ Check token balance
✅ Try lower gas price
```

### **Issue: "Transaction Pending Forever"**
```
✅ Check gas price (too low for miners)
✅ Increase gas price
✅ Wait 2-5 minutes
✅ Resubmit with higher gas
```

### **Issue: "Invalid Token Address"**
```
✅ Verify contract deployed
✅ Check network (wrong network?)
✅ Confirm contract verified on Etherscan
✅ Use exact contract address
```

---

## 📊 **Advanced Features**

### **Multi-Signature Wallets**
- Set up Gnosis Safe
- Requires multiple approvals
- Enhanced security for team funds

### **Hardware Wallets**
- Ledger support
- Trezor integration
- Cold storage security

### **Smart Contract Interactions**
- Direct contract access
- Function calling
- Event monitoring

---

## 🎯 **Quick Start Summary**

**New User Checklist:**
```
✅ Install MetaMask
✅ Fund with ~0.1 ETH
✅ Visit localhost:3000
✅ Connect wallet
✅ Create first test token
✅ Add liquidity
✅ Transfer tokens proudly! ✨
```

**Required Resources:**
- MetaMask wallet installed
- Ethereum mainnet access
- ~0.1-0.5 ETH for gas
- Stable internet connection

---

## 📞 **Support & Resources**

### **Learning Resources:**
- [MetaMask Documentation](https://docs.metamask.io/)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Uniswap Documentation](https://docs.uniswap.org/)

### **TokenMarket Support:**
- In-app help sections
- Transaction monitoring
- Error reporting system

### **Blockchain Resources:**
- [Etherscan](https://etherscan.io/) - Transaction monitoring
- [Uniswap Info](https://info.uniswap.org/) - Pool analytics

---

## 🚀 **Ready to Start Building!**

**Just follow these 3 steps:**
1. **Install MetaMask** → Setup wallet
2. **Get ETH** → For gas fees
3. **Visit TokenMarket** → localhost:3000/create

**Create your first token and experience seamless Web3 workflow!** 🎨✨

---

**Happy Building! 🎉**
Your TokenMarket + Web3 journey starts now...
