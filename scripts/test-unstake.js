const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Testing with account:", deployer.address);

  // Get contract instance
  const StakingContract = await ethers.getContractFactory("StakingContract");
  const stakingContract = StakingContract.attach("0x2F25657a5e4b4076818EcC306209abbF6821B87e");

  try {
    // Check POL balance for gas
    const polBalance = await ethers.provider.getBalance(deployer.address);
    console.log("\nPOL Balance:", ethers.formatEther(polBalance));

    // Get gas price
    const feeData = await ethers.provider.getFeeData();
    console.log("\nGas Price Info:", {
      maxFeePerGas: ethers.formatUnits(feeData.maxFeePerGas || 0, 'gwei'),
      maxPriorityFeePerGas: ethers.formatUnits(feeData.maxPriorityFeePerGas || 0, 'gwei'),
      gasPrice: ethers.formatUnits(feeData.gasPrice || 0, 'gwei')
    });

    // Check current stake
    const stake = await stakingContract.stakes(deployer.address);
    console.log("\nCurrent stake:", {
      amount: ethers.formatEther(stake.amount),
      startTime: new Date(Number(stake.startTime) * 1000).toLocaleString(),
      active: stake.active
    });

    // Calculate time staked
    const now = Math.floor(Date.now() / 1000);
    const timeStaked = now - Number(stake.startTime);
    console.log("\nTime staked:", Math.floor(timeStaked / 3600), "hours,", Math.floor((timeStaked % 3600) / 60), "minutes");

    // Try to unstake
    if (stake.active) {
      console.log("\nTrying to unstake...");
      
      // Estimate gas first
      const gasEstimate = await stakingContract.unstake.estimateGas();
      console.log("Estimated gas needed:", gasEstimate.toString());

      // Calculate max transaction cost
      const maxCost = gasEstimate.mul(feeData.maxFeePerGas || feeData.gasPrice);
      console.log("Max transaction cost:", ethers.formatEther(maxCost), "POL");

      // Send transaction with higher gas limit
      const tx = await stakingContract.unstake({
        gasLimit: Math.floor(gasEstimate.toString() * 1.5),
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
      });
      console.log("Transaction hash:", tx.hash);

      const receipt = await tx.wait();
      console.log("Transaction confirmed in block:", receipt.blockNumber);
    } else {
      console.log("\nNo active stake to unstake");
    }

  } catch (error) {
    console.error("\nError:", {
      message: error.message,
      data: error.data,
      code: error.code,
      reason: error.reason
    });

    // Try to decode error data if present
    if (error.data) {
      try {
        const iface = new ethers.utils.Interface(['function Error(string)']);
        const decodedError = iface.parseError(error.data);
        console.error("Decoded error:", decodedError.args[0]);
      } catch (e) {
        console.error("Could not decode error data");
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
