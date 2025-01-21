const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Minting tokens with account:", deployer.address);

  const WDOGEToken = await ethers.getContractFactory("WDOGEToken");
  const token = WDOGEToken.attach(process.env.WDOGE_ADDRESS);
  
  console.log("Minting 1000 WDOGE tokens...");
  const mintAmount = ethers.parseEther("1000");
  const tx = await token.mint(deployer.address, mintAmount);
  await tx.wait();
  
  const balance = await token.balanceOf(deployer.address);
  console.log("New balance:", ethers.formatEther(balance), "WDOGE");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
