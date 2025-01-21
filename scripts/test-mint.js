const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Testing mint with account:", deployer.address);

  // Get the contract instance
  const WDOGEToken = await ethers.getContractFactory("WDOGEToken");
  const token = await WDOGEToken.attach("0x554663df3c94DEc79c3094234DcF06969630d83e");

  try {
    // Try to mint 100 tokens
    const amount = ethers.parseEther("100");
    console.log("Attempting to mint", ethers.formatEther(amount), "WDOGE tokens");
    
    // Get the current balance before minting
    const balanceBefore = await token.balanceOf(deployer.address);
    console.log("Balance before:", ethers.formatEther(balanceBefore), "WDOGE");

    // Mint tokens
    const tx = await token.mint(deployer.address, amount);
    console.log("Transaction hash:", tx.hash);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);

    // Get the new balance
    const balanceAfter = await token.balanceOf(deployer.address);
    console.log("Balance after:", ethers.formatEther(balanceAfter), "WDOGE");
    
  } catch (error) {
    console.error("Error details:");
    console.error("Message:", error.message);
    if (error.error) {
      console.error("Inner error:", error.error.message);
    }
    if (error.data) {
      console.error("Error data:", error.data);
    }
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
