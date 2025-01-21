import React from 'react';
import { Box, VStack, Text, CircularProgress } from '@chakra-ui/react';
import PropTypes from 'prop-types';

const LoadingOverlay = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="blackAlpha.700"
      zIndex="overlay"
      display="flex"
      alignItems="center"
      justifyContent="center"
      backdropFilter="blur(4px)"
    >
      <VStack spacing={4}>
        <CircularProgress 
          isIndeterminate 
          color="brand.500" 
          size="60px" 
          thickness="4px" 
        />
        <Text color="white" fontSize="lg" fontWeight="bold">
          Processing...
        </Text>
      </VStack>
    </Box>
  );
};

LoadingOverlay.propTypes = {
  isOpen: PropTypes.bool.isRequired
};

export default LoadingOverlay;