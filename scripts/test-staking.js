const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Testing with account:", deployer.address);

  // Get contract instances
  const WDOGEToken = await ethers.getContractFactory("WDOGEToken");
  const StakingContract = await ethers.getContractFactory("StakingContract");

  const wdogeToken = WDOGEToken.attach("0x554663df3c94DEc79c3094234DcF06969630d83e");
  const stakingContract = StakingContract.attach("0x2F25657a5e4b4076818EcC306209abbF6821B87e");

  try {
    // Check POL balance for gas
    const polBalance = await ethers.provider.getBalance(deployer.address);
    console.log("\nPOL Balance:", ethers.formatEther(polBalance));

    // Get gas price
    const feeData = await ethers.provider.getFeeData();
    console.log("\nGas Price Info:", {
      maxFeePerGas: feeData.maxFeePerGas?.toString(),
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
      gasPrice: feeData.gasPrice?.toString()
    });

    // Check WDOGE balance
    const wdogeBalance = await wdogeToken.balanceOf(deployer.address);
    console.log("\nWDOGE Balance:", ethers.formatEther(wdogeBalance));

    // Check current allowance
    const allowance = await wdogeToken.allowance(deployer.address, stakingContract.target);
    console.log("\nCurrent allowance:", ethers.formatEther(allowance));

    // Check if we have an active stake
    const stake = await stakingContract.stakes(deployer.address);
    console.log("\nCurrent stake:", {
      amount: ethers.formatEther(stake.amount),
      startTime: stake.startTime.toString(),
      active: stake.active
    });

    // If we don't have an active stake, try to stake 1 WDOGE
    if (!stake.active) {
      const stakeAmount = ethers.parseEther("1");

      // Approve if needed
      if (allowance.lt(stakeAmount)) {
        console.log("\nApproving staking contract...");
        const approveTx = await wdogeToken.approve(stakingContract.target, stakeAmount, {
          gasLimit: 100000,
          maxFeePerGas: feeData.maxFeePerGas,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
        });
        console.log("Approval tx:", approveTx.hash);
        await approveTx.wait();
        console.log("Approval confirmed");
      }

      // Try to stake
      console.log("\nStaking 1 WDOGE...");
      const stakeTx = await stakingContract.stake(stakeAmount, {
        gasLimit: 500000,
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
      });
      console.log("Stake tx:", stakeTx.hash);
      await stakeTx.wait();
      console.log("Stake confirmed");
    } else {
      console.log("\nYou already have an active stake");
    }

  } catch (error) {
    console.error("\nError:", {
      message: error.message,
      data: error.data,
      code: error.code,
      reason: error.reason
    });
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
