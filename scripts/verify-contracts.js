const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Testing with account:", deployer.address);

  // Get contract instances
  const WDOGEToken = await ethers.getContractFactory("WDOGEToken");
  const StakingContract = await ethers.getContractFactory("StakingContract");

  const wdogeToken = WDOGEToken.attach(process.env.WDOGE_TOKEN_ADDRESS);
  const stakingContract = StakingContract.attach(process.env.STAKING_CONTRACT_ADDRESS);

  console.log("\nChecking WDOGE Token...");
  const name = await wdogeToken.name();
  const symbol = await wdogeToken.symbol();
  const totalSupply = await wdogeToken.totalSupply();
  console.log("Token Info:", {
    name,
    symbol,
    totalSupply: ethers.formatEther(totalSupply)
  });

  console.log("\nChecking Staking Contract...");
  const stakingToken = await stakingContract.stakingToken();
  const rewardRate = await stakingContract.rewardRate();
  console.log("Staking Contract Info:", {
    stakingToken,
    rewardRate: rewardRate.toString()
  });

  if (stakingToken.toLowerCase() !== process.env.WDOGE_TOKEN_ADDRESS.toLowerCase()) {
    throw new Error("Staking token address mismatch!");
  }

  // Check balance
  const balance = await wdogeToken.balanceOf(deployer.address);
  console.log("\nCurrent balance:", ethers.formatEther(balance), "WDOGE");

  // Check if we have an active stake
  const stake = await stakingContract.stakes(deployer.address);
  console.log("\nCurrent stake:", {
    amount: ethers.formatEther(stake.amount),
    startTime: stake.startTime.toString(),
    active: stake.active
  });

  if (stake.active) {
    console.log("Already have an active stake. Try unstaking first.");
    return;
  }

  if (balance.toString() === "0") {
    console.log("No tokens to stake. Try minting some first.");
    return;
  }

  // Try to stake 1 WDOGE
  const stakeAmount = ethers.parseEther("1");
  
  // Approve staking contract
  console.log("\nApproving staking contract...");
  const approveTx = await wdogeToken.approve(stakingContract.target, stakeAmount);
  await approveTx.wait();
  console.log("Approval successful");

  // Try to stake
  console.log("\nTesting stake function...");
  const stakeTx = await stakingContract.stake(stakeAmount);
  await stakeTx.wait();
  console.log("Successfully staked 1 WDOGE");

  console.log("\nAll tests passed! Contracts are working correctly.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
