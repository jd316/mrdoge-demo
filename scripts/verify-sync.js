const { ethers } = require("hardhat");

// Contract addresses from frontend config
const CONTRACT_ADDRESSES = {
    WDOGE_TOKEN: "0x554663df3c94DEc79c3094234DcF06969630d83e",
    STAKING_CONTRACT: "0x2F25657a5e4b4076818EcC306209abbF6821B87e"
};

async function main() {
    const [account] = await ethers.getSigners();
    console.log("Using account:", account.address);

    // Verify contract addresses
    console.log("\nContract Addresses:");
    console.log("Frontend WDOGE:", CONTRACT_ADDRESSES.WDOGE_TOKEN);
    console.log("Backend WDOGE:", process.env.WDOGE_ADDRESS);
    console.log("Frontend Staking:", CONTRACT_ADDRESSES.STAKING_CONTRACT);
    console.log("Backend Staking:", process.env.STAKING_CONTRACT_ADDRESS);
    console.log("\nNOTE: If Backend WDOGE is undefined, please add WDOGE_ADDRESS to your .env file");

    // Get contract instances
    const WDOGEToken = await ethers.getContractFactory("WDOGEToken");
    const wdoge = WDOGEToken.attach(CONTRACT_ADDRESSES.WDOGE_TOKEN);

    const StakingContract = await ethers.getContractFactory("StakingContract");
    const staking = StakingContract.attach(CONTRACT_ADDRESSES.STAKING_CONTRACT);

    console.log("\nContract Verification:");
    
    // Verify WDOGE Token
    try {
        const name = await wdoge.name();
        const symbol = await wdoge.symbol();
        const decimals = await wdoge.decimals();
        console.log("\nWDOGE Token Info:");
        console.log("Name:", name);
        console.log("Symbol:", symbol);
        console.log("Decimals:", decimals);
    } catch (error) {
        console.error("Error verifying WDOGE token:", error.message);
    }

    // Verify Staking Contract
    try {
        const stakingToken = await staking.stakingToken();
        console.log("\nStaking Contract Info:");
        console.log("Staking Token:", stakingToken);
        console.log("Is correct token:", stakingToken.toLowerCase() === CONTRACT_ADDRESSES.WDOGE_TOKEN.toLowerCase());
    } catch (error) {
        console.error("Error verifying staking contract:", error.message);
    }

    // Check WDOGE balance
    try {
        const balance = await wdoge.balanceOf(account.address);
        console.log("\nWDOGE Balance:", balance.toString(), "wei");
        console.log("WDOGE Balance (formatted):", ethers.formatUnits(balance, 18), "WDOGE");
    } catch (error) {
        console.error("Error checking WDOGE balance:", error.message);
    }

    // Check staking info
    try {
        const stakeInfo = await staking.stakes(account.address);
        console.log("\nStaking Information:");
        console.log("Amount Staked:", ethers.formatUnits(stakeInfo.amount, 18), "WDOGE");
        
        // Fix: Convert BigNumber to number using toString first
        const startTime = parseInt(stakeInfo.startTime.toString());
        console.log("Start Time:", new Date(startTime * 1000).toLocaleString());
        
        // Calculate time left in lockup
        const now = Math.floor(Date.now() / 1000);
        const LOCKUP_PERIOD = 7 * 24 * 60 * 60; // 7 days in seconds
        const endTime = startTime + LOCKUP_PERIOD;
        const timeLeft = endTime - now;
        
        console.log("Active:", stakeInfo.active);
        if (stakeInfo.active) {
            const days = Math.floor(timeLeft / (24 * 60 * 60));
            const hours = Math.floor((timeLeft % (24 * 60 * 60)) / 3600);
            const minutes = Math.floor((timeLeft % 3600) / 60);
            console.log("Time Left:", `${days}d ${hours}h ${minutes}m`);
        }
    } catch (error) {
        console.error("Error checking stake info:", error.message);
    }

    // Check reward info
    try {
        const rewardRate = await staking.rewardRate();
        const rewards = await staking.calculateReward(account.address);
        console.log("\nReward Information:");
        console.log("Reward Rate:", rewardRate.toString(), "%");
        console.log("Current Rewards:", ethers.formatUnits(rewards, 18), "WDOGE");
    } catch (error) {
        console.error("Error checking reward info:", error.message);
    }

    // Check allowance
    try {
        const allowance = await wdoge.allowance(account.address, CONTRACT_ADDRESSES.STAKING_CONTRACT);
        console.log("\nAllowance Information:");
        console.log("Staking Contract Allowance:", ethers.formatUnits(allowance, 18), "WDOGE");
    } catch (error) {
        console.error("Error checking allowance:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Fatal error:", error);
        process.exit(1);
    });
