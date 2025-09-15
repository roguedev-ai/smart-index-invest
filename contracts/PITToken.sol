// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @title PIT Token (Personal Index Token)
/// @notice ERC20 token representing shares in TokenMarket's rebalancing vault
/// @dev Minted when users deposit into strategies, burned on withdrawal
contract PITToken is ERC20, ERC20Permit, Ownable, ReentrancyGuard {
    using Math for uint256;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    // Strategy information
    uint256 public strategyId; // Unique strategy identifier
    string public strategyName;
    string public strategyDescription;
    address public vaultAddress; // Linked vault contract
    address public creator; // Strategy creator (fees go here)

    // Metadata
    string public category;
    uint256 public createdAt;
    uint256 public lastRebalance;
    uint256 public totalRebalances;

    // Analytics
    uint256 public totalVolume; // Total PIT tokens traded
    uint256 public totalFees; // Total fees earned by strategy
    mapping(address => uint256) public holderStaking; // Staked amounts

    // Events
    event SetMinter(address indexed newMinter, address indexed oldMinter);
    event SetBurner(address indexed newBurner, address indexed oldBurner);
    event FeeCollected(uint256 amount, address collector);
    event RebalanceExecuted(uint256 timestamp, address executor);
    event CreatorRewardPaid(address creator, uint256 amount);

    // Modifiers
    modifier onlyVault() {
        require(msg.sender == vaultAddress, "Only vault can call");
        _;
    }

    modifier onlyStrategyCreator() {
        require(msg.sender == creator, "Only strategy creator");
        _;
    }

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 _strategyId,
        string memory _strategyName,
        string memory _strategyDescription,
        address _vaultAddress,
        address _creator,
        string memory _category
    )
        ERC20(name_, symbol_)
        ERC20Permit(name_)
        Ownable(_creator)
    {
        strategyId = _strategyId;
        strategyName = _strategyName;
        strategyDescription = _strategyDescription;
        vaultAddress = _vaultAddress;
        creator = _creator;
        category = _category;
        createdAt = block.timestamp;
        lastRebalance = block.timestamp;

        // Grant roles to vault
        _grantRole(MINTER_ROLE, _vaultAddress);
        _grantRole(BURNER_ROLE, _vaultAddress);
        _grantRole(MINTER_ROLE, _creator);
    }

    /// @notice Mint PIT tokens to a user (only vault can call)
    /// @param to Address to receive tokens
    /// @param amount Amount of PIT tokens to mint
    function mintPIT(address to, uint256 amount) external onlyVault nonReentrant returns (bool) {
        require(amount > 0, "Cannot mint zero tokens");
        _mint(to, amount);
        return true;
    }

    /// @notice Burn PIT tokens from a user (only vault can call)
    /// @param from Address to burn tokens from
    /// @param amount Amount of PIT tokens to burn
    function burnPIT(address from, uint256 amount) external onlyVault nonReentrant returns (bool) {
        require(amount > 0, "Cannot burn zero tokens");
        _burn(from, amount);
        return true;
    }

    /// @notice Transfer tokens with fee collection
    /// @param recipient Address to receive tokens
    /// @param amount Amount of tokens to send
    function transferWithFee(address recipient, uint256 amount) external returns (bool) {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");

        // Calculate 0.5% trading fee
        uint256 fee = (amount * 5) / 1000; // 5 basis points = 0.05%
        uint256 netAmount = amount - fee;

        // Transfer net amount to recipient
        _transfer(msg.sender, recipient, netAmount);

        // Transfer fee to creator
        if (fee > 0) {
            _transfer(msg.sender, creator, fee);
            totalFees += fee;
            emit FeeCollected(fee, creator);
        }

        return true;
    }

    /// @notice Distribute creator rewards
    /// @param amount Amount of rewards to distribute
    function distributeRewards(uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Cannot distribute zero rewards");
        require(totalFees >= amount, "Insufficient fee balance");

        totalFees -= amount;

        // Mint additional PIT tokens to creator as reward
        // This dilutes existing holders but rewards creator
        _mint(creator, amount);

        emit CreatorRewardPaid(creator, amount);
    }

    /// @notice Stake PIT tokens for rewards
    /// @param amount Amount to stake
    function stakeTokens(uint256 amount) external nonReentrant {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(amount > 0, "Cannot stake zero tokens");

        // Transfer tokens to contract (mark as staked)
        _transfer(msg.sender, address(this), amount);
        holderStaking[msg.sender] += amount;
    }

    /// @notice Unstake PIT tokens
    /// @param amount Amount to unstake
    function unstakeTokens(uint256 amount) external nonReentrant {
        require(holderStaking[msg.sender] >= amount, "Insufficient staked balance");

        holderStaking[msg.sender] -= amount;
        _transfer(address(this), msg.sender, amount);
    }

    /// @notice Update recharge timestamp
    /// @param timestamp New recharge timestamp
    function updateRebalance(uint256 timestamp) external onlyOwner {
        lastRebalance = timestamp;
        totalRebalances++;
        emit RebalanceExecuted(timestamp, msg.sender);
    }

    /// @notice Update strategy metadata
    /// @param newName New strategy name
    /// @param newDescription New strategy description
    function updateStrategyMetadata(
        string memory newName,
        string memory newDescription
    ) external onlyStrategyCreator {
        strategyName = newName;
        strategyDescription = newDescription;
    }

    /// @notice Get total staked amount
    function getTotalStaked() external view returns (uint256) {
        uint256 totalStaked = 0;
        // Would iterate through all holders to sum staking
        // For simplicity, this is a placeholder
        return totalStaked;
    }

    /// @notice Get user's staked balance
    /// @param user Address to check
    function getUserStakedBalance(address user) external view returns (uint256) {
        return holderStaking[user];
    }

    /// @notice Override transfer to include fee mechanism
    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        return transferWithFee(to, amount);
    }

    /// @notice Override transferFrom to include fee mechanism
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual override returns (bool) {
        require(allowance(from, msg.sender) >= amount, "Insufficient allowance");
        _spendAllowance(from, msg.sender, amount);

        // Apply fee structure
        uint256 fee = (amount * 5) / 1000; // 5 basis points = 0.05%
        uint256 netAmount = amount - fee;

        _transfer(from, to, netAmount);
        if (fee > 0) {
            _transfer(from, creator, fee);
            totalFees += fee;
            emit FeeCollected(fee, creator);
        }

        totalVolume += amount;
        return true;
    }

    /// @notice Get strategy statistics
    function getStrategyStats() external view returns (
        uint256 _strategyId,
        string memory _name,
        address _creator,
        uint256 _createdAt,
        uint256 _lastRebalance,
        uint256 _totalRebalances,
        uint256 _totalVolume,
        uint256 _totalFees,
        uint256 _supply
    ) {
        return (
            strategyId,
            strategyName,
            creator,
            createdAt,
            lastRebalance,
            totalRebalances,
            totalVolume,
            totalFees,
            totalSupply()
        );
    }
}
