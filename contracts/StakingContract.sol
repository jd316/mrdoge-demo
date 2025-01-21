// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./WDOGEToken.sol";

error InsufficientBalance();
error TransferFailed();
error NoActiveStake();
error AlreadyStaking();
error LockupPeriodNotOver();
error InvalidAmount();
error InvalidRate();

contract StakingContract is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    WDOGEToken public immutable wdogeToken;  // Wrapped DOGE token
    uint256 public rewardRate = 25; // 25% Annual Percentage Yield (APY)
    uint256 public lockupPeriod = 7 days;

    struct Stake {
        uint256 amount;
        uint256 startTime;
        bool active;
    }

    mapping(address => Stake) public stakes;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);
    event EmergencyWithdrawn(address indexed user, uint256 amount);
    event RewardRateUpdated(uint256 oldRate, uint256 newRate);

    constructor(address _wdogeToken) {
        require(_wdogeToken != address(0), "Invalid WDOGE token address");
        wdogeToken = WDOGEToken(_wdogeToken);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function setRewardRate(uint256 _newRate) external onlyRole(ADMIN_ROLE) {
        if (_newRate == 0 || _newRate > 100) revert InvalidRate();
        uint256 oldRate = rewardRate;
        rewardRate = _newRate;
        emit RewardRateUpdated(oldRate, _newRate);
    }

    function stake() external payable nonReentrant {
        if (msg.value == 0) revert InvalidAmount();
        if (stakes[msg.sender].active) revert AlreadyStaking();

        // Mint WDOGE to user
        wdogeToken.mint(msg.sender, msg.value);

        stakes[msg.sender] = Stake({
            amount: msg.value,
            startTime: block.timestamp,
            active: true
        });

        emit Staked(msg.sender, msg.value);
    }

    function calculateReward(address user) public view returns (uint256) {
        Stake memory stakeData = stakes[user];
        if (!stakeData.active) return 0;

        uint256 stakingTime = block.timestamp - stakeData.startTime;
        uint256 reward = (stakeData.amount * rewardRate * stakingTime) / (365 days) / 100;
        return reward;
    }

    function unstake() external nonReentrant {
        Stake memory stakeData = stakes[msg.sender];
        if (!stakeData.active) revert NoActiveStake();
        if (block.timestamp < stakeData.startTime + lockupPeriod) revert LockupPeriodNotOver();

        uint256 reward = calculateReward(msg.sender);
        uint256 totalAmount = stakeData.amount + reward;

        // Check contract has enough DOGE for rewards
        if (address(this).balance < totalAmount) revert InsufficientBalance();

        // Burn WDOGE first
        wdogeToken.burn(msg.sender, stakeData.amount);

        // Delete stake before transfer to prevent reentrancy
        delete stakes[msg.sender];

        // Transfer original DOGE + rewards
        (bool success, ) = payable(msg.sender).call{value: totalAmount}("");
        if (!success) revert TransferFailed();

        emit Unstaked(msg.sender, stakeData.amount, reward);
    }

    function emergencyWithdraw() external nonReentrant {
        Stake memory stakeData = stakes[msg.sender];
        if (!stakeData.active) revert NoActiveStake();

        // Check contract has enough DOGE
        if (address(this).balance < stakeData.amount) revert InsufficientBalance();

        // Burn WDOGE first
        wdogeToken.burn(msg.sender, stakeData.amount);

        // Delete stake before transfer to prevent reentrancy
        delete stakes[msg.sender];

        // Return only staked amount, no rewards
        (bool success, ) = payable(msg.sender).call{value: stakeData.amount}("");
        if (!success) revert TransferFailed();

        emit EmergencyWithdrawn(msg.sender, stakeData.amount);
    }

    // Function to receive DOGE
    receive() external payable {}

    // Allow owner to fund contract for rewards
    function fundRewards() external payable onlyRole(ADMIN_ROLE) {}
}