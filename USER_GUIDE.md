# DogeStaking User Guide

Welcome to DogeStaking! This guide will help you get started with staking your DOGE tokens and earning rewards.

## Getting Started

### 1. Setting Up MetaMask

1. Install the [MetaMask](https://metamask.io/) browser extension if you haven't already
2. Create or import a wallet
3. Add Dogechain Testnet to MetaMask:
   - Network Name: Dogechain Testnet
   - RPC URL: https://rpc-testnet.dogechain.dog
   - Chain ID: 568
   - Currency Symbol: DOGE
   - Block Explorer: https://explorer-testnet.dogechain.dog

### 2. Getting Test DOGE

1. Visit the [Dogechain Faucet](https://faucet.dogechain.dog)
2. Connect your wallet
3. Request test DOGE
4. Wait for the tokens to arrive in your wallet

## Using the DApp

### Connecting Your Wallet

1. Visit [DogeStaking DApp](http://localhost:5173)
2. Click the "Connect Wallet" button in the top right
3. Approve the connection in MetaMask
4. Ensure you're connected to Dogechain Testnet

### Staking DOGE

1. Enter the amount of DOGE you want to stake
2. View the estimated rewards:
   - Daily rewards
   - Annual rewards (25% APY)
3. Click "Stake DOGE"
4. Confirm the transaction in MetaMask
5. Wait for transaction confirmation

### Viewing Your Stake

After staking, you can view:
- Your staked amount
- Current rewards
- Time remaining until unlock
- Total balance

### Withdrawing Your Stake

#### Normal Withdrawal
1. Wait for the 7-day lockup period to end
2. Click "Unstake"
3. Confirm the transaction
4. Receive your original stake plus rewards

#### Emergency Withdrawal
If needed, you can withdraw before the lockup period:
1. Click "Emergency Withdraw"
2. Confirm the transaction
3. Receive only your original stake (no rewards)

## Understanding the Interface

### Dark Theme UI
- Dark background for reduced eye strain
- Orange accents for important actions and information
- Clear status indicators and notifications

### Transaction Status
- Pending transactions shown with orange clock icon
- Successful transactions marked with orange checkmark
- Failed transactions indicated with warning icon
- All transactions link to the block explorer

### Rewards Calculation
- APY: 25% annually
- Daily Rate: APY ÷ 365
- Rewards accumulate continuously
- Displayed in real-time

## Security Features

### Smart Contract Security
- Role-based access control
- Secure withdrawal pattern
- Emergency withdrawal option
- Balance verification

### User Security
- Connect only through MetaMask
- Transaction confirmation required
- Clear error messages
- Network status indicator

## Troubleshooting

### Common Issues

1. **Transaction Failed**
   - Ensure you have enough DOGE for gas fees (2-3 DOGE recommended)
   - Try increasing gas limit
   - Wait and try again if network is congested

2. **Cannot Stake**
   - Check if you already have an active stake
   - Ensure sufficient balance
   - Verify network connection

3. **Cannot Withdraw**
   - Check if lockup period has ended
   - Verify contract has sufficient balance
   - Try emergency withdrawal if needed

### Getting Help

If you encounter any issues:
1. Check the transaction in the block explorer
2. Look for error messages in the UI
3. Open an issue on GitHub
4. Contact support team

## Best Practices

1. Start with a small test stake
2. Keep extra DOGE for gas fees
3. Monitor your rewards regularly
4. Save transaction hashes
5. Understand lockup period before staking

## Contract Addresses

- WDOGEToken: `0x200edc3efe52f03e79ace544a8d590e13f06afbf`
- StakingContract: `0x8b0fb6d18cd21381e5a327fba0d3f616e0368a91`

## Support

For additional support or questions:
- Open an issue on GitHub
- Join our community channels
- Check the FAQ section
- Contact the development team
