const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Checking stake for account:", deployer.address);

  const StakingContract = await ethers.getContractFactory("StakingContract");
  const stakingContract = StakingContract.attach(process.env.STAKING_CONTRACT_ADDRESS);

  try {
    const stake = await stakingContract.stakes(deployer.address);
    console.log("\nStake Details:");
    console.log("Amount:", ethers.formatEther(stake.amount), "WDOGE");
    console.log("Start Time:", new Date(Number(stake.startTime) * 1000).toLocaleString());
    console.log("Active:", stake.active);

    if (stake.active) {
      const reward = await stakingContract.calculateReward(deployer.address);
      console.log("Current Reward:", ethers.formatEther(reward), "WDOGE");
    }
  } catch (error) {
    console.error("Error checking stake:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
