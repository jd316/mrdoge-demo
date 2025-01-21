const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Staking Contract", function () {
    let WDOGEToken, wdogeToken;
    let StakingContract, stakingContract;
    let owner, user1, user2;
    const WEEK = 7 * 24 * 60 * 60; // 7 days in seconds
    const MIN_STAKE = ethers.parseEther("5"); // 5 DOGE
    const STAKE_AMOUNT = ethers.parseEther("500"); // 500 DOGE

    beforeEach(async function () {
        // Get signers
        [owner, user1, user2] = await ethers.getSigners();

        // Deploy WDOGE Token
        WDOGEToken = await ethers.getContractFactory("WDOGEToken");
        wdogeToken = await WDOGEToken.deploy();

        // Deploy Staking Contract
        StakingContract = await ethers.getContractFactory("StakingContract");
        stakingContract = await StakingContract.deploy(await wdogeToken.getAddress());

        // Grant MINTER_ROLE to staking contract
        await wdogeToken.grantRole(await wdogeToken.MINTER_ROLE(), await stakingContract.getAddress());

        // Fund the staking contract with rewards (10,000 DOGE for testing)
        await owner.sendTransaction({
            to: await stakingContract.getAddress(),
            value: ethers.parseEther("10000")
        });
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await stakingContract.owner()).to.equal(owner.address);
        });

        it("Should set the correct initial rates", async function () {
            expect(await stakingContract.baseRate()).to.equal(5);
            expect(await stakingContract.maxRate()).to.equal(15);
            expect(await stakingContract.minRate()).to.equal(3);
            expect(await stakingContract.currentRate()).to.equal(15); // Max rate initially since TVL is 0
        });

        it("Should start in unpaused state", async function () {
            expect(await stakingContract.paused()).to.be.false;
        });
    });

    describe("Staking", function () {
        it("Should not allow staking below minimum amount", async function () {
            await expect(stakingContract.connect(user1).stake({
                value: ethers.parseEther("4") // Below 5 DOGE minimum
            })).to.be.revertedWithCustomError(stakingContract, "BelowMinStake");
        });

        it("Should allow staking and update TVL", async function () {
            await stakingContract.connect(user1).stake({
                value: STAKE_AMOUNT
            });

            const stake = await stakingContract.stakes(user1.address);
            expect(stake.amount).to.equal(STAKE_AMOUNT);
            expect(stake.active).to.be.true;
            expect(await stakingContract.totalValueLocked()).to.equal(STAKE_AMOUNT);
        });

        it("Should not allow double staking", async function () {
            await stakingContract.connect(user1).stake({
                value: STAKE_AMOUNT
            });

            await expect(stakingContract.connect(user1).stake({
                value: STAKE_AMOUNT
            })).to.be.revertedWithCustomError(stakingContract, "AlreadyStaking");
        });
    });

    describe("Rewards", function () {
        it("Should calculate rewards correctly", async function () {
            // Get initial rate which should be maxRate since TVL is 0
            const initialRate = await stakingContract.currentRate();
            expect(initialRate).to.equal(await stakingContract.maxRate());

            // Stake amount
            await stakingContract.connect(user1).stake({
                value: STAKE_AMOUNT
            });

            // Get the actual rate that was locked for this stake
            const stake = await stakingContract.stakes(user1.address);
            const lockedRate = stake.lockedRate;

            // Move time forward by 30 days
            await time.increase(30 * 24 * 60 * 60);

            const reward = await stakingContract.calculateReward(user1.address);
            // Expected reward = (amount * lockedRate * time) / (365 days) / 100
            const expectedReward = STAKE_AMOUNT * BigInt(lockedRate) * 30n / (365n * 100n);
            expect(reward).to.be.closeTo(expectedReward, ethers.parseEther("0.1")); // Allow small deviation
        });
    });

    describe("Unstaking", function () {
        it("Should not allow unstaking before lockup period", async function () {
            await stakingContract.connect(user1).stake({
                value: STAKE_AMOUNT
            });

            await expect(stakingContract.connect(user1).unstake())
                .to.be.revertedWithCustomError(stakingContract, "LockupPeriodNotOver");
        });

        it("Should allow unstaking after lockup period", async function () {
            await stakingContract.connect(user1).stake({
                value: STAKE_AMOUNT
            });

            // Move time forward past lockup period
            await time.increase(WEEK + 1);

            const balanceBefore = await ethers.provider.getBalance(user1.address);
            await stakingContract.connect(user1).unstake();
            const balanceAfter = await ethers.provider.getBalance(user1.address);

            // Should receive original stake plus rewards
            expect(balanceAfter).to.be.gt(balanceBefore);
        });
    });

    describe("Emergency Withdrawal", function () {
        it("Should allow emergency withdrawal without rewards", async function () {
            await stakingContract.connect(user1).stake({
                value: STAKE_AMOUNT
            });

            const balanceBefore = await ethers.provider.getBalance(user1.address);
            await stakingContract.connect(user1).emergencyWithdraw();
            const balanceAfter = await ethers.provider.getBalance(user1.address);

            // Should receive only original stake
            expect(balanceAfter).to.be.gt(balanceBefore);
            expect(await stakingContract.totalValueLocked()).to.equal(0);
        });
    });

    describe("Dynamic Rate", function () {
        it("Should adjust rate based on TVL", async function () {
            const initialRate = await stakingContract.currentRate();
            console.log("Initial rate:", initialRate);
            
            // Use 80% of max cap to ensure rate drops to minimum
            const maxCap = await stakingContract.maxCap();
            console.log("Max cap:", maxCap);
            const stakeAmount = (maxCap * 80n) / 100n;
            console.log("Stake amount:", stakeAmount);
            
            await stakingContract.connect(user1).stake({
                value: stakeAmount
            });

            const newRate = await stakingContract.currentRate();
            console.log("New rate:", newRate);
            
            const tvl = await stakingContract.totalValueLocked();
            console.log("TVL:", tvl);
            const utilizationRate = (tvl * 100n) / maxCap;
            console.log("Utilization rate:", utilizationRate, "%");
            
            // With 80% utilization, rate should be at minimum
            expect(newRate).to.equal(await stakingContract.minRate());
        });

        it("Should maintain max rate at low utilization", async function () {
            // Use 5% of max cap
            const maxCap = await stakingContract.maxCap();
            const stakeAmount = (maxCap * 5n) / 100n;
            
            await stakingContract.connect(user1).stake({
                value: stakeAmount
            });

            const newRate = await stakingContract.currentRate();
            
            // At 5% utilization, should still be at max rate
            expect(newRate).to.equal(await stakingContract.maxRate());
        });
    });

    describe("Admin Functions", function () {
        it("Should allow owner to pause/unpause", async function () {
            await stakingContract.connect(owner).setPaused(true);
            expect(await stakingContract.paused()).to.be.true;

            await expect(stakingContract.connect(user1).stake({
                value: STAKE_AMOUNT
            })).to.be.revertedWithCustomError(stakingContract, "ContractPaused");

            await stakingContract.connect(owner).setPaused(false);
            expect(await stakingContract.paused()).to.be.false;
        });

        it("Should allow owner to update max cap", async function () {
            const newCap = ethers.parseEther("2000000"); // 2M DOGE
            await stakingContract.connect(owner).setMaxCap(newCap);
            expect(await stakingContract.maxCap()).to.equal(newCap);
        });

        it("Should prevent non-owner from pausing", async function () {
            await expect(stakingContract.connect(user1).setPaused(true))
                .to.be.revertedWithCustomError(stakingContract, "NotOwner");
        });
    });
}); 