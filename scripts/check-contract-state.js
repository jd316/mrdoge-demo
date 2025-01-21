const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Checking with account:", deployer.address);

  // Get contract instances
  const WDOGEToken = await ethers.getContractFactory("WDOGEToken");
  const wdogeToken = WDOGEToken.attach("0x554663df3c94DEc79c3094234DcF06969630d83e");

  console.log("\nChecking WDOGE Token Contract...");
  
  try {
    // Check if contract exists
    const code = await ethers.provider.getCode("0x554663df3c94DEc79c3094234DcF06969630d83e");
    if (code === "0x") {
      throw new Error("WDOGE Token contract not found at specified address");
    }
    console.log("Contract exists at address");

    // Check token info
    const name = await wdogeToken.name();
    const symbol = await wdogeToken.symbol();
    const decimals = await wdogeToken.decimals();
    const totalSupply = await wdogeToken.totalSupply();
    console.log("Token Info:", {
      name,
      symbol,
      decimals: decimals.toString(),
      totalSupply: ethers.formatEther(totalSupply)
    });

    // Check owner
    const owner = await wdogeToken.owner();
    console.log("Contract owner:", owner);
    console.log("Is deployer owner?", owner.toLowerCase() === deployer.address.toLowerCase());

    // Check mint limits
    const mintLimit = await wdogeToken.MINT_LIMIT();
    const mintCooldown = await wdogeToken.MINT_COOLDOWN();
    console.log("Mint configuration:", {
      limit: ethers.formatEther(mintLimit),
      cooldown: `${mintCooldown / (60 * 60)} hours`
    });

    // Try to get deployer's balance
    const balance = await wdogeToken.balanceOf(deployer.address);
    console.log("\nDeployer balance:", ethers.formatEther(balance), "WDOGE");

    // Try to get last mint time
    const lastMintTime = await wdogeToken.lastMintTime(deployer.address);
    console.log("Last mint timestamp:", lastMintTime.toString());

    // Try to estimate gas for a mint transaction
    try {
      const mintAmount = ethers.parseEther("1");
      const gasEstimate = await wdogeToken.mint.estimateGas(deployer.address, mintAmount);
      console.log("\nEstimated gas for mint:", gasEstimate.toString());
    } catch (error) {
      console.log("\nGas estimation failed:", error.message);
    }

  } catch (error) {
    console.error("\nError:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
