require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      accounts: {
        accountsBalance: "10000000000000000000000000" // 10,000,000 ETH in wei
      }
    },
    dogechainTestnet: {
      url: "https://rpc-testnet.dogechain.dog",
      accounts: [PRIVATE_KEY],
      chainId: 568,
      timeout: 60000 // 1 minute timeout
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  sourcify: {
    enabled: true
  }
};