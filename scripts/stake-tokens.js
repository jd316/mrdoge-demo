const { ethers } = require("hardhat");

async function main() {
    const [account] = await ethers.getSigners();
    console.log("Using account:", account.address);

    // Get contract instances
    const WDOGEToken = await ethers.getContractFactory("WDOGEToken");
    const wdoge = WDOGEToken.attach(process.env.WDOGE_ADDRESS);

    const StakingContract = await ethers.getContractFactory("StakingContract");
    const staking = StakingContract.attach(process.env.STAKING_CONTRACT_ADDRESS);

    // Amount to stake (100 WDOGE)
    const stakeAmount = ethers.parseEther("100");

    // Check allowance
    const allowance = await wdoge.allowance(account.address, process.env.STAKING_CONTRACT_ADDRESS);
    if (allowance < stakeAmount) {
        console.log("Approving WDOGE tokens for staking...");
        const approveTx = await wdoge.approve(process.env.STAKING_CONTRACT_ADDRESS, stakeAmount);
        await approveTx.wait();
        console.log("Approval successful!");
    }

    // Stake tokens
    console.log("Staking 100 WDOGE tokens...");
    const stakeTx = await staking.stake(stakeAmount);
    await stakeTx.wait();
    console.log("Staking successful!");

    // Get staking info
    const stakeInfo = await staking.stakes(account.address);
    console.log("\nStaking Information:");
    console.log("Amount Staked:", ethers.formatEther(stakeInfo.amount), "WDOGE");
    console.log("Start Time:", new Date(Number(stakeInfo.startTime) * 1000).toLocaleString());
    console.log("Active:", stakeInfo.active);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
