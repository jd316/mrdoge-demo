import React, { useState, useEffect } from 'react';
import {
  VStack, Text, Button, useToast, Box, Heading,
  Stat, StatLabel, StatNumber, StatHelpText,
  HStack, Divider
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../config';
import StakingContractArtifact from '../contracts/StakingContract.json';
import WDOGETokenArtifact from '../contracts/WDOGEToken.json';
import { handleTransaction } from '../utils/transactionHelper';

const UnstakingForm = ({ signer, address }) => {
  const [loading, setLoading] = useState(false);
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const [stakedAmount, setStakedAmount] = useState('0');
  const [startTime, setStartTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [rewards, setRewards] = useState('0');
  const toast = useToast();

  const LOCKUP_PERIOD = 7 * 24 * 60 * 60; // 7 days in seconds

  const fetchStakeInfo = async () => {
    if (!signer || !address) return;

    try {
      const stakingContract = new ethers.Contract(
        CONTRACT_ADDRESSES.STAKING_CONTRACT,
        StakingContractArtifact.abi,
        signer
      );

      const stake = await stakingContract.stakes(address);
      setStakedAmount(ethers.formatUnits(stake.amount, 18));
      setStartTime(Number(stake.startTime));

      if (stake.active) {
        const now = Math.floor(Date.now() / 1000);
        const endTime = Number(stake.startTime) + LOCKUP_PERIOD;
        const remaining = endTime - now;
        setTimeLeft(remaining > 0 ? remaining : 0);

        const currentRewards = await stakingContract.calculateReward(address);
        setRewards(ethers.formatUnits(currentRewards, 18));
      } else {
        setTimeLeft(null);
        setRewards('0');
      }
    } catch (error) {
      console.error('Error fetching stake info:', error);
      // Don't show toast for regular updates
    }
  };

  useEffect(() => {
    fetchStakeInfo();
    const interval = setInterval(fetchStakeInfo, 60000);
    return () => clearInterval(interval);
  }, [signer, address]);

  const formatTimeLeft = (seconds) => {
    if (!seconds) return '';
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const handleUnstake = async () => {
    if (!signer || !address) return;

    try {
      setLoading(true);
      const stakingContract = new ethers.Contract(
        CONTRACT_ADDRESSES.STAKING_CONTRACT,
        StakingContractArtifact.abi,
        signer
      );

      // Check if lockup period is over
      const now = Math.floor(Date.now() / 1000);
      if (startTime && now < startTime + LOCKUP_PERIOD) {
        const remaining = startTime + LOCKUP_PERIOD - now;
        throw new Error(`Lockup period not over. Please wait ${formatTimeLeft(remaining)}`);
      }

      const result = await handleTransaction(stakingContract, 'unstake');

      if (result.success) {
        toast({
          title: 'Success!',
          description: `Successfully unstaked ${stakedAmount} WDOGE + ${rewards} WDOGE rewards`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        setStakedAmount('0');
        setStartTime(null);
        setTimeLeft(null);
        setRewards('0');
        await fetchStakeInfo();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error during unstaking:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to unstake tokens',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyWithdraw = async () => {
    if (!signer || !address) return;

    try {
      setEmergencyLoading(true);
      const stakingContract = new ethers.Contract(
        CONTRACT_ADDRESSES.STAKING_CONTRACT,
        StakingContractArtifact.abi,
        signer
      );

      const stake = await stakingContract.stakes(address);
      if (!stake.active) {
        throw new Error('No active stake found');
      }

      const result = await handleTransaction(stakingContract, 'emergencyWithdraw');

      if (result.success) {
        toast({
          title: 'Success!',
          description: `Successfully withdrawn ${stakedAmount} WDOGE (no rewards)`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        setStakedAmount('0');
        setStartTime(null);
        setTimeLeft(null);
        setRewards('0');
        await fetchStakeInfo();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Emergency withdrawal error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to withdraw tokens',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setEmergencyLoading(false);
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      <Box mb={4}>
        <Heading size="md" color="white" mb={2}>Unstake WDOGE</Heading>
        <Text fontSize="sm" color="gray.400">
          Unstake your WDOGE tokens and claim rewards. Note that tokens are locked for 7 days after staking.
        </Text>
      </Box>

      <Box bg="#1A1D1F" p={6} borderRadius="xl">
        <VStack spacing={4} align="stretch">
          <Stat>
            <StatLabel color="gray.400">Staked Amount</StatLabel>
            <StatNumber color="white" fontSize="2xl">{stakedAmount} WDOGE</StatNumber>
            {timeLeft > 0 && (
              <StatHelpText color="orange.300">
                Lockup ends in: {formatTimeLeft(timeLeft)}
              </StatHelpText>
            )}
          </Stat>

          <Divider borderColor="gray.700" />

          <Stat>
            <StatLabel color="gray.400">Pending Rewards</StatLabel>
            <StatNumber color="green.400" fontSize="xl">{rewards} WDOGE</StatNumber>
          </Stat>
        </VStack>
      </Box>

      <HStack spacing={4}>
        <Button
          flex={1}
          colorScheme="orange"
          onClick={handleUnstake}
          isLoading={loading}
          loadingText="Unstaking..."
          isDisabled={loading || !parseFloat(stakedAmount) || (timeLeft && timeLeft > 0) || emergencyLoading}
        >
          Unstake & Claim Rewards
        </Button>

        <Button
          flex={1}
          colorScheme="red"
          variant="outline"
          onClick={handleEmergencyWithdraw}
          isLoading={emergencyLoading}
          loadingText="Withdrawing..."
          isDisabled={loading || !parseFloat(stakedAmount) || emergencyLoading}
        >
          Emergency Withdraw
        </Button>
      </HStack>

      {timeLeft > 0 && (
        <Text fontSize="sm" color="gray.400" textAlign="center">
          Your tokens are still locked. Please wait {formatTimeLeft(timeLeft)} before unstaking normally.
          Use emergency withdraw only if necessary (no rewards).
        </Text>
      )}
    </VStack>
  );
};

export default UnstakingForm;