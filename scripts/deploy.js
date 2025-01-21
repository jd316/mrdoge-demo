const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment...");

  // Get the deployer's address
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy WDOGEToken
  console.log("\nDeploying WDOGEToken...");
  const WDOGEToken = await hre.ethers.getContractFactory("WDOGEToken");
  const wdogeToken = await WDOGEToken.deploy();
  await wdogeToken.waitForDeployment();
  const wdogeTokenAddress = await wdogeToken.getAddress();
  console.log("WDOGEToken deployed to:", wdogeTokenAddress);

  // Deploy StakingContract
  console.log("\nDeploying StakingContract...");
  const StakingContract = await hre.ethers.getContractFactory("StakingContract");
  const stakingContract = await StakingContract.deploy(wdogeTokenAddress);
  await stakingContract.waitForDeployment();
  const stakingContractAddress = await stakingContract.getAddress();
  console.log("StakingContract deployed to:", stakingContractAddress);

  // Grant MINTER_ROLE to StakingContract in WDOGEToken
  console.log("\nGranting MINTER_ROLE to StakingContract...");
  const MINTER_ROLE = await wdogeToken.MINTER_ROLE();
  await wdogeToken.grantRole(MINTER_ROLE, stakingContractAddress);
  console.log("MINTER_ROLE granted to StakingContract");

  // Update frontend config
  console.log("\nUpdating frontend configuration...");
  const configPath = path.join(__dirname, "../frontend/src/config.js");
  const configContent = `// Contract Addresses (lowercase for consistency, will be checksummed in the app)
export const CONTRACT_ADDRESSES = {
  STAKING_CONTRACT: "${stakingContractAddress.toLowerCase()}",
  WDOGE_TOKEN: "${wdogeTokenAddress.toLowerCase()}"
};

// Network Configuration
export const REQUIRED_CHAIN_ID = 568; // Dogechain Testnet

export const NETWORK_CONFIG = {
  chainId: "0x238", // 568 in hex
  chainName: "Dogechain Testnet",
  nativeCurrency: {
    name: "DOGE",
    symbol: "DOGE",
    decimals: 18,
  },
  rpcUrls: ["https://rpc-testnet.dogechain.dog"],
  blockExplorerUrls: ["https://explorer-testnet.dogechain.dog"],
};
`;

  fs.writeFileSync(configPath, configContent);
  console.log("Frontend configuration updated");

  // Print deployment summary
  console.log("\nDeployment Summary:");
  console.log("-------------------");
  console.log("WDOGEToken:", wdogeTokenAddress);
  console.log("StakingContract:", stakingContractAddress);
  console.log("\nContracts deployed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });