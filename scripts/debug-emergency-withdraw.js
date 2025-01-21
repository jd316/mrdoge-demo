const { ethers } = require("hardhat");

async function main() {
    const [account] = await ethers.getSigners();
    console.log("Using account:", account.address);

    // Get contract instances
    const WDOGEToken = await ethers.getContractFactory("WDOGEToken");
    const wdoge = WDOGEToken.attach("0x554663df3c94DEc79c3094234DcF06969630d83e");

    const StakingContract = await ethers.getContractFactory("StakingContract");
    const staking = StakingContract.attach("0x2F25657a5e4b4076818EcC306209abbF6821B87e");

    try {
        // Check POL balance
        const polBalance = await ethers.provider.getBalance(account.address);
        console.log("\nPOL Balance:", ethers.formatEther(polBalance));

        // Get gas price
        const feeData = await ethers.provider.getFeeData();
        console.log("\nGas Price Info:");
        console.log("Max Fee Per Gas:", ethers.formatUnits(feeData.maxFeePerGas || 0, "gwei"), "gwei");
        console.log("Max Priority Fee:", ethers.formatUnits(feeData.maxPriorityFeePerGas || 0, "gwei"), "gwei");
        console.log("Gas Price:", ethers.formatUnits(feeData.gasPrice || 0, "gwei"), "gwei");

        // Check stake info
        const stake = await staking.stakes(account.address);
        console.log("\nStake Info:");
        console.log("Amount:", ethers.formatEther(stake.amount));
        console.log("Start Time:", new Date(Number(stake.startTime) * 1000).toLocaleString());
        console.log("Active:", stake.active);

        if (!stake.active) {
            console.log("No active stake to withdraw");
            return;
        }

        // Estimate gas for emergency withdraw
        console.log("\nEstimating gas...");
        const gasEstimate = await staking.emergencyWithdraw.estimateGas();
        console.log("Estimated gas needed:", gasEstimate.toString());

        // Calculate max transaction cost
        const maxCost = BigInt(gasEstimate) * (feeData.maxFeePerGas || feeData.gasPrice);
        console.log("Max transaction cost:", ethers.formatEther(maxCost), "POL");

        // Check if we have enough POL
        if (polBalance < maxCost) {
            console.log("Not enough POL for transaction");
            return;
        }

        // Try emergency withdraw with specific gas settings
        console.log("\nAttempting emergency withdraw...");
        const tx = await staking.emergencyWithdraw({
            gasLimit: Math.floor(gasEstimate.toString() * 1.5), // Add 50% buffer
            maxFeePerGas: feeData.maxFeePerGas,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
            type: 2 // Use EIP-1559
        });

        console.log("Transaction hash:", tx.hash);
        console.log("\nWaiting for confirmation...");
        
        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);
        console.log("Gas used:", receipt.gasUsed.toString());

        // Verify the stake was removed
        const newStake = await staking.stakes(account.address);
        console.log("\nNew stake status:", newStake.active);

        // Check new WDOGE balance
        const newBalance = await wdoge.balanceOf(account.address);
        console.log("New WDOGE balance:", ethers.formatEther(newBalance));

    } catch (error) {
        console.error("\nError details:", {
            message: error.message,
            code: error.code,
            data: error.data,
            reason: error.reason,
            method: error.method,
            transaction: error.transaction,
            receipt: error.receipt
        });

        // Try to decode error if possible
        if (error.data) {
            try {
                const iface = new ethers.Interface([
                    "error NoActiveStake()",
                    "error InsufficientBalance()",
                    "error TransferFailed()"
                ]);
                const decodedError = iface.parseError(error.data);
                console.error("Decoded error:", decodedError.name);
            } catch (e) {
                console.log("Could not decode error data");
            }
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Fatal error:", error);
        process.exit(1);
    });
