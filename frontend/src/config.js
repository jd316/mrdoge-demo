// Contract Addresses (lowercase for consistency, will be checksummed in the app)
export const CONTRACT_ADDRESSES = {
  STAKING_CONTRACT: "0x8b0fb6d18cd21381e5a327fba0d3f616e0368a91",
  WDOGE_TOKEN: "0x200edc3efe52f03e79ace544a8d590e13f06afbf"
};

// Network Configuration
export const REQUIRED_CHAIN_ID = 568; // Dogechain Testnet

export const NETWORK_CONFIG = {
  chainId: "0x238", // 568 in hex
  chainName: "Dogechain Testnet",
  nativeCurrency: {
    name: "DOGE",
    symbol: "DOGE",
    decimals: 18,
  },
  rpcUrls: ["https://rpc-testnet.dogechain.dog"],
  blockExplorerUrls: ["https://explorer-testnet.dogechain.dog"],
};
