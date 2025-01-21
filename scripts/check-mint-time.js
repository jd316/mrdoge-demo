const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Checking mint time for account:", deployer.address);

  // Get contract instance
  const WDOGEToken = await ethers.getContractFactory("WDOGEToken");
  const wdogeToken = WDOGEToken.attach(process.env.WDOGE_TOKEN_ADDRESS);

  // Get last mint time
  const lastMintTime = await wdogeToken.lastMintTime(deployer.address);
  console.log("\nLast mint timestamp:", lastMintTime.toString());
  
  // Calculate time until next mint
  const now = Math.floor(Date.now() / 1000);
  const nextMintTime = Number(lastMintTime) + (24 * 60 * 60); // Add 24 hours in seconds
  const timeUntilNextMint = nextMintTime - now;
  
  if (timeUntilNextMint > 0) {
    const hours = Math.floor(timeUntilNextMint / 3600);
    const minutes = Math.floor((timeUntilNextMint % 3600) / 60);
    console.log(`Time until next mint: ${hours} hours, ${minutes} minutes`);
  } else {
    console.log("You can mint now!");
  }

  // Get current balance
  const balance = await wdogeToken.balanceOf(deployer.address);
  console.log("\nCurrent balance:", ethers.formatEther(balance), "WDOGE");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
