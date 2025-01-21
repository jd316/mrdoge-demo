require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    dogechainTestnet: {
      url: "https://rpc-testnet.dogechain.dog",
      accounts: [PRIVATE_KEY],
      chainId: 568,
    }
  },
  sourcify: {
    enabled: true
  }
};