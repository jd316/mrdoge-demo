const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);
    
    console.log("\nAccount:", deployer.address);
    console.log("Balance:", ethers.formatEther(balance), "DOGE");
    
    if (balance < ethers.parseEther("7")) {
        console.log("\n⚠️ WARNING: Account balance is low!");
        console.log("You need at least 7 DOGE for deployment (5 DOGE for initial funding + gas fees)");
        console.log("Get test DOGE from: https://faucet.dogechain.dog");
    } else {
        console.log("\n✅ Account has sufficient balance for deployment");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
