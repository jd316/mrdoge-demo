const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("Starting contract tests...");

  // Get test accounts
  const [owner, user1] = await hre.ethers.getSigners();
  console.log("\nTest accounts:");
  console.log("Owner:", owner.address);
  console.log("User1:", user1.address);

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

  // Grant MINTER_ROLE to StakingContract
  console.log("\nGranting MINTER_ROLE to StakingContract...");
  const MINTER_ROLE = await wdogeToken.MINTER_ROLE();
  await wdogeToken.grantRole(MINTER_ROLE, stakingContractAddress);
  console.log("MINTER_ROLE granted successfully");

  // Test 1: Check initial setup
  console.log("\nTest 1: Checking initial setup...");
  const hasRole = await wdogeToken.hasRole(MINTER_ROLE, stakingContractAddress);
  console.log("StakingContract has MINTER_ROLE:", hasRole);

  // Test 2: Stake DOGE
  console.log("\nTest 2: Testing staking...");
  const stakeAmount = ethers.parseEther("1.0"); // 1 DOGE
  console.log("Staking", ethers.formatEther(stakeAmount), "DOGE");
  
  try {
    const stakeTx = await stakingContract.connect(user1).stake({ value: stakeAmount });
    await stakeTx.wait();
    console.log("Staking successful!");

    // Check WDOGE balance
    const wdogeBalance = await wdogeToken.balanceOf(user1.address);
    console.log("User WDOGE balance:", ethers.formatEther(wdogeBalance), "WDOGE");

    // Check stake info
    const stakeInfo = await stakingContract.stakes(user1.address);
    console.log("Stake amount:", ethers.formatEther(stakeInfo.amount), "DOGE");
    console.log("Stake active:", stakeInfo.active);
  } catch (error) {
    console.error("Staking failed:", error.message);
    return;
  }

  // Test 3: Calculate rewards
  console.log("\nTest 3: Testing reward calculation...");
  const reward = await stakingContract.calculateReward(user1.address);
  console.log("Current reward:", ethers.formatEther(reward), "DOGE");

  // Test 4: Try to stake again (should fail)
  console.log("\nTest 4: Testing double staking prevention...");
  try {
    await stakingContract.connect(user1).stake({ value: stakeAmount });
    console.error("ERROR: Double staking should have failed!");
  } catch (error) {
    console.log("Double staking prevented successfully");
  }

  // Test 5: Try emergency withdrawal
  console.log("\nTest 5: Testing emergency withdrawal...");
  try {
    const withdrawTx = await stakingContract.connect(user1).emergencyWithdraw();
    await withdrawTx.wait();
    console.log("Emergency withdrawal successful!");

    // Check balances after withdrawal
    const wdogeBalanceAfter = await wdogeToken.balanceOf(user1.address);
    console.log("User WDOGE balance after withdrawal:", ethers.formatEther(wdogeBalanceAfter), "WDOGE");

    const stakeInfoAfter = await stakingContract.stakes(user1.address);
    console.log("Stake active after withdrawal:", stakeInfoAfter.active);
  } catch (error) {
    console.error("Emergency withdrawal failed:", error.message);
  }

  console.log("\nAll tests completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });