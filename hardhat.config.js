require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    dogechainMainnet: {
      url: "https://rpc.dogechain.dog",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 2000,
      timeout: 60000
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