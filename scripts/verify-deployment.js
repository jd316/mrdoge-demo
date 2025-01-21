const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Checking deployment with account:", deployer.address);

  // Get contract instances
  const WDOGEToken = await ethers.getContractFactory("WDOGEToken");
  const StakingContract = await ethers.getContractFactory("StakingContract");

  const wdogeToken = WDOGEToken.attach("0x554663df3c94DEc79c3094234DcF06969630d83e");
  const stakingContract = StakingContract.attach("0x2F25657a5e4b4076818EcC306209abbF6821B87e");

  console.log("\nChecking WDOGE Token Contract...");
  try {
    // Check if contract exists
    const code = await ethers.provider.getCode("0x554663df3c94DEc79c3094234DcF06969630d83e");
    if (code === "0x") {
      throw new Error("WDOGE Token contract not found at specified address");
    }
    console.log("✅ Contract exists at address");

    // Check token info
    const name = await wdogeToken.name();
    const symbol = await wdogeToken.symbol();
    const totalSupply = await wdogeToken.totalSupply();
    console.log("✅ Token Info:", {
      name,
      symbol,
      totalSupply: ethers.formatEther(totalSupply)
    });

    // Check deployer's balance
    const balance = await wdogeToken.balanceOf(deployer.address);
    console.log("✅ Deployer balance:", ethers.formatEther(balance), "WDOGE");
  } catch (error) {
    console.error("❌ WDOGE Token Error:", error.message);
  }

  console.log("\nChecking Staking Contract...");
  try {
    // Check if contract exists
    const code = await ethers.provider.getCode("0x2F25657a5e4b4076818EcC306209abbF6821B87e");
    if (code === "0x") {
      throw new Error("Staking contract not found at specified address");
    }
    console.log("✅ Contract exists at address");

    // Check staking token
    const stakingToken = await stakingContract.stakingToken();
    console.log("✅ Staking token:", stakingToken);
    console.log("✅ Matches WDOGE token?", stakingToken.toLowerCase() === "0x554663df3c94DEc79c3094234DcF06969630d83e".toLowerCase());

    // Check reward rate
    const rewardRate = await stakingContract.rewardRate();
    console.log("✅ Reward rate:", rewardRate.toString(), "% APY");

    // Check if WDOGE token has approved staking contract
    const allowance = await wdogeToken.allowance(deployer.address, stakingContract.target);
    console.log("✅ Staking allowance:", ethers.formatEther(allowance), "WDOGE");

  } catch (error) {
    console.error("❌ Staking Contract Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
