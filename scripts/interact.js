const { ethers } = require("hardhat");

async function main() {
    // Get contract instances
    const WDOGEToken = await ethers.getContractFactory("WDOGEToken");
    const StakingContract = await ethers.getContractFactory("StakingContract");
    
    const wdogeToken = WDOGEToken.attach("0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9");
    const stakingContract = StakingContract.attach("0x5FC8d32690cc91D4c39d9d3abcBD16989F875707");
    
    // Get signers
    const [owner, user1, user2] = await ethers.getSigners();
    
    console.log("\nInitial State:");
    console.log("-------------");
    console.log("Current APY Rate:", await stakingContract.currentRate(), "%");
    console.log("Total Value Locked:", ethers.formatEther(await stakingContract.totalValueLocked()), "DOGE");
    console.log("Contract Balance:", ethers.formatEther(await ethers.provider.getBalance(await stakingContract.getAddress())), "DOGE");

    // Test Scenario 1: Minimum Stake
    console.log("\nScenario 1: Minimum Stake");
    console.log("-------------------------");
    try {
        const minStake = await stakingContract.minStakeAmount();
        console.log("Staking minimum amount:", ethers.formatEther(minStake), "DOGE");
        
        const tx1 = await stakingContract.connect(user1).stake({
            value: minStake
        });
        await tx1.wait();
        
        const stake = await stakingContract.stakes(user1.address);
        console.log("Stake successful!");
        console.log("Locked APY Rate:", stake.lockedRate, "%");
        console.log("New TVL:", ethers.formatEther(await stakingContract.totalValueLocked()), "DOGE");
    } catch (error) {
        console.error("Error in minimum stake:", error.message);
    }

    // Test Scenario 2: Large Stake to Test Rate Change
    console.log("\nScenario 2: Large Stake");
    console.log("----------------------");
    try {
        const maxCap = await stakingContract.maxCap();
        const largeStake = maxCap * 30n / 100n; // 30% of max cap
        console.log("Staking large amount:", ethers.formatEther(largeStake), "DOGE");
        
        const tx2 = await stakingContract.connect(user2).stake({
            value: largeStake
        });
        await tx2.wait();
        
        const stake = await stakingContract.stakes(user2.address);
        console.log("Large stake successful!");
        console.log("Locked APY Rate:", stake.lockedRate, "%");
        console.log("New TVL:", ethers.formatEther(await stakingContract.totalValueLocked()), "DOGE");
        console.log("Current APY Rate:", await stakingContract.currentRate(), "%");
    } catch (error) {
        console.error("Error in large stake:", error.message);
    }

    // Test Scenario 3: Wait and Check Rewards
    console.log("\nScenario 3: Check Rewards");
    console.log("-----------------------");
    try {
        // Simulate time passing (30 days)
        await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]);
        await ethers.provider.send("evm_mine");

        const reward1 = await stakingContract.calculateReward(user1.address);
        const reward2 = await stakingContract.calculateReward(user2.address);
        
        console.log("After 30 days:");
        console.log("User1 Rewards:", ethers.formatEther(reward1), "DOGE");
        console.log("User2 Rewards:", ethers.formatEther(reward2), "DOGE");
    } catch (error) {
        console.error("Error checking rewards:", error.message);
    }

    // Test Scenario 4: Unstake
    console.log("\nScenario 4: Unstake");
    console.log("------------------");
    try {
        const balanceBefore = await ethers.provider.getBalance(user1.address);
        
        const tx4 = await stakingContract.connect(user1).unstake();
        await tx4.wait();
        
        const balanceAfter = await ethers.provider.getBalance(user1.address);
        const difference = balanceAfter - balanceBefore;
        
        console.log("Unstake successful!");
        console.log("Balance change:", ethers.formatEther(difference), "DOGE");
        console.log("New TVL:", ethers.formatEther(await stakingContract.totalValueLocked()), "DOGE");
        console.log("Current APY Rate:", await stakingContract.currentRate(), "%");
    } catch (error) {
        console.error("Error in unstake:", error.message);
    }

    console.log("\nInteraction testing completed!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 