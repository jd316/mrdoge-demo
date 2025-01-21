import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  UnorderedList,
  ListItem,
} from '@chakra-ui/react';

const TermsOfService = () => {
  return (
    <Box bg="#0D111C" minH="100vh" py={12}>
      <Container maxW="container.lg">
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl" color="white">
            Terms of Service
          </Heading>
          
          <Text color="whiteAlpha.900">
            Last updated: {new Date().toLocaleDateString()}
          </Text>

          <VStack spacing={6} align="stretch">
            <Box>
              <Heading as="h2" size="lg" color="white" mb={4}>
                1. Agreement to Terms
              </Heading>
              <Text color="whiteAlpha.800">
                By accessing and using the WDOGE Staking Platform, you agree to be bound by these Terms of Service and all applicable laws and regulations.
              </Text>
            </Box>

            <Box>
              <Heading as="h2" size="lg" color="white" mb={4}>
                2. Risks
              </Heading>
              <Text color="whiteAlpha.800" mb={4}>
                You understand that using blockchain technology and cryptocurrencies involves significant risks, including but not limited to:
              </Text>
              <UnorderedList color="whiteAlpha.800" spacing={2} pl={4}>
                <ListItem>Price volatility</ListItem>
                <ListItem>Smart contract risks</ListItem>
                <ListItem>Network congestion and high gas fees</ListItem>
                <ListItem>Potential loss of funds</ListItem>
              </UnorderedList>
            </Box>

            <Box>
              <Heading as="h2" size="lg" color="white" mb={4}>
                3. User Responsibilities
              </Heading>
              <Text color="whiteAlpha.800">
                You are responsible for ensuring the security of your wallet, private keys, and maintaining accurate information for your account.
              </Text>
            </Box>

            <Box>
              <Heading as="h2" size="lg" color="white" mb={4}>
                4. Service Modifications
              </Heading>
              <Text color="whiteAlpha.800">
                We reserve the right to modify or discontinue the service at any time without notice.
              </Text>
            </Box>

            <Box>
              <Heading as="h2" size="lg" color="white" mb={4}>
                5. Limitation of Liability
              </Heading>
              <Text color="whiteAlpha.800">
                We shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our service.
              </Text>
            </Box>

            <Box>
              <Heading as="h2" size="lg" color="white" mb={4}>
                6. Governing Law
              </Heading>
              <Text color="whiteAlpha.800">
                These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which the service operates.
              </Text>
            </Box>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default TermsOfService; 