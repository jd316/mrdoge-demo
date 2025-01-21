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
  Heading,
  Divider,
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
          description: 'Successfully switched Network',
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
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [NETWORK_CONFIG],
          });
          toast({
            title: 'Success',
            description: 'Successfully added Network',
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
      maxW="600px"
      w="100%"
    >
      <VStack spacing={6} align="stretch">
        <Text fontSize="2xl" fontWeight="bold" color="white" textAlign="center">
          🐕 Welcome to DogeStaking!
        </Text>
        
        <Text color="gray.300" fontSize="lg" textAlign="center">
          Earn rewards by staking!
        </Text>

        <Divider borderColor="#2A2F34" />

        <VStack spacing={4} align="stretch">
          <Text fontWeight="bold" fontSize="lg" color="white">
            Key Features:
          </Text>
          <List spacing={3} color="gray.300">
            <ListItem display="flex" alignItems="center">
              <ListIcon as={CheckCircleIcon} color="#FF6B00" boxSize={5} />
              Dynamic APY up to 15% based on TVL
            </ListItem>
            <ListItem display="flex" alignItems="center">
              <ListIcon as={CheckCircleIcon} color="#FF6B00" boxSize={5} />
              Minimum stake: 5 WDOGE
            </ListItem>
            <ListItem display="flex" alignItems="center">
              <ListIcon as={CheckCircleIcon} color="#FF6B00" boxSize={5} />
              7-day lockup period
            </ListItem>
            <ListItem display="flex" alignItems="center">
              <ListIcon as={CheckCircleIcon} color="#FF6B00" boxSize={5} />
              Secure smart contracts
            </ListItem>
          </List>
        </VStack>

        <Divider borderColor="#2A2F34" />

        <VStack spacing={4}>
          <Text fontWeight="bold" color="white">
            To get started, connect your wallet to the network:
          </Text>
          <Button
            bg="#FF6B00"
            color="white"
            onClick={addNetwork}
            rightIcon={<ExternalLinkIcon />}
            _hover={{ bg: "#E66000" }}
            _active={{ bg: "#CC5500" }}
          >
            Switch Network
          </Button>
        </VStack>

        <Box 
          bg="#1A1D1F" 
          p={4} 
          borderRadius="md" 
          border="1px" 
          borderColor="#2A2F34"
        >
          <VStack spacing={2} fontSize="sm" color="gray.300">
            <Text>Looking for wDoge?</Text>
            <Link
              href="https://bridge.dogechain.dog"
              isExternal
              color="#FF6B00"
              _hover={{ color: "#E66000" }}
            >
              Bridge your DOGE to WDOGE <ExternalLinkIcon mx="2px" />
            </Link>
            <Text mt={2}>
              💡 <Text as="span" color="#FF6B00" fontWeight="bold">Pro Tip:</Text>{' '}
              You'll need a small amount of DOGE for gas fees.
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default NetworkGuide;
