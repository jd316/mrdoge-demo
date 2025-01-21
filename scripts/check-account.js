const { ethers } = require("hardhat");

async function main() {
    const accountAddress = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
    console.log("Checking account:", accountAddress);

    const WDOGEToken = await ethers.getContractFactory("WDOGEToken");
    const wdoge = WDOGEToken.attach(process.env.WDOGE_ADDRESS);

    const StakingContract = await ethers.getContractFactory("StakingContract");
    const staking = StakingContract.attach(process.env.STAKING_CONTRACT_ADDRESS);

    // Check WDOGE balance
    const balance = await wdoge.balanceOf(accountAddress);
    console.log("\nWDOGE Balance:", ethers.formatEther(balance), "WDOGE");

    // Check stake status
    const stake = await staking.stakes(accountAddress);
    console.log("\nStake Details:");
    console.log("Amount:", ethers.formatEther(stake.amount), "WDOGE");
    console.log("Start Time:", new Date(Number(stake.startTime) * 1000).toLocaleString());
    console.log("Active:", stake.active);

    if (stake.active) {
        const reward = await staking.calculateReward(accountAddress);
        console.log("Current Reward:", ethers.formatEther(reward), "WDOGE");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
