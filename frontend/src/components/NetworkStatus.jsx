import React, { useEffect, useState } from 'react';
import {
  HStack,
  Text,
  Box,
  Tooltip,
  useToast
} from '@chakra-ui/react';
import { REQUIRED_CHAIN_ID, NETWORK_CONFIG } from '../config';

const NetworkStatus = ({ isConnected }) => {
  const toast = useToast();
  const [chainId, setChainId] = useState(null);

  useEffect(() => {
    const updateChainId = () => {
      if (window.ethereum) {
        setChainId(parseInt(window.ethereum.chainId));
      }
    };

    updateChainId();
    if (window.ethereum) {
      window.ethereum.on('chainChanged', updateChainId);
      return () => {
        window.ethereum.removeListener('chainChanged', updateChainId);
      };
    }
  }, []);

  const isCorrectNetwork = chainId === REQUIRED_CHAIN_ID;
  
  const statusColor = isConnected 
    ? isCorrectNetwork 
      ? "green.400" 
      : "red.400"
    : "gray.400";

  const statusText = isConnected
    ? isCorrectNetwork
      ? "Connected"
      : "Wrong Network"
    : "Not Connected";

  const handleNetworkClick = async () => {
    if (!isConnected || isCorrectNetwork) return;
    
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
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to add Polygon Amoy network",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      }
    }
  };

  return (
    <Tooltip
      label={isConnected && !isCorrectNetwork ? "Click to switch to Polygon Amoy" : statusText}
      placement="bottom"
    >
      <HStack
        spacing={2}
        bg="#22262B"
        px={4}
        py={2}
        borderRadius="xl"
        cursor={isConnected && !isCorrectNetwork ? "pointer" : "default"}
        transition="all 0.2s"
        onClick={handleNetworkClick}
        _hover={{
          bg: isConnected && !isCorrectNetwork ? "#2A2F34" : "#22262B"
        }}
      >
        <Box
          w="8px"
          h="8px"
          borderRadius="full"
          bg={statusColor}
          sx={{
            animation: isConnected ? 'pulse 2s infinite' : 'none',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)', opacity: 1 },
              '50%': { transform: 'scale(1.1)', opacity: 0.8 },
              '100%': { transform: 'scale(1)', opacity: 1 },
            }
          }}
        />
        <Text fontSize="sm" color="white">
          {statusText}
        </Text>
      </HStack>
    </Tooltip>
  );
};

export default NetworkStatus;