const hre = require("hardhat");
const fs = require('fs');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId);

  // Deploy WDOGEToken
  const WDOGEToken = await ethers.getContractFactory("WDOGEToken");
  const wdogeToken = await WDOGEToken.deploy();
  await wdogeToken.waitForDeployment();
  const wdogeTokenAddress = await wdogeToken.getAddress();
  console.log("WDOGEToken deployed to:", wdogeTokenAddress);

  // Deploy StakingContract
  const StakingContract = await ethers.getContractFactory("StakingContract");
  const stakingContract = await StakingContract.deploy(wdogeTokenAddress);
  await stakingContract.waitForDeployment();
  const stakingContractAddress = await stakingContract.getAddress();
  console.log("StakingContract deployed to:", stakingContractAddress);

  // Grant MINTER_ROLE to StakingContract
  const MINTER_ROLE = await wdogeToken.MINTER_ROLE();
  await wdogeToken.grantRole(MINTER_ROLE, stakingContractAddress);
  console.log("Granted MINTER_ROLE to StakingContract");

  // Fund StakingContract with initial DOGE
  const fundTx = await deployer.sendTransaction({
    to: stakingContractAddress,
    value: ethers.parseEther("5") // Fund with 5 DOGE for initial rewards
  });
  await fundTx.wait();
  console.log("Funded StakingContract with 5 DOGE");

  // Get contract parameters
  const currentRate = await stakingContract.currentRate();
  const minStakeAmount = await stakingContract.minStakeAmount();
  const maxCap = await stakingContract.maxCap();
  const contractBalance = await ethers.provider.getBalance(stakingContractAddress);

  console.log("\nContract Parameters:");
  console.log("- Current APY Rate:", currentRate.toString(), "%");
  console.log("- Minimum Stake Amount:", ethers.formatEther(minStakeAmount), "DOGE");
  console.log("- Maximum Cap:", ethers.formatEther(maxCap), "DOGE");
  console.log("- Contract Balance:", ethers.formatEther(contractBalance), "DOGE");

  // Save deployment info
  const deployment = {
    network: network.name === 'unknown' ? 'dogechainMainnet' : network.name,
    chainId: Number(network.chainId),
    wdogeToken: wdogeTokenAddress,
    stakingContract: stakingContractAddress,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    'deployment.json',
    JSON.stringify(deployment, null, 2)
  );

  console.log("\nVerification Commands:");
  console.log("npx hardhat verify --network dogechainMainnet", wdogeTokenAddress);
  console.log("npx hardhat verify --network dogechainMainnet", stakingContractAddress, wdogeTokenAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });