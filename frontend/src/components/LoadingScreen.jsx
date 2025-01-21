import React from 'react';
import { Box, VStack, Spinner, Text } from '@chakra-ui/react';

const LoadingScreen = () => {
  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="#0D111C"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex="9999"
    >
      <VStack spacing={4}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.700"
          color="#F4501E"
          size="xl"
        />
        <Text fontSize="xl" color="white">
          Loading WDOGE Staking...
        </Text>
      </VStack>
    </Box>
  );
};

export default LoadingScreen; 