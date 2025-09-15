import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true, // Enable intermediate representation for better compilation
    },
  },
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-mainnet.g.alchemy.com/v2/demo-key", // Replace with actual Alchemy key
      },
      chainId: 31337,
    },
    mainnet: {
      url: "https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY", // Replace with actual API key
      accounts: [], // Use private key from environment
    },
    polygon: {
      url: "https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY",
      accounts: [],
    },
    bsc: {
      url: "https://bsc-dataseed1.binance.org/",
      accounts: [],
    }
  },
  etherscan: {
    apiKey: "YOUR_ETHERSCAN_API_KEY", // Replace with actual API key
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v6",
  },
};

export default config;
