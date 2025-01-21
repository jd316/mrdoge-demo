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

const PrivacyPolicy = () => {
  return (
    <Box bg="#0D111C" minH="100vh" py={12}>
      <Container maxW="container.lg">
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl" color="white">
            Privacy Policy
          </Heading>
          
          <Text color="whiteAlpha.900">
            Last updated: {new Date().toLocaleDateString()}
          </Text>

          <VStack spacing={6} align="stretch">
            <Box>
              <Heading as="h2" size="lg" color="white" mb={4}>
                1. Information We Collect
              </Heading>
              <Text color="whiteAlpha.800" mb={4}>
                We collect the following information when you use our platform:
              </Text>
              <UnorderedList color="whiteAlpha.800" spacing={2} pl={4}>
                <ListItem>Wallet addresses</ListItem>
                <ListItem>Transaction data</ListItem>
                <ListItem>Smart contract interactions</ListItem>
                <ListItem>Network information</ListItem>
              </UnorderedList>
            </Box>

            <Box>
              <Heading as="h2" size="lg" color="white" mb={4}>
                2. How We Use Your Information
              </Heading>
              <Text color="whiteAlpha.800">
                We use the collected information to:
              </Text>
              <UnorderedList color="whiteAlpha.800" spacing={2} pl={4}>
                <ListItem>Process staking transactions</ListItem>
                <ListItem>Calculate and distribute rewards</ListItem>
                <ListItem>Improve our services</ListItem>
                <ListItem>Comply with legal obligations</ListItem>
              </UnorderedList>
            </Box>

            <Box>
              <Heading as="h2" size="lg" color="white" mb={4}>
                3. Data Security
              </Heading>
              <Text color="whiteAlpha.800">
                We implement appropriate technical and organizational measures to protect your information. However, please note that blockchain transactions are public by nature.
              </Text>
            </Box>

            <Box>
              <Heading as="h2" size="lg" color="white" mb={4}>
                4. Third-Party Services
              </Heading>
              <Text color="whiteAlpha.800">
                We use third-party services such as blockchain networks and wallet providers. These services have their own privacy policies and terms of service.
              </Text>
            </Box>

            <Box>
              <Heading as="h2" size="lg" color="white" mb={4}>
                5. Your Rights
              </Heading>
              <Text color="whiteAlpha.800">
                You have the right to:
              </Text>
              <UnorderedList color="whiteAlpha.800" spacing={2} pl={4}>
                <ListItem>Access your personal information</ListItem>
                <ListItem>Request deletion of your information</ListItem>
                <ListItem>Object to processing of your information</ListItem>
                <ListItem>Data portability</ListItem>
              </UnorderedList>
            </Box>

            <Box>
              <Heading as="h2" size="lg" color="white" mb={4}>
                6. Updates to Privacy Policy
              </Heading>
              <Text color="whiteAlpha.800">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page.
              </Text>
            </Box>

            <Box>
              <Heading as="h2" size="lg" color="white" mb={4}>
                7. Contact Us
              </Heading>
              <Text color="whiteAlpha.800">
                If you have any questions about this privacy policy, please contact us at support@wdogestaking.com
              </Text>
            </Box>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default PrivacyPolicy; 