const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Starting deployment to", network.name);
  console.log("Deployer address:", (await ethers.getSigners())[0].address);

  // Deploy WDOGE Token
  console.log("\nDeploying WDOGEToken...");
  const WDOGEToken = await ethers.getContractFactory("WDOGEToken");
  const wdogeToken = await WDOGEToken.deploy();
  await wdogeToken.waitForDeployment();
  const wdogeTokenAddress = await wdogeToken.getAddress();
  console.log("WDOGEToken deployed to:", wdogeTokenAddress);

  // Deploy Staking Contract
  console.log("\nDeploying StakingContract...");
  const StakingContract = await ethers.getContractFactory("StakingContract");
  const stakingContract = await StakingContract.deploy(wdogeTokenAddress);
  await stakingContract.waitForDeployment();
  const stakingContractAddress = await stakingContract.getAddress();
  console.log("StakingContract deployed to:", stakingContractAddress);

  // Grant MINTER_ROLE to staking contract
  console.log("\nGranting MINTER_ROLE to StakingContract...");
  const MINTER_ROLE = await wdogeToken.MINTER_ROLE();
  await wdogeToken.grantRole(MINTER_ROLE, stakingContractAddress);
  console.log("Granted MINTER_ROLE to StakingContract");

  // Fund the staking contract with initial DOGE for rewards
  console.log("\nFunding StakingContract with initial rewards...");
  const [deployer] = await ethers.getSigners();
  const fundTx = await deployer.sendTransaction({
    to: stakingContractAddress,
    value: ethers.parseEther("5") // Fund with 5 DOGE
  });
  await fundTx.wait();
  console.log("Funded StakingContract with 5 DOGE");

  // Save deployment addresses
  const deployment = {
    network: network.name,
    wdogeToken: wdogeTokenAddress,
    stakingContract: stakingContractAddress,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    'deployment.json',
    JSON.stringify(deployment, null, 2)
  );
  console.log("\nDeployment addresses saved to deployment.json");

  // Verify deployment
  console.log("\nDeployment completed!");
  console.log("Initial contract state:");
  console.log("- Current APY Rate:", await stakingContract.currentRate(), "%");
  console.log("- Min Stake Amount:", ethers.formatEther(await stakingContract.minStakeAmount()), "DOGE");
  console.log("- Max Cap:", ethers.formatEther(await stakingContract.maxCap()), "DOGE");
  console.log("- Contract Balance:", ethers.formatEther(await ethers.provider.getBalance(stakingContractAddress)), "DOGE");

  console.log("\nVerify contracts on explorer:");
  console.log(`npx hardhat verify --network ${network.name} ${wdogeTokenAddress}`);
  console.log(`npx hardhat verify --network ${network.name} ${stakingContractAddress} ${wdogeTokenAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });