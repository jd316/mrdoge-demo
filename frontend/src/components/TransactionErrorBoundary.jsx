import React from 'react';
import { Box, VStack, Text, Button, HStack } from '@chakra-ui/react';

class TransactionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Transaction error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  formatErrorMessage(error) {
    if (error.code === 'CALL_EXCEPTION') {
      return "Transaction failed. Please check your balance and network connection.";
    } else if (error.code === 'INSUFFICIENT_FUNDS') {
      return "Insufficient funds for gas. Please make sure you have enough POL.";
    } else if (error.code === 'NETWORK_ERROR') {
      return "Network connection error. Please check your internet connection.";
    } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
      return "Unable to estimate gas. The contract may be paused.";
    } else if (error.message?.includes("user rejected")) {
      return "Transaction was rejected. Please try again.";
    }
    return error.message || "An unknown error occurred";
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={6} bg="red.900" color="white" borderRadius="xl">
          <VStack spacing={4} align="stretch">
            <Text fontSize="lg" fontWeight="bold">Transaction Failed</Text>
            <Text>{this.formatErrorMessage(this.state.error)}</Text>
            {this.state.errorInfo && (
              <Box bg="whiteAlpha.100" p={4} borderRadius="md" fontSize="sm">
                <Text fontFamily="monospace" whiteSpace="pre-wrap">
                  {this.state.errorInfo.componentStack}
                </Text>
              </Box>
            )}
            <HStack spacing={4}>
              <Button
                size="sm"
                colorScheme="orange"
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              >
                Try Again
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </HStack>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default TransactionErrorBoundary; 