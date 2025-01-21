const { ethers } = require("hardhat");

async function main() {
    const accountAddress = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
    console.log("Checking details for account:", accountAddress);

    const WDOGEToken = await ethers.getContractFactory("WDOGEToken");
    const token = WDOGEToken.attach(process.env.WDOGE_ADDRESS);

    const balance = await token.balanceOf(accountAddress);
    const mintLimit = await token.MINT_LIMIT();
    const lastMintTime = await token.lastMintTime(accountAddress);
    const cooldown = await token.MINT_COOLDOWN();
    const currentTime = Math.floor(Date.now() / 1000);
    
    console.log("\nBalance:", ethers.formatEther(balance), "WDOGE");
    console.log("Mint limit per transaction:", ethers.formatEther(mintLimit), "WDOGE");
    console.log("Last mint time:", new Date(Number(lastMintTime) * 1000).toLocaleString());
    console.log("Cooldown period:", Number(cooldown) / 3600, "hours");
    
    if (lastMintTime > 0) {
        const timeUntilNextMint = Number(lastMintTime) + Number(cooldown) - currentTime;
        if (timeUntilNextMint > 0) {
            console.log("\nTime until next mint:", Math.ceil(timeUntilNextMint / 3600), "hours");
        } else {
            console.log("\nCan mint now!");
        }
    } else {
        console.log("\nNever minted before - can mint now!");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
