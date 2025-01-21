const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Checking with account:", deployer.address);

  // Get contract instance
  const WDOGEToken = await ethers.getContractFactory("WDOGEToken");
  const wdogeToken = WDOGEToken.attach("0x554663df3c94DEc79c3094234DcF06969630d83e");

  // Try to estimate gas for a mint transaction
  try {
    const mintAmount = ethers.parseEther("1");
    console.log("\nTrying to estimate gas for minting 1 WDOGE...");
    
    // Get current gas price
    const gasPrice = await ethers.provider.getFeeData();
    console.log("Current gas price:", {
      maxFeePerGas: gasPrice.maxFeePerGas?.toString(),
      maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas?.toString(),
      gasPrice: gasPrice.gasPrice?.toString()
    });

    // Estimate gas with higher limit
    const gasEstimate = await wdogeToken.mint.estimateGas(deployer.address, mintAmount, {
      gasLimit: 500000
    });
    console.log("Estimated gas needed:", gasEstimate.toString());

  } catch (error) {
    console.error("\nGas estimation error:", {
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
