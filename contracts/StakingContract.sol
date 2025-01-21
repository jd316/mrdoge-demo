// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./WDOGEToken.sol";

error InsufficientBalance();
error TransferFailed();
error NoActiveStake();
error AlreadyStaking();
error LockupPeriodNotOver();
error InvalidAmount();
error InvalidRate();
error MaxCapReached();
error BelowMinStake();
error NotOwner();
error ContractPaused();
error ReentrantCall();

contract StakingContract {
    address public owner;
    bool public paused;
    bool private locked; // Reentrancy guard
    
    WDOGEToken public immutable wdogeToken;
    
    // Dynamic APY parameters
    uint256 public baseRate = 5;      // 5% base APY
    uint256 public maxRate = 15;      // 15% maximum APY
    uint256 public minRate = 3;       // 3% minimum APY
    uint256 public currentRate;       // Current effective APY
    
    // TVL parameters
    uint256 public totalValueLocked;
    uint256 public maxCap = 1_000_000 * 1e18;  // 1M DOGE max cap
    uint256 public minStakeAmount = 5 * 1e18; // 5 DOGE minimum stake
    
    uint256 public lockupPeriod = 7 days;

    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 lockedRate;  // Rate locked at stake time
        bool active;
    }

    mapping(address => Stake) public stakes;

    event Staked(address indexed user, uint256 amount, uint256 rate);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);
    event EmergencyWithdrawn(address indexed user, uint256 amount);
    event RateUpdated(uint256 oldRate, uint256 newRate);
    event MaxCapUpdated(uint256 newCap);
    event Paused(bool status);
    event RateCalculation(
        uint256 utilizationRate,
        uint256 adjustedUtilization,
        uint256 rateSpread,
        uint256 rateReduction,
        uint256 newRate
    );

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }

    modifier nonReentrant() {
        if (locked) revert ReentrantCall();
        locked = true;
        _;
        locked = false;
    }

    constructor(address _wdogeToken) {
        require(_wdogeToken != address(0), "Invalid WDOGE token address");
        wdogeToken = WDOGEToken(_wdogeToken);
        owner = msg.sender;
        currentRate = maxRate; // Start with maximum rate since TVL is 0
        paused = false; // Explicitly set to false
        locked = false; // Initialize reentrancy guard
    }

    // Dynamic rate calculation based on TVL
    function calculateDynamicRate() public view returns (uint256) {
        if (totalValueLocked == 0) return maxRate;
        
        // Rate decreases as TVL approaches maxCap
        uint256 utilizationRate = (totalValueLocked * 100) / maxCap;
        
        // More aggressive rate changes:
        // maxRate (15%) when utilization <= 10%
        // minRate (3%) when utilization >= 75%
        // Linear decrease in between
        if (utilizationRate <= 10) return maxRate;
        if (utilizationRate >= 75) return minRate;
        
        // Linear decrease from maxRate to minRate between 10% and 75% utilization
        uint256 rateSpread = maxRate - minRate;
        uint256 adjustedUtilization = ((utilizationRate - 10) * 100) / 65; // 75 - 10 = 65
        uint256 rateReduction = (rateSpread * adjustedUtilization) / 100;
        uint256 newRate = maxRate - rateReduction;
        
        return newRate > minRate ? newRate : minRate;
    }

    function _updateRate() internal {
        uint256 oldRate = currentRate;
        currentRate = calculateDynamicRate();
        emit RateUpdated(oldRate, currentRate);
    }

    function setMaxCap(uint256 _newCap) external onlyOwner {
        require(_newCap > totalValueLocked, "New cap below TVL");
        maxCap = _newCap;
        emit MaxCapUpdated(_newCap);
        _updateRate();
    }

    function stake() external payable nonReentrant whenNotPaused {
        if (msg.value < minStakeAmount) revert BelowMinStake();
        if (msg.value + totalValueLocked > maxCap) revert MaxCapReached();
        if (stakes[msg.sender].active) revert AlreadyStaking();

        // Update TVL first
        totalValueLocked += msg.value;

        // Update rate after TVL change
        _updateRate();

        // Mint WDOGE to user
        wdogeToken.mint(msg.sender, msg.value);

        stakes[msg.sender] = Stake({
            amount: msg.value,
            startTime: block.timestamp,
            lockedRate: currentRate,  // Lock current rate for this stake
            active: true
        });

        emit Staked(msg.sender, msg.value, currentRate);
    }

    function calculateReward(address user) public view returns (uint256) {
        Stake memory stakeData = stakes[user];
        if (!stakeData.active) return 0;

        uint256 stakingTime = block.timestamp - stakeData.startTime;
        uint256 reward = (stakeData.amount * stakeData.lockedRate * stakingTime) / (365 days) / 100;
        return reward;
    }

    function unstake() external nonReentrant whenNotPaused {
        Stake memory stakeData = stakes[msg.sender];
        if (!stakeData.active) revert NoActiveStake();
        if (block.timestamp < stakeData.startTime + lockupPeriod) revert LockupPeriodNotOver();

        uint256 reward = calculateReward(msg.sender);
        uint256 totalAmount = stakeData.amount + reward;

        if (address(this).balance < totalAmount) revert InsufficientBalance();

        // Burn WDOGE first
        wdogeToken.burn(msg.sender, stakeData.amount);

        // Update TVL
        totalValueLocked -= stakeData.amount;

        // Delete stake before transfer
        delete stakes[msg.sender];

        // Transfer original DOGE + rewards
        (bool success, ) = payable(msg.sender).call{value: totalAmount}("");
        if (!success) revert TransferFailed();

        emit Unstaked(msg.sender, stakeData.amount, reward);
        
        // Update rate after unstake
        _updateRate();
    }

    function emergencyWithdraw() external nonReentrant {
        Stake memory stakeData = stakes[msg.sender];
        if (!stakeData.active) revert NoActiveStake();

        if (address(this).balance < stakeData.amount) revert InsufficientBalance();

        // Burn WDOGE first
        wdogeToken.burn(msg.sender, stakeData.amount);

        // Update TVL
        totalValueLocked -= stakeData.amount;

        // Delete stake before transfer
        delete stakes[msg.sender];

        // Return only staked amount, no rewards
        (bool success, ) = payable(msg.sender).call{value: stakeData.amount}("");
        if (!success) revert TransferFailed();

        emit EmergencyWithdrawn(msg.sender, stakeData.amount);
        
        // Update rate after emergency withdrawal
        _updateRate();
    }

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit Paused(_paused);
    }

    // Function to receive DOGE
    receive() external payable {}

    // Allow owner to fund contract for rewards
    function fundRewards() external payable onlyOwner {}
}