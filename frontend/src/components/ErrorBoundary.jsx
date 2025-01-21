import React from 'react';
import { Box, VStack, Text, Button, Icon } from '@chakra-ui/react';
import { BiError } from 'react-icons/bi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          minH="100vh"
          bg="#0D111C"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={4}
        >
          <VStack spacing={6} maxW="600px" textAlign="center">
            <Icon as={BiError} boxSize={16} color="#F4501E" />
            <Text fontSize="2xl" fontWeight="bold" color="white">
              Oops! Something went wrong
            </Text>
            <Text color="whiteAlpha.800">
              We apologize for the inconvenience. Please try refreshing the page or contact support if the problem persists.
            </Text>
            <Button
              bg="#F4501E"
              color="white"
              _hover={{ bg: "#d64118" }}
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 