import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying TokenMarket contracts with account:", deployer.address);

  // Get deployer balance
  const balance = await deployer.getBalance();
  console.log("Deployer balance:", ethers.utils.formatEther(balance));

  // Step 1: Deploy a mock ERC20 token as the underlying asset (if deploying to testnet/mainnet, use real tokens)
  console.log("\n=== Deploying Mock wETH Token ===");
  const MockWETH = await ethers.getContractFactory("MockERC20");
  const mockWETH = await MockWETH.deploy("Wrapped Ether", "WETH", ethers.utils.parseEther("1000000"));
  await mockWETH.deployed();
  console.log("Mock WETH deployed to:", mockWETH.address);

  // Step 2: Deploy TokenMarket Rebalancing Vault
  console.log("\n=== Deploying TokenMarket Rebalancing Vault ===");
  const TokenMarketVault = await ethers.getContractFactory("TokenMarketVault");

  const vaultName = "TokenMarket Rebalancing Vault";
  const vaultSymbol = "TMVAULT";

  const vault = await TokenMarketVault.deploy(
    mockWETH.address, // Underlying asset (WETH)
    vaultName,
    vaultSymbol
  );
  await vault.deployed();
  console.log("TokenMarket Vault deployed to:", vault.address);

  // Step 3: Create a test strategy via the vault
  console.log("\n=== Creating Test Strategy ===");

  const strategyName = "DeFi Kings";
  const strategyDescription = "High-yield DeFi strategy with automated rebalancing";
  const performanceFee = 200; // 2%
  const rebalanceFrequency = 24; // 24 hours

  // Define some test assets and weights (total = 10000 = 100%)
  const targetAssets = [
    mockWETH.address, // WETH
    "0xA0b86a33e6449Cr9283ea03ae498f3bfee5e3a1d1", // Mock USDC address (would be real in production)
    "0x514910771AF9Ca656af840dff83E8264ecf986CA", // Mock LINK address
  ];

  const targetWeights = [5000, 3000, 2000]; // 50%, 30%, 20%

  // Deploy 1000 ETH into the strategy
  const depositAmount = ethers.utils.parseEther("1000");

  console.log(`Creating ${strategyName} strategy for deployer...`);
  const tx = await vault.connect(deployer).depositAndCreateStrategy(
    depositAmount,
    deployer.address,
    strategyName,
    strategyDescription,
    performanceFee,
    rebalanceFrequency,
    targetAssets,
    targetWeights
  );

  await tx.wait();
  console.log("Strategy created successfully!");

  // Step 4: Verify deployment
  console.log("\n=== Deployment Summary ===");
  console.log("🔒 TokenMarket Vault:", vault.address);
  console.log("💰 Underlying Asset (WETH):", mockWETH.address);
  console.log("👤 Deployer:", deployer.address);

  const vaultBalance = await vault.convertToAssets(await vault.balanceOf(deployer.address));
  console.log("💰 Deployer PIT Tokens:", ethers.utils.formatEther(await vault.balanceOf(deployer.address)));
  console.log("💰 Deployer Assets in Vault:", ethers.utils.formatEther(vaultBalance));

  const strategyCount = await vault.getUserStrategyCount(deployer.address);
  console.log("📊 Deployer Strategies:", strategyCount.toNumber());

  if (strategyCount.toNumber() > 0) {
    const strategies = await vault.getUserStrategies(deployer.address);
    const latestStrategy = strategies[strategies.length - 1];

    console.log("🎯 Latest Strategy:");
    console.log("  📈 Name:", latestStrategy.name);
    console.log("  📝 Description:", latestStrategy.description);
    console.log("  🤝 Performance Fee:", latestStrategy.performanceFee / 100 + "%");
    console.log("  ⏰ Rebalance Frequency:", latestStrategy.rebalanceFrequency + " hours");
    console.log("  💰 Assets Under Management:", ethers.utils.formatEther(latestStrategy.totalAssetsManaged));
  }

  console.log("\n✅ TokenMarket Smart Contracts Successfully Deployed!");
  console.log("\n📝 Next Steps:");
  console.log("1. Execute automated rebalancing: npx hardhat run scripts/execute-rebalance.ts");
  console.log("2. Set up price feeds: npx hardhat run scripts/setup-price-feeds.ts");
  console.log("3. Test DEX integration: npx hardhat run scripts/test-dex-integration.ts");

  // Save contract addresses to a JSON file
  const fs = require("fs");
  const deploymentInfo = {
    deployedAt: new Date().toISOString(),
    network: network.name,
    contracts: {
      vault: vault.address,
      underlyingAsset: mockWETH.address,
      strategist: deployer.address
    },
    strategy: {
      name: strategyName,
      description: strategyDescription,
      performanceFee: performanceFee,
      rebalanceFrequency: rebalanceFrequency,
      targetAssets: targetAssets,
      targetWeights: targetWeights,
      initialDeposit: ethers.utils.formatEther(depositAmount)
    }
  };

  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n💾 Deployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
