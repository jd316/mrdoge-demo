const { ethers } = require("hardhat");

async function main() {
    const accountAddress = "0x86c53Eb85D0B7548fea5C4B4F82b4205C8f6Ac18";
    console.log("Checking POL balance for account:", accountAddress);

    const provider = ethers.provider;
    const balance = await provider.getBalance(accountAddress);
    
    console.log("\nPOL Balance:", ethers.formatEther(balance));
    console.log("(You need enough POL to pay for gas fees)");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
