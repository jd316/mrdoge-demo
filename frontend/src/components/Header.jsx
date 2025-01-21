import React from 'react';
import { Flex, Text, Button } from '@chakra-ui/react';
import { BiWallet } from 'react-icons/bi';

const Header = ({ address, connectWallet, borderColor }) => {
  return (
    <Flex flex="1" align="center">
      <Text 
        fontSize={{ base: "xl", md: "2xl" }} 
        fontWeight="bold" 
        color={borderColor}
        mr={4}
      >
        WDOGE Staking
      </Text>
      <Button
        leftIcon={<BiWallet />}
        bg={address ? "green.500" : borderColor}
        color="white"
        onClick={connectWallet}
        _hover={{ bg: address ? "green.600" : "#d64118" }}
        size={{ base: "sm", md: "md" }}
      >
        {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect Wallet"}
      </Button>
    </Flex>
  );
};

export default React.memo(Header); 