const { ethers } = require("hardhat");

async function main() {
    const accountAddress = "0x86c53Eb85D0B7548fea5C4B4F82b4205C8f6Ac18";
    console.log("Attempting emergency withdrawal for account:", accountAddress);

    const StakingContract = await ethers.getContractFactory("StakingContract");
    const stakingContract = StakingContract.attach(process.env.STAKING_CONTRACT_ADDRESS);

    console.log("\nChecking stake status...");
    const stake = await stakingContract.stakes(accountAddress);
    console.log("Amount:", ethers.formatEther(stake.amount), "WDOGE");
    console.log("Start Time:", new Date(Number(stake.startTime) * 1000).toLocaleString());
    console.log("Active:", stake.active);

    if (!stake.active) {
        console.log("No active stake found!");
        return;
    }

    console.log("\nAttempting emergency withdrawal...");
    const tx = await stakingContract.emergencyWithdraw({
        gasLimit: 500000
    });
    console.log("Transaction sent:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt.status === 1 ? "Success" : "Failed");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error:", error);
        process.exit(1);
    });
