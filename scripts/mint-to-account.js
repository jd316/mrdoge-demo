const { ethers } = require("hardhat");

async function main() {
    // Get target address from command line argument
    const targetAddress = process.argv[2];
    if (!targetAddress) {
        console.error("Please provide a target address as argument");
        process.exit(1);
    }

    const [deployer] = await ethers.getSigners();
    console.log("Minting tokens from:", deployer.address);
    console.log("Minting to:", targetAddress);

    const WDOGEToken = await ethers.getContractFactory("WDOGEToken");
    const token = WDOGEToken.attach(process.env.WDOGE_ADDRESS);

    // Mint 1000 WDOGE
    console.log("\nMinting 1000 WDOGE tokens...");
    const mintAmount = ethers.parseEther("1000");
    const tx = await token.mint(targetAddress, mintAmount);
    await tx.wait();

    // Check new balance
    const balance = await token.balanceOf(targetAddress);
    console.log("New balance:", ethers.formatEther(balance), "WDOGE");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
