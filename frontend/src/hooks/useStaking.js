import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export function useStaking(provider, signer, address, stakingContract, tokenContract) {
  const [balance, setBalance] = useState('0');
  const [stakedAmount, setStakedAmount] = useState('0');
  const [rewards, setRewards] = useState('0');
  const [isStaking, setIsStaking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [rewardRate, setRewardRate] = useState(25); // 25% APY
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (provider && signer && address && stakingContract && tokenContract) {
      setIsInitialized(true);
    }
  }, [provider, signer, address, stakingContract, tokenContract]);

  // Update rewards separately
  const updateRewards = async () => {
    if (!stakingContract || !address || !isStaking || !isInitialized) {
      return;
    }

    try {
      const rewardsWei = await stakingContract.calculateReward(address);
      const formattedRewards = ethers.utils.formatEther(rewardsWei);
      console.log('Updated rewards:', formattedRewards);
      setRewards(formattedRewards);
    } catch (error) {
      console.error('Error updating rewards:', error);
    }
  };

  // Update all balances
  const updateBalances = async () => {
    if (!stakingContract || !tokenContract || !address || !isInitialized) {
      return;
    }

    try {
      console.log('Fetching balances for address:', address);

      const [
        balanceWei,
        stakeData,
        rewardsWei,
        lockupTime
      ] = await Promise.all([
        tokenContract.balanceOf(address),
        stakingContract.stakes(address),
        stakingContract.calculateReward(address),
        stakingContract.lockupPeriod()
      ]);

      const formattedBalance = ethers.utils.formatEther(balanceWei);
      const formattedStaked = ethers.utils.formatEther(stakeData.amount);
      const formattedRewards = ethers.utils.formatEther(rewardsWei);

      console.log('Updated balances:', {
        balance: formattedBalance,
        staked: formattedStaked,
        rewards: formattedRewards,
        isActive: stakeData.active
      });

      setBalance(formattedBalance);
      setStakedAmount(formattedStaked);
      setRewards(formattedRewards);
      setIsStaking(stakeData.active);

      if (stakeData.active) {
        const currentTime = Math.floor(Date.now() / 1000);
        const endTime = stakeData.startTime.add(lockupTime);
        const timeLeftSeconds = Math.max(0, endTime.sub(currentTime).toNumber());
        console.log('Lock period:', {
          startTime: stakeData.startTime.toString(),
          lockupTime: lockupTime.toString(),
          timeLeft: timeLeftSeconds
        });
        setTimeLeft(timeLeftSeconds);
      } else {
        setTimeLeft(0);
      }
    } catch (error) {
      console.error('Error updating balances:', error);
    }
  };

  // Update balances every minute
  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    console.log('Setting up balance update interval');
    updateBalances();
    const balanceInterval = setInterval(updateBalances, 60000);
    return () => clearInterval(balanceInterval);
  }, [isInitialized, updateBalances]);

  // Update rewards more frequently
  useEffect(() => {
    if (!isInitialized || !isStaking) {
      return;
    }

    console.log('Setting up rewards update interval');
    updateRewards();
    const rewardInterval = setInterval(updateRewards, 15000);
    return () => clearInterval(rewardInterval);
  }, [isInitialized, isStaking, updateRewards]);

  return {
    balance,
    stakedAmount,
    rewards,
    isStaking,
    timeLeft,
    rewardRate,
    stakingContract,
    tokenContract,
    updateBalances,
    isInitialized
  };
}