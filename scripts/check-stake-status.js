const { ethers } = require("hardhat");

async function main() {
    const accountAddress = "0x86c53Eb85D0B7548fea5C4B4F82b4205C8f6Ac18";
    console.log("Checking stake status for account:", accountAddress);

    const StakingContract = await ethers.getContractFactory("StakingContract");
    const stakingContract = StakingContract.attach(process.env.STAKING_CONTRACT_ADDRESS);

    const stake = await stakingContract.stakes(accountAddress);
    console.log("\nStake Details:");
    console.log("Amount:", ethers.formatEther(stake.amount), "WDOGE");
    console.log("Start Time:", new Date(Number(stake.startTime) * 1000).toLocaleString());
    console.log("Active:", stake.active);

    if (stake.active) {
        const reward = await stakingContract.calculateReward(accountAddress);
        console.log("\nPending Rewards:", ethers.formatEther(reward), "WDOGE");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
