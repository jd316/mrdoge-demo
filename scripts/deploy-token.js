const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy WDOGE Token
  const WDOGEToken = await ethers.getContractFactory("WDOGEToken");
  console.log("Deploying WDOGEToken...");
  const wdoge = await WDOGEToken.deploy();
  await wdoge.waitForDeployment();

  const wdogeAddress = await wdoge.getAddress();
  console.log("WDOGEToken deployed to:", wdogeAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });