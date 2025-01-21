import { ethers } from 'ethers';

export const formatBalance = (balance) => {
  try {
    if (!balance) return '0';
    // If it's already a BigNumber, format it
    if (ethers.BigNumber.isBigNumber(balance)) {
      return ethers.utils.formatEther(balance);
    }
    // If it's a string or number, convert to BigNumber first
    return ethers.utils.formatEther(ethers.utils.parseEther(String(balance)));
  } catch (error) {
    console.error('Error formatting balance:', error);
    return '0';
  }
};
