import React from 'react';
import {
  Box,
  VStack,
  Text,
  Link,
  Button,
  useToast,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { CheckCircleIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { NETWORK_CONFIG } from '../config';

const NetworkGuide = () => {
  const toast = useToast();

  const addNetwork = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      // First try to switch to the network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: NETWORK_CONFIG.chainId }],
        });
        
        toast({
          title: 'Success',
          description: 'Successfully switched to Dogechain Testnet',
          status: 'success',
          duration: 5000,
          isClosable: true,
          containerStyle: {
            background: '#1E2328',
            color: 'white',
          }
        });
        return;
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          // Add the network
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
            containerStyle: {
              background: '#1E2328',
              color: 'white',
            }
          });
        } else {
          throw switchError;
        }
      }
    } catch (error) {
      console.error('Error adding/switching network:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add/switch network',
        status: 'error',
        duration: 5000,
        isClosable: true,
        containerStyle: {
          background: '#1E2328',
          color: 'white',
        }
      });
    }
  };

  return (
    <Box
      bg="#1E2328"
      p={8}
      borderRadius="xl"
      border="1px"
      borderColor="#2A2F34"
      mb={6}
      boxShadow="lg"
    >
      <VStack spacing={6} align="stretch">
        <Text fontSize="2xl" fontWeight="bold" color="white">
          🐕 Welcome to DogeStaking! 
        </Text>

        <Text color="gray.300" fontSize="lg">
          Earn rewards by staking your DOGE tokens on Dogechain Testnet
        </Text>

        <List spacing={4} color="gray.300">
          <ListItem display="flex" alignItems="center">
            <ListIcon as={CheckCircleIcon} color="#FF6B00" boxSize={5} />
            <Text>Install MetaMask if you haven't already</Text>
          </ListItem>
          
          <ListItem display="flex" alignItems="center">
            <ListIcon as={CheckCircleIcon} color="#FF6B00" boxSize={5} />
            <Text>Configure Dogechain Testnet:</Text>
            <Button
              size="sm"
              bg="#FF6B00"
              color="white"
              ml={2}
              onClick={addNetwork}
              _hover={{ bg: "#E66000" }}
              _active={{ bg: "#CC5500" }}
              leftIcon={<ExternalLinkIcon />}
            >
              Add Network
            </Button>
          </ListItem>

          <ListItem display="flex" alignItems="center">
            <ListIcon as={CheckCircleIcon} color="#FF6B00" boxSize={5} />
            <Text>Get test DOGE from the{' '}
              <Link
                href="https://faucet.dogechain.dog"
                isExternal
                color="#FF6B00"
                _hover={{ color: "#E66000" }}
              >
                Dogechain Faucet <ExternalLinkIcon mx="2px" />
              </Link>
            </Text>
          </ListItem>
        </List>

        <Box 
          bg="#1A1D1F" 
          p={4} 
          borderRadius="md" 
          border="1px" 
          borderColor="#2A2F34"
        >
          <Text color="gray.300" fontSize="sm">
            💡 <Text as="span" color="#FF6B00" fontWeight="bold">Pro Tip:</Text>{' '}
            You'll need a small amount of DOGE (around 2-3) to cover transaction fees. 
            Stake any amount of DOGE to start earning up to 15% APY!
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default NetworkGuide;
