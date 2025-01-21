// Contract Addresses (lowercase for consistency, will be checksummed in the app)
export const CONTRACT_ADDRESSES = {
  STAKING_CONTRACT: "0x84F17668Dcd628e358C7e0393d624459A6Bc5dAe",
  WDOGE_TOKEN: "0x543f5319cbe021474EDc09889a9515f893E98B5e"
};

// Network Configuration
export const REQUIRED_CHAIN_ID = 2000; // Dogechain Mainnet

export const NETWORK_CONFIG = {
  chainId: "0x7D0", // 2000 in hex
  chainName: "Dogechain Mainnet",
  nativeCurrency: {
    name: "DOGE",
    symbol: "DOGE",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.dogechain.dog"],
  blockExplorerUrls: ["https://explorer.dogechain.dog"],
};
