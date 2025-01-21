import React, { useState, useEffect } from 'react';
import {
  VStack,
  Text,
  Button,
  Progress,
  useToast,
  Box,
  Card,
  CardBody,
  HStack,
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../config';
import StakingContractArtifact from '../contracts/StakingContract.json';

const WithdrawForm = ({ signer, address, handleTransaction }) => {
  const [loading, setLoading] = useState(false);
  const [stakedAmount, setStakedAmount] = useState('0');
  const [rewards, setRewards] = useState('0');
  const [lockProgress, setLockProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [stakeStartTime, setStakeStartTime] = useState(0);
  const [isLocked, setIsLocked] = useState(true);
  const toast = useToast();

  const calculateTimeRemaining = (startTime) => {
    const now = Math.floor(Date.now() / 1000);
    const lockupPeriod = 7 * 24 * 60 * 60; // 7 days in seconds
    const endTime = Number(startTime) + lockupPeriod;
    const remainingSeconds = Math.max(0, endTime - now);

    if (remainingSeconds === 0) {
      setIsLocked(false);
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(remainingSeconds / (24 * 60 * 60));
    const hours = Math.floor((remainingSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((remainingSeconds % (60 * 60)) / 60);
    const seconds = remainingSeconds % 60;

    return { days, hours, minutes, seconds };
  };

  useEffect(() => {
    const fetchStakingInfo = async () => {
      if (!signer || !address) return;
      try {
        const stakingContract = new ethers.Contract(
          CONTRACT_ADDRESSES.STAKING_CONTRACT,
          StakingContractArtifact.abi,
          signer
        );

        const stakeData = await stakingContract.stakes(address);
        const rewardsWei = await stakingContract.calculateReward(address);
        
        setStakedAmount(ethers.utils.formatEther(stakeData.amount));
        setRewards(ethers.utils.formatEther(rewardsWei));
        setStakeStartTime(Number(stakeData.startTime));

        // Calculate lock progress
        if (stakeData.active) {
          const now = Math.floor(Date.now() / 1000);
          const lockupPeriod = 7 * 24 * 60 * 60; // 7 days in seconds
          const progress = Math.min(100, Math.max(0, ((now - Number(stakeData.startTime)) / lockupPeriod) * 100));
          setLockProgress(progress);
          setTimeRemaining(calculateTimeRemaining(stakeData.startTime));
        } else {
          setLockProgress(0);
          setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      } catch (error) {
        console.error('Error fetching staking info:', error);
      }
    };

    fetchStakingInfo();
    const interval = setInterval(fetchStakingInfo, 10000); // Update staking info every 10 seconds
    return () => clearInterval(interval);
  }, [signer, address]);

  // Real-time countdown timer
  useEffect(() => {
    if (!stakeStartTime) return;

    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining(stakeStartTime);
      setTimeRemaining(remaining);
      
      // Update progress bar
      const now = Math.floor(Date.now() / 1000);
      const lockupPeriod = 7 * 24 * 60 * 60;
      const progress = Math.min(100, Math.max(0, ((now - stakeStartTime) / lockupPeriod) * 100));
      setLockProgress(progress);
    }, 1000);

    return () => clearInterval(timer);
  }, [stakeStartTime]);

  const handleWithdraw = async () => {
    if (!signer) return;

    try {
      setLoading(true);
      const stakingContract = new ethers.Contract(
        CONTRACT_ADDRESSES.STAKING_CONTRACT,
        StakingContractArtifact.abi,
        signer
      );

      const tx = await stakingContract.unstake();
      await tx.wait();

      toast({
        title: 'Success!',
        description: `Successfully withdrawn ${stakedAmount} WDOGE and ${rewards} WDOGE rewards`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        variant: 'solid',
      });

      // Reset states
      setStakedAmount('0');
      setRewards('0');
      setLockProgress(0);
      setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setStakeStartTime(0);
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to withdraw tokens',
        status: 'error',
        duration: 5000,
        isClosable: true,
        variant: 'solid',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyWithdraw = async () => {
    if (!signer) return;

    try {
      setLoading(true);
      const stakingContract = new ethers.Contract(
        CONTRACT_ADDRESSES.STAKING_CONTRACT,
        StakingContractArtifact.abi,
        signer
      );

      // First check if we have an active stake
      const stake = await stakingContract.stakes(await signer.getAddress());
      
      if (!stake.active) {
        throw new Error("No active stake found");
      }

      // Call emergency withdraw with gas settings
      const tx = await stakingContract.emergencyWithdraw({
        gasLimit: 150000,
        gasPrice: await signer.provider.getGasPrice()
      });

      // Show pending toast
      const pendingToastId = toast({
        title: 'Emergency Withdrawal Pending',
        description: 'Processing your emergency withdrawal...',
        status: 'warning',
        duration: null,
        isClosable: true,
        variant: 'solid',
      });

      // Wait for transaction
      await tx.wait();

      // Close pending toast
      toast.close(pendingToastId);

      // Show success toast
      toast({
        title: 'Emergency Withdrawal Successful',
        description: `Withdrawn ${stakedAmount} DOGE (rewards forfeited)`,
        status: 'warning',
        duration: 5000,
        isClosable: true,
        variant: 'solid',
      });

      // Reset states
      setStakedAmount('0');
      setRewards('0');
      setLockProgress(0);
      setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setStakeStartTime(0);
    } catch (error) {
      console.error('Emergency withdrawal error:', error);
      let errorMessage = error.message;
      
      // Check for specific error conditions
      if (error.code === -32603) {
        errorMessage = "Transaction failed. Please check your POL balance for gas fees.";
      } else if (error.code === 'ACTION_REJECTED') {
        errorMessage = "Transaction was rejected in MetaMask";
      } else if (error.message?.includes('user rejected')) {
        errorMessage = "Transaction was rejected by user";
      }
      
      // Close any pending toasts
      toast.closeAll();
      
      toast({
        title: 'Emergency Withdrawal Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
        variant: 'solid',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card height="full" bg="#1A1D1F" border="1px solid" borderColor="#2A2F34">
      <CardBody p={8}>
        <VStack spacing={6} align="stretch">
          <Text 
            fontSize="2xl" 
            fontWeight="bold" 
            color="#FF6B00"
            textAlign="center"
            mb={2}
          >
            Unstake
          </Text>

          <Box>
            <Text fontSize="sm" color="#64748B" mb={2}>
              Total Staked
            </Text>
            <Text fontSize="xl" fontWeight="bold" color="#FF6B00">
              {Number(stakedAmount).toLocaleString('en-US')} WDOGE
            </Text>
          </Box>

          <Box>
            <Text fontSize="sm" color="#64748B" mb={2}>
              Total Rewards
            </Text>
            <Text fontSize="xl" fontWeight="bold" color="#FF6B00">
              {Number(rewards).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 })} WDOGE
            </Text>
          </Box>

          <Box>
            <Text fontSize="sm" color="#64748B" mb={2}>
              Lock Period
            </Text>
            <Progress 
              value={lockProgress} 
              size="sm" 
              colorScheme="orange" 
              bg="#22262B"
              borderRadius="full"
              mb={2}
            />
            <HStack justify="space-between" color={isLocked ? "#FF6B00" : "green.400"}>
              <Text fontSize="sm">
                {lockProgress.toFixed(2)}% Complete
              </Text>
              <Text fontSize="sm">
                {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s
              </Text>
            </HStack>
          </Box>

          <Box>
            <Text fontSize="sm" color="#64748B" mb={2}>
              APY Rate
            </Text>
            <Text fontSize="xl" fontWeight="bold" color="#FF6B00">
              25%
            </Text>
          </Box>

          <Button
            w="full"
            bg="#CD853F"
            color="white"
            size="lg"
            onClick={handleWithdraw}
            isLoading={loading}
            isDisabled={loading || lockProgress < 100}
            _hover={{ bg: "#B8732F" }}
            mb={2}
          >
            Unstake & Claim Rewards
          </Button>

          <Button
            w="full"
            variant="outline"
            borderColor="#FF4B4B"
            color="#FF4B4B"
            size="lg"
            onClick={handleEmergencyWithdraw}
            isLoading={loading}
            isDisabled={loading || !stakedAmount || stakedAmount === '0'}
            _hover={{ bg: "#2D1C1C" }}
          >
            Emergency Withdraw
          </Button>

          <Text fontSize="xs" color="#FF4B4B" textAlign="center">
            Emergency withdraw forfeits rewards
          </Text>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default WithdrawForm;
