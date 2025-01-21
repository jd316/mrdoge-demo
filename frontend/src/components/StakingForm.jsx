import React, { useState, useEffect } from 'react';
import {
  VStack,
  Text,
  Button,
  Input,
  useToast,
  Box,
  Card,
  CardBody,
  HStack,
  Link,
  Icon,
  Progress,
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { CONTRACT_ADDRESSES, REQUIRED_CHAIN_ID } from '../config';
import StakingContractArtifact from '../contracts/StakingContract.json';
import { logger } from '../utils/logger';

const StakingForm = ({ signer, address, onStakeSuccess, apy, minStakeAmount, totalValueLocked, maxCap }) => {
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState('0');
  const [amount, setAmount] = useState('');
  const [dailyReward, setDailyReward] = useState('0');
  const [annualReward, setAnnualReward] = useState('0');
  const [networkError, setNetworkError] = useState(false);
  const [hasActiveStake, setHasActiveStake] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const loadBalance = async () => {
      if (!signer || !address) return;

      try {
        const balance = await signer.provider.getBalance(address);
        setBalance(ethers.utils.formatEther(balance));
      } catch (error) {
        logger.error('Error loading balance:', error);
      }
    };

    loadBalance();
    const interval = setInterval(loadBalance, 10000);
    return () => clearInterval(interval);
  }, [signer, address]);

  useEffect(() => {
    const calculateRewards = () => {
      if (!amount || isNaN(parseFloat(amount))) {
        setDailyReward('0');
        setAnnualReward('0');
        return;
      }

      try {
        const amountNum = parseFloat(amount);
        if (amountNum <= 0) {
          setDailyReward('0');
          setAnnualReward('0');
          return;
        }

        const annualRewardAmount = (amountNum * (apy / 100)); // Dynamic APY
        const dailyRewardAmount = annualRewardAmount / 365;

        setAnnualReward(annualRewardAmount.toFixed(4));
        setDailyReward(dailyRewardAmount.toFixed(4));
      } catch (error) {
        logger.error('Error calculating rewards:', error);
        setDailyReward('0');
        setAnnualReward('0');
      }
    };

    calculateRewards();
  }, [amount, apy]);

  const handleStake = async () => {
    if (!signer || !address || !amount) return;

    try {
      setLoading(true);

      // Check network first
      const network = await signer.provider.getNetwork();
      if (network.chainId !== REQUIRED_CHAIN_ID) {
        throw new Error(`Please switch to Testnet (Chain ID: ${REQUIRED_CHAIN_ID})`);
      }
      
      // Get contract instance
      const stakingContract = new ethers.Contract(
        CONTRACT_ADDRESSES.STAKING_CONTRACT,
        StakingContractArtifact.abi,
        signer
      );

      const amountToStake = ethers.utils.parseEther(amount);

      // Check balance first
      const balance = await signer.provider.getBalance(address);
      if (balance.lt(amountToStake)) {
        throw new Error('Insufficient DOGE balance');
      }

      // Check if already staking
      const stake = await stakingContract.stakes(address);
      if (stake.active) {
        throw new Error('You already have an active stake. Please unstake first.');
      }

      // Stake DOGE
      logger.info('Staking...');
      
      // Show staking pending toast
      const stakingToastId = toast({
        title: 'Staking',
        description: (
          <VStack align="start" spacing={2}>
            <HStack>
              <Icon as={FiClock} color="#FF6B00" />
              <Text>Staking {amount} DOGE...</Text>
            </HStack>
          </VStack>
        ),
        status: 'info',
        duration: null,
        isClosable: true,
        variant: 'solid',
        containerStyle: {
          background: '#1E2328',
          color: 'white',
        }
      });

      try {
        // Estimate gas first
        const gasEstimate = await stakingContract.estimateGas.stake({
          value: amountToStake
        });
        
        // Add 30% buffer to gas estimate
        const gasLimit = gasEstimate.mul(130).div(100);
        
        // Get current gas price with a small buffer
        const gasPrice = (await signer.provider.getGasPrice()).mul(110).div(100);

        // Send stake transaction
        const stakeTx = await stakingContract.stake({
          value: amountToStake,
          gasLimit: gasLimit,
          gasPrice: gasPrice
        });
        
        logger.info('Stake transaction sent:', stakeTx.hash);

        // Add transaction link
        toast.update(stakingToastId, {
          description: (
            <VStack align="start" spacing={2}>
              <HStack>
                <Icon as={FiClock} color="#FF6B00" />
                <Text>Staking {amount} DOGE...</Text>
              </HStack>
              <Link
                href={`https://explorer-testnet.dogechain.dog/tx/${stakeTx.hash}`}
                isExternal
                color="#FF6B00"
                fontSize="sm"
              >
                <HStack>
                  <Text>View on Explorer</Text>
                  <ExternalLinkIcon mx="2px" />
                </HStack>
              </Link>
            </VStack>
          ),
        });

        // Wait for transaction
        await stakeTx.wait();

        // Close staking toast
        toast.close(stakingToastId);

        // Show success toast
        toast({
          title: 'Staking Successful',
          description: (
            <VStack align="start" spacing={2}>
              <HStack>
                <Icon as={FiCheckCircle} color="#FF6B00" />
                <Text>{amount} WDOGE staked successfully!</Text>
              </HStack>
              <Link
                href={`https://explorer-testnet.dogechain.dog/tx/${stakeTx.hash}`}
                isExternal
                color="#FF6B00"
                fontSize="sm"
              >
                <HStack>
                  <Text>View on Explorer</Text>
                  <ExternalLinkIcon mx="2px" />
                </HStack>
              </Link>
            </VStack>
          ),
          status: 'success',
          duration: 5000,
          isClosable: true,
          variant: 'solid',
          containerStyle: {
            background: '#1E2328',
            color: 'white',
          }
        });

        // Clear form
        setAmount('');
        if (onStakeSuccess) onStakeSuccess();

      } catch (error) {
        logger.error('Error during staking:', {
          error,
          errorMessage: error.message,
          errorCode: error.code,
          errorData: error.data,
          errorReason: error.reason
        });
        
        // Handle specific error types
        let errorMessage = 'Failed to stake';
        
        if (error.code === 'ACTION_REJECTED') {
          errorMessage = 'Transaction was rejected by user';
        } else if (error.code === -32603) {
          errorMessage = 'Transaction failed. Please try with a smaller amount or contact support.';
        } else if (error.message?.includes('insufficient funds')) {
          errorMessage = 'Insufficient DOGE balance for staking and gas fees';
        } else if (error.data?.message) {
          errorMessage = `Transaction failed: ${error.data.message}`;
        }

        // Show error toast
        toast({
          title: 'Staking Failed',
          description: (
            <VStack align="start" spacing={2}>
              <HStack>
                <Icon as={FiAlertCircle} color="#FF6B00" />
                <Text>{errorMessage}</Text>
              </HStack>
            </VStack>
          ),
          status: 'error',
          duration: 5000,
          isClosable: true,
          variant: 'solid',
          containerStyle: {
            background: '#1E2328',
            color: 'white',
          }
        });

        throw new Error(errorMessage);
      }

    } catch (error) {
      logger.error('Error in handleStake:', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        containerStyle: {
          background: '#1E2328',
          color: 'white',
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      <Text fontSize="2xl" fontWeight="bold" color="white">Stake</Text>
      
      <Card bg="whiteAlpha.100" border="1px" borderColor="whiteAlpha.200">
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Box>
              <Text mb={2} color="gray.400">Total Value Locked</Text>
              <Text fontSize="xl" fontWeight="bold" color="white">
                {parseFloat(totalValueLocked).toFixed(2)} / {parseFloat(maxCap).toLocaleString()} WDOGE
              </Text>
              <Progress 
                value={(parseFloat(totalValueLocked) / parseFloat(maxCap)) * 100} 
                size="sm" 
                colorScheme="orange" 
                bg="#22262B"
                borderRadius="full"
                mt={2}
              />
            </Box>

            <Box>
              <Text mb={2} color="gray.400">Your WDOGE Balance</Text>
              <Text fontSize="xl" fontWeight="bold" color="white">
                {parseFloat(balance).toFixed(4)} WDOGE
              </Text>
            </Box>

            <Box>
              <Text mb={2} color="gray.400">Amount to Stake (min. {minStakeAmount} WDOGE)</Text>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Enter amount (min. ${minStakeAmount} WDOGE)`}
                type="number"
                min={minStakeAmount}
                step="0.1"
                bg="whiteAlpha.100"
                border="1px"
                borderColor="whiteAlpha.300"
                _hover={{ borderColor: "whiteAlpha.400" }}
                _focus={{ borderColor: "blue.500", boxShadow: "none" }}
                color="white"
              />
            </Box>

            <Box>
              <Text mb={2} color="gray.400">Estimated Rewards</Text>
              <HStack spacing={6}>
                <Box>
                  <Text color="gray.400" fontSize="sm">Daily</Text>
                  <Text color="#FF6B00" fontSize="lg" fontWeight="bold">
                    {dailyReward} WDOGE
                  </Text>
                </Box>
                <Box>
                  <Text color="gray.400" fontSize="sm">Annual ({apy}% APY)</Text>
                  <Text color="#FF6B00" fontSize="lg" fontWeight="bold">
                    {annualReward} WDOGE
                  </Text>
                </Box>
              </HStack>
            </Box>

            <Button
              onClick={handleStake}
              isLoading={loading}
              loadingText="Staking..."
              bg="#FF6B00"
              color="white"
              _hover={{ bg: "#E66000" }}
              _active={{ bg: "#CC5500" }}
              isDisabled={!amount || parseFloat(amount) < parseFloat(minStakeAmount) || hasActiveStake}
            >
              Stake
            </Button>

            {amount && parseFloat(amount) < parseFloat(minStakeAmount) && (
              <Text color="#FF6B00" fontSize="sm">
                Minimum stake amount is {minStakeAmount} WDOGE
              </Text>
            )}

            {hasActiveStake && (
              <Text color="#FF6B00" fontSize="sm">
                You already have an active stake. Please unstake first.
              </Text>
            )}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default StakingForm;