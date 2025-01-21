# DogeStaking DApp

A decentralized application for staking DOGE tokens on Dogechain Testnet, featuring a modern dark theme UI and attractive rewards.

## Features

- 🔒 Secure staking of native DOGE tokens
- 💰 Earn 25% APY on staked DOGE
- 🎨 Modern dark & orange themed UI
- 🔐 Role-based access control for enhanced security
- ⚡ Fast and efficient transactions on Dogechain
- 🌐 Full MetaMask integration

## Deployed Contracts (Dogechain Testnet)

- WDOGEToken: `0x200edc3efe52f03e79ace544a8d590e13f06afbf`
- StakingContract: `0x8b0fb6d18cd21381e5a327fba0d3f616e0368a91`

## Prerequisites

- Node.js v16+
- npm or yarn
- MetaMask wallet
- Test DOGE from [Dogechain Faucet](https://faucet.dogechain.dog)

## Quick Start

1. Clone the repository:

```bash
git clone https://github.com/yourusername/dogestaking-dapp.git
cd dogestaking-dapp
```

2. Install dependencies:

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

3. Configure environment:

```bash
# Create .env file in root directory
PRIVATE_KEY=your_private_key_here
```

4. Run the development server:

```bash
# In the frontend directory
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Smart Contracts

The project consists of two main smart contracts:

### WDOGEToken
- ERC20 token representing wrapped DOGE
- Implements AccessControl for secure minting/burning
- Only the StakingContract can mint/burn tokens

### StakingContract
- Handles DOGE staking and rewards
- 25% APY reward rate
- 7-day lockup period
- Emergency withdrawal feature
- Role-based access control for admin functions

## Network Configuration

Dogechain Testnet:
- RPC URL: https://rpc-testnet.dogechain.dog
- Chain ID: 568
- Currency Symbol: DOGE
- Block Explorer: https://explorer-testnet.dogechain.dog

## Development

1. Compile contracts:

```bash
npx hardhat compile
```

2. Run tests:

```bash
npx hardhat test
```

3. Deploy contracts:

```bash
npx hardhat run scripts/deploy.js --network dogechainTestnet
```

## Security Features

- Role-based access control using OpenZeppelin's AccessControl
- Reentrancy protection
- Balance checks before transfers
- Secure withdrawal patterns
- Gas optimization

## Frontend Features

- Modern dark theme with orange accents
- Responsive design
- Real-time balance and reward updates
- Transaction status notifications
- MetaMask integration
- Network status monitoring

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
