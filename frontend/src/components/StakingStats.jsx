import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box, VStack, HStack, Text } from '@chakra-ui/react';

const StakingStats = ({
  stakedAmount,
  rewards,
  apy,
  cardBgColor,
  isStaking
}) => {
  const [currentRewards, setCurrentRewards] = useState(rewards);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const baseRewardsRef = useRef(parseFloat(rewards));

  // Calculate rewards per second (memoized)
  const calculateRewardsPerSecond = useCallback(() => {
    if (!isStaking || parseFloat(stakedAmount) === 0) return 0;

    const stakedAmountFloat = parseFloat(stakedAmount);
    const annualReward = stakedAmountFloat * (apy / 100);
    return annualReward / (365 * 24 * 60 * 60);
  }, [stakedAmount, apy, isStaking]);

  // Reset rewards and timer when blockchain data updates
  useEffect(() => {
    baseRewardsRef.current = parseFloat(rewards);
    startTimeRef.current = Date.now();
    setCurrentRewards(rewards);
  }, [rewards]);

  // Update rewards in real-time
  useEffect(() => {
    if (!isStaking || parseFloat(stakedAmount) === 0) {
      setCurrentRewards(rewards);
      return;
    }

    const rewardsPerSecond = calculateRewardsPerSecond();
    console.log('Starting reward tracking:', {
      stakedAmount: parseFloat(stakedAmount),
      apy,
      rewardsPerSecond: rewardsPerSecond.toFixed(18),
      baseRewards: baseRewardsRef.current.toFixed(18)
    });

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start new interval
    intervalRef.current = setInterval(() => {
      const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000;
      const estimatedRewards = baseRewardsRef.current + (rewardsPerSecond * elapsedSeconds);
      
      // Only update if change is significant
      if (Math.abs(estimatedRewards - parseFloat(currentRewards)) >= 0.0001) {
        setCurrentRewards(estimatedRewards.toString());
      }
    }, 5000);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isStaking, stakedAmount, apy, rewards, calculateRewardsPerSecond]);

  // Format number with proper decimal places and thousands separator
  const formatNumber = (value) => {
    const number = parseFloat(value);
    if (isNaN(number)) return '0.0000';
    
    // Split number into integer and decimal parts
    const [integerPart, decimalPart = '0000'] = number.toFixed(4).split('.');
    
    // Add thousands separator to integer part
    const formattedInteger = parseInt(integerPart).toLocaleString('en-US');
    
    // Ensure decimal part has exactly 4 digits
    const paddedDecimal = decimalPart.padEnd(4, '0').slice(0, 4);
    
    return `${formattedInteger}.${paddedDecimal}`;
  };

  return (
    <Box bg={cardBgColor} borderRadius="xl" p={6} w="full">
      <Text fontSize="xl" fontWeight="bold" mb={4}>Your Stats</Text>
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text color="whiteAlpha.700">Total Staked</Text>
          <Text fontWeight="bold">{formatNumber(stakedAmount)} WDOGE</Text>
        </HStack>
        <HStack justify="space-between">
          <Text color="whiteAlpha.700">Total Rewards</Text>
          <Text fontWeight="bold" color="green.400">
            {formatNumber(isStaking ? currentRewards : rewards)} WDOGE
          </Text>
        </HStack>
        <HStack justify="space-between">
          <Text color="whiteAlpha.700">Lock Period</Text>
          <Text fontWeight="bold">7 Days</Text>
        </HStack>
        <HStack justify="space-between">
          <Text color="whiteAlpha.700">APY Rate</Text>
          <Text fontWeight="bold" color="green.400">{apy}%</Text>
        </HStack>
      </VStack>
    </Box>
  );
};

StakingStats.propTypes = {
  stakedAmount: PropTypes.string.isRequired,
  rewards: PropTypes.string.isRequired,
  apy: PropTypes.number.isRequired,
  cardBgColor: PropTypes.string.isRequired,
  isStaking: PropTypes.bool.isRequired
};

export default React.memo(StakingStats); 