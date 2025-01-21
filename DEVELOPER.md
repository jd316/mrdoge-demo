# DogeLater Staking - Developer Documentation

## Current Deployment Status

**Important**: The smart contracts are already deployed on Polygon Amoy testnet. You don't need to redeploy them unless you're making contract changes.

- **Network**: Polygon Amoy Testnet
- **Staking Contract**: `0x94A925CFBBC5Ce37e77e454F2E921dadcD84F9a8`
- **WDOGE Token**: `0xefF43eCD583074232cE1B4441DcBC5770505263F`

For local development, you only need to:

1. Install dependencies
2. Start the frontend
3. Have MetaMask configured for Polygon Amoy

## Quick Start

1. **Frontend Development**:

   ```shell
   cd frontend
   npm install
   npm run dev
   ```

2. **Required Environment**:
   Create `.env` file in root (only needed if deploying new contracts):

   ```shell
   PRIVATE_KEY=your_wallet_private_key
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ALCHEMY_API_KEY=your_alchemy_api_key
   ```

## Project Structure

```text
dogelayer-staking/
├── contracts/                # Smart contracts
│   ├── StakingContract.sol   # Main staking contract
│   └── WDOGEToken.sol        # WDOGE token contract
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── App.jsx          # Main application
│   │   └── config.js        # Network configuration
│   └── package.json         # Frontend dependencies
├── scripts/                  # Deployment scripts
├── test/                    # Contract tests
├── .env                     # Environment variables
└── hardhat.config.js        # Hardhat configuration
```

## Development Setup

1. **Environment Setup**:

   ```shell
   # Clone repository
   git clone [repository-url]
   cd dogelayer-staking

   # Install dependencies
   npm install
   cd frontend && npm install
   ```

2. **Environment Variables**:
   Create `.env` file in root:

   ```shell
   PRIVATE_KEY=your_wallet_private_key
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ALCHEMY_API_KEY=your_alchemy_api_key
   ```

## Smart Contracts

### StakingContract.sol

- 7-day lockup period
- 25% APY reward rate
- Emergency withdrawal function
- Events for all major actions

Key Functions:

```solidity
function stake(uint256 amount) external
function unstake() external
function emergencyWithdraw() external
function calculateReward(address user) public view returns (uint256)
```

### Deployment

```shell
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Polygon Amoy
npx hardhat run scripts/deploy.js --network amoy
```

## Frontend Application

### Key Components

1. **App.jsx**:
   - Main application logic
   - Web3 connection handling
   - Contract interactions
   - State management

2. **StakingForm.jsx**:
   - Stake amount input
   - Transaction handling
   - Real-time validation

3. **UnstakingForm.jsx**:
   - Unstake functionality
   - Reward display
   - Lock period countdown

4. **NetworkStatus.jsx**:
   - Network connection status
   - Chain validation
   - Address display

### State Management

```javascript
// Main state variables
const [balance, setBalance] = useState("0");
const [stakedAmount, setStakedAmount] = useState("0");
const [rewards, setRewards] = useState("0");
const [timeLeft, setTimeLeft] = useState(0);
const [isStaking, setIsStaking] = useState(false);
```

### Contract Interaction

```javascript
// Initialize contract
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const stakingContract = new ethers.Contract(
  CONTRACT_ADDRESSES.STAKING_CONTRACT,
  StakingContractABI,
  signer
);
```

### Error Handling

```javascript
try {
  const tx = await stakingContract.emergencyWithdraw({
    gasLimit: 200000,
    gasPrice: await provider.getGasPrice()
  });
  await tx.wait();
} catch (error) {
  console.error("Error:", error);
  // Handle specific error types
}
```

## Testing

### Smart Contract Tests

```shell
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/StakingContract.test.js

# Get coverage report
npx hardhat coverage
```

### Frontend Testing

```shell
# Run tests
cd frontend
npm test

# Run with coverage
npm test -- --coverage
```

## How to Deploy?

### Step 1: Deploy Smart Contracts

1. Update `hardhat.config.js` with network details
2. Set environment variables
3. Run deployment script
4. Verify on Polygonscan

### Step 2: Deploy Frontend

#### Vercel Deployment

1. **Prepare for Deployment**:
   ```shell
   cd frontend
   npm run build
   ```

2. **Deploy to Vercel**:
   - Create an account on Vercel (vercel.com)
   - Install Vercel CLI:
     ```shell
     npm install -g vercel
     ```
   - Login to Vercel:
     ```shell
     vercel login
     ```
   - Deploy:
     ```shell
     vercel
     ```
   - For production:
     ```shell
     vercel --prod
     ```

3. **Environment Variables**:
   - No sensitive environment variables needed for frontend
   - Contract addresses are already in `config.js`
   - RPC endpoints are public

4. **Domain Setup** (Optional):
   - Go to Vercel dashboard
   - Select your project
   - Go to "Settings" → "Domains"
   - Add your custom domain

After deployment, share the Vercel URL with users. They only need:
- MetaMask wallet
- POL tokens for gas
- WDOGE tokens to stake

## Security Considerations

1. **Contract Security**:
   - Reentrancy protection
   - Integer overflow checks
   - Access control
   - Emergency functions

2. **Frontend Security**:
   - Input validation
   - Error handling
   - Transaction confirmation
   - Network validation

3. **Gas Optimization**:
   - Fixed gas limits
   - Batch updates
   - Efficient state management

## Maintenance

1. **Contract Upgrades**:
   - No proxy pattern implemented
   - New deployments require migration

2. **Frontend Updates**:
   - Update ABI when contract changes
   - Keep dependencies updated
   - Monitor for security updates

3. **Monitoring**:
   - Track failed transactions
   - Monitor gas usage
   - Check network status

## Troubleshooting

1. **Transaction Failures**:
   - Check gas price and limit
   - Verify contract state
   - Check user balance

2. **Frontend Issues**:
   - Clear browser cache
   - Reset MetaMask
   - Check console logs

3. **Network Issues**:
   - Verify RPC endpoints
   - Check network status
   - Monitor gas prices
