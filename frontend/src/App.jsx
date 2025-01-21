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
import { REQUIRED_CHAIN_ID, NETWORK_CONFIG } from './config';
import StakingForm from './components/StakingForm';
import WithdrawForm from './components/WithdrawForm';
import NetworkGuide from './components/NetworkGuide';
import NetworkStatus from './components/NetworkStatus';
import ErrorBoundary from './components/ErrorBoundary';
import { handleTransaction } from './utils/transactionHelper';
import { logger } from './utils/logger';

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
  const toast = useToast();

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
        description: 'Polygon Amoy Testnet added to MetaMask',
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

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      const account = accounts[0];

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (parseInt(chainId, 16) !== REQUIRED_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: NETWORK_CONFIG.chainId }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [NETWORK_CONFIG],
              });
            } catch (addError) {
              toast({
                title: 'Error',
                description: 'Failed to add network to MetaMask',
                status: 'error',
                duration: 5000,
                isClosable: true,
              });
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
            return;
          }
        }
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      setSigner(signer);
      setAddress(account);

      window.ethereum.on('accountsChanged', (accounts) => {
        setAddress(accounts[0]);
      });

      window.ethereum.on('chainChanged', (_chainId) => {
        window.location.reload();
      });

    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: 'Error',
        description: 'Failed to connect wallet',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
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
                    <StakingForm signer={signer} address={address} handleTransaction={handleTransaction} />
                  </Box>
                  <Box 
                    flex="1"
                    p={6}
                    bg="#1E2328"
                    borderRadius="xl"
                    border="1px"
                    borderColor="#2A2F34"
                  >
                    <WithdrawForm signer={signer} address={address} handleTransaction={handleTransaction} />
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