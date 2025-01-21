import React, { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  Button,
  Text,
  useToast,
  HStack,
  Flex,
  Circle,
  ChakraProvider,
  extendTheme,
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import { REQUIRED_CHAIN_ID, NETWORK_CONFIG, CONTRACT_ADDRESSES } from './config';
import StakingForm from './components/StakingForm';
import WithdrawForm from './components/WithdrawForm';
import NetworkGuide from './components/NetworkGuide';
import NetworkStatus from './components/NetworkStatus';
import ErrorBoundary from './components/ErrorBoundary';
import { handleTransaction } from './utils/transactionHelper';
import { logger } from './utils/logger';
import { useStaking } from './hooks/useStaking';
import StakingContractArtifact from './contracts/StakingContract.json';
import WDOGETokenArtifact from './contracts/WDOGEToken.json';

// Create a custom theme with default toast position
const theme = extendTheme({
  components: {
    Toast: {
      defaultProps: {
        position: 'bottom',
      },
    },
  },
});

function App() {
  const [address, setAddress] = useState('');
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);
  const toast = useToast();

  // Initialize contracts
  const stakingContract = signer ? new ethers.Contract(
    CONTRACT_ADDRESSES.STAKING_CONTRACT,
    StakingContractArtifact.abi,
    signer
  ) : null;

  const tokenContract = signer ? new ethers.Contract(
    CONTRACT_ADDRESSES.WDOGE_TOKEN,
    WDOGETokenArtifact.abi,
    signer
  ) : null;

  // Use the staking hook
  const {
    balance,
    stakedAmount,
    rewards,
    isStaking,
    timeLeft,
    rewardRate,
    minStakeAmount,
    lockupPeriod,
    updateBalances,
    isInitialized,
    totalValueLocked,
    maxCap,
  } = useStaking(provider, signer, address, stakingContract, tokenContract);

  const addToMetamask = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to use this app');
      }

      logger.info('Adding network to MetaMask');
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [NETWORK_CONFIG],
      });

      toast({
        title: 'Success',
        description: 'Dogechain Testnet added to MetaMask',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      logger.error('Failed to add network to MetaMask', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add network to MetaMask',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to use this app');
      }

      // First step: Connect wallet
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      const account = accounts[0];

      // Set initial provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      setSigner(signer);
      setAddress(account);

      // Second step: Check and switch network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (parseInt(chainId, 16) !== REQUIRED_CHAIN_ID) {
        toast({
          title: 'Wrong Network',
          description: 'Please switch to Dogechain Testnet',
          status: 'warning',
          duration: null,
          isClosable: true,
        });

        try {
          // This will show the MetaMask network switch prompt
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: NETWORK_CONFIG.chainId }],
          });
          
          toast({
            title: 'Success',
            description: 'Successfully connected to Dogechain Testnet',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              toast({
                title: 'Adding Network',
                description: 'Please approve adding Dogechain Testnet to MetaMask',
                status: 'info',
                duration: null,
                isClosable: true,
              });

              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [NETWORK_CONFIG],
              });

              toast({
                title: 'Success',
                description: 'Dogechain Testnet added to MetaMask',
                status: 'success',
                duration: 5000,
                isClosable: true,
              });
            } catch (addError) {
              toast({
                title: 'Error',
                description: 'Failed to add network to MetaMask',
                status: 'error',
                duration: 5000,
                isClosable: true,
              });
              setAddress('');
              setSigner(null);
              return;
            }
          } else {
            toast({
              title: 'Error',
              description: 'Failed to switch network',
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
            setAddress('');
            setSigner(null);
            return;
          }
        }
      }

      // Set up event listeners
      window.ethereum.on('accountsChanged', (accounts) => {
        setAddress(accounts[0] || '');
        if (!accounts[0]) {
          setSigner(null);
        }
      });

      window.ethereum.on('chainChanged', (_chainId) => {
        window.location.reload();
      });

    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to connect wallet',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setAddress('');
      setSigner(null);
    }
  };

  return (
    <ChakraProvider theme={theme}>
      <ErrorBoundary>
        <Box minH="100vh" bg="#1A1D1F">
          {/* Header */}
          <Box 
            py={4} 
            bg="#1E2328"
            borderBottom="1px"
            borderColor="#2A2F34"
            position="fixed"
            width="100%"
            zIndex={100}
          >
            <Container maxW="container.xl">
              <Flex justify="space-between" align="center">
                <HStack spacing={3}>
                  <Circle size="36px" bg="#FF6B00">
                    <Text fontSize="xl" fontWeight="bold" color="white">Ð</Text>
                  </Circle>
                  <Box>
                    <HStack spacing={3} align="baseline">
                      <Text 
                        fontSize="xl" 
                        fontWeight="bold"
                        color="#FF6B00"
                        letterSpacing="tight"
                      >
                        DogeStaking
                      </Text>
                      <Text fontSize="xs" color="gray.400" mt={1}>v2.1 Beta</Text>
                    </HStack>
                  </Box>
                </HStack>

                <HStack spacing={4}>
                  <NetworkStatus isConnected={!!signer} />
                  {address && (
                    <Text color="gray.400">
                      Wallet Connected: {`${address.slice(0, 6)}...${address.slice(-4)}`}
                    </Text>
                  )}
                  <Button
                    onClick={address ? () => setAddress('') : connectWallet}
                    bg="#CD853F"
                    color="white"
                    _hover={{
                      bg: "#B8732F"
                    }}
                    size="md"
                    px={6}
                    fontWeight="semibold"
                  >
                    {address ? 'Disconnect' : 'Connect Wallet'}
                  </Button>
                </HStack>
              </Flex>
            </Container>
          </Box>

          {/* Main Content */}
          <Container maxW="container.xl" pt="100px" pb={8}>
            {address ? (
              <VStack spacing={8} align="stretch">
                <Flex 
                  gap={8} 
                  direction={{ base: 'column', lg: 'row' }}
                >
                  <Box 
                    flex="1"
                    p={6}
                    bg="#1E2328"
                    borderRadius="xl"
                    border="1px"
                    borderColor="#2A2F34"
                  >
                    <StakingForm 
                      signer={signer} 
                      address={address} 
                      handleTransaction={handleTransaction}
                      apy={rewardRate}
                      minStakeAmount={minStakeAmount}
                      totalValueLocked={totalValueLocked}
                      maxCap={maxCap}
                      onStakeSuccess={updateBalances}
                    />
                  </Box>
                  <Box 
                    flex="1"
                    p={6}
                    bg="#1E2328"
                    borderRadius="xl"
                    border="1px"
                    borderColor="#2A2F34"
                  >
                    <WithdrawForm 
                      signer={signer} 
                      address={address} 
                      handleTransaction={handleTransaction}
                      apy={rewardRate}
                      lockupPeriod={lockupPeriod}
                    />
                  </Box>
                </Flex>
              </VStack>
            ) : (
              <Container maxW="container.md" py={8}>
                <VStack spacing={6}>
                  <NetworkGuide />
                </VStack>
              </Container>
            )}
          </Container>
        </Box>
      </ErrorBoundary>
    </ChakraProvider>
  );
}

export default App;