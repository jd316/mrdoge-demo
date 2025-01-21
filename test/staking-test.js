const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Staking Contract", function () {
  let WDOGEToken;
  let StakingContract;
  let wdogeToken;
  let stakingContract;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy WDOGEToken
    WDOGEToken = await ethers.getContractFactory("WDOGEToken");
    wdogeToken = await WDOGEToken.deploy();
    await wdogeToken.waitForDeployment();

    // Deploy StakingContract
    StakingContract = await ethers.getContractFactory("StakingContract");
    stakingContract = await StakingContract.deploy(await wdogeToken.getAddress());
    await stakingContract.waitForDeployment();

    // Grant MINTER_ROLE to StakingContract
    const MINTER_ROLE = await wdogeToken.MINTER_ROLE();
    await wdogeToken.grantRole(MINTER_ROLE, await stakingContract.getAddress());

    // Fund contract with initial DOGE for rewards
    await owner.sendTransaction({
      to: await stakingContract.getAddress(),
      value: ethers.parseEther("10.0") // 10 DOGE for rewards
    });
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await wdogeToken.hasRole(await wdogeToken.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
    });

    it("Should grant MINTER_ROLE to StakingContract", async function () {
      const MINTER_ROLE = await wdogeToken.MINTER_ROLE();
      expect(await wdogeToken.hasRole(MINTER_ROLE, await stakingContract.getAddress())).to.equal(true);
    });

    it("Should set the right admin", async function () {
      const ADMIN_ROLE = await stakingContract.ADMIN_ROLE();
      expect(await stakingContract.hasRole(ADMIN_ROLE, owner.address)).to.equal(true);
    });
  });

  describe("Staking", function () {
    const stakeAmount = ethers.parseEther("1.0");

    it("Should allow staking DOGE", async function () {
      await stakingContract.connect(user1).stake({ value: stakeAmount });
      
      const stake = await stakingContract.stakes(user1.address);
      expect(stake.amount).to.equal(stakeAmount);
      expect(stake.active).to.equal(true);
      
      const wdogeBalance = await wdogeToken.balanceOf(user1.address);
      expect(wdogeBalance).to.equal(stakeAmount);
    });

    it("Should prevent double staking", async function () {
      await stakingContract.connect(user1).stake({ value: stakeAmount });
      await expect(
        stakingContract.connect(user1).stake({ value: stakeAmount })
      ).to.be.revertedWithCustomError(stakingContract, "AlreadyStaking");
    });

    it("Should prevent staking 0 DOGE", async function () {
      await expect(
        stakingContract.connect(user1).stake({ value: 0 })
      ).to.be.revertedWithCustomError(stakingContract, "InvalidAmount");
    });
  });

  describe("Rewards", function () {
    const stakeAmount = ethers.parseEther("1.0");

    it("Should calculate rewards correctly", async function () {
      await stakingContract.connect(user1).stake({ value: stakeAmount });
      
      // Simulate time passing (7 days)
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      const reward = await stakingContract.calculateReward(user1.address);
      expect(reward).to.be.gt(0);
    });

    it("Should allow admin to change reward rate", async function () {
      const newRate = 30; // 30% APY
      await stakingContract.connect(owner).setRewardRate(newRate);
      expect(await stakingContract.rewardRate()).to.equal(newRate);
    });

    it("Should prevent non-admin from changing reward rate", async function () {
      const newRate = 30; // 30% APY
      await expect(
        stakingContract.connect(user1).setRewardRate(newRate)
      ).to.be.reverted;
    });

    it("Should allow admin to fund rewards", async function () {
      const fundAmount = ethers.parseEther("5.0");
      await stakingContract.connect(owner).fundRewards({ value: fundAmount });
      const balance = await ethers.provider.getBalance(await stakingContract.getAddress());
      expect(balance).to.be.gt(fundAmount);
    });
  });

  describe("Withdrawals", function () {
    const stakeAmount = ethers.parseEther("1.0");

    it("Should prevent early withdrawal", async function () {
      await stakingContract.connect(user1).stake({ value: stakeAmount });
      await expect(
        stakingContract.connect(user1).unstake()
      ).to.be.revertedWithCustomError(stakingContract, "LockupPeriodNotOver");
    });

    it("Should allow emergency withdrawal", async function () {
      await stakingContract.connect(user1).stake({ value: stakeAmount });
      
      const balanceBefore = await ethers.provider.getBalance(user1.address);
      const tx = await stakingContract.connect(user1).emergencyWithdraw();
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(user1.address);
      
      // Check stake was deactivated
      const stake = await stakingContract.stakes(user1.address);
      expect(stake.active).to.equal(false);
      
      // Check WDOGE was burned
      const wdogeBalance = await wdogeToken.balanceOf(user1.address);
      expect(wdogeBalance).to.equal(0);
      
      // Check DOGE was returned (accounting for gas costs)
      const expectedBalance = balanceBefore + stakeAmount - gasCost;
      expect(balanceAfter).to.be.closeTo(expectedBalance, ethers.parseEther("0.0001"));
    });

    it("Should allow withdrawal after lockup period", async function () {
      await stakingContract.connect(user1).stake({ value: stakeAmount });
      
      // Simulate time passing (8 days to be safe)
      await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      const balanceBefore = await ethers.provider.getBalance(user1.address);
      const reward = await stakingContract.calculateReward(user1.address);
      const tx = await stakingContract.connect(user1).unstake();
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(user1.address);
      
      // Check stake was deactivated
      const stake = await stakingContract.stakes(user1.address);
      expect(stake.active).to.equal(false);
      
      // Check WDOGE was burned
      const wdogeBalance = await wdogeToken.balanceOf(user1.address);
      expect(wdogeBalance).to.equal(0);
      
      // Check DOGE was returned with rewards (accounting for gas costs)
      const expectedBalance = balanceBefore + stakeAmount + reward - gasCost;
      expect(balanceAfter).to.be.closeTo(expectedBalance, ethers.parseEther("0.0001"));
    });
  });
}); 