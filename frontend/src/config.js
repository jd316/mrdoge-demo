// Contract Addresses (lowercase for consistency, will be checksummed in the app)
export const CONTRACT_ADDRESSES = {
  STAKING_CONTRACT: "0x134e4d590D977a84871b6e651A9AFe919a2ece29",
  WDOGE_TOKEN: "0xED06BD809785C1c62069D5dF05743B2ac74AA791"
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
